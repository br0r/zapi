from node:8.2

RUN npm install pm2 -g

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

COPY . /usr/src/app
CMD ["rm", "-rf", "node_modules"]
RUN npm install

RUN npm run build

ARG PORT=8040
EXPOSE $PORT
ENV NODE_ENV production
CMD ["pm2-docker", "./build/server/index.js"]
