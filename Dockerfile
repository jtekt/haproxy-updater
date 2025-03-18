FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun i
CMD ["bun", "index.ts"]