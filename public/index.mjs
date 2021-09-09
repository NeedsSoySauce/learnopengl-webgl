import { Matrix, Vector, Vector3 } from './matrix.mjs';
import { ShaderUtil } from './util.mjs';
import { RenderLoop } from './render.mjs';

const canvas = document.querySelector('canvas');
const objFileInput = document.querySelector('#object');
const pre = document.querySelector('pre');

/**
 * @param {object} obj
 */
const log = (obj) => console.log(obj.toString());

/**
 * @param {string} path
 * @returns {Promise<string>}
 */
const loadShader = async (path) => (await fetch(path)).text();

const main = async () => {
    const vertexShaderSource = await loadShader('./shaders/vertex.glsl');
    const fragmentShaderSource = await loadShader('./shaders/fragment.glsl');

    console.log(vertexShaderSource);
    console.log(fragmentShaderSource);

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

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const buffer = ShaderUtil.createArrayBuffer(gl);

    // Setup attributes (these are used to tell WebGL how to interpret our data)
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const scaleAttributeLocation = gl.getUniformLocation(program, 'u_scale');
    // const buffer = ShaderUtil.createArrayBuffer(gl, );

    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell WebGL how to read values for the above attribute from out input
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const vertexAttribPointerOffset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, vertexAttribPointerOffset);

    // let vertexCoords = [-0.5, 0.5, 0.0, -0.5, -0.5, 0.9, 0.5, 0, 0];
    let vertexCoords = [0.5, 0.5, 0, 0.7, 0.7, 0, 0.7, 0.5, 0];

    let x = 0;

    const renderFunction = (deltaTime) => {
        ShaderUtil.clear(gl);
        x += deltaTime;
        gl.uniform1f(scaleAttributeLocation, 1 + Math.sin(x * 2) * 0.5);
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

    objFileInput.addEventListener('change', (e) => {
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

    renderLoopToggleHtmlButtonElement.click();
};

window.addEventListener('DOMContentLoaded', () => {
    // main().catch(console.error);

    // const matrixA = new Matrix([
    //     [1, 2, 3],
    //     [4, 5, 6]
    // ]);
    // const matrixB = new Matrix([
    //     [1.4, 2, 3],
    //     [-1, 6, 3]
    // ]);
    // const matrixC = new Matrix([
    //     [7, 8],
    //     [9, 10],
    //     [11, 12]
    // ]);

    // log(matrixA);
    // log(matrixA.getRowVector(0));
    // log(matrixC.getColumnVector(0));
    // log(matrixC.getColumnVector(0));
    // log(matrixA.multiply(matrixC));

    // const vectorA = new Vector([-4, -9]);
    // const vectorB = new Vector([-1, 2]);
    // console.log(vectorA.dot(vectorB));
    // log(vectorA)
    // log(vectorB)

    // const vectorA = new Vector3(2, 3, 4);
    // const vectorB = new Vector3(5, 6, 7);
    // log(vectorA.cross(vectorB));

    // const identityMatrix = Matrix.identity(4);
    // log(identityMatrix);

    // const scalingMatrix = Matrix.scale(2, 3, 4);
    // log(scalingMatrix);

    const translationMatrix = Matrix.translate(2, 3, 4);
    log(translationMatrix);
});
