
import cloneDeep from 'lodash-es/cloneDeep'
import isArray from 'lodash-es/isArray'
import isObject from 'lodash-es/isObject'
import isEqual from 'lodash-es/isEqual'

import cuid from "cuid";
import scheduler from './timeout-scheduler.js'

function splitPath(pathStr) {
    return pathStr.split('.')
}

function splitProp(pathStr) {
    const segments = splitPath(pathStr)
    let prop = segments.pop()
    return {
        segments,
        prop,
    }
}

function mutate(val) {
    return isArray(val) ? val.slice(0) :
        isObject(val) ? Object.assign({}, val) : val
}

class Store {
    constructor(initial = {}, opts = {}) {

        this.jso = cloneDeep(initial)

        this.opts = opts
        this.defaults = initial
        this.subscriptionsByPath = {}
        this.subscribers = {}
    }

    /**
     * gets the value for a path ('.' separated list of segments e.g.'author.name')
     *
     * NOTE: all but the last segment will throw if it does not exist in the state tree
     *
     * @param {(string|string[])} pathStr
     * @returns {*}
     */
    get(pathStr) {
        if (!pathStr) {
            return this.jso
        }
        if (isArray(pathStr)) {
            const ret = {}
            pathStr.forEach(_pathStr => ret[_pathStr] = this.get(_pathStr))
            return ret
        }
        return this.getSegment(pathStr).value()
    }

    set(pathStr, value, opts = {}) {
        const s = this.getSegment(pathStr)
        const prev = s.value()
        if (opts.deepCompare) {
            if (isEqual(prev, value)) {
                console.log('SET: deepCompare NOOP', pathStr, value);
                return
            }
        }
        if (prev === value) {
            console.log('SET: NOOP', pathStr, value);
            return
        }
        console.log('SET', pathStr, prev, value, s);
        s.set(value)
        const {segments} = splitProp(pathStr)
        let changedPath = []
        segments.forEach(segmentStr => {
            changedPath.push(segmentStr)
            const p = changedPath.join('.')
            const so = this.getSegment(p)
            console.log('MUTATE PARENT', p);
            so.set(mutate(so.value()))
            this.notify(p)
        })
        this.notify(pathStr)
    }

    merge(pathStr, valueObj, opts = {}) {
        const current = this.get(pathStr)
        //const merged = {...current, ...valueObj}
        //return this.set(pathStr, merged, opts)
        Object.keys(valueObj).forEach(key => {
            this.set(`${pathStr}.${key}`, valueObj[key])
        })
    }

    addPath(pathStr, initialValue) {
        const segments = splitPath(pathStr)
        const l = segments.length
        let s = this.jso
        segments.forEach((segment, idx) => {
            if (s[segment] === undefined) {
                s[segment] = idx === l - 1 ? initialValue : {}
            }
            s = s[segment]
        })
        console.log('STORE', this.jso);
    }

    unsubscribe(uid) {
        const {subscriptionsByPath, subscribers} = this
        const sub = subscribers[uid]
        delete subscribers[uid]
        for (let pathStr of sub.pathsArr) {
            console.log('UNSUB', uid, pathStr);
            let index = subscriptionsByPath[pathStr].indexOf(sub)
            if (index > -1) {
                subscriptionsByPath[pathStr].splice(index, 1)
            }
        }
    }

    subscribe(pathsArr, callback, opts = {}) {
        const uid = cuid()
        const sub = {
            uid,
            pathsArr,
            callback,
            opts
        }
        this.subscribers[uid] = sub
        const {subscriptionsByPath} = this
        pathsArr.forEach(pathStr => {
            subscriptionsByPath[pathStr] = subscriptionsByPath[pathStr] || []
            subscriptionsByPath[pathStr].push(sub)
        })
        // return this.unsubscribe.bind(this, uid)
        return uid
    }

    notify(pathStr) {
        const {subscriptionsByPath} = this
        const subs = subscriptionsByPath[pathStr]
        if (subs === undefined) {
            return
        }
        scheduler.queue(() => {
            subs.forEach(sub => {
                const cbValue = this.get(sub.pathsArr)
                sub.callback(cbValue)
                console.log('NOTIFY', pathStr, sub.uid, cbValue);
            })

        })
    }

    getParent(pathStr) {
        const {segments} = splitProp(pathStr)
        let parent = this.jso
        segments.forEach(segment => {
            parent = parent[segment]
            if (parent === undefined) {
                throw new Error(`STORE: NO SUCH PATH '${pathStr}', segment '${segment}'`)
            }
        })
        return parent
    }

    getSegment(pathStr) {
        const {prop} = splitProp(pathStr)
        const ret = {
            value: () => this.getParent(pathStr)[prop],
            set: (value) => this.getParent(pathStr)[prop] = value,
        }
        return ret
    }
}

export default Store
