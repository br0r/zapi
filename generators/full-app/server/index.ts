import * as http from 'http';
import * as express from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as config from '../config';
import {health as dbHealth} from './db';
import {passport} from './passport';
import * as blocked from 'blocked';

const app = express();
const server = http.createServer(app);

app.use(passport.initialize());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
  app.use(compression());
} else {
  blocked(function(ms) {
    console.error(process.pid + ' was blocked for: ' + ms + 'ms');
  });
}

app.get('/health', (req, res, next) => {
  dbHealth()
  .then(() => {
    res.status(200).end();
  })
  .catch(next);
});

import * as loginController from './users/login.controller';
import * as usersController from './users/controller';

app.post('/users', usersController.create);
app.post('/login', loginController.login);
app.post('/logout', loginController.logout);

// API
import * as exampleController from './example/controller';

const api = express.Router();
api.use(passport.authenticate('jwt', {session: false}));

api.get('/example', exampleController.index);
api.get('/example/:id', exampleController.show);
api.patch('/example/:id', exampleController.update);
api.delete('/example/:id', exampleController.remove);

api.get('/users/:id', usersController.show);
api.patch('/users/:id', usersController.update);
api.delete('/users/:id', usersController.remove);

app.use(api);

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.isJoi) {
    res.status(400).json({
      errors: err.details,
    });
  } else {
    let status = err.status || 500;
    res.status(status).json({
      errors: [{
        status,
        code: err.name,
        title: err.message,
      }]
    });
  }
});

server.listen(config.port, () => {
  console.log('Listening on', config.port);
});
