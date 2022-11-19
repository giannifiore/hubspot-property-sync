const { addProperty } = require("./../engine/core")
const SegmentExtractor = require("./../engine/segments")
const hubspotClient = require("@hubspot/api-client")
const config = require("./../../config")
const pluralize = require("pluralize")
    
class TaskRunner {
    run = async (task) => {
        const extractor = new SegmentExtractor()
        const segment = await extractor.extract(task.segment)
        for (const target of segment) {
            await this.makeAction(task.action, target)
        }
    }

    makeAction = async (action, target) => {
        let accessToken = "token"
        let hsApiClient = new hubspotClient.Client({
            accessToken,
            basePath: config.hubspot.api.url
        }).crm[pluralize(target.resource)].basicApi;
        
        switch (action.type) {
            case "propertyChange": {
                let resource = {
                    id: target.id
                }
                
                resource = await hsApiClient.getById(resource.id, [action.property])
                if (!resource) return
                let { changed, output } = addProperty(resource, action.property, action.value, { overridable: action.overridable })
                if (changed) {
                    let atomicUpdate = {
                        id: output.id,
                        properties: {}
                    }
                    atomicUpdate.properties[action.property] = output.properties[action.property]
                    await hsApiClient.update(atomicUpdate.id, atomicUpdate)
                }
            }
        }
    }
}

module.exports = TaskRunner