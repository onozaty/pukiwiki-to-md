FROM node:22-slim

RUN npm install -g pnpm

RUN apt-get update && apt-get install -y \
    sudo \
    git \
    wget \
    curl \
    jq

RUN echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers