import * as express from 'express';

import Errors = require('../errors');
import * as controllerHelper from '../helpers/controller_helper';

import * as model from './model';
import * as view from './view';

export function create(req: express.Request, res: express.Response, next: any) {
  const item = req.body.data.attributes;
  if (!item) return new Errors.InvalidArgumentsError('Invalid item');
  model.create([item])
  .then(ids => model.index({id: ids}))
  .then(users => {
    let user = users[0];
    let content = view.create(req, user);
    res.status(201).send(content);
  })
  .catch(next);

}

export function show(req: express.Request, res: express.Response, next: any) {
  let id = req.user.id;
  if (!id || id !== parseInt(req.params.id)) return next(new Errors.InvalidArgumentsError('Invalid id'));

  const {
    include = '',
  } = req.query;

  const includes = include.split(',');

  const opts = controllerHelper.getQueryOpts(req.query);
  model.index({id}, includes, opts)
  .then(users => {
    if (!users.length) {
      return next(new Errors.NotFoundError('No user found'));
    }
    res.send(view.show(req, users[0]));
  })
  .catch(next);
}

export function update(req: express.Request, res: express.Response, next: any) {
  const id = req.user.id;
  if (!id || id !== parseInt(req.params.id)) return next(new Errors.InvalidArgumentsError('Invalid id'));
  const changes = req.body.data.attributes;
  model.update(id, changes)
  .then(id => {
    return model.index({id})
    .then(xs => xs[0]);
  })
  .then(item => {
    const c = view.show(req, item);
    res.status(200).send(c);
  })
  .catch(next);
}

export function remove(req: express.Request, res: express.Response, next: any) {
  let id = req.user.id;
  if (!id || id !== parseInt(req.params.id)) return next(new Errors.InvalidArgumentsError('Invalid id'));
  model.index({id})
  .then(users => {
    if (!users.length) {
      return next(new Errors.NotFoundError('No user found'));
    }

    return model.remove([id], true);
  })
  .then(() => {
    res.status(204).end();
  })
  .catch(next);
}
