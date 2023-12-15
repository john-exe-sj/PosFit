const AWS = require("aws-sdk");
const Cognito =  require("amazon-cognito-identity-js");

const poolData = {
    UserPoolId: "us-east-1_QOD4mBo6F",
    ClientId: "2u5og5gqud9m98ubkb1m9iq2tt"
}

let awsConfig = {
  "region": "us-east-1",
  "accessKeyId": "AKIA3BPEGHGKD5OOSOKQ",
  "secretAccessKey": "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"
}

AWS.config.update(awsConfig); 

function getS3url(key){
  const myBucket = 'posfit-bucket'; 
  const signedUrlExpireSeconds = 60 * 5; 
  const url = s3.getSignedUrl('getObject', {
      Bucket: myBucket,
      Key: key,
      Expires: signedUrlExpireSeconds
  })
  return url;
}

const s3 = new AWS.S3();
s3.getS3url = getS3url; 

const aws = {}

aws.dynamo = new AWS.DynamoDB.DocumentClient();
aws.cognito = new Cognito.CognitoUserPool(poolData); 
aws.s3 = new AWS.S3();

export default aws;