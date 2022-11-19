const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')
const TokenStore = require("./auth/TokenStore")
const tokenStore = new TokenStore()
const config = require("./config")
const scheduler = new ToadScheduler()
const auth = require("./services/hubspot/auth")
const moment = require("moment")

const REDIRECT_URI = `${config.app.protocol}://${config.app.host}:${config.app.port}/app/connect`;
// required only for validation purposes of refresh token process

const task = new Task('Refresh all tokens', async () => { 
    const tokens = await tokenStore.list();
    for (const token of tokens) {
        let userId = token["user.id"]
        let appId = token["app.id"]
        console.log(`> refreshing token for user ${userId} and app ${appId}`)
        const { access_token, refresh_token, expires_in, message } = 
            await auth.exchangeRefreshTokenForToken(
                token["refresh_token"], REDIRECT_URI)
        if (message) {
            console.error(message)
        } else {
            await tokenStore.store(userId, appId,
                {
                // keep created_at unchanged for reference
                timestamp: moment().unix(),
                access_token, 
                refresh_token, 
                expires_in })
        }
    }
})
const job = new SimpleIntervalJob(config.hubspot.auth.refresh.schedule, task)
scheduler.addSimpleIntervalJob(job)