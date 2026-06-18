ARG SUPERSET_VERSION=4.1.4
# HINT: Do not use dev versions except for testing
ARG STACKABLE_VERSION=25.11.0
# Use the Node version which is used upstream for the given Superset version
ARG NODE_IMAGE=node:20@sha256:8f693eaa7e0a8e71560c9a82b55fd54c2ae920a2ba5d2cde28bac7d1c01c9ba5

# ===========
# Build stage
# ===========

FROM ${NODE_IMAGE} AS builder

# ARGs only last for the build phase of a single image. For the multistage, renew the ARG
ARG SUPERSET_VERSION

# Download and extract the Superset source code to /app/superset
WORKDIR /app
RUN curl \
    --output superset.tar.gz \
    --location \
    https://github.com/apache/superset/archive/refs/tags/${SUPERSET_VERSION}.tar.gz \
    && tar --extract --gunzip --file=superset.tar.gz \
    && mv superset-${SUPERSET_VERSION} superset \
    # clean up sources
    && rm -rf superset.tar.gz

# Copy and extract the custom visualization plugins to /app/plugins
WORKDIR /app/plugins
COPY plugins/ .

# Register the plugins in Superset by patching MainPreset.js
WORKDIR /app/superset/superset-frontend
COPY MainPreset.js src/visualizations/presets/MainPreset.js
COPY index.tsx packages/superset-ui-core/src/style/index.tsx
COPY webpack.config.js .

# Build Superset with the plugins
RUN npm install --save html2canvas global-box react-spring @react-spring/web currencyformatter.js
RUN for dir in /app/plugins/*; do \
        echo "Running npm ci in $dir"; \
        (cd "$dir" && npm ci --legacy-peer-deps && npm run build || exit 1); \
    done
RUN npm install -S --legacy-peer-deps --prefer-offline --no-audit --loglevel=verbose /app/plugins/*
RUN npm run build

# ===========
# Final image
# ===========

FROM oci.stackable.tech/sdp/superset:${SUPERSET_VERSION}-stackable${STACKABLE_VERSION}

ARG PYTHON_VERSION=3.9

# Additional plugins
RUN pip install --no-deps --no-cache flask_cors # missing dependency of apache-superset[cors]

# Replace the Superset frontend with the one containing the plugins
RUN rm --recursive \
    /stackable/app/lib/python${PYTHON_VERSION}/site-packages/superset/static/assets
COPY --from=builder --chown=stackable:stackable \
    /app/superset/superset/static/assets \
    /stackable/app/lib/python${PYTHON_VERSION}/site-packages/superset/static/assets

#Patch for UD-721
COPY --chown=stackable:stackable \
    ./replacementFiles/trino.py \
    /stackable/app/lib/python${PYTHON_VERSION}/site-packages/superset/db_engine_specs/trino.py
