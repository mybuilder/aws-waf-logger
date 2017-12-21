'use strict';

const AWS = require('aws-sdk');
const waf = new AWS.WAF();

const { MAX_WAF_ITEMS } = process.env;

const getRuleIds = (aclId) => new Promise((res, rej) => {
  waf.getWebACL({ WebACLId: aclId }, (err, data) => {
    if (err) rej(err);
    else res(data.WebACL.Rules.map(r => r.RuleId));
  });
});

const getRuleHits = (aclId, ruleId, { start, end }) => new Promise((res, rej) => {
  const params = {
    MaxItems: MAX_WAF_ITEMS,
    RuleId: ruleId,
    TimeWindow: { StartTime: start, EndTime: end },
    WebAclId: aclId,
  };

  waf.getSampledRequests(params, (err, data) => {
    if (err) rej(err);
    else {
      res(data.SampledRequests.reduce((acc, req) => {
        return [ ...acc, Object.assign(req, { WebAclId: aclId, RuleId: ruleId }) ];
      }, []));
    }
  });
});

const normaliseHeaders = (hit) => {
  hit.Request.Headers = hit.Request.Headers.reduce((headers, { Name, Value }) => {
    headers[Name.toLowerCase()] = Value;
    return headers;
  }, {});

  return hit;
};

const flatten = (arrs) => Array.prototype.concat.apply([], arrs);

module.exports.getWebAclHits = (aclId, timeRange) =>
  getRuleIds(aclId)
    .then(ruleIds => Promise.all(ruleIds.map(ruleId => getRuleHits(aclId, ruleId, timeRange))))
    .then(flatten)
    .then(hits => hits.map(normaliseHeaders));
