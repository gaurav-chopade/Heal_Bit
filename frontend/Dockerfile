FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Vite bakes the API URL into the bundle at build time. .env.production points at /api
# (for the Nginx deployment), but this image has no Nginx, so the browser must call the
# backend directly. Shell variables beat .env files in Vite, so this ARG wins.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

RUN npm install -g serve

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
