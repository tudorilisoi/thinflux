import _ from 'lodash'
import React from 'react'
import connect from './connect'

function defaultTransform(emittedValue, hoc, evName) {
    return {[evName]: emittedValue}
}

const connectevents = (store, Component, eventHandlerMap) => {

    const config = {
        Component: Component,
        construct: hoc => {
            hoc.__eventhandlers = {}
            hoc.state = {}
            Object.keys(eventHandlerMap).forEach(evName => {
                const conf = eventHandlerMap[evName]
                hoc.state = {
                    ...hoc.state,
                    ...conf.initial
                }
                const transform = conf.transformFn || defaultTransform
                const handler = emittedValue => {
                    const newState = transform(emittedValue, hoc)
                    if (newState === null) {
                        //noop
                        return
                    }
                    // console.log('NEW EV STATE', newState);
                    hoc.setState(newState)
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
