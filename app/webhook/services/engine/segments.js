const hubspotClient = require("@hubspot/api-client")
const config = require("./../../config")

class SegmentsExtractor {
    extract = async (segmentDefinition) => {
        const { filters, resource, owner } = segmentDefinition
        
        const startingResource = Object.keys(filters)[0]
        const targetResource = resource
        const hsClient = new hubspotClient.Client({
            basePath: config.hubspot.api.url,
            accessToken: "token" // load owner token
        })
        const contacts = hsClient.crm.contacts
        const companies = hsClient.crm.companies
        const deals = hsClient.crm.deals 
        const tickets = hsClient.crm.tickets

        switch (targetResource) {
            case "company": {
                switch (startingResource) {
                    case "company": {
                        return [{
                            owner,
                            resource: "company",
                            id: filters["company"].id
                        }]
                    }
                    case "contact": {
                        let contact = filters["contact"]
                        let contactCompanies = (await contacts.associationsApi.getAll(contact.id, "company")).results
                        return contactCompanies.map(company => {
                            return {
                                owner,
                                resource: "company",
                                id: company.id
                            }
                        })
                    }
                    case "deal": {
                        let deal = filters["deal"]
                        let dealContacts = (await deals.associationsApi.getAll(deal.id, "contact")).results
                        let dealContact = dealContacts[0]
                        let contactCompanies = (await contacts.associationsApi.getAll(dealContact.id, "company")).results
                        return contactCompanies.map(company => {
                            return {
                                owner,
                                resource: "company",
                                id: company.id
                            }
                        })
                    }
                    case "ticket": {
                        let ticket = filters["ticket"]
                        let ticketContacts = (await tickets.associationsApi.getAll(ticket.id, "contact")).results
                        let ticketContact = ticketContacts[0]
                        let ticketContactCompanies = (await contacts.associationsApi.getAll(ticketContact.id, "company")).results
                        return ticketContactCompanies.map(company => {
                            return {
                                owner,
                                resource: "company",
                                id: company.id
                            }
                        })
                    }
                }
            }
            case "contact": {
                switch (startingResource) {
                    case "company": {
                        let company = filters["company"]
                        let companyContacts = (await companies.associationsApi.getAll(company.id, "contact")).results
                        return companyContacts.map(contact => {
                            return {
                                owner,
                                resource: "contact",
                                id: contact.id
                            }
                        })
                    }
                    case "contact": {
                        return [{
                            owner,
                            resource: "contact",
                            id: filters["contact"].id
                        }]
                    }
                    case "deal": {
                        let deal = filters["deal"]
                        let dealContacts = (await deals.associationsApi.getAll(deal.id, "contact")).results
                        let dealContact = dealContacts[0]
                        return [{
                            owner,
                            resource: "contact",
                            id: dealContact.id
                        }]
                    }
                    case "ticket": {
                        let ticket = filters["ticket"]
                        let ticketContacts = (await tickets.associationsApi.getAll(ticket.id, "contact")).results
                        let ticketContact = ticketContacts[0]
                        return [{
                            owner,
                            resource: "contact",
                            id: ticketContact.id
                        }]
                    }
                }
            }
            case "deal": {
                switch (startingResource) {
                    case "company": {
                        let deals = []
                        let company = filters["company"]
                        let companyContacts = (await companies.associationsApi.getAll(company.id, "contact")).results
                        for (const companyContact of companyContacts) {
                            let contactDeals = (await contacts.associationsApi.getAll(companyContact.id, "deal")).results
                            for (const contactDeal of contactDeals) {
                                deals.push({
                                    owner,
                                    resource: "deal",
                                    id: contactDeal.id,
                                })    
                            }
                        }
                        return deals
                    }
                    case "contact": {
                        let contact = filters["contact"]
                        let contactDeals = (await contacts.associationsApi.getAll(contact.id, "deal")).results
                        return contactDeals.map(contactDeal => {
                            return {
                                owner,
                                resource: "deal",
                                id: contactDeal.id
                            }
                        })
                    }
                    case "deal": {
                        return [{
                            owner,
                            resource: "deal",
                            id: filters["deal"].id
                        }]
                    }
                    case "ticket": {
                        let ticket = filters["ticket"]
                        let ticketContacts = (await tickets.associationsApi.getAll(ticket.id, "contact")).results
                        let ticketContact = ticketContacts[0]
                        let ticketContactDeals = (await contacts.associationsApi.getAll(ticketContact.id, "deal")).results
                        return ticketContactDeals.map(ticketContactDeal => {
                            return {
                                owner,
                                resource: "deal",
                                id: ticketContactDeal.id
                            }
                        })
                    }
                }
            }
            case "ticket": {
                switch (startingResource) {
                    case "company": {
                        let company = filters["company"]
                        let tickets = []
                        let companyContacts = (await companies.associationsApi.getAll(company.id, "contact")).results
                        for (const companyContact of companyContacts) {
                            let companyContactTickets = (await contacts.associationsApi.getAll(companyContact.id, "ticket")).results
                            for (const companyContactTicket of companyContactTickets) {
                                tickets.push({
                                    owner,
                                    resource: "ticket",
                                    id: companyContactTicket.id
                                })
                            }
                        }
                        return tickets;
                    }
                    case "contact": {
                        let contact = filters["contact"]
                        let contactTickets = (await contacts.associationsApi.getAll(contact.id, "ticket")).results
                        return contactTickets.map(contactTicket => {
                            return {
                                owner,
                                resource: "ticket",
                                id: contactTicket.id
                            }
                        })
                    }
                    case "deal": {
                        let deal = filters["deal"]
                        let dealContacts = (await deals.associationsApi.getAll(deal.id,"contact")).results
                        let dealContact = dealContacts[0]
                        let dealContactTickets = (await contacts.associationsApi.getAll(dealContact.id, "ticket")).results
                        return dealContactTickets.map(dealContactTicket => {
                            return {
                                owner,
                                resource: "ticket",
                                id: dealContactTicket.id
                            }
                        })
                    }
                    case "ticket": {
                        return [{
                            owner,
                            resource: "ticket",
                            id: filters["ticket"].id,
                        }]
                    }
                }
            }
        }
    }
}

module.exports = SegmentsExtractor