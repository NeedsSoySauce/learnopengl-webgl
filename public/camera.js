import { Matrix, Vector3 } from './math.js';

class Camera {
    /**
     * Creates a camera using the UVN convention.
     *
     * @param {Vector3} position
     * @param {Vector3} target Look at vector
     * @param {Vector3} up Up vector
     * @param {number} speed Units per second
     * @param {number} mouseSensitivity
     */
    constructor(position = Vector3.zero, target = Vector3.z, up = Vector3.y, speed = 1, mouseSensitivity = 0.2) {
        this.position = position;
        this.rotation = Vector3.zero;
        this.deltaRotation = Vector3.zero;
        this.target = target;
        this.up = up;
        this.speed = speed;
        this.mouseSensitivity = mouseSensitivity;
        this.viewMatrix = Matrix.identity(4);
        this.viewMatrixArray = this.viewMatrix.toArray();

        // For debugging
        this._u = Vector3.zero;
        this._v = Vector3.zero;
        this._n = Vector3.zero;

        this._updateViewMatrix();
    }

    get u() {
        return this._u;
    }

    get v() {
        return this._v;
    }

    get n() {
        return this._n;
    }

    _updateViewMatrix() {
        const n = this.target.normalised();
        const u = this.up.cross(n).normalised();
        const v = n.cross(u);
        this._u = u;
        this._v = v;
        this._n = n;
        this.viewMatrix = Matrix.view(this.position, u, v, n);
        this.viewMatrixArray = this.viewMatrix.toArray();
    }

    _updateUvnVectors() {
        const yAxis = Vector3.y;

        const horizontalTarget = this.target.rotate(this.deltaRotation.x, yAxis).normalised();
        const horizontalAxis = yAxis.cross(horizontalTarget).normalised();
        const n = horizontalTarget.rotate(this.deltaRotation.y, horizontalAxis).normalised();
        const v = n.cross(horizontalAxis);

        this.target = n;
        this.up = v;
        this._updateViewMatrix();
    }

    /**
     * @param {Vector3} position
     */
    setPosition(position) {
        this.position = position;
        this._updateViewMatrix();
    }

    /**
     * @param {Vector3} rotation
     */
    rotate(rotation) {
        this.deltaRotation = rotation.multiply(this.mouseSensitivity);
        this.rotation = this.rotation.add(this.deltaRotation);
        this._updateUvnVectors();
    }

    forward(deltaTime) {
        this.position = this.position.add(this.target.multiply(this.speed * deltaTime));
        this._updateViewMatrix();
    }

    backward(deltaTime) {
        this.position = this.position.add(this.target.multiply(-this.speed * deltaTime));
        this._updateViewMatrix();
    }

    strafeLeft(deltaTime) {
        const left = this.target.cross(this.up).normalised();
        this.position = this.position.add(left.multiply(this.speed * deltaTime));
        this._updateViewMatrix();
    }

    strafeRight(deltaTime) {
        const right = this.up.cross(this.target).normalised();
        this.position = this.position.add(right.multiply(this.speed * deltaTime));
        this._updateViewMatrix();
    }

    moveUp(deltaTime) {
        this.position = this.position.add(Vector3.y.multiply(this.speed * deltaTime));
        this._updateViewMatrix();
    }

    moveDown(deltaTime) {
        this.position = this.position.add(Vector3.y.multiply(-this.speed * deltaTime));
        this._updateViewMatrix();
    }
}

export { Camera };
