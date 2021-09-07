class RenderLoop {
    /**
     * @param {Function} callback
     * @param {number} fps
     */
    constructor(callback, fps) {
        this.callback = callback;
        this.fps = fps;
        this.isActive = false;
        this.msPreviousFrame = 0;
        this.renderFunction = this.renderFunction.bind(this);
    }

    /**
     *
     * @param {DOMHighResTimeStamp} timestamp
     */
    renderFunction(timestamp) {
        if (this.msPreviousFrame === null) {
            this.msPreviousFrame = timestamp;
            window.requestAnimationFrame(this.renderFunction);
            return;
        }

        const deltaTime = timestamp - this.msPreviousFrame;
        this.msPreviousFrame = timestamp;

        this.callback(deltaTime / 1000);

        if (this.isActive) window.requestAnimationFrame(this.renderFunction.bind(this));
    }

    start() {
        this.isActive = true;
        this.msPreviousFrame = null;
        window.requestAnimationFrame(this.renderFunction);
        return this;
    }

    stop() {
        this.isActive = false;
    }
}

class ShaderUtil {
    /**
     * @param {HTMLCanvasElement} element
     */
    constructor(element) {
        this.gl = element.getContext('webgl2');

        if (!ShaderUtil.isWebGLAvailable(this.gl)) {
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
        return ShaderUtil.createShader(gl, gl.VERTEX_SHADER, source);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {string} source
     */
    static createFragmentShader(gl, source) {
        return ShaderUtil.createShader(gl, gl.FRAGMENT_SHADER, source);
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
     * @param {Float32Array} array
     * @param {number} usage For example gl.STATIC_DRAW or gl.DYNAMIC_DRAW
     * @returns {WebGLBuffer}
     */
    static createArrayBuffer(gl, array, usage = WebGL2RenderingContext.STATIC_DRAW) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(buffer, array, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
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
     * @param {number[]} vertexCoords
     */
    static draw(gl, vertexCoords, size) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCoords), gl.STATIC_DRAW);
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);

        const primitiveType = gl.LINE_LOOP;
        const drawArraysOffset = 0;
        const count = vertexCoords.length / size;
        gl.drawArrays(primitiveType, drawArraysOffset, count);
    }
}

const vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

uniform float u_scale;
 
// all shaders have a main function
void main() {
//  float scale = 2.0;
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position * vec4(u_scale, u_scale, u_scale, 1);
}
`;

const fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`;

function main() {
    const body = document.querySelector('body');
    const canvas = document.querySelector('canvas');
    const input = document.querySelector('#object');
    const pre = document.querySelector('pre');

    // Initialize the GL context
    const gl = canvas.getContext('webgl2');

    // Only continue if WebGL is available and working
    if (!ShaderUtil.isWebGLAvailable(gl)) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Setup shaders
    const vertexShader = ShaderUtil.createVertexShader(gl, vertexShaderSource);
    const fragmentShader = ShaderUtil.createFragmentShader(gl, fragmentShaderSource);
    const program = ShaderUtil.createProgram(gl, vertexShader, fragmentShader);

    const size = 3;

    gl.useProgram(program);

    // Setup attributes (these are used to tell WebGL how to interpret our data)
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const scaleAttributeLocation = gl.getUniformLocation(program, 'u_scale');
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell WebGL how to read values for the above attribute from out input
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const vertexAttribPointerOffset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, vertexAttribPointerOffset);

    let vertexCoords = [0, 0, 0, 0, 0.5, 0, 0.7, 0, 0];

    let x = 0;

    const renderFunction = (deltaTime) => {
        ShaderUtil.clear(gl);
        x += deltaTime;
        gl.uniform1f(scaleAttributeLocation, 1 + Math.sin(x * 20) * 0.5);
        let coords = vertexCoords.map((c) => c);
        ShaderUtil.draw(gl, vertexCoords, size);
    };

    // Render loop
    let isLooping = false;
    const renderLoopToggleHtmlButtonElement = document.querySelector('#render-loop-toggle');
    const resetHtmlButtonElement = document.querySelector('#reset');
    const deltaTimeHtmlSpanElement = document.querySelector('#deltaTime');

    const renderLoop = new RenderLoop((deltaTime) => {
        deltaTimeHtmlSpanElement.textContent = `${(deltaTime * 1000).toFixed(2)}`;
        renderFunction(deltaTime);
    }, 60);

    renderLoopToggleHtmlButtonElement.addEventListener('click', () => {
        isLooping = !isLooping;
        if (isLooping) {
            renderLoop.start();
            renderLoopToggleHtmlButtonElement.textContent = 'Stop';
        } else {
            renderLoop.stop();
            renderLoopToggleHtmlButtonElement.textContent = 'Start';
        }
    });

    resetHtmlButtonElement.addEventListener('click', () => {
        ShaderUtil.clear(gl);
    });

    input.addEventListener('change', (e) => {
        if (e.target.files.length !== 1) return;
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.readAsText(file);

        reader.addEventListener('load', () => {
            pre.textContent = reader.result;

            const lines = reader.result.split('\n');

            let vertices = [];

            for (let line of lines) {
                if (!line.startsWith('v ')) continue;

                const v = line
                    .split(' ')
                    .slice(1)
                    .map((f) => Number.parseFloat(f));

                vertices = [...vertices, ...v];
            }

            ShaderUtil.clear(gl);
            ShaderUtil.draw(gl, vertices, size);
        });
    });
}

window.onload = main;
