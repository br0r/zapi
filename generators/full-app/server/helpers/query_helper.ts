import * as knex from 'knex';
import logger from '../logger';

type Fields = {[k: string]: string[] | string};
type Sort = string | string[];

interface Page {
  size?: number;
  number?: number;
};

export interface IOpts {
  fields?: Fields;
  sort?: Sort;
  page?: Page,
}

interface Defaults {
  defaultSelect?: string[];
  defaultPage?: Page;
  parentKey?: string;
  addId?: boolean;
}

export function getBuilder(knex: knex, table: string, opts: IOpts = {}, defaults: Defaults = {}) {
  let p = knex(table);
  const select = getSelect(table, opts.fields, defaults);
  const {limit, offset} = getPage(opts, defaults.defaultPage);
  const sort = getSort(opts.sort);

  p = p.select(select);
  if (limit || limit === 0) p = p.limit(limit);

  if (offset) p = p.offset(offset);

  if (sort) {
    sort.forEach(x => {
      p = p.orderBy(x.column, x.direction);
    });
  }

  return p;
}

export function getSelect(key: string, fields: Fields, defaults: Defaults = {}): string[] {
  const {
    defaultSelect: defaultFields,
    parentKey,
    addId = true,
  } = defaults;

  if (!defaultFields || !defaultFields.length) throw new Error('Invalid defaultFields');

  const filter = (xs => {
    let tmpFields = defaultFields.map(x => {
      if (/^[^\.]+\..+$/.test(x) === false) {
        return x.replace(/^[^\.]+\./, '');
      }
      return x;
    });
    return xs.filter(x => defaultFields.indexOf(x) !== -1);
  });

  let a: string[];
  if (fields && fields[key]) {
    let b: string | string[] = fields[key]; 
    if (typeof b === 'string') a = filter(b.split(','));
    else if (b.length) a = filter(b.slice());
    else a = defaultFields.slice();
  }
  else a = defaultFields.slice();

  a = a.map(x => {
    if (/^[^\.]+\..+$/.test(x) === false) {
      return key + '.' + x;
    }
    return x;
  });

  if (addId && a.indexOf('id') === -1 && a.indexOf(key + '.id') === -1) {
    a.push(key + '.id');
  }

  if (parentKey && a.indexOf(parentKey) === -1) {
    a.push(key + '.' + parentKey);
  }

  return a;
}

export function getPage(opts: {page?: Page} = {}, defaultPage: Page = {}) {
  let {page = {}} = opts;
  let limit = page.size || defaultPage.size;
  let offset = limit * (page.number || defaultPage.number || 0);
  return {limit, offset};
}

export function getSort(sort?: Sort): {column: string, direction: string}[] {
  if (!sort) return [];
  if (typeof sort === 'string') sort = sort.split(',');
  return sort.map(x => {
    let direction = 'ASC';
    if (x.charAt(0) === '-') {
      direction = 'DESC';
      x = x.substr(1);
    }
    return {column: x, direction};
  });
}

/**
 * Helper for making standard inclusions
 *
 * @name include
 * @param {object[]} items - Main items we're adding inclusion items to
 * @param {object[]} includes - Include items
 * @param {string} setKey - Key that should be set on items objects
 * @param {string} idKey - Key in items that we should set includes on. Value should map to referenceKey
 * @param {string} referenceKey - Key in includes objects that reference an item in items. Value should map to idKey
 * @param {boolean} multi - If setKey key should be set as single value or as an array
 * @returns {object[]} items
 *
 */
export function mapIncludes<T>(items: T[], includes: object[], setKey: string, idKey: string, referenceKey: string, multi: boolean = true): T[] {
  let hash = {};
  for (let item of items) {
    let id = item[idKey];
    item[setKey] = multi ? [] : null;
    if (!hash[id]) hash[id] = [];
    hash[id].push(item);
  }

  includes.forEach(include => {
    let h = hash[include[referenceKey]];
    if (h) {
      h.forEach(item => {
        if (multi) {
          item[setKey].push(include);
        } else {
          item[setKey] = include
        }
      });
    }
  });
  return items;
}

export function toIntegers(xs: (string|number)[]): number[] {
  let ids = [];
  for(let i = 0; i < xs.length; i += 1) {
    let x = xs[i];
    if (typeof x === 'number') ids.push(x);
    else if (typeof x === 'string') {
      x = Number.parseInt(x);
      if (Number.isInteger(x)) ids.push(x);
    }
  }
  return ids;
}
