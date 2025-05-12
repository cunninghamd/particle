FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./
RUN npm install

COPY . .

CMD ["npx", "tsx", "src/index.ts"]
