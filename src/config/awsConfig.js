const AWS = require('aws-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const REGION = 'us-east-1';

const s3 = new AWS.S3();
const ssm = new AWS.SSM();
const client = new DynamoDBClient({ region: REGION });
const dynamodb = DynamoDBDocumentClient.from(client);

module.exports = {
  s3,
  ssm,
  dynamodb
};