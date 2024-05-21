const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.listProducts = async () => {
  const params = {
    TableName: process.env.PRODUCTS_TABLE
  };

  const products = await dynamo.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(products.Items)
  };
};
