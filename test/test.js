const assert = require('assert');
var AWS = require('aws-sdk');
const pluralize = require("pluralize")
const config = require("./config")

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: config.aws.region,
  endpoint: config.aws.dynamo.url,
});

const docClient = new AWS.DynamoDB.DocumentClient({
  service: dynamodb
})

const hubspotClient = require("@hubspot/api-client")

const accessToken = "random"
const owner = 1
const hsClient = new hubspotClient.Client({ accessToken, basePath: config.hubspot.api.url })


let associationTypes = {
  "contact to company" : 1, 
  "company to contact" : 2, 
  "deal to contact" : 3, 
  "contact to deal" : 4, 
  "deal to company" : 5, 
  "company to deal" : 6, 
  "company to engagement" : 7, 
  "engagement to company" : 8, 
  "contact to engagement" : 9, 
  "engagement to contact" : 10, 
  "deal to engagement" : 11, 
  "engagement to deal" : 12, 
  "parent company to child company" : 13, 
  "child company to parent company" : 14, 
  "contact to ticket" : 15, 
  "ticket to contact" : 16, 
  "ticket to engagement" : 17, 
  "engagement to ticket" : 18, 
  "deal to line item" : 19, 
  "line item to deal" : 20, 
  "company to ticket" : 25, 
  "ticket to company" : 26, 
  "deal to ticket" : 27, 
  "ticket to deal" : 28
}

const companies = hsClient.crm.companies.basicApi
const contacts = hsClient.crm.contacts.basicApi
const deals = hsClient.crm.deals.basicApi
const tickets = hsClient.crm.tickets.basicApi

const rulesEngine = {
  save: async (owner, rules) => {
    await (docClient.put({
      Item: {
        "user.id": String(owner),
        "rules": rules
      },
      TableName: config.aws.dynamo.rulesTable
    }).promise())
  },
  get: async (owner) => {
    let result = await (docClient.get({
      Key: {
        "user.id": String(owner)
      },
      TableName: config.aws.dynamo.rulesTable
    }).promise())
    return result.Item.rules
  }
}

const setRelated = async (resourceType, resource, otherResourceType, otherResource) => {
  let associationType = associationTypes[`${resourceType} to ${otherResourceType}`]
  await hsClient
    .crm[pluralize(resourceType)]
    .associationsApi
    .create(resource.id, otherResourceType, otherResource.id, associationType)
}


const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');
const randomName = () => uniqueNamesGenerator({
  dictionaries: [adjectives, animals],
  length: 2
});

const generateContact = (forCompany) => {
  let name = randomName();
  return {
    "properties": {
      "company": forCompany.properties.name,
      "email": `${name}@${forCompany.properties.domain}`,
      "firstname": name.split("_")[0],
      "lastname": name.split("_")[1],
      "phone": "(877) 929-0687",
      "website": `https://${forCompany.properties.domain}.com`  
    }
  }
}

const generateCompany = () => {
  let random = randomName()
  let domain = `${random.replace("_","")}.com`
  let name = random.replace("_", " ");
  return {
    "properties": {
      "city": "Cambridge",
      "domain": domain,
      "industry": "Technology",
      "name": name,
      "phone": "(877) 929-0687",
      "state": "Massachusetts"
    }
  }
}

const generateDeal = () => {
  return {
    "properties": {
      "amount": "99.00",
      "closedate": "2022-11-01T00:00:00.000Z",
      "dealname": "Demo deal",
      "dealstage": "presentationscheduled",
      "pipeline": "default"  
    }
  }
}

const generateTicket = () => {
  return {
    "properties": {
      "hs_pipeline": "0",
      "hs_pipeline_stage": "1",
      "hs_ticket_priority": "HIGH",
      "subject": "troubleshoot report"  
    }
  }
}


