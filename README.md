AWS WAF Logger
--------------

The AWS WAF is an amazing feature however actually getting meaningful logs out of it can be a pain.
Since putting it in-place we have been wanting to analyse the traffic patterns and which rules are getting hit.
However, at this time AWS does not provide such a log stream.

To remedy this we have created this small scheduled Lambda which queries the AWS SDK [`GetSampledRequests`](http://docs.aws.amazon.com/waf/latest/APIReference/API_GetSampledRequests.html) action to fetch any matches and store them in S3 and/or [Loggly](https://www.loggly.com/).
This allows us to look at current and historical data about the WAF's actions.

### Configuration

You must first specify your desired configuration within `env.yml`, using `env.yml.example` as a template.
This service uses [Serverless](https://serverless.com/) to manage provisioning the Lambda, so with this present on your machine you can simply execute:

```bash
$ serverless deploy -v
```

Depending on if you have configured to output the logs to S3 and/or Loggly you will now begin to see any resulting output based on your check frequency.

**Note**: `GetSampledRequests` only returns a 'sample' (max 500) among the first 5,000 request that your resource receives during the specified time range.
As such the check frequency may need to be adjusted according to your throughput.
