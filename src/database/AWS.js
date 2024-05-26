const AWS = require("aws-sdk");
const Cognito =  require("amazon-cognito-identity-js");

const poolData = {
    UserPoolId: process.env.REACT_APP_ENV_USER_POOL_ID,
    ClientId: process.env.REACT_APP_ENV_CLIENT_ID
}

let awsConfig = {
  "region": process.env.REACT_APP_ENV_REGION,
  "accessKeyId": process.env.REACT_APP_ENV_AWS_ACCESS_KEY_ID,
  "secretAccessKey":process.env.REACT_APP_ENV_DYNAMO_SECRET_ACCESS_KEY_ID
}

AWS.config.update(awsConfig); 

function getS3url(key){
  const myBucket = process.env.REACT_APP_ENV_S3_BUCKET_NAME; 
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
aws.s3 = s3; 

export default aws;