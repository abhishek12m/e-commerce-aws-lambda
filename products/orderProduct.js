const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const ORDERS_TABLE=process.env.ORDERS_TABLE;
const { v4: uuidv4 } = require('uuid');

module.exports.orderProduct = async (event) => {
    const { productId, quantity } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.principalId;
    const orderId = uuidv4();
    const orderDate = new Date().toISOString();

    const params = {
        TableName: ORDERS_TABLE,
        Item: {
            orderId,
            userId,
            productId,
            quantity,
            orderDate
        }
    };

    await dynamo.put(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Order placed successfully' })
    };
};