ARG SUPERSET_VERSION=6.1.0
# HINT: Do not use dev versions except for testing
ARG STACKABLE_VERSION=26.7.0
# Use the Node version which is used upstream for the given Superset version
ARG NODE_IMAGE=node:24.19@sha256:934240a162082fd8b8a2f90cd5114446443f1eba1c5378f6687167ca405e6584

# ===========
# Build stage
# ===========

FROM ${NODE_IMAGE} AS builder
# System-Abhängigkeiten wie zstd für simple-zstd / webpack installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    zstd \
    && rm -rf /var/lib/apt/lists/*
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

# Register the plugins in Superset by patching MainPreset.js
WORKDIR /app/superset/superset-frontend/plugins
COPY plugins/ .
WORKDIR /app/superset/superset-frontend
COPY MainPreset.ts src/visualizations/presets/MainPreset.ts
COPY VizType.ts packages/superset-ui-core/src/chart/types/VizType.ts

# Build Superset with the plugins
RUN npm install
RUN npm run build

# ===========
# Final image
# ===========

FROM oci.stackable.tech/sdp/superset:${SUPERSET_VERSION}-stackable${STACKABLE_VERSION}

ARG PYTHON_VERSION=3.12

# Additional plugins
RUN pip install --no-deps --no-cache flask_cors # missing dependency of apache-superset[cors]

# Replace the Superset frontend with the one containing the plugins
RUN rm --recursive \
    /stackable/app/lib/python${PYTHON_VERSION}/site-packages/superset/static/assets
COPY --from=builder --chown=stackable:stackable \
    /app/superset/superset/static/assets \
    /stackable/app/lib/python${PYTHON_VERSION}/site-packages/superset/static/assets
