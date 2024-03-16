FROM oven/bun:latest

copy . /app
WORKDIR /app

RUN bun install
CMD bun server.js -env-file .env