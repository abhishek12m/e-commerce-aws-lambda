const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSSMParameter } = require('../ssmUtil/ssmUtil');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.login = async (event) => {
    const { username,email, password } = JSON.parse(event.body);
    const secretKey = await getSSMParameter("SECRET_KEY");
    const params = {
        TableName: process.env.USERS_TABLE,
        Key: { username }
    };

    const user = await dynamo.get(params).promise();

    if (!user.Item || user.Item.email!==email || !await bcrypt.compare(password, user.Item.passwordHash)) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Invalid credentials' })
        };
    }

    const token = jwt.sign({ userId: user.Item.userId }, secretKey, { expiresIn: '1h' });

    return {
        statusCode: 200,
        body: JSON.stringify({ token })
    };
};