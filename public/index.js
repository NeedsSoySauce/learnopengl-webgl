import { Matrix, Vector, Vector3, Vector4 } from './math.js';
import { Scene, SceneObject } from './scene.js';
import { ShaderUtils } from './shader.js';
import { RenderLoop } from './render.js';
import { cube, pyramid, triangle } from './shape.js';
import { bindInput, bindInputVector3 } from './binding.js';

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
const fetchText = async (path) => (await fetch(path)).text();

const main = async () => {
    const vertexShaderSource = await fetchText('./shaders/vertex.glsl');
    const fragmentShaderSource = await fetchText('./shaders/fragment.glsl');

    // Initialize the GL context
    const gl = canvas.getContext('webgl2');

    ShaderUtils.setCanvasSize(gl, 800, 600);

    // Only continue if WebGL is available and working
    if (!ShaderUtils.isWebGLAvailable(gl)) {
        throw Error('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Setup shaders
    const vertexShader = ShaderUtils.createVertexShader(gl, vertexShaderSource);
    const fragmentShader = ShaderUtils.createFragmentShader(gl, fragmentShaderSource);
    const program = ShaderUtils.createProgram(gl, vertexShader, fragmentShader);

    const size = 3;

    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const arrayBuffer = ShaderUtils.createArrayBuffer(gl);
    const indexBuffer = ShaderUtils.createIndexBuffer(gl);

    // Setup attributes (these are used to tell WebGL how to interpret our data)
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const modelMatrixAttributeLocation = gl.getUniformLocation(program, 'u_model');
    const viewMatrixAttributeLocation = gl.getUniformLocation(program, 'u_view');
    const projectionMatrixAttributeLocation = gl.getUniformLocation(program, 'u_projection');

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell WebGL how to read values for the above attribute from out input
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const vertexAttribPointerOffset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, vertexAttribPointerOffset);

    const projection = {
        fieldOfViewDegrees: bindInput('#fov', 90),
        aspectRatio: bindInput('#aspectRatio', gl.canvas.width / gl.canvas.height),
        near: bindInput('#near', 0.1),
        far: bindInput('#far', 10)
    };

    const { fieldOfViewDegrees, aspectRatio, near, far } = projection;

    const shape = cube();
    const scene = new Scene();
    const sceneObject = new SceneObject(shape.vertices, shape.indices, shape.drawMode);
    scene.addObject(sceneObject);

    const camera = {
        position: new Vector3(0, 0, 0)
    };

    const transform = {
        position: bindInputVector3('#x-position', '#y-position', '#z-position', new Vector3(0, 0, 1.5)),
        scale: bindInputVector3('#x-scale', '#y-scale', '#z-scale', new Vector3(1, 1, 1)),
        rotation: bindInputVector3('#x-rotation', '#y-rotation', '#z-rotation', new Vector3(0, 0, 0))
    };

    let x = 0;
    const renderFunction = (deltaTime) => {
        x += deltaTime;
        transform.rotation.y = (x * 45) % 360;
        sceneObject.setPosition(transform.position.value);
        sceneObject.setScale(transform.scale.value);
        sceneObject.setRotation(transform.rotation.value);
        gl.uniformMatrix4fv(modelMatrixAttributeLocation, false, sceneObject.modelMatrixArray);
        gl.uniformMatrix4fv(
            viewMatrixAttributeLocation,
            false,
            Matrix.view(camera.position, new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)).toArray()
        );
        gl.uniformMatrix4fv(
            projectionMatrixAttributeLocation,
            false,
            Matrix.perspective(fieldOfViewDegrees.value, aspectRatio.value, near.value, far.value).toArray()
        );

        for (const sceneObject of scene.objects) {
            ShaderUtils.draw(gl, sceneObject.vertices, sceneObject.indices, sceneObject.drawMode);
        }
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
        ShaderUtils.clear(gl);
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

            ShaderUtils.clear(gl);
            ShaderUtils.draw(gl, vertices, size);
        });
    });

    renderLoopToggleHtmlButtonElement.click();
};

window.addEventListener('keydown', (e) => {
    console.log(e.code);
});

window.addEventListener('DOMContentLoaded', () => {
    main().catch((e) => {
        console.error(e);
        pre.classList.add('error');
        pre.textContent = `${e.stack ? e.stack : e}`;
    });
});
