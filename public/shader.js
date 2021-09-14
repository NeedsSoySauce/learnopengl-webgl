class ShaderUtils {
    /**
     * @param {HTMLCanvasElement} element
     */
    constructor(element) {
        this.gl = element.getContext('webgl2');

        if (!ShaderUtils.isWebGLAvailable(this.gl)) {
            throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    static isWebGLAvailable(gl) {
        return gl !== null;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {number} type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param {string} source
     */
    static createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw Error('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {string} source
     */
    static createVertexShader(gl, source) {
        return ShaderUtils.createShader(gl, gl.VERTEX_SHADER, source);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {string} source
     */
    static createFragmentShader(gl, source) {
        return ShaderUtils.createShader(gl, gl.FRAGMENT_SHADER, source);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {WebGLShader} vertexShader
     * @param {WebGLShader} fragmentShader
     */
    static createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw Error('Failed to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
        }

        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);

        return program;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {number[]} data Initial data to buffer or `null` to not buffer anything.
     * @param {number} usage Defaults to STATIC_DRAW.
     * @param {boolean} unbind Defaults to false. Whether to unbind the new buffer before returning.
     * @returns {WebGLBuffer}
     */
    static createArrayBuffer(gl, data = null, usage = WebGL2RenderingContext.STATIC_DRAW, unbind = false) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        if (data) gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);
        if (unbind) gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {number[]} data Initial data to buffer or `null` to not buffer anything.
     * @param {number} usage Defaults to STATIC_DRAW.
     * @param {boolean} unbind Defaults to false. Whether to unbind the new buffer before returning.
     * @returns {WebGLBuffer}
     */
    static createIndexBuffer(gl, data = null, usage = WebGL2RenderingContext.STATIC_DRAW, unbind = false) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        if (data) gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), usage);
        if (unbind) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return buffer;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    static clear(gl) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {number[]} vertices
     * @param {number[]} indices
     * @param {number} size
     * @param {GLenum} mode Defaults to LINE_LOOP
     * @param {GLenum} usage Defaults to STATIC_DRAW
     */
    static draw(
        gl,
        vertices,
        indices,
        mode = WebGL2RenderingContext.LINE_LOOP,
        usage = WebGL2RenderingContext.STATIC_DRAW
    ) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), usage);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), usage);
        const count = indices.length;
        const offset = 0;
        const type = gl.UNSIGNED_SHORT;
        gl.drawElements(mode, count, type, offset);
    }
}

export { ShaderUtils };
