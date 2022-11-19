const { parseAction, parseObject, parseOwner, parsePropertyName, parseResource } = require("./../utils/parser")
const { v4: uuidv4 } = require('uuid');
const hubspotClient = require("@hubspot/api-client")
const config = require("./../config")
const pluralize = require("pluralize")

const accessToken = "random"

class HubspotResourceListener {
    constructor(resource, taskScheduler) {
        this.taskScheduler = taskScheduler;
        this.resource = resource;
    }
    
    _expandResource = async (event, extraPropertiesToInclude = []) => {
        let owner = parseOwner(event)
        // TODO make it owner dependent
        const hsClient = new hubspotClient.Client({ accessToken, basePath: config.hubspot.api.url })
        const resourceId = parseObject(event)
        return await hsClient.crm[pluralize(this.resource)].basicApi.getById(resourceId, extraPropertiesToInclude)
    };

    on = async (event, rules) => {
        rules = rules.filter(rule => rule.source.resource == this.resource)
        switch (parseAction(event)) {
            case "creation": return this.onCreation(event, rules)
            case "propertyChange": return this.onUpdate(event, rules)
        }
    };

    buildSegmentFilter = (resource) => {
        let filter = {}
        filter[this.resource] = resource
        return filter
    } 

    scheduleUpdates = async (owner, triggeringObject, propertyName, propertyValue, targets) => {
        let tasks = targets.map(target => {
            return {
                id: uuidv4(),
                segment: {
                    owner,
                    resource: target.resource,
                    filters: this.buildSegmentFilter(triggeringObject)
                },
                action: {
                    type: "propertyChange",
                    property: propertyName,
                    value: propertyValue,
                    overridable: target.property.overridable    
                }
            }
        }) 
        await this.taskScheduler.schedule(tasks)
    }


    onCreation = async (event, rules) => {

    };

    onUpdate = async (event, rules) => {
        let owner = parseOwner(event)
        let updatedProperty = parsePropertyName(event)

        rules = rules.filter(rule => rule.source.property.id == updatedProperty)
        if (rules.length == 0) return

        let updatedResource = await this._expandResource(event, [updatedProperty])
        let thisPropIsValued = updatedResource.properties[updatedProperty] != null
        if (!thisPropIsValued) return
        let targets = rules.map(rule => rule.target)
        await this.scheduleUpdates(owner, updatedResource, updatedProperty, updatedResource.properties[updatedProperty], targets);
    };
}

module.exports = HubspotResourceListener