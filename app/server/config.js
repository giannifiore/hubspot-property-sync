module.exports = {
    hubspot: {
        api: {
            url: process.env.HUBSPOT_API_URL,
        },
        auth: {
            url: process.env.HUBSPOT_AUTH_WEB,
            refresh: {
                schedule: { seconds: 30, }
            }
        },
        app: {
            id: 1210381,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scopes: [
                'crm.objects.companies.read',
                'crm.objects.companies.write',
                'crm.objects.contacts.read',
                'crm.objects.contacts.write',
                'crm.objects.deals.read',
                'crm.objects.deals.write'
            ]
        }
    },
    aws: {
        region: process.env.AWS_REGION,
        dynamodb: {
            url: process.env.AWS_DYNAMO_URL
        }
    },
    store: {
        tokens: {
            tableName: "HubspotAppTokens"
        }
    },
    app: {
        protocol: process.env.APP_PROTOCOL,
        host: process.env.APP_HOST,
        port: process.env.APP_PORT
    }
}