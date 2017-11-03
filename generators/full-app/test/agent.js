const supertest = require('supertest');

let headers = {};
function request(url) {
  let s = supertest(url);
  for (key of ['get', 'post', 'patch', 'put', 'delete']) {
    let tmp = s[key];
    s[key] = function(url2) {
      return tmp(url2).set(headers);
    }
  }
  s.set = set.bind(this);
  return s;
}

request.set = set.bind(request);

function set(field, value) {
  headers[field] = value;
  return this;
}


module.exports = request;
