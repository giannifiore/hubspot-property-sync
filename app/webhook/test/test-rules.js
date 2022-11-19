const assert = require('assert');
const Rules = require("./../services/engine/Rules");

const engine = new Rules()
const { 
  v4: uuidv4,
} = require('uuid');

let validSourceDefinition = {
    "resource": "company",
    "property": {
        "id": "a_custom_prop"
    }
}

let validTargetDefinition = {
    "resource": "contact",
    "property": {
        "id": "a_custom_prop"
    },
    "overridable": true
}

let validRules = [
    {
        "source": validSourceDefinition,
        "target": validTargetDefinition
    }
]


describe('Mapping rules', function () {  
    it('should save and re-load rules for a given owner', async function () {
        let owner = uuidv4();
        await engine.save(owner, validRules);
        let rules = await engine.load(owner);
        assert(rules)
    });

    it('should validate rules and consider them valid', async function () {
        let valid = engine.validate(validRules);
        assert(valid)
    });

    it('should validate empty rules and consider them invalid', async function () {
        let invalidBecauseEmpty = [{}]
        let valid = engine.validate(invalidBecauseEmpty);
        assert(!valid)
    });        

    it('should validate rules without source and consider them invalid', async function () {
        let invalidBecauseMissingSource = [{ "target": validTargetDefinition }]
        let valid = engine.validate(invalidBecauseMissingSource);
        assert(!valid)
    });

    it('should validate rules without target and consider them invalid', async function () {
        let invalidBecauseMissingTarget = [{ "source": validSourceDefinition }]
        let valid = engine.validate(invalidBecauseMissingTarget);
        assert(!valid)
    });

    it('should validate rules with unsupported resources and consider them invalid', async function () {
        let invalidSourceDefinitionUnsupportedResource = { ...validSourceDefinition, resource: "ticket" }    
        let invalidBecauseUnsupportedResource = { ...validRules, source: invalidSourceDefinitionUnsupportedResource }
        let valid = engine.validate(invalidBecauseUnsupportedResource);
        assert(!valid)
    });
    
});