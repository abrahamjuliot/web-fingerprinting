/* Prototype lies */

const getIframe = () => {
    try {
        const numberOfIframes = window.length
        const frag = new DocumentFragment()
        const div = document.createElement('div')
        frag.appendChild(div)
        const ghost = () => `
			height: 100vh;
			width: 100vw;
			position: absolute;
			left:-10000px;
			visibility: hidden;
		`
        div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
        document.body.appendChild(frag)
        const iframeWindow = window[numberOfIframes]
        return {
            iframeWindow,
            div
        }
    } catch (error) {
        return {
            iframeWindow: window,
            div: undefined
        }
    }
}
const {
    iframeWindow,
    div: iframeContainerDiv
} = getIframe()

const getPrototypeLies = iframeWindow => {
    // Lie Tests
    // object constructor descriptor should return undefined properties
    const getUndefinedValueLie = (obj, name) => {
        const objName = obj.name
        const objNameUncapitalized = window[objName.charAt(0).toLowerCase() + objName.slice(1)]
        const hasInvalidValue = !!objNameUncapitalized && (
            typeof Object.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined' ||
            typeof Reflect.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined'
        )
        return hasInvalidValue ? true : false
    }

    // accessing the property from the prototype should throw a TypeError
    const getIllegalTypeErrorLie = (obj, name) => {
        const proto = obj.prototype
        try {
            proto[name]
            //console.log(obj.name, name)
            return true
        } catch (error) {
            return error.constructor.name != 'TypeError' ? true : false
        }
        const illegal = [
            '',
            'is',
            'call',
            'seal',
            'keys',
            'bind',
            'apply',
            'assign',
            'freeze',
            'values',
            'entries',
            'toString',
            'isFrozen',
            'isSealed',
            'constructor',
            'isExtensible',
            'getPrototypeOf',
            'preventExtensions',
            'propertyIsEnumerable',
            'getOwnPropertySymbols',
            'getOwnPropertyDescriptors'
        ]
        const lied = !!illegal.find(prop => {
            try {
                prop == '' ? Object(proto[name]) : Object[prop](proto[name])
                return true
            } catch (error) {
                return error.constructor.name != 'TypeError' ? true : false
            }
        })
        return lied
    }

    // calling the interface prototype on the function should throw a TypeError
    const getCallInterfaceTypeErrorLie = (apiFunction, proto) => {
        try {
            new apiFunction()
            apiFunction.call(proto)
            return true
        } catch (error) {
            return error.constructor.name != 'TypeError' ? true : false
        }
    }

    // applying the interface prototype on the function should throw a TypeError
    const getApplyInterfaceTypeErrorLie = (apiFunction, proto) => {
        try {
            new apiFunction()
            apiFunction.apply(proto)
            return true
        } catch (error) {
            return error.constructor.name != 'TypeError' ? true : false
        }
    }

    // creating a new instance of the function should throw a TypeError
    const getNewInstanceTypeErrorLie = apiFunction => {
        try {
            new apiFunction()
            return true
        } catch (error) {
            return error.constructor.name != 'TypeError' ? true : false
        }
    }

    // extending the function on a fake class should throw a TypeError and message "not a constructor"
    const getClassExtendsTypeErrorLie = apiFunction => {
        try {
            class Fake extends apiFunction {}
            return true
        } catch (error) {
            // Native has TypeError and 'not a constructor' message in FF & Chrome
            return error.constructor.name != 'TypeError' ? true :
                !/not a constructor/i.test(error.message) ? true : false
        }
    }

    // setting prototype to null and converting to a string should throw a TypeError
    const getNullConversionTypeErrorLie = apiFunction => {
        const nativeProto = Object.getPrototypeOf(apiFunction)
        try {
            Object.setPrototypeOf(apiFunction, null) + ''
            return true
        } catch (error) {
            return error.constructor.name != 'TypeError' ? true : false
        } finally {
            // restore proto
            Object.setPrototypeOf(apiFunction, nativeProto)
        }
    }

    // toString() and toString.toString() should return a native string in all frames
    const getToStringLie = (apiFunction, name, iframeWindow) => {
        /*
        Accepted strings:
        'function name() { [native code] }'
        'function name() {\n    [native code]\n}'
        'function get name() { [native code] }'
        'function get name() {\n    [native code]\n}'
        'function () { [native code] }'
        `function () {\n    [native code]\n}`
        */
        const apiFunctionToString = (
            iframeWindow ?
            iframeWindow.Function.prototype.toString.call(apiFunction) :
            apiFunction.toString()
        )
        const apiFunctionToStringToString = (
            iframeWindow ?
            iframeWindow.Function.prototype.toString.call(apiFunction.toString) :
            apiFunction.toString.toString()
        )
        const trust = name => ({
            [`function ${name}() { [native code] }`]: true,
            [`function get ${name}() { [native code] }`]: true,
            [`function () { [native code] }`]: true,
            [`function ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
            [`function get ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
            [`function () {${'\n'}    [native code]${'\n'}}`]: true
        })
        return (
            !trust(name)[apiFunctionToString] ||
            !trust('toString')[apiFunctionToStringToString]
        )
    }

    // "prototype" in function should not exist
    const getPrototypeInFunctionLie = apiFunction => 'prototype' in apiFunction ? true : false

    // "arguments", "caller", "prototype", "toString"  should not exist in descriptor
    const getDescriptorLie = apiFunction => {
        const hasInvalidDescriptor = (
            !!Object.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
            !!Reflect.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
            !!Object.getOwnPropertyDescriptor(apiFunction, 'caller') ||
            !!Reflect.getOwnPropertyDescriptor(apiFunction, 'caller') ||
            !!Object.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
            !!Reflect.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
            !!Object.getOwnPropertyDescriptor(apiFunction, 'toString') ||
            !!Reflect.getOwnPropertyDescriptor(apiFunction, 'toString')
        )
        return hasInvalidDescriptor ? true : false
    }

    // "arguments", "caller", "prototype", "toString" should not exist as own property
    const getOwnPropertyLie = apiFunction => {
        const hasInvalidOwnProperty = (
            apiFunction.hasOwnProperty('arguments') ||
            apiFunction.hasOwnProperty('caller') ||
            apiFunction.hasOwnProperty('prototype') ||
            apiFunction.hasOwnProperty('toString')
        )
        return hasInvalidOwnProperty ? true : false
    }

    // descriptor keys should only contain "name" and "length"
    const getDescriptorKeysLie = apiFunction => {
        const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(apiFunction))
        const hasInvalidKeys = '' + descriptorKeys != 'length,name' && '' + descriptorKeys != 'name,length'
        return hasInvalidKeys ? true : false
    }

    // own property names should only contain "name" and "length"
    const getOwnPropertyNamesLie = apiFunction => {
        const ownPropertyNames = Object.getOwnPropertyNames(apiFunction)
        const hasInvalidNames = (
            '' + ownPropertyNames != 'length,name' && '' + ownPropertyNames != 'name,length'
        )
        return hasInvalidNames ? true : false
    }

    // own keys names should only contain "name" and "length"
    const getOwnKeysLie = apiFunction => {
        const ownKeys = Reflect.ownKeys(apiFunction)
        const hasInvalidKeys = '' + ownKeys != 'length,name' && '' + ownKeys != 'name,length'
        return hasInvalidKeys ? true : false
    }

    // API Function Test
    const getLies = (apiFunction, proto, obj = null) => {
        if (typeof apiFunction != 'function') {
            return {
                lied: false,
                lieTypes: []
            }
        }
        const name = apiFunction.name.replace(/get\s/, '')
        const lies = {
            // custom lie string names
            [`a: accessing the property from the prototype should throw a TypeError`]: obj ? getIllegalTypeErrorLie(obj, name) : false,
            [`b: object constructor descriptor should return undefined properties`]: obj ? getUndefinedValueLie(obj, name) : false,
            [`c: calling the interface prototype on the function should throw a TypeError`]: getCallInterfaceTypeErrorLie(apiFunction, proto),
            [`d: applying the interface prototype on the function should throw a TypeError`]: getApplyInterfaceTypeErrorLie(apiFunction, proto),
            [`e: creating a new instance of the function should throw a TypeError`]: getNewInstanceTypeErrorLie(apiFunction),
            [`f: extending the function on a fake class should throw a TypeError`]: getClassExtendsTypeErrorLie(apiFunction),
            [`g: setting prototype to null and converting to a string should throw a TypeError`]: getNullConversionTypeErrorLie(apiFunction),
            [`h: toString() and toString.toString() should return a native string in all frames`]: getToStringLie(apiFunction, name, iframeWindow),
            [`i: "prototype" in function should not exist`]: getPrototypeInFunctionLie(apiFunction),
            [`j: "arguments", "caller", "prototype", "toString"  should not exist in descriptor`]: getDescriptorLie(apiFunction),
            [`k: "arguments", "caller", "prototype", "toString" should not exist as own property`]: getOwnPropertyLie(apiFunction),
            [`l: descriptor keys should only contain "name" and "length"`]: getDescriptorKeysLie(apiFunction),
            [`m: own property names should only contain "name" and "length"`]: getOwnPropertyNamesLie(apiFunction),
            [`n: own keys names should only contain "name" and "length"`]: getOwnKeysLie(apiFunction)
        }
        const lieTypes = Object.keys(lies).filter(key => !!lies[key])
        return {
            lied: lieTypes.length,
            lieTypes
        }
    }

    // Lie Detector
    const createLieDetector = () => {
        const isSupported = obj => typeof obj != 'undefined' && !!obj
        const props = {} // lie list and detail
        let propsSearched = [] // list of properties searched
        return {
            getProps: () => props,
            getPropsSearched: () => propsSearched,
            searchLies: (fn, {
                target = [],
                ignore = []
            } = {}) => {
                let obj
                // check if api is blocked or not supported
                try {
                    obj = fn()
                    if (!isSupported(obj)) {
                        return
                    }
                } catch (error) {
                    return
                }

                const interfaceObject = !!obj.prototype ? obj.prototype : obj
                Object.getOwnPropertyNames(interfaceObject)
                    .forEach(name => {
                        const skip = (
                            name == 'constructor' ||
                            (target.length && !new Set(target).has(name)) ||
                            (ignore.length && new Set(ignore).has(name))
                        )
                        if (skip) {
                            return
                        }
                        const objectNameString = /\s(.+)\]/
                        const apiName = `${
							obj.name ? obj.name : objectNameString.test(obj) ? objectNameString.exec(obj)[1] : undefined
						}.${name}`
                        propsSearched.push(apiName)
                        try {
                            const proto = obj.prototype ? obj.prototype : obj
                            let res // response from getLies

                            // search if function
                            try {
                                const apiFunction = proto[name] // may trigger TypeError
                                if (typeof apiFunction == 'function') {
                                    res = getLies(proto[name], proto)
                                    if (res.lied) {
                                        return (props[apiName] = res.lieTypes)
                                    }
                                    return
                                }
                            } catch (error) {}
                            // else search getter function
                            const getterFunction = Object.getOwnPropertyDescriptor(proto, name).get
                            res = getLies(getterFunction, proto, obj) // send the obj for special tests
                            if (res.lied) {
                                return (props[apiName] = res.lieTypes)
                            }
                            return
                        } catch (error) {
                            const lie = `failed prototype test execution`
                            return (
                                props[apiName] = [lie]
                            )
                        }
                    })
            }
        }
    }

    const lieDetector = createLieDetector()
    const {
        searchLies
    } = lieDetector

    // search for lies: remove target to search all properties
    searchLies(() => AnalyserNode)
    searchLies(() => AudioBuffer, {
        target: [
            'copyFromChannel',
            'getChannelData'
        ]
    })
    searchLies(() => BiquadFilterNode, {
        target: [
            'getFrequencyResponse'
        ]
    })
    searchLies(() => CanvasRenderingContext2D, {
        target: [
            'getImageData',
            'getLineDash',
            'isPointInPath',
            'isPointInStroke',
            'measureText',
            'quadraticCurveTo'
        ]
    })
    searchLies(() => Date, {
        target: [
            'getDate',
            'getDay',
            'getFullYear',
            'getHours',
            'getMinutes',
            'getMonth',
            'getTime',
            'getTimezoneOffset',
            'setDate',
            'setFullYear',
            'setHours',
            'setMilliseconds',
            'setMonth',
            'setSeconds',
            'setTime',
            'toDateString',
            'toJSON',
            'toLocaleDateString',
            'toLocaleString',
            'toLocaleTimeString',
            'toString',
            'toTimeString',
            'valueOf'
        ]
    })
    searchLies(() => Intl.DateTimeFormat, {
        target: [
            'format',
            'formatRange',
            'formatToParts',
            'resolvedOptions'
        ]
    })
    searchLies(() => Document, {
        target: [
            'createElement',
            'createElementNS',
            'getElementById',
            'getElementsByClassName',
            'getElementsByName',
            'getElementsByTagName',
            'getElementsByTagNameNS',
            'referrer',
            'write',
            'writeln'
        ],
        ignore: [
            // Firefox returns undefined on getIllegalTypeErrorLie test
            'onreadystatechange',
            'onmouseenter',
            'onmouseleave'
        ]
    })
    searchLies(() => DOMRect)
    searchLies(() => DOMRectReadOnly)
    searchLies(() => Element, {
        target: [
            'append',
            'appendChild',
            'getBoundingClientRect',
            'getClientRects',
            'insertAdjacentElement',
            'insertAdjacentHTML',
            'insertAdjacentText',
            'insertBefore',
            'prepend',
            'replaceChild',
            'replaceWith',
            'setAttribute'
        ]
    })
    searchLies(() => Function, {
        target: [
            'toString',
        ],
        ignore: [
            // Chrome Firefox returns false positives
            'caller',
            'arguments'
        ]
    })
    searchLies(() => HTMLCanvasElement)
    searchLies(() => HTMLElement, {
        target: [
            'clientHeight',
            'clientWidth',
            'offsetHeight',
            'offsetWidth',
            'scrollHeight',
            'scrollWidth'
        ],
        ignore: [
            // Firefox returns undefined on getIllegalTypeErrorLie test
            'onmouseenter',
            'onmouseleave'
        ]
    })
    searchLies(() => HTMLIFrameElement, {
        target: [
            'contentDocument',
            'contentWindow',
        ]
    })
    searchLies(() => IntersectionObserverEntry, {
        target: [
            'boundingClientRect',
            'intersectionRect',
            'rootBounds'
        ]
    })
    searchLies(() => Math, {
        target: [
            'acos',
            'acosh',
            'asinh',
            'atan',
            'atan2',
            'atanh',
            'cbrt',
            'cos',
            'cosh',
            'exp',
            'expm1',
            'log',
            'log10',
            'log1p',
            'sin',
            'sinh',
            'sqrt',
            'tan',
            'tanh'
        ]
    })
    searchLies(() => MediaDevices, {
        target: [
            'enumerateDevices',
            'getDisplayMedia',
            'getUserMedia'
        ]
    })
    searchLies(() => Navigator, {
        target: [
            'appCodeName',
            'appName',
            'appVersion',
            'buildID',
            'connection',
            'deviceMemory',
            'getBattery',
            'getGamepads',
            'getVRDisplays',
            'hardwareConcurrency',
            'language',
            'languages',
            'maxTouchPoints',
            'mimeTypes',
            'oscpu',
            'platform',
            'plugins',
            'product',
            'productSub',
            'sendBeacon',
            'serviceWorker',
            'userAgent',
            'vendor',
            'vendorSub'
        ]
    })
    searchLies(() => Node, {
        target: [
            'appendChild',
            'insertBefore',
            'replaceChild'
        ]
    })
    searchLies(() => OffscreenCanvasRenderingContext2D, {
        target: [
            'getImageData',
            'getLineDash',
            'isPointInPath',
            'isPointInStroke',
            'measureText',
            'quadraticCurveTo'
        ]
    })
    searchLies(() => Range, {
        target: [
            'getBoundingClientRect',
            'getClientRects',
        ]
    })
    searchLies(() => Intl.RelativeTimeFormat, {
        target: [
            'resolvedOptions'
        ]
    })
    searchLies(() => Screen)
    searchLies(() => SVGRect)
    searchLies(() => TextMetrics)
    searchLies(() => WebGLRenderingContext, {
        target: [
            'bufferData',
            'getParameter',
            'readPixels'
        ]
    })
    searchLies(() => WebGL2RenderingContext, {
        target: [
            'bufferData',
            'getParameter',
            'readPixels'
        ]
    })


    /* potential targets:
    	RTCPeerConnection
    	Plugin
    	PluginArray
    	MimeType
    	MimeTypeArray
    	Worker
    	History
    */

    // return lies list and detail 
    const props = lieDetector.getProps()
    const propsSearched = lieDetector.getPropsSearched()
    return {
        lieList: Object.keys(props).sort(),
        lieDetail: props,
        lieCount: Object.keys(props).reduce((acc, key) => acc + props[key].length, 0),
        propsSearched
    }
}

// start program
const start = performance.now()
const {
    lieList,
    lieDetail,
    lieCount,
    propsSearched
} = getPrototypeLies(iframeWindow) // execute and destructure the list and detail
if (iframeContainerDiv) {
    iframeContainerDiv.parentNode.removeChild(iframeContainerDiv)
}
const perf = performance.now() - start

// check lies later in any function
lieList.includes('HTMLCanvasElement.toDataURL') // returns true or false
lieDetail['HTMLCanvasElement.toDataURL'] // returns the list of lies

console.log(propsSearched)
console.log(lieList)
console.log(lieDetail)
