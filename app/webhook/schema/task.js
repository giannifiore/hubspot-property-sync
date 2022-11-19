module.exports = {
    "type": "object",
    "description": "a task to be executed on hubspot resources",
    "properties": {
        "segment": {
            "type": "object",
            "properties": {
                "owner": {
                    "type": "string",
                    "description": "id of the hubspot account owner of resources"
                },
                "resource": {
                    "type": "string",
                    "description": "resource type for items of this segment",
                    "enum": ["company", "contact", "deal", "ticket"]
                },
                "filters": {
                    "type": "object",
                    "description": "a free set of filters to describe how to create the segment",
                    "properties": {
                        "company": {
                            "type": "string",
                            "description": "id of the company this segment is limited to"
                        },
                        "contact": {
                            "type": "string",
                            "description": "id of the contact this segment is limited to"
                        },
                        "deal": {
                            "type": "string",
                            "description": "id of the deal this segment is limited to"
                        },
                        "ticket": {
                            "type": "string",
                            "description": "id of the ticket this segment is limited to"
                        }
                    }
                }
            },
            "required": ["owner","resource","filters"]
        },
        "action": {
            "type": "object",
            "properties": {
                "type": {
                    "type": "string",
                    "description": "which type of action should be performend on this segment",
                    "enum": ["propertyChange"]
                },
                "property": {
                    "type": "string",
                    "description": "which property should be updated, if type is propertyChange"
                },
                "value": {
                    "type": "string",
                    "description": "which value should be set for property, if type is propertyChange"
                },
                "overridable": {
                    "type": "boolean",
                    "description": "whether we are allowed to override existing values, if any found"
                }
            },
            "required": ["type"]
        }
    },
    "required": ["segment", "action"]
}