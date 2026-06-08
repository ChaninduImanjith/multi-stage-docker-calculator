# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm test

# Production Stage
FROM nginx:alpine

COPY public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx","-g","daemon off;"]