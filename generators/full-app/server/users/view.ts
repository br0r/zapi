import * as express from 'express';
import { Serializer } from '../helpers/jsonapi_helper';
import * as Errors from '../errors';

import {IUser} from './model';

export const UserSerializer = new Serializer('users', {
  attributes: ['name', 'email', 'created_at', 'updated_at'],
  keyForAttribute: 'snake_case',
  dataLinks: {
    self: (dataSet, user) => '/users/' + user.id,
  }
});

export function create(req: express.Request, user: IUser) : string | object {
  let t = req.accepts(['json']);
  if (t === 'json') {
    return UserSerializer.serialize(req, user);
  } else {
    throw new Errors.NotAcceptableError();
  }
}

export function show(req: express.Request, user: IUser) : string | object {
  let t = req.accepts(['json']);
  if (t === 'json') {
    return UserSerializer.serialize(req, user);
  } else {
    throw new Errors.NotAcceptableError();
  }
}

