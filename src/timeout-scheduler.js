const tasks = []

const DEFAULT_TIMEOUT = 16
let TIMEOUT = DEFAULT_TIMEOUT

let timer
const next = () => {
    const cb = tasks.shift()
    if (cb) {
        //console.log('ASYNC QUEUE', tasks.length + 1);
        cb()
    }
    if (tasks.length > 0) {
        tick()
    }
}

const tick = () => {
    window.cancelAnimationFrame(timer)
    timer = window.requestAnimationFrame(next, TIMEOUT)
}

const queue = callback => {
    tasks.push(callback)
    if (tasks.length === 1) {
        tick()
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
