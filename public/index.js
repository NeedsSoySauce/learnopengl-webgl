import { MathUtils, Matrix, Vector, Vector3, Vector4 } from './math.js';
import { Scene, SceneObject } from './scene.js';
import { ShaderUtils } from './shader.js';
import { RenderLoop } from './render.js';
import { cube, plane, pyramid, triangle } from './shape.js';
import { bindInput, bindInputVector3 } from './binding.js';
import { Camera } from './camera.js';
import { ObjectFileLoader } from './loader.js';

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

const registerKeyHandlers = () => {
    let keyDownStates = new Map();

    const blurListener = () => {
        keyDownStates.clear();
    };

    const keydownListener = (e) => {
        e.preventDefault();
        keyDownStates.set(e.code, true);
    };

    const keyupListener = (e) => {
        e.preventDefault();
        keyDownStates.set(e.code, false);
    };

    const keys = {
        /**
         * @param {string} key
         */
        isKeyDown(key) {
            return keyDownStates.get(key) === true;
        },
        unregister() {
            window.removeEventListener('blur', blurListener, false);
            window.removeEventListener('keydown', keydownListener);
            window.removeEventListener('keyup', keyupListener);
        },
        listen() {
            window.addEventListener('blur', blurListener, false);
            window.addEventListener('keydown', keydownListener);
            window.addEventListener('keyup', keyupListener);
        }
    };

    return keys;
};

