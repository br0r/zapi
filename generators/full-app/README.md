# Node API Boilerplate

## Setup
```bash
  cp knexfile.js.sample knexfile.js
  cp config.ts.sample config.ts
  npm install
  docker-compose up -d --build
  ./node_modules/.bin/knex migrate:latest
```

You need to change the IP in `knexfile.js` to correspond to your Docker machine. You can get the IP with the following command:

```bash
docker-machine ip default
```

## Test
After normal setup   
```bash
  cp test/config.js.sample test/config.js
  npm test
```
