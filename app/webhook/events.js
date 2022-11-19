const config = require("./config")

const { parseApp, parseOwner, parseResource } = require("./utils/parser")
const HubspotEventListener = require("./listeners/HubspotResourceListener")

const matchesAnyRule = async (event, customRules) => {
    let resource = parseResource(event);
    return customRules.find(rule => rule.source.resource == resource);
};

class EventDispatcher {
    constructor(rulesEngine, taskScheduler) {
        this.taskScheduler = taskScheduler
        this.rulesEngine = rulesEngine
    }

    dispatchEventBatch = async (events) => {
        let isNotifiedToThisApp = event => parseApp(event) == config.hubspot.app.id
        let relevantEvents = events
            .filter(isNotifiedToThisApp)

        for (const event of relevantEvents){
            await this.dispatchEvent(event)
        }
    };

    dispatchEvent = async (event) => {
        let owner = parseOwner(event);
        let customerSpecificRules = await this.rulesEngine.load(owner);
        if (!customerSpecificRules) return;

        let matches = await matchesAnyRule(event, customerSpecificRules);
        if (!matches) return;

        let listener = new HubspotEventListener(
            parseResource(event),
            this.taskScheduler)
        await listener.on(event, customerSpecificRules)
    };

    dispatch = async (events) => {
        console.log(`dispatching ${events.length} events`)
        await this.dispatchEventBatch(events || [])
    };
}

module.exports = EventDispatcher