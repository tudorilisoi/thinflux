const tasks = []

const DEFAULT_TIMEOUT = 16
let TIMEOUT = DEFAULT_TIMEOUT

let timers = {}
const next = () => {
    const task = tasks.shift()
    if (task) {
        //console.log('ASYNC QUEUE', tasks.length + 1);
        task.callback()
    }
    if (tasks.length > 0) {
        tick(tasks[0].uid)
    }
}


// const clear = window.clearTimeout.bind(window)
// const set = window.setTimeout.bind(window)

const clear = window.cancelAnimationFrame.bind(window)
const set = window.requestAnimationFrame.bind(window)


const tick = uid => {
    console.log('TICK', uid, timers);
    clear(timers[uid])
    timers[uid] = set(next, TIMEOUT)
}

const queue = (callback, uid) => {
    tasks.push({callback, uid})
    if (tasks.length === 1) {
        tick(uid)
    }
}

const setDelay = millis => {
    TIMEOUT = millis
}

export default {
    setDelay,
    tick,
    queue,
}
