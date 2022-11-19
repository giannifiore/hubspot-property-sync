module.exports = {
    hubspot: {
        app: {
            id: 1210381
        },
        api: {
            url: process.env.HUBSPOT_API_URL
        }
    },
    aws: {
        dynamodb: {
            url: process.env.AWS_DYNAMO_URL,
            rulesTable: "HubspotUserRules"
        }
    },
    store: {
        tokens: {
            tableName: "HubspotAppTokens"
        }
    }
}