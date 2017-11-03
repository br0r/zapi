import * as express from 'express';
import { Serializer } from '../helpers/jsonapi_helper';
import * as Errors from '../errors';

import { IExample } from './model';

import { UserSerializer } from '../users/view';

export const ExampleSerializer = new Serializer('bugs', {
  attributes: ['title', 'updated_at', 'created_at'],
  keyForAttribute: 'snake_case',
  /*
  media: MediaSerializer.getReference({
    ref: (c, media) => media.id,
    attributes: ['meta', 'file_name', 'created_at', 'updated_at'],
  }),
  project: {
    attributes: ['name', 'updated_at', 'created_at'],
    ref: (suite, project) => project.id,
    include: true,
    includedLinks: {
      self: (bug, x) => '/projects/' + x.id,
    }
  },
  */
  dataLinks: {
    self: (dataSet, x) => '/example/' + x.id,
  }
});

export function create(req: express.Request, example: IExample): object {
  let t = req.accepts(['json']);
  if (t === 'json') {
    return ExampleSerializer.serialize(req, example);
  } else {
    throw new Errors.NotAcceptableError();
  }
}

export function show(req: express.Request, examples: IExample): object {
  let t = req.accepts(['json']);
  if (t === 'json') {
    return ExampleSerializer.serialize(req, examples);
  } else {
    throw new Errors.NotAcceptableError();
  }
}

export function index(req: express.Request, examples: IExample[]): object {
  let t = req.accepts(['json']);
  if (t === 'json') {
    return ExampleSerializer.serialize(req, examples);
  } else {
    throw new Errors.NotAcceptableError();
  }
}
