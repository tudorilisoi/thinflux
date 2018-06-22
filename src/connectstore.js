import React from 'react'
import connect from './connect'
// import store from "src/store"


const identity = value => value

function mapKeyedPathsToStoreValues(store, pathsObj) {
    const propNames = Object.keys(pathsObj)
    const ret = propNames.reduce((acc, prop) => {
        acc[prop] = store.get(pathsObj[prop])
        return acc
    }, {})
    return ret
}


function normalizePaths(pathsObj, hoc) {
    if (typeof pathsObj === 'function') {
        return pathsObj(hoc)
    }
    return pathsObj
}

const connectstore = (store, Component, pathsObj, mapValuesToProps = identity) => {

    const config = {
        Component: Component,
        // connectComponent: ConnectStore,
        construct: hoc => {
            const paths = normalizePaths(pathsObj, hoc)
            const initial = mapValuesToProps(
                mapKeyedPathsToStoreValues(
                    store,
                    paths
                ), hoc, true)
            hoc.state = initial
        },
        didMount: hoc => {
            const paths = normalizePaths(pathsObj, hoc)

            hoc.subID = store.subscribe(Object.values(paths), values => {
                const newState = mapValuesToProps(
                    mapKeyedPathsToStoreValues(
                        store,
                        paths),
                    hoc, false)

                // if the mapper function returned null this is a no-op
                if (newState !== null) {
                    hoc.setState(newState)
                }
            })
        },
        willUnmount: hoc => {
            hoc.subID && store.unsubscribe(hoc.subID)
        }
    }
    const hoc = connect(config)
    hoc.displayName = `connectstore[${config.Component.displayName || config.Component.name}]`;
    return hoc

}

export default connectstore
