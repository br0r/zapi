import {IOpts} from './query_helper';

export function getQueryOpts(q: any): IOpts {
  let {
    page: {
      size = 20,
      number = 0,
    } = {}
  } = q;

  return {
    fields: q.fields,
    page: {
      size,
      number,
    },
    sort: q.sort,
  };
}
