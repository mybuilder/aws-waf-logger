'use strict';

const AWS = require('aws-sdk');
const cloudwatchlogs = new AWS.CloudWatchLogs();
const { LOG_GROUP } = process.env;

module.exports.writeHitsToCloudWatch = (timeRange, hits) => new Promise((res, rej) => {
  if (hits.length === 0) {
    res(hits);
    return;
  }
  const logStreamName = `${timeRange.start.toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')}/${timeRange.end.toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')}`;
  var params = {}
  params = {
    logGroupName: LOG_GROUP,
    logStreamName: logStreamName
  };
  cloudwatchlogs.createLogStream(params, function(err, data) {
    if (err) throw ("createLogStream Error: " + err);
    else {
      var hitDate;
      var logEvents = [];
      for (var i in hits) {
        hitDate = new Date(hits[i].Timestamp).getTime();
        logEvents.push({
              message: JSON.stringify(hits[i]),
              timestamp: hitDate
        });
      }
      logEvents.sort(function(obj1, obj2) {
        return obj1.timestamp - obj2.timestamp;
      });
      params = {
        logEvents: logEvents,
        logGroupName: LOG_GROUP,
        logStreamName: logStreamName
      };
      cloudwatchlogs.putLogEvents(params, (err, data) => {
        if (err) throw ("putLogEvents Error: " + err);
        else res(hits);
      });
    }
  });
});
