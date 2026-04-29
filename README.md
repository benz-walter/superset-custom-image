# CI/CD Pipeline for Superset and custom plugins based on the Stackable Superset image

## Description

This is the build repository for the custom Superset image used in Freiburg.
The image contains extra plugins from the city of Freiburg for visualization that are located as tar files in the `./plugins` folder:

- `superset-plugin-compare-two-columns`
- `superset-plugin-occupancy-spots`

The Superset deployment is controlled [here](https://gitlab.com/smartcityfreiburg/plattform-apps/superset).

## Usage

The build process is triggered automatically when merging into main.

## Tips

If upgrading the Superset version, a couple of steps have to be performed:

- Adapt the `SUPERSET_VERSION` argument in the docker file
- Adapt the `STACKABLE_VERSION` argument in the docker file
- Adapt the `NODE_VERSION` argument in the docker file to the version Superset is using
- Adapt the `MainPreset.js` to the new Superset version (e.g. [here](https://github.com/apache/superset/blob/3.0.1/superset-frontend/src/visualizations/presets/MainPreset.js) for the tag `3.0.1`)
- Adapt the `webpack.config.js` to the new Superset version (e.g. [here](https://github.com/apache/superset/blob/3.0.1/superset-frontend/webpack.config.js) for the tag `3.0.1`)
- Import and activate the custom plugins or use the `MainPreset.js.patch` (this may need adaption in terms of lines of the patch)

## Building manually for testing

Run
```
docker build --tag=superset-with-custom-visualization-plugins:<superset-version-in-dockerfile>-stackable<stackable-version-in-dockerfile> .
```

Successful output looks similar to this:
```
/superset-app (main)> docker build --tag=superset-with-custom-visualization-plugins:3.0.1-stackable23.11.0 .
[+] Building 1234.8s (18/18) FINISHED docker:default
 => [internal] load build definition from Dockerfile 0.1s
 => => transferring dockerfile: 1.82kB 0.0s
 => [internal] load .dockerignore 0.0s
 => => transferring context: 2B 0.0s
 => [internal] load metadata for docker.stackable.tech/stackable/superset:3.0.1-stackable23.11.0 0.2s
 => [internal] load metadata for docker.io/library/node:16 0.9s
 => [builder 1/9] FROM docker.io/library/node:16@sha256:f77a1aef2da8d83e45ec990f45df50f1a286c5fe8bbfb8c6e4246c6389705c0b 0.0s
 => [stage-1 1/3] FROM docker.stackable.tech/stackable/superset:3.0.1-stackable23.11.0@sha256:deac5c08d29a91b113bb581f5682aea483526f650a6e57bd4f0fce3ccb4880ae 0.0s
 => [internal] load build context 0.0s
 => => transferring context: 8.58kB 0.0s
 => CACHED [stage-1 2/3] RUN rm --recursive /stackable/app/lib/python3.9/site-packages/superset/static/assets 0.0s
 => CACHED [builder 2/9] WORKDIR /app 0.0s
 => CACHED [builder 3/9] RUN curl --output superset.tar.gz --location https://github.com/apache/superset/archive/refs/tags/3.0.1.tar.gz && tar --extra 0.0s
 => CACHED [builder 4/9] WORKDIR /app/plugins 0.0s
 => CACHED [builder 5/9] COPY plugins/* . 0.0s
 => CACHED [builder 6/9] RUN find -name *.tar.gz -exec tar --extract --gunzip --file={} ; 0.0s
 => CACHED [builder 7/9] WORKDIR /app/superset/superset-frontend 0.0s
 => [builder 8/9] COPY MainPreset.js src/visualizations/presets/MainPreset.js 0.1s
 => [builder 9/9] RUN npm install --save-prod ../../plugins/* && npm clean-install && npm run build 1230.5s
 => [stage-1 3/3] COPY --from=builder --chown=stackable:stackable /app/superset/superset/static/assets /stackable/app/lib/python3.9/site-packages/superset/static/assets 1.9s 
 => exporting to image 0.6s 
 => => exporting layers 0.6s 
 => => writing image sha256:13236a199df1ea1d9c3428620344038f6d05f880ea890ad3e57d256f800effe7 0.0s 
 => => naming to docker.io/library/superset-with-custom-visualization-plugins:3.0.1-stackable23.11.0
```
