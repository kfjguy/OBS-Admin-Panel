FROM node:22.9-slim

COPY . .
WORKDIR /app/server/
RUN npm install --omit=dev

CMD ["npm", "start"]