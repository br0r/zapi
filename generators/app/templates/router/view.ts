import * as express from 'express';
import { Serializer } from '../helpers/jsonapi_helper';
import * as Errors from '../errors';

import { I<%= TitleSingular %> } from './model';

import { UserSerializer } from '../users/view';

export const <%= TitleSingular %>Serializer = new Serializer('<%= title %>', {
  attributes: ['updated_at', 'created_at'],
  keyForAttribute: 'snake_case',
  /*
  example: ExampleSerializer.getReference({
    ref: (<%= titleSingular %>, example) => example.id,
    attributes: ['title', 'created_at', 'updated_at'],
  }),
  example2: {
    attributes: ['name', 'updated_at', 'created_at'],
    ref: (<%= titleSingular %>, example2) => example2.id,
    include: true,
    includedLinks: {
      self: (record, current) => '/example2/' + current.id,
    }
  },
  */
  dataLinks: {
    self: (dataSet, x) => '/<%= titleSingular %>/' + x.id,
  }
});

export function create(req: express.Request, <%= titleSingular %>: I<%= TitleSingular %>): object {
  let t = req.accepts(['json']);
  if (t === 'json') {
    return <%= TitleSingular %>Serializer.serialize(req, <%= titleSingular %>);
  } else {
    throw new Errors.NotAcceptableError();
  }
}

export function show(req: express.Request, <%= titleSingular %>: I<%= TitleSingular %>): object {
  let t = req.accepts(['json']);
  if (t === 'json') {
    return <%= TitleSingular %>Serializer.serialize(req, <%= titleSingular %>);
  } else {
    throw new Errors.NotAcceptableError();
  }
}

export function index(req: express.Request, <%= titleSingular %>: I<%= TitleSingular %>[]): object {
  let t = req.accepts(['json']);
  if (t === 'json') {
    return <%= TitleSingular %>Serializer.serialize(req, <%= titleSingular %>);
  } else {
    throw new Errors.NotAcceptableError();
  }
}
