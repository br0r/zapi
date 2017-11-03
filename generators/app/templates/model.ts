import * as Joi from 'joi';

import * as Errors from '../errors';
import {knex} from '../db';

import * as queryHelper from '../helpers/query_helper';

import * as usersModel from '../users/model';

export interface I<%= TitleSingular %> {
  id?: number;
  title: string;
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
  Joi.array().<%= title %>(Joi.number()),
]);

const <%= TitleSingular %>QuerySchema = Joi.object().keys({
  id: numberOrNumbersSchema,
  user_id: Joi.number(),
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
    if (includes.indexOf('tester') !== -1) {
      let userIds = bugs.map(x => x.tester_id);
      let p = usersModel.index({id: userIds}, [], opts)
      .then(xs => queryHelper.mapIncludes(bugs, xs, 'tester', 'tester_id', 'id', false))

      ps.push(p);
    }
    */

    return Promise.all(ps)
      .then(() => <%= title %>);
  }) as any;
}

const <%= TitleSingular %>UpdateSchema = Joi.object().keys({
  title: Joi.string().min(1),
}).or([
  'title',
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

const <%= TitleSingular %>CreateSchema = Joi.array().<%= title %>(Joi.object().keys({
  title: Joi.string().min(1).required(),
}));

/**
 * @param {I<%= TitleSingular %>[]} <%= title %>
 * @param {string[]} includes - Includes for index when done with creation
 */
export function create(<%= title %>: I<%= TitleSingular %>[], includes: string[] = [], userId?: number): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const result = Joi.validate(<%= title %>, <%= TitleSingular %>CreateSchema);
    if (result.error) return reject(result.error);

    //let projectIds = [];
    for (let i = 0; i < <%= title %>.length; i += 1) {
      let <%= titleSingular %> = <%= title %>[i];
      <%= titleSingular %>.created_at = new Date();
      <%= titleSingular %>.updated_at = new Date();
      //projectIds.push(<%= titleSingular %>.project_id);

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
  return p.whereIn('bugs.project_id', function() {
      return this.from('projects_permissions').select('project_id').where('user_id', userId);
    });
  */
}
