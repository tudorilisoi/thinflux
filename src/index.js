import Store from './Store'
export {Store}

//TODO move these into the Store classs

function createSetter(store, path) {
    return function (...args) {
        return store.set(path, ...args)
    }
}

function createMergeSetter(store, path) {
    return function (...args) {
        return store.merge(path, ...args)
    }
}


function createGetter(store, path) {
    return function (...args) {
        return store.get(path, ...args)
    }
}

//

export function createStore(...args) {
    const store = new Store(...args)
    return {
        store,
        createSetter: createSetter.bind(null, store),
        createMergeSetter: createMergeSetter.bind(null, store),
        createGetter: createGetter.bind(null, store),
    }
}

