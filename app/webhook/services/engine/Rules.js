var AWS = require('aws-sdk');
const config = require("./../../config")
const docClient = new AWS.DynamoDB.DocumentClient({
    region: config.aws.region,
    endpoint: config.aws.dynamodb.url
});

class Rules {
    load = async (owner) => {
        let result = await (docClient.get({
            Key: {
                "user.id": String(owner)
            },
            TableName: config.aws.dynamodb.rulesTable
        })).promise()
        return result.Item && result.Item.rules ? result.Item.rules : []
    };
}

module.exports = Rules;