const InMemorySessionStore = require("./auth/SessionStore")
const TokenStore = require("./auth/TokenStore")
const sessionStore = new InMemorySessionStore()
const tokenStore = new TokenStore()
const PORT = 80

const app = require('./app')(sessionStore, tokenStore)
app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("App Server listening on Port", PORT);
})