# ------------------------ BUILD

FROM node:12-alpine AS build-env
# https://github.com/nodejs/docker-node

COPY . ./app
WORKDIR /app

RUN yarn
RUN yarn build
#ENTRYPOINT ["serve", "-s build"]


# ------------------------ RUNTIME

FROM nginx:1.17.3-alpine AS runtime

# have a bash and curl
RUN apk add --update curl && rm -rf /var/cache/apk/*
RUN apk add --update bash && rm -rf /var/cache/apk/*

COPY --from=build-env /app/build /app
WORKDIR /app

EXPOSE 80

ENTRYPOINT ["node", "start:prod"]
