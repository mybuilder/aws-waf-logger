'use strict';

const https = require('https');

const { LOGGLY_TOKEN, LOGGLY_TAG } = process.env;

const sendHitToLoggly = (hit) => new Promise((res, rej) => {
  const payload = JSON.stringify(hit);
  const params = {
    host: 'logs-01.loggly.com',
    path: `/inputs/${LOGGLY_TOKEN}/tag/${LOGGLY_TAG}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
    },
  };

  const req = https.request(params, (r) => {
    if (r.statusCode < 200 || r.statusCode > 299) rej(new Error(`Request failed: ${r.statusCode}`));
  });
  req.on('error', rej);
  req.write(payload);
  req.end();
  res();
});

module.exports.sendHitsToLoggly = (hits) =>
  Promise.all(hits.map(sendHitToLoggly)).then(() => hits);
