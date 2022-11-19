module.exports = {
    aws: {
        region: process.env.AWS_REGION,
        dynamo: {
            url: process.env.AWS_DYNAMO_URL,
            rulesTable: "HubspotUserRules"
        }
    },
    hubspot: {
        api: {
            url: process.env.HUBSPOT_API_URL
        }
    }
}