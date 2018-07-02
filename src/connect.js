import React from 'react'
import shallowEqual from 'fbjs/lib/shallowEqual'

export class Connect extends React.Component {
    constructor(props) {
        super(props)
        const {config: {Component, didMount, willUnmount, construct}, componentProps} = this.props
        this.state = {}
        this.connectRef = null
        construct(this)

    }

    _ref = (ref) => {
        this.connectRef = ref
    }


    shouldComponentUpdate(nextProps, nextState) {

        if (nextProps === null) {
            return false
        }

        const {props: {componentProps}, state} = this
        // return true
        return !shallowEqual(state, nextState) ||
            !shallowEqual(componentProps, nextProps.componentProps)
    }

    componentDidMount() {
        const {config: {didMount}} = this.props
        didMount(this)
    }

    componentWillUnmount() {
        const {config: {willUnmount}} = this.props
        willUnmount(this)
    }

    render() {
        const {config: {Component}, componentProps} = this.props
        const props = {...componentProps, ...this.state}
        return (<Component ref={this._ref} {...props} />)
    }
}

export default function connect(config) {
    const hoc = props => {
        return (<Connect config={config} componentProps={props}/>)
    }
    hoc.displayName = `connect[${config.Component.displayName || config.Component.name}]`;
    return hoc
}

