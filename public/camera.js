import { Matrix, Vector3 } from './math.js';

class Camera {
    /**
     * Creates a camera using the UVN convention.
     *
     * @param {Vector3} position
     * @param {Vector3} target Look at vector
     * @param {Vector3} up Up vector
     * @param {number} speed Units per second
     */
    constructor(position = Vector3.zero, target = Vector3.z, up = Vector3.y, speed = 1) {
        this.position = position;
        this.target = target;
        this.up = up;
        this.speed = speed;
    }

    /**
     * @param {Vector3} position
     */
    setPosition(position) {
        this.position = position;
        this._updateModelMatrix();
    }

    forward(deltaTime) {
        this.position = this.position.add(this.target.multiply(this.speed * deltaTime));
    }

    backward(deltaTime) {
        this.position = this.position.add(this.target.multiply(-this.speed * deltaTime));
    }

    strafeLeft(deltaTime) {
        const left = this.target.cross(this.up).normalised();
        this.position = this.position.add(left.multiply(this.speed * deltaTime));
    }

    strafeRight(deltaTime) {
        const right = this.up.cross(this.target).normalised();
        this.position = this.position.add(right.multiply(this.speed * deltaTime));
    }

    moveUp(deltaTime) {
        this.position = this.position.add(Vector3.y.multiply(this.speed * deltaTime));
    }

    moveDown(deltaTime) {
        this.position = this.position.add(Vector3.y.multiply(-this.speed * deltaTime));
    }

    get viewMatrix() {
        const n = this.target.normalised();
        const u = this.up.cross(n).normalised();
        const v = n.cross(u);
        return Matrix.view(this.position, u, v, n);
    }
}

export { Camera };
