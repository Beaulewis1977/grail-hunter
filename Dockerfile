FROM apify/actor-nodejs-20:1.0.0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
