FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production && \
    npm install dotenv

COPY --from=builder /app/index.js ./
COPY --from=builder /app/Models ./Models
COPY --from=builder /app/Routes ./Routes
COPY --from=builder /app/config.env ./config.env

RUN chown -R node:node /app && \
    chmod 600 config.env

USER node

EXPOSE 5000

CMD [ "node", "index.js" ]
