const TaskScheduler = require("./TaskScheduler")
const TaskRunner = require("./TaskRunner")

class InMemoryTaskScheduler extends TaskScheduler {
    constructor(autostart=false) {
        super(autostart)
        this.tasks = []
        this.taskRunner = new TaskRunner()
    }

    schedule = async (tasks) => {
        for (const task of tasks) {
            if (!this.autostart) this.tasks.push(task)
            else {
                await this.taskRunner.run(task)
            }
        }
    }

    dequeue = async (task) => {
        this.tasks = this.tasks.filter(t => t.id != task.id)
    }

    poll = async () => {
        return this.tasks
    }

    empty = async () => {
        this.tasks = []
    }
}

module.exports = InMemoryTaskScheduler