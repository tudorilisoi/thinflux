import connect from './connect'
import Store from './Store'

export {connect}
export {Store}

function createSetter(store, path) {
    return function (...args) {
        return store.set(path, ...args)
    }
}

function createGetter(store, path) {
    return function (...args) {
        return store.get(path, ...args)
    }
}

export function createStore(...args) {
    const store = new Store(...args)
    return {
        store,
        createSetter: createSetter.bind(null, store),
        createGetter: createGetter.bind(null, store),
    }
}

