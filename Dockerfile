FROM node:14.17-alpine3.11

# Working directory
WORKDIR /app

# Install necessary libraries
RUN apk  --update --no-cache add  make g++ python3

# Install dependencies
COPY package.json package-lock.json ./
RUN npm i
RUN npm i ts-jest ts-node typescript --save-dev

