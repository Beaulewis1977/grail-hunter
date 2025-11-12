FROM apify/actor-nodejs-20:latest

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
