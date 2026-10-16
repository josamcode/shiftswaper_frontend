# Production build served by nginx.
# docker build --build-arg REACT_APP_URI_API_URL=https://api.example.com .
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG REACT_APP_URI_API_URL
ENV REACT_APP_URI_API_URL=$REACT_APP_URI_API_URL \
    GENERATE_SOURCEMAP=false \
    CI=false
RUN test -n "$REACT_APP_URI_API_URL" || (echo "REACT_APP_URI_API_URL build argument is required" && exit 1)
RUN npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
