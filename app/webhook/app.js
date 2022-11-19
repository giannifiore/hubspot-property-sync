const express = require("express")
const bodyParser = require('body-parser')
const auth = require("./middlewares/auth")

const EventDispatcher = require('./events');
const RulesEngine = require("./services/engine/Rules")
const InMemoryTaskScheduler = require("./services/tasks/InMemoryTaskScheduler")

const rulesEngine = new RulesEngine()

const autostart = true;
const taskScheduler = new InMemoryTaskScheduler(autostart)

const eventDispatcher = new EventDispatcher(rulesEngine, taskScheduler)

const app = express();
app.use(bodyParser.json())
app.post('/hubspot/events/listener', auth,  async (req, res) => {
    await eventDispatcher.dispatch(req.body)
    res.write("ack")
    res.end()
})

module.exports = app