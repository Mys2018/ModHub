FROM node:18-alpine
WORKDIR /appe
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]