import { Vector3 } from './math';

class Camera {
    /**
     * Creates a camera using the UVN convention.
     *
     * @param {Vector3} position
     * @param {Vector3} u Right vector
     * @param {Vector3} v Up vector
     * @param {Vector3} n Look at vector
     */
    constructor(position = Vector3.zero, u = Vector3.x, v = Vector3.y, n = Vector3.z) {
        this.position = position;
        this.u = u;
        this.v = v;
        this.n = n;
    }
}