describe('Sync', async function () {
  
  describe('Company-level changes', async function () {
  
    it('should update all contacts upon company custom prop change', async function () {
      const syncCompanyToContactsRules = [
        {
          "source": {
            "resource": "company",
            "property": { 
              "id": "prop"
            }
          },
          "target": {
            "resource": "contact",
            "property": {
              "id": "prop",
              "overridable": true
            }
          }
        }
      ];
  
      await rulesEngine.save(owner, syncCompanyToContactsRules)
      let company = generateCompany()
      let contact = generateContact(company)

      company = await companies.create(company)
      contact = await contacts.create(contact)
      await setRelated("company", company, "contact", contact)
      await setRelated("contact", contact, "company", company)

      // simulate setting a custom prop for company
      await companies.update(company.id, { 
        id: company.id,
        properties: {
          prop: "true"
        }
      })

      contact = await contacts.getById(contact.id, ["prop"])
      assert(contact.properties.prop == "true")

    });

    it('should update all deals upon company custom prop change', async function () {
      const syncCompanyToDealsRules = [
        {
          "source": {
            "resource": "company",
            "property": { 
              "id": "prop"
            }
          },
          "target": {
            "resource": "deal",
            "property": {
              "id": "prop",
              "overridable": true
            }
          }
        }
      ];
      
      await rulesEngine.save(owner, syncCompanyToDealsRules)
      let company = generateCompany()
      let contact = generateContact(company)
      let deal = generateDeal()

      company = await companies.create(company)
      contact = await contacts.create(contact)
      deal = await deals.create(deal)
      
      await setRelated("company", company, "contact", contact)
      await setRelated("contact", contact, "company", company)

      await setRelated("contact", contact, "deal", deal)
      await setRelated("deal", deal, "contact", contact)

      // simulate setting a custom prop for company
      await companies.update(company.id, { 
        id: company.id,
        properties: {
          prop: "true"
        }
      })

      deal = await deals.getById(deal.id, ["prop"])
      assert(deal.properties.prop == "true")
    });

    it('should update all tickets upon company custom prop change', async function () {
      const syncCompanyToTicketsRules = [
        {
          "source": {
            "resource": "company",
            "property": { 
              "id": "prop"
            }
          },
          "target": {
            "resource": "ticket",
            "property": {
              "id": "prop",
              "overridable": true
            }
          }
        }
      ];
      
      await rulesEngine.save(owner, syncCompanyToTicketsRules)
      let company = generateCompany()
      let contact = generateContact(company)
      let ticket = generateTicket()

      company = await companies.create(company)
      contact = await contacts.create(contact)
      ticket = await tickets.create(ticket)
      
      await setRelated("company", company, "contact", contact)
      await setRelated("contact", contact, "company", company)

      await setRelated("contact", contact, "ticket", ticket)
      await setRelated("ticket", ticket, "contact", contact)

      // simulate setting a custom prop for company
      await companies.update(company.id, { 
        id: company.id,
        properties: {
          prop: "true"
        }
      })

      ticket = await tickets.getById(ticket.id, ["prop"])
      assert(ticket.properties.prop == "true")
    });

    it('should update all tickets of same contact upon change to deal custom prop change', async function () {
      const syncTicketToDealsRules = [
        {
          "source": {
            "resource": "ticket",
            "property": { 
              "id": "prop"
            }
          },
          "target": {
            "resource": "deal",
            "property": {
              "id": "prop",
              "overridable": true
            }
          }
        }
      ];
      
      await rulesEngine.save(owner, syncTicketToDealsRules)

      let contact = generateContact(generateCompany())
      let ticket = generateTicket()
      let deal = generateDeal()

      contact = await contacts.create(contact)
      ticket = await tickets.create(ticket)
      deal = await deals.create(deal)

      await setRelated("contact", contact, "deal", deal)
      await setRelated("deal", deal, "contact", contact)

      await setRelated("contact", contact, "ticket", ticket)
      await setRelated("ticket", ticket, "contact", contact)


      // simulate setting a custom prop for ticket
      await tickets.update(ticket.id, { 
        id: ticket.id,
        properties: {
          prop: "true"
        }
      })

      deal = await deals.getById(deal.id, ["prop"])
      assert(deal.properties.prop == "true")
    });

    it('should update company upon deal custom prop change', async function () {
      const syncDealToCompany = [
        {
          "source": {
            "resource": "deal",
            "property": { 
              "id": "prop"
            }
          },
          "target": {
            "resource": "company",
            "property": {
              "id": "prop",
              "overridable": true
            }
          }
        }
      ];
      
      await rulesEngine.save(owner, syncDealToCompany)
      let company = generateCompany()
      let contact = generateContact(company)
      let deal = generateDeal()

      company = await companies.create(company);
      contact = await contacts.create(contact)
      deal = await deals.create(deal)
      
      await setRelated("contact", contact, "deal", deal)
      await setRelated("deal", deal, "contact", contact)

      await setRelated("contact", contact, "company", company)
      await setRelated("company", company, "contact", contact)

      // simulate setting a custom prop for deal
      await deals.update(deal.id, { 
        id: deal.id,
        properties: {
          prop: "true"
        }
      })

      company = await companies.getById(company.id, ["prop"])
      assert(company.properties.prop == "true")
    });

    it('should update all company deals upon changes to one of the deal of the company', async function () {
      const syncDealToCompany = [
        {
          "source": {
            "resource": "deal",
            "property": { 
              "id": "prop"
            }
          },
          "target": {
            "resource": "company",
            "property": {
              "id": "prop",
              "overridable": true
            }
          }
        },
        {
          "source": {
            "resource": "company",
            "property": { 
              "id": "prop"
            }
          },
          "target": {
            "resource": "deal",
            "property": {
              "id": "prop",
              "overridable": true
            }
          }
        }
      ];
      
      await rulesEngine.save(owner, syncDealToCompany)
      let company = generateCompany()
      let contact1 = generateContact(company)
      let contact2 = generateContact(company)
      let deal1 = generateDeal()
      let deal2 = generateDeal()

      company = await companies.create(company);
      contact1 = await contacts.create(contact1)
      contact2 = await contacts.create(contact2)
      deal1 = await deals.create(deal1)
      deal2 = await deals.create(deal2)
      
      await setRelated("contact", contact1, "deal", deal1)
      await setRelated("deal", deal1, "contact", contact1)
      await setRelated("contact", contact2, "deal", deal2)
      await setRelated("deal", deal2, "contact", contact2)

      await setRelated("contact", contact1, "company", company)
      await setRelated("company", company, "contact", contact1)
      await setRelated("contact", contact2, "company", company)
      await setRelated("company", company, "contact", contact2)


      // simulate setting a custom prop for deal
      await deals.update(deal1.id, { 
        id: deal1.id,
        properties: {
          prop: "true"
        }
      })

      company = await companies.getById(company.id, ["prop"])
      deal1 = await deals.getById(deal1.id, ["prop"])
      deal2 = await deals.getById(deal2.id, ["prop"])
      assert(company.properties.prop == "true")
      assert(deal1.properties.prop == "true")
      assert(deal2.properties.prop == "true")
    });
    
  });
});