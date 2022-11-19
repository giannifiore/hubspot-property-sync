module.exports = {
    "type": "array",
    "uniqueItems": "true",
    "description": "a list of unique rules that will be evaluated in order",
    "items": {
        "type": "object",
        "description": "a rule definining which Company/Contact/Deal property should be copied into which other Company/Contact/Deal property",
        "properties": {
            "source": {
                "type": "object",
                "description": "which is the resource (company, contact or deal) and property to observe for changes",
                "properties": {
                    "resource": {
                        "type": "string",
                        "enum": ["company", "contact", "deal", "ticket"]
                    },
                    "property": {
                        "type": "object",
                        "description": "which property of this resource should be observed for changes",
                        "properties": {
                            "id": {
                                "type": "string",
                                "pattern": "^[a-z_]+$",
                                "maxLength": 128
                            }
                        },
                        "required": ["id"]
                    }
                },
                "required": ["resource", "property"]
            },
            "target": {
                "type": "object",
                "description": "which is the other resource (company, contact or deal) and property that should be updated when changes are detected in source",
                "properties": {
                    "resource": {
                        "type": "string",
                        "enum": ["company", "contact", "deal", "ticket"]
                    },
                    "property": {
                        "type": "object",
                        "description": "which property of this resource should be updated in response to changes to the source property",
                        "properties": {
                            "id": {
                                "type": "string",
                                "pattern": "^[a-z_]+$",
                                "maxLength": 128
                            },
                            "overridable": {
                                "type": "boolean",
                                "description": "define the behavior (override or not) in case the target property already has a value"
                            }
                        },
                        "required": ["id"]
                    }
                },
                "required": ["resource", "property"]
            }    
        },
        "required": ["source", "target"]
    }
}