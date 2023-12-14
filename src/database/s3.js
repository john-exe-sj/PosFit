let AWS = require("aws-sdk");

let awsConfig = {
  "region": "us-east-1",
  "accessKeyId": "AKIA3BPEGHGKD5OOSOKQ",
  "secretAccessKey": "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"
}

AWS.config.update(awsConfig);
const s3 = new AWS.S3();

const myBucket = 'posfit-bucket'
const signedUrlExpireSeconds = 60 * 5

function getS3url(key){
  const url = s3.getSignedUrl('getObject', {
      Bucket: myBucket,
      Key: key,
      Expires: signedUrlExpireSeconds
  })
  return url;
}

export {s3, getS3url};


