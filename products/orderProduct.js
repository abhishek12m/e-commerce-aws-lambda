const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();


module.exports.orderProduct = async (event) => {
    const { productId, quantity } = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.principalId;
    const orderId = AWS.util.uuid.v4();
    const orderDate = new Date().toISOString();

    const params = {
        TableName: process.env.ORDERS_TABLE,
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