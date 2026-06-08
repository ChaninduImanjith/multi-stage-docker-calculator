# ==========================
# Stage 1 - Test Builder
# ==========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm test

RUN npx eslint .

# ==========================
# Stage 2 - Production
# ==========================
FROM nginx:alpine

COPY public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]