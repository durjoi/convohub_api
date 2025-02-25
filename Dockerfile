FROM node:18-alpine 

RUN apk update 

WORKDIR /usr/src/app 

COPY package.json ./
COPY package-lock.json ./ 

RUN apk --no-cache add make gcc g++ python3 

RUN npm ci --force 

RUN npm rebuild bcrypt --build-from-source 

COPY . .

RUN npm run build

CMD ["npm", "start"]