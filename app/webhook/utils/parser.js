const parseOwner = event => event.portalId
const parseApp = event => event.appId
const parseSource = event => event.changeSource
const parseResource = event => event.subscriptionType.split(".")[0]
const parseAction = event => event.subscriptionType.split(".")[1]
const parseObject = event => event.objectId
const parsePropertyName = event => event.propertyName
const parsePropertyValue = event => event.propertyValue

module.exports = {
    parseOwner,
    parseApp,
    parseSource,
    parseResource,
    parseAction,
    parseObject,
    parsePropertyName,
    parsePropertyValue
}