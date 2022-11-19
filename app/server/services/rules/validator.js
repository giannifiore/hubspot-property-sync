var SchemaValidator = require('jsonschema').Validator;
var ruleValidator = new SchemaValidator();

var ruleSchema = require("./../../schema/rules");

const validate = (rules) => {
    return ruleValidator.validate(rules, ruleSchema).valid
}
module.exports = {
    validate
}