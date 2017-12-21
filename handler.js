'use strict';

const { getWebAclHits } = require('./hits');

const { CHECK_EVERY_MINUTES, LOG_BUCKET, LOGGLY_TOKEN } = process.env;
const WEB_ACLS = process.env.WEB_ACLS.split(',');

const createTimeRange = (minutesAgo) => {
  const end = new Date();
  const start = new Date(end);
  start.setMinutes(end.getMinutes() - minutesAgo);
  return { start, end };
};

const flatten = (arrs) => Array.prototype.concat.apply([], arrs);

module.exports.log = (event, context, callback) => {
  const timeRange = createTimeRange(CHECK_EVERY_MINUTES);

  Promise.all(WEB_ACLS.map(aclId => getWebAclHits(aclId, timeRange)))
    .then(flatten)
    .then(hits => LOG_BUCKET ? require('./s3').writeHitsToBucket(timeRange, hits) : hits)
    .then(hits => LOGGLY_TOKEN ? require('./loggly').sendHitsToLoggly(hits) : hits)
    .then(hits => hits.length > 0 && callback(undefined, `Successfully logged ${hits.length} requests.`))
    .catch(err => callback(err));
};