const main = async () => {
    const vertexShaderSource = await fetchText('./shaders/vertex.glsl');
    const fragmentShaderSource = await fetchText('./shaders/fragment.glsl');

    // Initialize the GL context
    const gl = canvas.getContext('webgl2');

    ShaderUtils.setCanvasSize(gl, 800, 600);

    // Only continue if WebGL is available and working
    if (!ShaderUtils.isWebGLAvailable(gl)) {
        throw Error('Unable to initialize WebGL. Your browser or machine may not support it.');
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
        far: bindInput('#far', 100)
    };

    const { fieldOfViewDegrees, aspectRatio, near, far } = projection;

    const scene = new Scene();
    const shape = cube();
    // const sceneObject1 = new SceneObject(shape.vertices, shape.indices, shape.drawMode);
    // scene.addObject(sceneObject1);

    const shape2 = plane();
    const sceneObject2 = new SceneObject(shape2.vertices, shape2.indices, shape2.drawMode);
    scene.addObject(sceneObject2);

    const camera = new Camera(new Vector3(2, 2, -2), new Vector3(0, 0, 1), new Vector3(0, 1, 0), 5);
    camera.rotate(new Vector3(-45, -20, 0));

    const cameraState = {
        position: bindInputVector3('#x-camera-position', '#y-camera-position', '#z-camera-position', camera.position),
        rotation: bindInputVector3('#x-camera-rotation', '#y-camera-rotation', '#z-camera-rotation', camera.rotation),
        u: bindInputVector3('#u-x-component', '#u-y-component', '#u-z-component', camera.u),
        v: bindInputVector3('#v-x-component', '#v-y-component', '#v-z-component', camera.u),
        n: bindInputVector3('#n-x-component', '#n-y-component', '#n-z-component', camera.u)
    };

    const { isKeyDown, unregister, listen } = registerKeyHandlers();

    /**
     * @param {MouseEvent} e
     */
    const updatePosition = (e) => {
        camera.rotate(new Vector3(e.movementX, -e.movementY, 0));
    };

    gl.canvas.addEventListener('click', () => gl.canvas.requestPointerLock());
    document.addEventListener(
        'pointerlockchange',
        (e) => {
            if (document.pointerLockElement === gl.canvas) {
                document.addEventListener('mousemove', updatePosition, false);
                listen();
            } else {
                document.removeEventListener('mousemove', updatePosition, false);
                unregister();
            }
        },
        false
    );

    const speed = 5;

    // Note: this movement method isn't great as you move faster when moving in more than one direction at once
    const keyHandlers = new Map(
        Object.entries({
            KeyW: (deltaTime) => camera.forward(deltaTime * speed),
            KeyA: (deltaTime) => camera.strafeLeft(deltaTime * speed),
            KeyS: (deltaTime) => camera.backward(deltaTime * speed),
            KeyD: (deltaTime) => camera.strafeRight(deltaTime * speed),
            ControlLeft: (deltaTime) => camera.strafeDown(deltaTime * speed),
            Space: (deltaTime) => camera.strafeUp(deltaTime * speed)
            // ControlLeft: (deltaTime) => camera.moveDown(deltaTime),
            // Space: (deltaTime) => camera.moveUp(deltaTime)
        })
    );

    const transform = {
        position: bindInputVector3('#x-position', '#y-position', '#z-position', new Vector3(0, 0, 0)),
        scale: bindInputVector3('#x-scale', '#y-scale', '#z-scale', new Vector3(1, 1, 1)),
        rotation: bindInputVector3('#x-rotation', '#y-rotation', '#z-rotation', new Vector3(0, 0, 0))
    };

    /** @type {(SceneObject|null)} */
    let selectedSceneObject = null;

    const clearSelection = () => {
        selectedSceneObject = null;
        transform.position.value = Vector3.zero;
        transform.scale.value = Vector3.one;
        transform.rotation.value = Vector3.zero;
    };

    /**
     * @param {SceneObject} sceneObject
     */
    const selectSceneObject = (sceneObject) => {
        clearSelection();
        transform.position.value = sceneObject.position;
        transform.scale.value = sceneObject.scale;
        transform.rotation.value = sceneObject.rotation;
        selectedSceneObject = sceneObject;
    };

    let x = 0;
    const renderFunction = (deltaTime) => {
        cameraState.position.value = camera.position;
        cameraState.rotation.value = camera.rotation;
        cameraState.u.value = camera.u;
        cameraState.v.value = camera.v;
        cameraState.n.value = camera.n;

        if (document.pointerLockElement === gl.canvas) {
            for (const [key, callback] of keyHandlers) {
                if (isKeyDown(key)) {
                    callback(deltaTime);
                }
            }
        }

        // x += deltaTime;
        // transform.rotation.y = animate ? (x * 45) % 360 : transform.rotation.y;

        if (selectedSceneObject) {
            selectedSceneObject.setPosition(transform.position.value);
            selectedSceneObject.setScale(transform.scale.value);
            selectedSceneObject.setRotation(transform.rotation.value);
        }

        gl.uniformMatrix4fv(viewMatrixAttributeLocation, false, camera.viewMatrixArray);
        gl.uniformMatrix4fv(
            projectionMatrixAttributeLocation,
            false,
            Matrix.perspective(fieldOfViewDegrees.value, aspectRatio.value, near.value, far.value).toArray()
        );

        for (const sceneObject of scene.objects) {
            gl.uniformMatrix4fv(modelMatrixAttributeLocation, false, sceneObject.modelMatrixArray);
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

        ObjectFileLoader.load(file).then((shapeData) => {
            const sceneObject = new SceneObject(shapeData.vertices, shapeData.indices, shapeData.drawMode);
            scene.addObject(sceneObject);
            selectSceneObject(sceneObject);
        });
    });

    const data = await fetchText('./geometry/toon.obj');
    const shapeData = ObjectFileLoader.fromText(data);
    const sceneObject = new SceneObject(shapeData.vertices, shapeData.indices, shapeData.drawMode);
    scene.addObject(sceneObject);
    selectSceneObject(sceneObject);

    renderLoopToggleHtmlButtonElement.click();
};

window.addEventListener('DOMContentLoaded', () => {
    main().catch((e) => {
        console.error(e);
        pre.classList.add('error');
        pre.textContent = `${e.stack ? e.stack : e}`;
    });
});
