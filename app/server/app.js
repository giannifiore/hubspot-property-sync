const express = require('express');
const config = require("./config")
const session = require('express-session');
const escape = require('escape-html');
const moment = require("moment")

const { exchangeRefreshTokenForToken, exchangeCodeForToken, getAuthURL } = require("./services/hubspot/auth")
const NodeCache = require('node-cache');
const accessTokenAppCache = new NodeCache({ deleteOnExpire: true });

const sessionStrategy = session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true
})
const REDIRECT_URI = `${config.app.protocol}://${config.app.host}:${config.app.port}/app/connect`;

const buildApp = (sessionStore, tokenStore) => {
    const app = express();
    
    const path = __dirname + '/views/';
    app.use(express.static(path));

    app.use(sessionStrategy);

    app.get('/app/install', (req, res) => {
        console.log(`> ${req.method} ${req.url}`)
        res.redirect(getAuthURL(REDIRECT_URI));
    });
    
    app.get('/app/connect', async (req, res) => {
        console.log(`> ${req.method} ${req.url}`)
        if (req.query.code) {
            const { access_token, refresh_token, expires_in, message, user } = await exchangeCodeForToken(req.query.code, REDIRECT_URI);
            if (message) {
                return res.redirect(`/app/error?msg=${exchangeResult.message}`);
            }
            const now = moment().unix()
            await sessionStore.store(req.sessionID, { user })
            await tokenStore.store(user, config.hubspot.app.id, { 
                created_at: now,
                timestamp: now,
                access_token, 
                refresh_token,
                expires_in
            })
            res.redirect(`/app/home`);
          }
    })
    
    app.get('/', (req, res) => {
        console.log(`> ${req.method} ${req.url}`)
        res.redirect('/app/home')
    })
    
    app.get('/app/error', (req, res) => {
        console.log(`> ${req.method} ${req.url}`)
        res.setHeader('Content-Type', 'text/html');
        res.write(`<p>${escape(req.path.msg)}</p>`);
    })
    
    app.get('/app/home', async (req, res) => {
        console.log(`> ${req.method} ${req.url}`)
        res.setHeader('Content-Type', 'text/html');
        res.write(`<h2>Sync Props App</h2>`);
        if (await isAuthorized(req.sessionID)) {
            const accessToken = await getAccessToken(req.sessionID);
            res.write(`<h4>Access token: ${accessToken}</h4>`);
        } else {
            res.write(`<a href="/app/install"><h3>Install the app</h3></a>`);
        }
        res.end();
    })
    
    const getAccessToken = async (sessionID) => {
        let accessToken = accessTokenAppCache.get(sessionID)
        if (!accessToken) {
            // session token is expired or close to expiration: refresh the token remotely using refresh token
            let userId = (await sessionStore.get(sessionID)).user
            let current = (await tokenStore.get(userId, config.hubspot.app.id))
    
            const { access_token, refresh_token, expires_in, message, user } =
                 await exchangeRefreshTokenForToken(current.refresh_token, REDIRECT_URI);
            if (message) throw new Error(message)
            await tokenStore.store(user, 
                config.hubspot.app.id,
                {
                // keep created_at unchanged for reference
                timestamp: moment().unix(),
                access_token, 
                refresh_token, 
                expires_in })
            accessTokenAppCache.set(sessionID, access_token, Math.round(expires_in * 0.75))
        }
        return accessTokenAppCache.get(sessionID);
    }
    
    const isAuthorized = async (sessionID) => {
        return await sessionStore.get(sessionID);
    };

    return app
}
  

module.exports = buildApp