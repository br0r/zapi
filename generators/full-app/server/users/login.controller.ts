import * as usersModel from './model';
import * as Joi from 'joi';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import * as config from '../../config';

export function login(req, res, next) {
  const {email, password} = req.body;

  usersModel.verify({email, password})
  .then(id => {
    const expireDate = moment().add(1, 'day');
    const payload = {
      exp: expireDate.unix(),
      sub: id,
      iss: config.jwtIssuer,
      scopes: ['api'],
      iat: moment().unix(),
    };
    const token = jwt.encode(payload, config.jwtSecret);
    res.cookie('jwt', token, {
      path: '/',
      httpOnly: true,
      expires: expireDate.toDate(),
      // Should add secure: true here (need https)
    });
    if (req.query.redirect) {
      res.redirect(req.query.redirect);
    } else {
      res.status(200).end(token);
    }
  })
  .catch(next);
}

export function logout(req, res, next) {
  res.clearCookie('jwt');
  if (req.query.redirect) {
    res.redirect(req.query.redirect);
  } else {
    res.status(204).end();
  }
}
