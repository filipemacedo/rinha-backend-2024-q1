# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS dev
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun run build

ENTRYPOINT [ "bun", "run", "dev" ]

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=dev /usr/src/app/dist/index.js dist/index.js
COPY --from=dev /usr/src/app/package.json package.json

USER bun
EXPOSE 3000/tcp

ENTRYPOINT [ "bun", "dist/index.js" ]
