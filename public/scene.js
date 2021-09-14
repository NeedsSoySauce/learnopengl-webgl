import { MathUtils, Matrix, Vector3 } from './math.js';

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
        this.position = Vector3.zero;
        this.scale = Vector3.one;
        this.rotation = Vector3.zero;
        this.translationMatrix = Matrix.identity(4);
        this.scaleMatrix = Matrix.identity(4);
        this.xRotationMatrix = Matrix.identity(4);
        this.yRotationMatrix = Matrix.identity(4);
        this.zRotationMatrix = Matrix.identity(4);
        this.modelMatrix = Matrix.identity(4);
        this.modelMatrixArray = this.modelMatrix.toArray();
        this._updateModelMatrix();
    }

    _updateModelMatrix() {
        this.translationMatrix = Matrix.translate(this.position.x, this.position.y, this.position.z);
        this.scaleMatrix = Matrix.scale(this.scale.x, this.scale.y, this.scale.z);
        this.xRotationMatrix = Matrix.rotate(this.rotation.x, Vector3.x);
        this.yRotationMatrix = Matrix.rotate(this.rotation.y, Vector3.y);
        this.zRotationMatrix = Matrix.rotate(this.rotation.z, Vector3.z);
        this.modelMatrix = MathUtils.multiplyMatrices([
            this.translationMatrix,
            this.scaleMatrix,
            this.xRotationMatrix,
            this.yRotationMatrix,
            this.zRotationMatrix
        ]);
        this.modelMatrixArray = this.modelMatrix.toArray();
    }

    /**
     * @param {Vector3} scale
     */
    setScale(scale) {
        this.scale = scale;
        this._updateModelMatrix();
    }
}

export { Scene, SceneObject };
