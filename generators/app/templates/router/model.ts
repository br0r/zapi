import * as Joi from 'joi';
import logger from '../logger';

import * as Errors from '../errors';
import {knex} from '../db';

import * as queryHelper from '../helpers/query_helper';

import * as usersModel from '../users/model';

export interface I<%= TitleSingular %> {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export const defaultAttributes = ['created_at', 'updated_at'];

interface IQuery {
  id?: number | number[];
  user_id?: number;
}

const numberOrNumbersSchema = Joi.alternatives([
  Joi.number(),
  Joi.array().items(Joi.number()),
]);

const <%= TitleSingular %>QuerySchema = Joi.object().keys({
  id: numberOrNumbersSchema,
});

export function index(q: IQuery = {}, includes=[], opts: queryHelper.IOpts = {}): Promise<I<%= TitleSingular %>[]> {
  const result = Joi.validate(q, <%= TitleSingular %>QuerySchema);
  if (result.error) return Promise.reject(result.error);

  let p = queryHelper.getBuilder(knex, '<%= title %>', opts, {
    defaultSelect: defaultAttributes,
  });

  const multiFilters = [
    'id', 
  ];

  for (let k in q) {
    let v = q[k];
    if (multiFilters.indexOf(k) !== -1) {
      p = p.whereIn('<%= title %>.' + k, v);
    }  
  }

  if (q.user_id) {
    p = setUserRelation(p, q.user_id);
  }

  return p.then(<%= title %> => {
    let ps = [];

    let <%= title %>Ids = <%= title %>.map(x => x.id);

    /*
    if (includes.indexOf('example') !== -1) {
      let <%= titleSingular %>Ids = <%= title %>.map(x => x.example_id);
      let p = <%= title %>Model.index({id: <%= titleSingular %>Ids}, [], opts)
      .then(xs => queryHelper.mapIncludes(<%= title %>, xs, 'example', 'example_id', 'id', false))

      ps.push(p);
    }
    */

    return Promise.all(ps)
      .then(() => <%= title %>);
  }) as any;
}

const <%= TitleSingular %>UpdateSchema = Joi.object().keys({

}).or([

]);

export function update(id: number, changes: any, userId?: number): Promise<number> {
  if (!id) return Promise.reject(new Errors.InvalidArgumentsError('Invalid id'));
  const result = Joi.validate(changes, <%= TitleSingular %>UpdateSchema);
  if (result.error) return Promise.reject(result.error);
  changes.updated_at = new Date();

  let p = knex('<%= title %>');
  if (userId) setUserRelation(p, userId);

  return p.where('id', id)
  .update(changes)
  .returning('id')
  .then(ids => {
    if (!ids.length) throw new Errors.NotFoundError('No <%= title %> by given id');
    return ids[0];
  }) as any;
}

const <%= TitleSingular %>CreateSchema = Joi.array().items(Joi.object().keys({

}));

/**
 * @param {I<%= TitleSingular %>[]} <%= title %>
 * @param {string[]} includes - Includes for index when done with creation
 */
export function create(<%= title %>: I<%= TitleSingular %>[], includes: string[] = [], userId?: number): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const result = Joi.validate(<%= title %>, <%= TitleSingular %>CreateSchema);
    if (result.error) return reject(result.error);

    //let exampleIds = [];
    for (let i = 0; i < <%= title %>.length; i += 1) {
      let <%= titleSingular %> = <%= title %>[i];
      <%= titleSingular %>.created_at = new Date();
      <%= titleSingular %>.updated_at = new Date();
      //exampleIds.push(<%= titleSingular %>.example_id);

    }

    return new Promise((resolve, reject) => {
      /*
      if (userId) {
        examplesModel.index({id: exampleIds, user_id: userId}, [], {fields: {examples: 'id'}})
        .then(examples => {
          if (examples.length !== examplesIds.length) throw new Errors.ForbiddenError();
          resolve();
        })
        .catch(reject);
      } else {
        resolve();
      }
      */
      resolve();
    })
    .then(() => {
      return knex('<%= title %>')
        .insert(<%= title %>)
        .returning('id');
    })
    .then(resolve)
    .catch(reject);
  });
}

export function remove(ids: (string|number)[], userId?: number) {
  ids = ids.map(Number.parseInt).filter(x => Number.isInteger(x));
  let p = knex('<%= title %>')
    .whereIn('<%= title %>.id', ids);
  if (userId) setUserRelation(p, userId);
  return p.del();
}

function setUserRelation(p, userId) {
  return p;
  /*
  return p.whereIn('<%= title %>.example_id', function() {
      return this.from('example_permissions').select('example_id').where('user_id', userId);
    });
  */
}
