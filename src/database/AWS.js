const AWS = require("aws-sdk");

let awsConfig = {
  "region": "us-east-1",
  "accessKeyId": "AKIA3BPEGHGKD5OOSOKQ",
  "secretAccessKey": "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"
}

AWS.config.update(awsConfig)
const dynamo = new AWS.DynamoDB.DocumentClient();

export default dynamo;