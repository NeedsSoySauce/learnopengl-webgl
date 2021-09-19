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
        this.target = target;
        this.up = up;
        this.speed = speed;
        this.mouseSensitivity = mouseSensitivity;
        this.viewMatrix = Matrix.identity(4);
        this.viewMatrixArray = this.viewMatrix.toArray();
        this._updateViewMatrix();
    }

    _updateViewMatrix() {
        const n = this.target.normalised();
        const u = this.up.cross(n).normalised();
        const v = n.cross(u);
        this.viewMatrix = Matrix.view(this.position, u, v, n);
        this.viewMatrixArray = this.viewMatrix.toArray();
        console.log(this.target.toString());
    }

    _updateUvnVectors() {
        const yAxis = Vector3.y;

        const horizontalTarget = this.target.rotate(this.rotation.x, yAxis).normalised();
        const horizontalAxis = yAxis.cross(horizontalTarget).normalised();
        const n = horizontalTarget.rotate(this.rotation.y, horizontalAxis).normalised();
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
        this.rotation = rotation.multiply(this.mouseSensitivity);
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
