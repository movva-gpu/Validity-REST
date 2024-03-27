FROM oven/bun:latest
WORKDIR /home/bun/app

LABEL authors="Danyella Strikann"

COPY API API/
COPY assets assets/
COPY .env .
COPY app.ts .
COPY utils.ts .
COPY bun.lockb .
COPY package.json .

RUN bun install --production

CMD ["bun", "start"]
