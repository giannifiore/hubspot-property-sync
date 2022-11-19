
module.exports = {
    addProperty: (target, property, value, options) => {
        output = { ...target}
        if (!options.overridable && target.properties[property] != null)
            return { changed: false, output }
        if (output.properties[property] == value)
            return { changed: false, output }
        output.properties[property] = value
        return { changed: true, output }        
    }
}