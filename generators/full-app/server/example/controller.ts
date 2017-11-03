import * as express from 'express';

import * as Errors from '../errors';
import * as controllerHelper from '../helpers/controller_helper';
import {io} from '../helpers/socket';

import * as model from './model';

import * as view from './view';

export function index(req: express.Request, res: express.Response, next: any) {
  const {
    filter = {},
    include = '',
  } = req.query;

  (filter as any).user_id = req.user.id;

  const includes = include.split(',');
  const opts = controllerHelper.getQueryOpts(req.query);

  model.index(filter, includes, opts)
  .then(items => {
    let c = view.index(req, items);
    res.status(200).send(c);
  })
  .catch(next);
}

export function show(req: express.Request, res: express.Response, next: any) {
  const id = req.params.id;

  const {
    include = '',
  } = req.query;

  const includes = include.split(',');

  model.index({id, user_id: req.user.id}, includes)
  .then(items => {
    if (!items.length) throw new Errors.NotFoundError('No item by id');
    let c = view.show(req, items[0]);
    res.status(200).send(c);
  })
  .catch(next);
}

export function update(req: express.Request, res: express.Response, next: any) {
  const id = req.params.id;
  const changes = req.body.data.attributes;
  model.update(id, changes, req.user.id)
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

export function create(req: express.Request, res: express.Response, next: any) {
  let item = req.body.data.attributes;
  if (req.params.id) item.project_id = req.params.id;

  model.create([item], req.user.id)
  .then(ids => {
    return model.index({id: ids});
  })
  .then(items => {
    let c = view.create(req, items[0]);
    res.status(201).send(c);
  })
  .catch(next);
}

export function remove(req: express.Request, res: express.Response, next: any) {
  const id = req.params.id;
  if (!id) return next(new Errors.InvalidArgumentsError('Invalid id'));

  model.remove([id], req.user.id)
  .then(() => {
    res.status(204).end();
  })
  .catch(next);
}
