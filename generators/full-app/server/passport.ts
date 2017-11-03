import * as passport from 'passport';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import * as usersModel from './users/model';
import * as Errors from './errors';
import * as config from '../config';

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    req => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies.jwt;
      }
      return token;
    }
  ]),
  secretOrKey: config.jwtSecret,
  issuer: config.jwtIssuer,
};

passport.use(new JwtStrategy(opts, (payload, done) => {
  usersModel.index({id: payload.sub})
    .then(users => {
      if (users.length === 1) return done(null, users[0]);
      return done(null, false);
    })
    .catch(done);
}));

export {passport};
