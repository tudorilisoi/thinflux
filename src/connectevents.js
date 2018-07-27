import _ from 'lodash'
import React from 'react'
import connect from './connect'

const connectevents = (store, Component, eventHandlerMap) => {

    const config = {
        Component: Component,
        construct: hoc => {
            hoc.__eventhandlers = {}
            hoc.state = {}
            Object.keys(eventHandlerMap).forEach(evName => {
                const conf = eventHandlerMap[evName]
                hoc.state[evName] = conf.initial
                const transform = conf.transform || _.identity
                const handler = emittedValue => {
                    hoc.setState({
                        [evName]: transform(emittedValue)
                    })
                }
                hoc.__eventhandlers[evName] = handler
                store.eventBus.on(evName, handler)
            })

        },
        didMount: _.noop,

        willUnmount: hoc => {
            Object.keys(eventHandlerMap).forEach(evName => {
                store.eventBus.off(evName, hoc.__eventhandlers[evName])
            })
        }
    }
    const hoc = connect(config)
    hoc.displayName = `connectevents[${config.Component.displayName || config.Component.name}]`;
    return hoc

}

export default connectevents
