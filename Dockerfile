FROM node:24.7-slim AS dependencies

WORKDIR /usr/app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

FROM dependencies AS build

WORKDIR /usr/app

COPY . .
COPY --from=dependencies /usr/app/node_modules ./node_modules

RUN pnpm build
RUN pnpm prune --prod

FROM node:24.7-alpine3.21 AS deploy

WORKDIR /usr/app

RUN apk add --no-cache bash \
  && npm i -g pnpm

COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/node_modules ./node_modules
COPY --from=build /usr/app/package.json ./package.json
COPY --from=build /usr/app/wait-for-it.sh ./wait-for-it.sh
RUN chmod +x /usr/app/wait-for-it.sh

EXPOSE 3333

CMD ["pnpm", "start"]
