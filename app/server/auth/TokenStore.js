const AWS = require("aws-sdk")
const config = require("./../config")

var dynamodb = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    region: config.aws.region,
    endpoint: config.aws.dynamodb.url,
});

const db = new AWS.DynamoDB.DocumentClient({
    service: dynamodb
})
const tokensTableName = config.store.tokens.tableName

class TokenStore {
    store = async (userId, appId, { timestamp, access_token, refresh_token, expires_in }) => {
        const params = {
            TableName: tokensTableName,
            Item: {
                "user.id": String(userId),
                "app.id": String(appId),
                "timestamp": timestamp,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_in": expires_in
            },
        }
        await db
            .put(params)
            .promise()
    }
    get = async (userId, appId) => {
        const params = {
            TableName: tokensTableName,
            Key: {
                "user.id": String(userId),
                "app.id": String(appId)
            }
        }
        return (await db.get(params).promise()).Item
    }

    list = async () => {
        const params = {
            TableName: tokensTableName
        }
        return (await db.scan(params).promise()).Items
    }
}

module.exports = TokenStore