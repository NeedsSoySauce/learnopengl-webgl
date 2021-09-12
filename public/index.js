import { Matrix, Vector, Vector2, Vector3, Polar, Quaternion, MathUtils } from './matrix.js';
import { Scene, SceneObject } from './scene.js';
import { ShaderUtil } from './util.js';
import { RenderLoop } from './render.js';
import { triangle } from './shape.js';

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
    const uniformPositionAttributeLocation = gl.getUniformLocation(program, 'u_position');
    const scaleAttributeLocation = gl.getUniformLocation(program, 'u_scale');
    const rotationAttributeLocation = gl.getUniformLocation(program, 'u_rotation');
    // const buffer = ShaderUtil.createArrayBuffer(gl, );

    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell WebGL how to read values for the above attribute from out input
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const vertexAttribPointerOffset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, vertexAttribPointerOffset);

    const scene = new Scene();
    scene.addObject(new SceneObject(triangle()));

    const transform = {
        position: Vector3.zero,
        scale: Vector3.one,
        rotation: Vector3.zero
    };
    const { position, scale, rotation } = transform;

    const renderFunction = (deltaTime) => {
        gl.uniformMatrix4fv(
            uniformPositionAttributeLocation,
            true,
            Matrix.translate(position.x, position.y, position.z).flat
        );
        gl.uniformMatrix4fv(scaleAttributeLocation, true, Matrix.scale(scale.x, scale.y, scale.z).flat);
        gl.uniformMatrix4fv(rotationAttributeLocation, true, Matrix.rotate(0, Vector3.z).flat);
        for (const sceneObject of scene.objects) {
            ShaderUtil.draw(gl, sceneObject.vertices, size);
        }
    };

    // let vertexCoords = [-0.5, 0.5, 0.0, -0.5, -0.5, 0.9, 0.5, 0, 0];
    // let vertexCoords = [0.5, 0.5, 0, 0.7, 0.7, 0, 0.7, 0.5, 0];

    // let x = 0;

    // const renderFunction = (deltaTime) => {
    //     ShaderUtil.clear(gl);
    //     x += deltaTime;
    //     gl.uniform1f(scaleAttributeLocation, 1 + Math.sin(x * 2) * 0.5);
    //     let coords = vertexCoords.map((c) => c);
    //     ShaderUtil.draw(gl, vertexCoords, size);
    // };

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
    main().catch(console.error);

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
});
