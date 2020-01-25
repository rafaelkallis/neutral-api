# installer
FROM node:lts-alpine as installer

WORKDIR app
COPY package*.json ./

RUN npm install

# builder
FROM node:lts-alpine as builder
WORKDIR app
COPY src src/
COPY tsconfig.json .
COPY --from=installer app ./

RUN npm run build

# runner
FROM node:lts-alpine as runner

RUN adduser -h appuser -D appuser
WORKDIR /home/appuser
USER appuser

COPY --from=builder app ./

CMD ["npm", "start"]
