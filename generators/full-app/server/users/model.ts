import * as Joi from 'joi';
import * as crypto from 'crypto';

import { knex } from '../db';
import * as Errors from '../errors';

import * as queryHelper from '../helpers/query_helper';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  salt?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface IQuery {
  id?: number[] | number;
  email?: string[] | string;
}

export function index(q: IQuery = {}, includes: string[] = [ ], opts: queryHelper.IOpts = {}): Promise<IUser[]> {
  const select = queryHelper.getSelect('users', opts.fields, {defaultSelect: ['name', 'email', 'created_at', 'updated_at']});

  let p = knex('users')
    .select(select);

  if (q.id) {
    p = p.whereIn('users.id', Array.isArray(q.id) ? q.id : [q.id]);
  }

  if (q.email) {
    p = p.whereIn('users.email', Array.isArray(q.email) ? q.email : [q.email]);
  }

  return p.then(users => {
    let ps = [];
    const userIds = users.map(x => x.id);

    return Promise.all(ps).then(() => users);
  }) as any;
}

const UserCreateSchema = Joi.array().items(Joi.object().keys({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
}));

export function create(users: IUser[]): Promise<number[]> {
  let result = Joi.validate(users, UserCreateSchema);
  if (result.error) return Promise.reject(result.error);

  return index({email: users.map(x => x.email)})
  .then(existingUsers => {
    let h = {};
    existingUsers.forEach(x => h[x.email] = true);
    let data = [];
    for (let user of users) {
      if (h[user.email]) throw new Errors.ConflictError('A user with given email already exists');
      user.salt = crypto.randomBytes(16).toString('hex');
      user.password = generatePasswordHash(user.password, user.salt);
      user.created_at = new Date();
      user.updated_at = new Date();
      data.push(user);
    }

    users = users.map(user => {
      return user;
    });

    return (knex('users').insert(data).returning('id') as any);
  });
}

const UserUpdateSchema = Joi.object().keys({
  name: Joi.string().min(1),
  email: Joi.string().email(),
  password: Joi.string().min(1),
}).or([
  'name',
  'email',
  'password'
]);

export function update(id: number, changes: any): Promise<number> {
  if (!id) return Promise.reject(new Errors.InvalidArgumentsError('Invalid id'));
  const result = Joi.validate(changes, UserUpdateSchema);
  if (result.error) return Promise.reject(result.error);
  changes.updated_at = new Date();

  return knex('users')
  .where('id', id)
  .update(changes)
  .returning('id')
  .then(ids => {
    if (!ids.length) throw new Errors.NotFoundError('No user by given id');
    return ids[0];
  }) as any;
}

export function remove(maybeIds: (string|number)[], hardDelete: boolean = false): Promise<void> {
  let ids = queryHelper.toIntegers(maybeIds);
  if (!hardDelete) {
    return knex('users').whereIn('id', ids)
      .update({
        is_deleted: true,
      }) as any;
  }

  // Hard delete, we need to delete all references first.
  return Promise.all([
  ])
  .then(() => {
    return knex('users').whereIn('id', ids).del();
  });
}

const VerifySchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required()
});

export function verify(payload): Promise<number> {
  const result = Joi.validate(payload, VerifySchema);
  if (result.error) return Promise.reject(result.error);
  const {email, password} = payload;
  return (knex('users')
    .select('id', 'salt', 'password')
    .where('email', email) as any)
    .then(users => {
      if (users.length === 1) {
        const user = users[0];
        const hash = generatePasswordHash(password, user.salt); 
        if (user.password === hash) {
          return user.id;
        }
      }
      throw new Errors.ForbiddenError();
    });
}

function generatePasswordHash(password: string, salt: string): string {
  if (!password || !salt) throw new Errors.InvalidArgumentsError('Invalid password or salt');
  let shasum = crypto.createHash('sha256');
  shasum.update(password + salt);
  return shasum.digest('hex');
}
