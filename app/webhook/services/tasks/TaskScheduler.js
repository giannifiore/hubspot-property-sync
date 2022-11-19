class TaskScheduler {
    constructor(autostart=false) {
        this.autostart = autostart
    }

    schedule = async (tasks) => {
        // upload to a queue
    }

    dequeue = async (task) => {

    }

    poll = async () => {

    }

    empty = async () => {
        
    }
    
}

module.exports = TaskScheduler