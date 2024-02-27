FROM alpine:3.19
RUN apk add --no-cache nodejs npm ffmpeg
COPY . /app
WORKDIR /app
RUN npm ci
