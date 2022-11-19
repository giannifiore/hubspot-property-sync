# Hubspot Property Sync

![Sync company property to contacts](docs/img/example.png?raw=true "Example")

Hubspot marketplace app (unpublished) to **keep your custom properties in sync** between different Hubspot resources, e.g.:
* Sync Company properties to all corresponding Contacts
* Sync Contact propertes to all corresponding Companies
* Sync Contact properties to all associated Deals
* Sync Contact properties to all associated Tickets
* Sync Deal properties to the associated Contact
* and any combination of the above



## how it works

a proprietary format defines
* which custom property  
(e.g. `$.lead_temperature`)
* of which Hubspot Resource type (e.g. `company`, `contact`, `deal`, `ticket`)

should be observed for changes,  
and
* which other hubspot Resource(s) should be updated in response to the update event (e.g. `company`, `contact`, `deal`, `ticket`)

## installing on your servers

the app is not yet available on the marketplace,  
contact me if you need assistance in installing it on your servers

Install Docker on your device, then run 
```
docker-compose --profile webapp up
```
to run the app.  

Contact me if you need to sync your existing properties between resources that already exist.


## testing the rules engine

Install Docker on your device, then run 
```
docker-compose --profile testing up
```
to execute all tests.  

Initial tests cover 6 advanced scenarios:  
* update all contacts upon company change
* update all deals upon company change
* update all tickets upon company change
* update all tickets of same contact upon change to deal
* update company upon deal change
* update all company deals upon changes to one of the deal of the company

### Sync rule format

the following JSON Schema defines rules to control the sync
```
{
    "type": "array",
    "uniqueItems": "true",
    "description": "a list of ordered sync rules",
    "items": {
        "type": "object",
        "description": "a sync rule",
        "properties": {
            "source": {
                "type": "object",
                "description": "which Hubspot resource and property to observe for changes",
                "properties": {
                    "resource": {
                        "type": "string",
                        "enum": ["company", "contact", "deal", "ticket"]
                    },
                    "property": {
                        "type": "object",
                        "description": "which property to observe for changes",
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
                "description": "which other Hubspot resource to update",
                "properties": {
                    "resource": {
                        "type": "string",
                        "enum": ["company", "contact", "deal", "ticket"]
                    },
                    "property": {
                        "type": "object",
                        "description": "which property to update",
                        "properties": {
                            "id": {
                                "type": "string",
                                "pattern": "^[a-z_]+$",
                                "maxLength": 128
                            },
                            "overridable": {
                                "type": "boolean",
                                "description": "override existing values in target"
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
```

example rule to update `lead_temperature` property for all contacts of a company:

```javascript
let source = {
    "resource": "company",
    "property": {
        "id": "lead_temperature"
    }
}

let target = {
    "resource": "contact",
    "property": {
        "id": "lead_temperature"
    },
    "overridable": true
}

const syncRule = {
   source,
   target
}
```
