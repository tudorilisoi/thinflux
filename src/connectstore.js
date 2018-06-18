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

const connectstore = (store, Component, pathsObj, mapValuesToProps = identity) => {


    const paths = Object.values(pathsObj)

    const config = {
        Component: Component,
        // connectComponent: ConnectStore,
        construct: hoc => {
            console.log('CONNECT_STORE CONSTRUCT')
            const initial = mapValuesToProps(mapKeyedPathsToStoreValues(store, pathsObj))
            hoc.state = initial
        },
        didMount: hoc => {
            hoc.subID = store.subscribe(paths, values => {
                const newState = mapValuesToProps(mapKeyedPathsToStoreValues(store, pathsObj))
                hoc.setState(newState)
            })
        },
        willUnmount: hoc => {
            hoc.subID && store.unsubscribe(hoc.subID)
        }
    }
    const hoc = connect(config)
    hoc.displayName = `connectstore(${config.Component.displayName || config.Component.name})`;
    return hoc

}

export default connectstore
