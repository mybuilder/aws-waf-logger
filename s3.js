'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const { LOG_BUCKET } = process.env;

module.exports.writeHitsToBucket = (timeRange, hits) => new Promise((res, rej) => {
  if (hits.length === 0) {
    res(hits);
    return;
  }

  const params = {
    Bucket: LOG_BUCKET,
    Key: `${timeRange.start}-${timeRange.end}`,
    Body: JSON.stringify(hits),
    ContentType: 'application/json',
  };

  s3.putObject(params, (err, data) => {
    if (err) rej(err);
    else res(hits);
  });
});
