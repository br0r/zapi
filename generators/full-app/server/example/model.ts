import * as Joi from 'joi';

import * as Errors from '../errors';
import {knex} from '../db';

import * as queryHelper from '../helpers/query_helper';

import * as usersModel from '../users/model';

export interface IExample {
  id?: number;
  title: string;
  created_at?: Date;
  updated_at?: Date;
}

interface IQuery {
  id?: number | number[];
  user_id?: number;
}

const numberOrNumbersSchema = Joi.alternatives([
  Joi.number(),
  Joi.array().items(Joi.number()),
]);

const ExampleQuerySchema = Joi.object().keys({
  id: numberOrNumbersSchema,
});

export function index(q: IQuery = {}, includes=[], opts: queryHelper.IOpts = {}): Promise<IExample[]> {
  const result = Joi.validate(q, ExampleQuerySchema);
  if (result.error) return Promise.reject(result.error);

  let p = queryHelper.getBuilder(knex, 'example', opts, {
    defaultSelect: ['title', 'created_at', 'updated_at'],
  });

  const multiFilters = [
    'id', 
  ];

  for (let k in q) {
    let v = q[k];
    if (multiFilters.indexOf(k) !== -1) {
      p = p.whereIn('example.' + k, v);
    }  
  }

  if (q.user_id) {
    p = setUserRelation(p, q.user_id);
  }

  return p.then(items => {
    let ps = [];

    let itemsIds = items.map(x => x.id);

    /*
    if (includes.indexOf('tester') !== -1) {
      let userIds = bugs.map(x => x.tester_id);
      let p = usersModel.index({id: userIds}, [], opts)
      .then(xs => queryHelper.mapIncludes(bugs, xs, 'tester', 'tester_id', 'id', false))

      ps.push(p);
    }
    */

    return Promise.all(ps)
      .then(() => items);
  }) as any;
}

const ExampleUpdateSchema = Joi.object().keys({
  title: Joi.string().min(1),
}).or([
  'title',
]);

export function update(id: number, changes: any, userId?: number): Promise<number> {
  if (!id) return Promise.reject(new Errors.InvalidArgumentsError('Invalid id'));
  const result = Joi.validate(changes, ExampleUpdateSchema);
  if (result.error) return Promise.reject(result.error);
  changes.updated_at = new Date();

  let p = knex('example');
  if (userId) setUserRelation(p, userId);

  return p.where('id', id)
  .update(changes)
  .returning('id')
  .then(ids => {
    if (!ids.length) throw new Errors.NotFoundError('No bug by given id');
    return ids[0];
  }) as any;
}

const ExampleCreateSchema = Joi.array().items(Joi.object().keys({
  title: Joi.string().min(1).required(),
}));

/**
 * @param {IExample[]} items
 * @param {string[]} includes - Includes for index when done with creation
 */
export function create(items: IExample[], includes: string[] = [], userId?: number): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const result = Joi.validate(items, ExampleCreateSchema);
    if (result.error) return reject(result.error);

    //let projectIds = [];
    for (let i = 0; i < items.length; i += 1) {
      let item = items[i];
      item.created_at = new Date();
      item.updated_at = new Date();
      //projectIds.push(item.project_id);

    }

    return new Promise((resolve, reject) => {
      /*
      if (userId) {
        projectsModel.index({id: projectIds, user_id: userId}, [], {fields: {projects: 'id'}})
        .then(projects => {
          if (projects.length !== projectIds.length) throw new Errors.ForbiddenError();
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
      return knex('example')
        .insert(items)
        .returning('id');
    })
    .then(resolve)
    .catch(reject);
  });
}

export function remove(ids: (string|number)[], userId?: number) {
  ids = ids.map(Number.parseInt).filter(x => Number.isInteger(x));
  let p = knex('example')
    .whereIn('example.id', ids);
  if (userId) setUserRelation(p, userId);
  return p.del();
}

function setUserRelation(p, userId) {
  return p;
  /*
  return p.whereIn('bugs.project_id', function() {
      return this.from('projects_permissions').select('project_id').where('user_id', userId);
    });
  */
}
