/* parameter helpers */
// https://developer.mozilla.org/en-US/docs/Web/API/EXT_texture_filter_anisotropic
const getMaxAnisotropy = context => {
    try {
        const extension = (
            context.getExtension('EXT_texture_filter_anisotropic') ||
            context.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
            context.getExtension('MOZ_EXT_texture_filter_anisotropic')
        )
        return context.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
    } catch (error) {
        console.error(error)
        return undefined
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_draw_buffers
const getMaxDrawBuffers = context => {
    try {
        const extension = (
            context.getExtension('WEBGL_draw_buffers') ||
            context.getExtension('WEBKIT_WEBGL_draw_buffers') ||
            context.getExtension('MOZ_WEBGL_draw_buffers')
        )
        return context.getParameter(extension.MAX_DRAW_BUFFERS_WEBGL)
    } catch (error) {
        return undefined
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/precision
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/rangeMax
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/rangeMin
const getShaderData = (name, shader) => {
    const shaderData = {}
    try {
        for (const prop in shader) {
            const shaderPrecisionFormat = shader[prop]
            shaderData[prop] = {
                precision: shaderPrecisionFormat.precision,
                rangeMax: shaderPrecisionFormat.rangeMax,
                rangeMin: shaderPrecisionFormat.rangeMin
            }
        }
        return shaderData
    } catch (error) {
        return undefined
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderPrecisionFormat
const getShaderPrecisionFormat = (context, shaderType) => {
    const props = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT']
    const precisionFormat = {}
    try {
        props.forEach(prop => {
            precisionFormat[prop] = context.getShaderPrecisionFormat(context[shaderType], context[prop])
            return
        })
        return precisionFormat
    } catch (error) {
        return undefined
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info
const getUnmasked = (context, constant) => {
    try {
        const extension = context.getExtension('WEBGL_debug_renderer_info')
        const unmasked = context.getParameter(extension[constant])
        return unmasked
    } catch (error) {
        return undefined
    }
}

/* get WebGLRenderingContext or WebGL2RenderingContext */
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext
const getWebgl = type => {
    return new Promise(resolve => {

        // detect support
        if (type == 'webgl' && !('WebGLRenderingContext' in window)) {
            return resolve(undefined)
        } else if (type == 'webgl2' && !('WebGL2RenderingContext' in window)) {
            return resolve(undefined)
        }

        // get canvas context
        let canvas = {}
        let context = {}
        try {
            canvas = document.createElement('canvas')
            context = canvas.getContext(type) || canvas.getContext('experimental-' + type)
        } catch (error) {
            console.error(error)
            return resolve(undefined)
        }

        // get webgl2 new methods
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext
        let newMethods = []

        if (type == 'webgl2') {
            try {
                const version1Props = Object.getOwnPropertyNames(WebGLRenderingContext.prototype)
                const version2Props = Object.getOwnPropertyNames(WebGL2RenderingContext.prototype)
                const version1Methods = new Set(version1Props.filter(name => typeof context[name] == 'function'))
                const version2Methods = new Set(version2Props.filter(name => typeof context[name] == 'function'))
                newMethods = [...new Set([...version2Methods].filter(method => !version1Methods.has(method)))]
            } catch (error) {
                console.error(error)
            }
        }

        // get supported extensions
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getSupportedExtensions
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Using_Extensions
        let supportedExtensions = []
        try {
            supportedExtensions = context.getSupportedExtensions()
        } catch (error) {
            console.error(error)
        }

        // get parameters
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
        const version1Constants = [
            'ALIASED_LINE_WIDTH_RANGE',
            'ALIASED_POINT_SIZE_RANGE',
            'ALPHA_BITS',
            'BLUE_BITS',
            'DEPTH_BITS',
            'GREEN_BITS',
            'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
            'MAX_CUBE_MAP_TEXTURE_SIZE',
            'MAX_FRAGMENT_UNIFORM_VECTORS',
            'MAX_RENDERBUFFER_SIZE',
            'MAX_TEXTURE_IMAGE_UNITS',
            'MAX_TEXTURE_SIZE',
            'MAX_VARYING_VECTORS',
            'MAX_VERTEX_ATTRIBS',
            'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
            'MAX_VERTEX_UNIFORM_VECTORS',
            'MAX_VIEWPORT_DIMS',
            'RED_BITS',
            'RENDERER',
            'SHADING_LANGUAGE_VERSION',
            'STENCIL_BITS',
            'VERSION'
        ]

        const version2Constants = [
            'MAX_VARYING_COMPONENTS',
            'MAX_VERTEX_UNIFORM_COMPONENTS',
            'MAX_VERTEX_UNIFORM_BLOCKS',
            'MAX_VERTEX_OUTPUT_COMPONENTS',
            'MAX_PROGRAM_TEXEL_OFFSET',
            'MAX_3D_TEXTURE_SIZE',
            'MAX_ARRAY_TEXTURE_LAYERS',
            'MAX_COLOR_ATTACHMENTS',
            'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
            'MAX_COMBINED_UNIFORM_BLOCKS',
            'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
            'MAX_DRAW_BUFFERS',
            'MAX_ELEMENT_INDEX',
            'MAX_FRAGMENT_INPUT_COMPONENTS',
            'MAX_FRAGMENT_UNIFORM_COMPONENTS',
            'MAX_FRAGMENT_UNIFORM_BLOCKS',
            'MAX_SAMPLES',
            'MAX_SERVER_WAIT_TIMEOUT',
            'MAX_TEXTURE_LOD_BIAS',
            'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
            'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
            'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
            'MAX_UNIFORM_BLOCK_SIZE',
            'MAX_UNIFORM_BUFFER_BINDINGS',
            'MIN_PROGRAM_TEXEL_OFFSET',
            'UNIFORM_BUFFER_OFFSET_ALIGNMENT'
        ]

        const compileParameters = context => {
            try {
                const parameters = {
                    ANTIALIAS: context.getContextAttributes().antialias,
                    MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(context),
                    MAX_DRAW_BUFFERS_WEBGL: getMaxDrawBuffers(context),
                    VERTEX_SHADER: getShaderData('VERTEX_SHADER', getShaderPrecisionFormat(context, 'VERTEX_SHADER')),
                    FRAGMENT_SHADER: getShaderData('FRAGMENT_SHADER', getShaderPrecisionFormat(context, 'FRAGMENT_SHADER')),
                    UNMASKED_VENDOR_WEBGL: getUnmasked(context, 'UNMASKED_VENDOR_WEBGL'),
                    UNMASKED_RENDERER_WEBGL: getUnmasked(context, 'UNMASKED_RENDERER_WEBGL')
                }
                const pnames = type == 'webgl2' ? [...version1Constants, ...version2Constants] : version1Constants
                pnames.forEach(key => {
                    const value = context[key]
                    const result = context.getParameter(context[key])
                    const typedArray = (
                        result.constructor === Float32Array ||
                        result.constructor === Int32Array
                    )
                    parameters[key] = typedArray ? [...result] : result
                })
                return parameters
            } catch (error) {
                console.error(error)
                return undefined
            }
        }

        let getParameter = null
        try {
            getParameter = context.getParameter
        } catch (error) {}

        const parameters = !!getParameter ? compileParameters(context) : undefined
        const response = {
            parameters,
            supportedExtensions
        }
        if (type == 'webgl2') {
            response.newMethods = newMethods
        }
        return resolve(response)
    })
}

Promise.all([
    getWebgl('webgl'),
    getWebgl('webgl2')
]).then(response => {
    const webgl = response[0]
    const webgl2 = response[1]

    // results
    console.log('WebGLRenderingContext: ', webgl)
    console.log('WebGL2RenderingContext: ', webgl2)

    // version1 diffs
    if (webgl && webgl.parameters && webgl2 && webgl2.parameters) {
        const webglparameters = webgl.parameters
        const webgl2parameters = webgl2.parameters
        const diffs = []
        Object.keys(webglparameters).forEach(key => {
            const webglValue = webglparameters[key]
            const webgl2Value = webgl2parameters[key]
            if (JSON.stringify(webglValue) != JSON.stringify(webgl2parameters[key])) {
                const comparison = {
                    [key]: {
                        webgl: webglValue,
                        webgl2: webgl2Value
                    }
                }
                diffs.push(comparison)
            }
        })
        console.log('Diffs: ', diffs)
    }
}).catch(error => {
    console.error(error)
})
