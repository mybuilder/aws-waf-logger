'use strict';

const { getWebAclHits } = require('./hits');

const { CHECK_EVERY_MINUTES, S3_ENABLE ,LOG_BUCKET, LOGGLY_TOKEN, CLOUDWATCH_ENABLE, LOG_GROUP} = process.env;
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
    .then(hits => (S3_ENABLE == 'true') && LOG_BUCKET ? require('./s3').writeHitsToBucket(timeRange, hits) : hits)
    .then(hits => (CLOUDWATCH_ENABLE == 'true') && LOG_GROUP ? require('./cloudwatch').writeHitsToCloudWatch(timeRange, hits) : hits)
    .then(hits => LOGGLY_TOKEN ? require('./loggly').sendHitsToLoggly(hits) : hits)
    .then(hits => hits.length > 0 && callback(undefined, `Successfully logged ${hits.length} requests.`))
    .catch(err => callback(err));
};