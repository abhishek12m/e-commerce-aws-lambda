const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const ORDERS_TABLE = process.env.ORDERS_TABLE;
const ORDERS_STATUS_TABLE = process.env.ORDERS_STATUS_TABLE;

module.exports.updateOrderStatus = async (event) => {
    try {
        console.log('Event received:', event);

        // Fetch all orders with status "order out for delivery"
        const scanParams = {
            TableName: ORDERS_STATUS_TABLE,
            FilterExpression: 'orderStatus = :status',
            ExpressionAttributeValues: {
                ':status': 'order out for delivery'
            }
        };

        const orders = await dynamo.scan(scanParams).promise();
        console.log('Orders retrieved:', orders);

        const currentTime = new Date().toISOString();

        for (const orderStatus of orders.Items) {
            const order = await dynamo.get({
                TableName: ORDERS_TABLE,
                Key: { orderId: orderStatus.orderId }
            }).promise();
            console.log('Order retrieved:', order);

            if (order.Item && new Date(orderStatus.expectedDeliveryTime) < new Date(currentTime)) {
                const params = {
                    TableName: ORDERS_STATUS_TABLE,
                    Key: { orderId: orderStatus.orderId },
                    UpdateExpression: 'set orderStatus = :status, statusUpdateDate = :updateDate',
                    ExpressionAttributeValues: {
                        ':status': 'completed',
                        ':updateDate': currentTime
                    }
                };

                await dynamo.update(params).promise();
                console.log('Order status updated:', params);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order statuses checked and updated' })
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
