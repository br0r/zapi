import * as express from 'express';
import * as JSONAPISerializer from 'jsonapi-serializer';

export class Serializer {
  private req: express.Request;
  constructor(private key: string, private options: object) { }

  get opts() {
    return this.getOpts(this.req);
  }


  serialize(req: express.Request | any, value?: object) {
    if (req && typeof value === 'undefined') {
      value = req;
      req = undefined;
    }

    let opts = this.getOpts(req);
    return new JSONAPISerializer.Serializer(this.key, opts).serialize(value);
  }


  getReference(customOpts?: object) {
    let _this = this;
    return function setReq(req) {
      return Object.assign({}, _this.getOpts(req), customOpts);
    }
  }

  private getOpts(req) {
    let opts: any = {};
    for (let k in this.options) {
      if (typeof this.options[k] === 'function' && this.options[k].name === 'setReq') {
        opts[k] = this.options[k](req);
      } else opts[k] = this.options[k];
    }

    if (req && req.query && req.query.fields && req.query.fields[this.key]) {
      opts.attributes = req.query.fields[this.key].split(',');
    }

    return opts;
  }

}
