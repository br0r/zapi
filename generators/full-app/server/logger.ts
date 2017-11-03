import * as winston from 'winston';
import * as config from '../config';

const getLevel = function () {
  if (process.env.NODE_ENV === 'production') return 'info';
  return 'silly';
};

var transports = [
  new (winston.transports.Console)({ level: getLevel() }),
];

/*
if (config.errorFile) {
  transports.push(
    new (winston.transports.File)({
      name: 'error-file',
      filename: config.errorFile,
      level: 'error',
    })
  );
}

*/

const log = new (winston.Logger)({
  transports,
});

export default log;
