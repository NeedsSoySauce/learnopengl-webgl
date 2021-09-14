import { Matrix, Vector, Vector3, Vector4 } from './math.js';
import { Scene, SceneObject } from './scene.js';
import { ShaderUtils } from './shader.js';
import { RenderLoop } from './render.js';
import { pyramid, triangle } from './shape.js';

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

    // Only continue if WebGL is available and working
    if (!ShaderUtils.isWebGLAvailable(gl)) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
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

    const buffer = ShaderUtils.createArrayBuffer(gl);

    // Setup attributes (these are used to tell WebGL how to interpret our data)
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const modelMatrixAttributeLocation = gl.getUniformLocation(program, 'u_model');

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell WebGL how to read values for the above attribute from out input
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const vertexAttribPointerOffset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, vertexAttribPointerOffset);

    const scene = new Scene();
    const sceneObject = new SceneObject(triangle());
    scene.addObject(sceneObject);

    const transform = {
        position: Vector3.zero,
        scale: Vector3.one,
        rotation: Vector3.zero
    };
    const { position, scale, rotation } = transform;

    let x = 0;
    const renderFunction = (deltaTime) => {
        x += deltaTime;
        sceneObject.setPosition(Vector3.one.multiply(Math.sin(x * 3) / 4));
        sceneObject.setScale(Vector3.one.multiply(1 + Math.sin(x * 3) / 4));
        sceneObject.setRotation(Vector3.one.multiply(Math.sin(x) * 360));
        gl.uniformMatrix4fv(modelMatrixAttributeLocation, false, sceneObject.modelMatrixArray);

        for (const sceneObject of scene.objects) {
            ShaderUtils.draw(gl, sceneObject.vertices, size);
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

    const bindTransformControls = (x, y, z, group) => {
        const vector = transform[group];
        x.addEventListener('change', (e) => (vector.x = Number(e.target.value)));
        y.addEventListener('change', (e) => (vector.y = Number(e.target.value)));
        z.addEventListener('change', (e) => (vector.z = Number(e.target.value)));
    };

    for (const group of ['position', 'scale', 'rotation']) {
        const xControl = document.querySelector(`#x-${group}`);
        const yControl = document.querySelector(`#y-${group}`);
        const zControl = document.querySelector(`#z-${group}`);
        bindTransformControls(xControl, yControl, zControl, group);
    }

    renderLoopToggleHtmlButtonElement.click();
};

window.addEventListener('DOMContentLoaded', () => {
    main().catch((e) => {
        console.error(e);
        pre.classList.add('error');
        pre.textContent = `${e.stack ? e.stack : e}`;
    });

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

    // const translationMatrix = Matrix.translate(2, 3, 4);
    // log(translationMatrix);

    // const vector2 = new Vector2(123, -12);
    // const polar = vector2.toPolar();
    // log(vector2);
    // log(polar);
    // log(polar.toCartesian());

    // const quaternionA = new Quaternion(7, new Vector3(2, 3, 4));
    // const quaternionB = new Quaternion(1, new Vector3(2, 3, 4));
    // log(quaternionA.add(quaternionB));
    // log(quaternionA.multiply(quaternionA));
    // log(quaternionB.norm());
    // log(quaternionB.length);
    // log(quaternionB.normalized());
    // log(quaternionB.inverse());

    // const axisOfRotation = new Vector3(1, 1, 0);
    // const axis = Vector3.x();
    // const directionCosineA = MathUtils.directionCosine(axisOfRotation, axis);
    // console.log(directionCosineA);

    // const rotationMatrix = Matrix.rotate(45, Vector3.x);
    // log(rotationMatrix);

    // const scalingMatrix = Matrix.scale(2, 3, 4);
    // log(scalingMatrix);

    // const vertex = new Vector4(1, 2, 3, 4);
    // log(vertex);

    // vertex.x = 2;
    // vertex.y = 3;
    // vertex.z = 4;
    // vertex.w = 5;
    // log(vertex);

    // let result = scalingMatrix.multiply(vertex);
    // log(result);

    // log(scalingMatrix.toArray());
});
