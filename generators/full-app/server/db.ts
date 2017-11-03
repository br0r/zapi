import * as config from '../config';
import * as k from 'knex';

export const knex = k(Object.assign({
  debug: process.env.NODE_ENV !== 'production',
}, config.db));

export function health() {
  return knex.raw('select 1+1 as result');
}
