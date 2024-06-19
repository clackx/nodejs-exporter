# expected size is ~210Mb (no npm dependncies)

FROM node:bookworm-slim as builder

LABEL stage=node-builder

WORKDIR /home/node/app

COPY . .

RUN npm i


FROM debian:trixie-slim

RUN apt-get update

RUN apt-get -y install nodejs --no-install-recommends

RUN apt-get -y install sysstat iproute2 --no-install-recommends

RUN rm -rf /var/cache/apt/archives /var/lib/apt/lists

RUN useradd node -m

WORKDIR /home/node

USER node

COPY --from=builder --chown=node:node /home/node/app .

EXPOSE 9200

CMD [ "nodejs", "./index.js" ]
