import _ from "lodash";
import React from "react";
import scheduler from './timeout-scheduler.js'


function _getPropName(map) {
    if (Array.isArray(map)) {
        return map[0]
    } else {
        return map
    }
}

function _transformProp(map, value, valuesMap) {
    if (Array.isArray(map)) {
        const t = map[1]
        return t(value, valuesMap)
    } else {
        return value
    }
}

function _mapProps(valuesMap, mutations, objMap) {
    const newState = {}
    _.each(valuesMap, (val, storePath) => {
        const map = objMap[storePath]
        let propName = _getPropName(map)
        if (propName === '_') {
            propName = storePath
        }
        if (propName !== null) {
            newState[propName] = _transformProp(map, val, valuesMap)
        }
    })
    return newState
}


/**
 * objMap prop: {storePath:propName, anotherPath:[propName, transformFn], ...}
 */
class Connect extends React.Component {
    constructor(props) {
        super(props)

        this.isFrozen = this.isFrozen.bind(this)

        const self = this
        this.mounted = false
        this.timer = null

        this.store = props.__connect.store

        const mapper = props.__connect.transformFn ? props.__connect.transformFn : _mapProps

        let objMap = props.__connect.propsMap

        //allow passing an array of store paths
        //convert it to obj with key:null pairs
        if (Array.isArray(objMap)) {
            const t = {}
            objMap.forEach(v => {
                t[v] = null
            })
            objMap = t
        }

        const paths = Object.keys(objMap)
        const values = this.store.get(paths)
        const mappedValues = mapper(values, {}, objMap)

        this.state = {
            mappedProps: mappedValues
        }

        const {opts, component} = this.props.__connect

        this.subscriptionID = this.store.subscribe(paths, (values, mutations) => {
                if (!this.mounted) {
                    return
                }

                const _setStateAsync = () => {
                    if (!this.mounted) {
                        return
                    }
                    const newValues = this.store.get(paths)
                    const mappedMutations = mapper(newValues, mutations, objMap, this.ref)
//                    console.log('MAPPED', mappedMutations);
                    this.setState({mappedProps: mappedMutations})

                }

                //window.clearTimeout(this.timer)
                //this.timer = window.setTimeout(_setStateAsync, 16)
                scheduler.queue(_setStateAsync)

            },
            {
                freeze: this.isFrozen,
            }
        )

    }

    isFrozen() {
        const {opts, component} = this.props.__connect
        if (opts.freeze && opts.freeze()) {

            // component.name === 'HomeConnected' &&
//            // console.log('FROZEN', component.name, APP.state);
            return true
        }

        // component.name === 'HomeConnected' &&
//        // console.log('UNFROZEN', component.name, APP.state);

        return false
    }


    shouldComponentUpdate(nextProps, nextState) {
        if (this.isFrozen()) {
            return false
        }
        return nextState !== this.state
    }

    // componentWillMount(){}
    componentDidMount() {
        this.mounted = true
    }

    componentWillUnmount() {
        this.mounted = false
        if (this.subscriptionID) {
            store.unsubscribe(this.subscriptionID)
        }
    }

    _ref = (ref) => {
        this.ref = ref;

        //pass the ref further
        const {__connect, ...rest} = this.props
        rest.ref && rest.ref(ref)
    }

    render() {


        const {__connect, ...rest} = this.props
        const MappedComponent = __connect.component
        const {mappedProps} = this.state

//        // console.log('CONNECT PROPS', MappedComponent.name, mappedProps);

        return (<MappedComponent {...rest} {...mappedProps} ref={this._ref}/>)
    }

}

/**
 *  returns a component wrapped in a store paths observer
 * @param component
 * @param mapObj
 * @returns {function(*)}
 */
export default function connect(store, component, propsMap, transformFn = null, opts = {}) {
    return function (props) {
        return (<Connect  {...props} __connect={{store, component, propsMap, transformFn, opts}}/>)
    }
}

export {Connect}
