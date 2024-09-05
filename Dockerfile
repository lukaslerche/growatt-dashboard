FROM node:alpine AS build

RUN npm i -g pnpm

WORKDIR /app
COPY . .
RUN pnpm i --frozen-lockfile
RUN pnpm build


FROM node:alpine AS run

RUN npm i -g pnpm

WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm i --frozen-lockfile -P

COPY --from=build /app/build/index.js .

CMD ["node", "index.js"]
EXPOSE 3000/tcp