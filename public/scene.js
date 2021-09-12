import { Matrix, Vector3, Polar, Quaternion, MathUtils } from './matrix.js';

class Scene {
    constructor() {
        /** @type {SceneObject[]} */
        this._objects = [];
    }

    get objects() {
        return this._objects;
    }

    /**
     * @param {SceneObject} sceneObject
     */
    addObject(sceneObject) {
        this._objects.push(sceneObject);
    }
}

class SceneObject {
    /**
     * @param {Array<Number>} vertices
     */
    constructor(vertices) {
        this.vertices = vertices;
        this.position = Vector3.one;
        this.scale = Vector3.one;
        this.rotation = Vector3.one;
        this.scaleMatrix = Matrix.scale(this.scale);
    }

    /**
     * @param {Vector3} scale
     */
    setScale(scale) {
        this.scale = scale;
        this.scaleMatrix = Matrix.scale(this.scale);
    }
}

export { Scene, SceneObject };
