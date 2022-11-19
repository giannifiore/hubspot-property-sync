module.exports = {
    "type": "array",
    "maxItems": 100,
    "description": "You should expect to receive an array of objects in a single request. The batch size can vary, but will be under 100 notifications. HubSpot will send multiple notifications when a lot of events have occurred within a short period of time. For example, if you've subscribed to new contacts and a customer imports a large number of contacts, HubSpot will send you the notifications for these imported contacts in batches and not one per request. HubSpot does not guarantee that you'll receive these notifications in the order they occurred. Use the occurredAt property for each notification to determine when the event that triggered the notification occurred. HubSpot also does not guarantee that you'll only get a single notification for an event. Though this should be rare, it is possible that HubSpot will send you the same notification multiple times.",
    "items": {
        "type": "object",
        "properties": {
            "eventId": {
                "type": "integer",
                "description": "The ID of the event that triggered this notification. This value is not guaranteed to be unique."
            },
            "subscriptionId": {
                "type": "integer",
                "description": "The ID of the subscription that triggered a notification about the event."
            },
            "portalId": {
                "type": "integer",
                "description": "The customer's HubSpot account ID where the event occurred."
            },
            "appId": {
                "type": "integer",
                "description": "The ID of your application. This is used in case you have multiple applications pointing to the same webhook URL."
            },
            "occurredAt": {
                "type": "integer",
                "description": "When this event occurred as a millisecond timestamp."
            },
            "eventType": {
                "type": "string",
                "description": "The type of event this notification is for. Review the list of supported subscription types in the webhooks subscription section."
            },
            "subscriptionType": {
                "type": "string",
                "description": "which kind of event occurred, in format <resource.action>",
                "enum": [
                    "contact.creation", "contact.deletion", "contact.propertyChange","contact.privacyDeletion",
                    "conversation.newMessage", "conversation.creation", "conversation.deletion", "conversation.propertyChange","conversation.privacyDeletion",
                    "company.creation", "company.deletion", "company.propertyChange",
                    "deal.creation", "deal.deletion", "deal.propertyChange",
                    "ticket.creation", "ticket.deletion", "ticket.propertyChange",
                    "product.creation", "product.deletion", "product.propertyChange",
                    "line_item.creation", "line_item.deletion", "line_item.propertyChange",
                ]
            },
            "attemptNumber": {
                "type": "integer",
                "description": "Starting at 0, which number attempt this is to notify your service of this event. If your service times-out or throws an error as describe in the Retries section, HubSpot will attempt to send the notification again."
            },
            "objectId": {
                "type": "integer",
                "description": "The ID of the object that was created, changed, or deleted. For contacts this is the contact ID; for companies, the company ID; for deals, the deal ID; and for conversations the thread ID.",
                "example": "151"
            },
            "propertyName": {
                "type": "string",
                "pattern": "^[a-z_]+$",
                "description": "This is only sent for property change subscriptions and is the name of the property that was changed.",
                "example": "lifecyclestage"
            },
            "propertyValue": {
                "type": "string",
                "description": "This is only sent for property change subscriptions and represents the new value set for the property that triggered the notification.",
                "example": "lead"
            },
            "changeFlag": {
                "type": "string",
                "description": "?",
                "example": "NEW"
            },
            "changeSource": {
                "type": "string",
                "description": "The source of the change. This can be any of the change sources that appear in contact property histories.",
                "example": "CRM_UI"
            },
            "sourceId": {
                "type": "string",
                "description": "?",
                "example": "userId:47874139"
            },
            "messageid": {
                "type": "integer",
                "description": "This is only sent when a webhook is listening for new messages to a thread. It is the ID of the new message."
            },
            "messageType": {
                "type": "string",
                "description": "This is only sent when a webhook is listening for new messages to a thread. It represents the type of message you're sending. This value can either be MESSAGE or COMMENT.",
                "enum": ["MESSAGE", "CONTENT"]
            }
        }
    }
  }