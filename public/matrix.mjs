class MathUtils {
    static radToDegrees(radians) {
        return (radians / Math.PI) * 180;
    }

    static degreesToRadians(degrees) {
        return (degrees / 180) * Math.PI;
    }

    /**
     *
     * @param {Vector3} axisOfRotation
     * @param {Vector3} axis
     */
    static directionCosine(axisOfRotation, axis) {
        return axisOfRotation.dot(axis) / axisOfRotation.length;
    }

    /**
     * @param {Array<number>} array
     */
    static sum(array) {
        return array.reduce((prev, curr) => prev + curr, 0);
    }
}

class Matrix {
    /**
     * @param {number[][]} values
     */
    constructor(values) {
        this.values = values;
        this.rows = values.length;
        this.columns = values.length > 0 ? values[0].length : 0;

        // Check values is a rectangular array
        if (values.some((row) => row.length != this.columns)) {
            throw Error(`Values must be a rectangular array`);
        }
    }

    toString() {
        const strVals = this.values.map((row) => row.map((value) => value.toFixed(1)));
        const padding = Math.max(...strVals.flatMap((row) => row.map((value) => value.length)));
        return strVals.map((row) => row.map((value) => value.padStart(padding)).join(' ')).join('\n');
    }

    /**
     * @param {number} index
     * @returns {Vector}
     */
    getRowVector(index) {
        return new Vector(this.values[index]);
    }

    /**
     * @param {number} index
     * @returns {Vector}
     */
    getColumnVector(index) {
        return new Vector(this.values.map((row) => row[index]));
    }

    /**
     * Multiply this matrix by a scalar or another matrix. If a matrix is given, this matrix is treated as being on
     * the left hand side. Returns a new matrix.
     *
     * @param {(number|Matrix)} multiplier
     * @returns {Matrix}
     */
    multiply(other) {
        if (typeof other === 'number') {
            return new Matrix(this.values.map((row) => row.map((value) => value * other)));
        }

        if (this.columns !== other.rows) {
            throw Error(
                `Cannot multiply a ${this.rows}x${this.columns} matrix by a ${other.rows}x${other.columns} matrix`
            );
        }

        const range = new Array(this.rows).fill(0);
        return new Matrix(
            this.values.map((_, i) => range.map((_, j) => this.getRowVector(i).dot(other.getColumnVector(j))))
        );
    }

    /**
     * @param {(number|Matrix)} multiplier
     * @returns {Matrix}
     */
    add(other) {
        if (typeof other === 'number') {
            return new Matrix(this.values.map((row) => row.map((value) => value + other)));
        }

        if (this.columns !== other.columns || this.rows !== other.rows) {
            throw Error(`Cannot add a ${this.rows}x${this.columns} matrix to a ${other.rows}x${other.columns} matrix`);
        }

        const range = new Array(this.rows).fill(0);
        return new Matrix(this.values.map((row, i) => other.values[i].map((value, j) => value + row[j])));
    }

    /**
     * Creates an identity matrix.
     *
     * @param {number} size
     * @returns {Matrix}
     */
    static identity(size) {
        const range = new Array(size).fill(0);
        return new Matrix(range.map((_, i) => new Array(size).fill(0).map((_, j) => (j === i ? 1 : 0))));
    }

    /**
     * Creates a scaling matrix using homogenous coordinates.
     *
     * @param {number} size
     * @returns {Matrix}
     */
    static scale(x, y, z) {
        return new Matrix([
            [x, 0, 0, 0],
            [0, y, 0, 0],
            [0, 0, z, 0],
            [0, 0, 0, 1]
        ]);
    }

    /**
     * Creates a translation matrix using homogenous coordinates.
     *
     * @param {number} size
     * @returns {Matrix}
     */
    static translate(x, y, z) {
        return new Matrix([
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1]
        ]);
    }

    /**
     * A poor attempt at rotating stuff.
     *
     * @param {number} degrees
     * @param {Vector3} axis
     */
    static axisRotation(degrees, axis) {}
}

class Vector extends Matrix {
    /**
     * @param {number[]} values
     */
    constructor(values) {
        super([values]);
        this._length = values.length;
    }

    get length() {
        return Math.sqrt(MathUtils.sum(this.values[0].map((value) => value ** 2)));
    }

    /**
     * Returns the dot product of this vector and another vector.
     *
     * @param {Vector} other
     * @returns {number}
     */
    dot(other) {
        if (this._length !== other._length) {
            throw Error(`Cannot calculate the dot product of two vectors with a different length`);
        }
        return this.values[0].reduce((prev, curr, i) => prev + curr * other.values[0][i], 0);
    }

    /**
     * Multiply this vector by a scalar or another vector. If a vector is given, this vector is treated as being on
     * the left hand side. Returns a new vector.
     *
     * @param {(number|Matrix)} multiplier
     * @returns {Vector}
     */
    multiply(other) {
        return new Vector(super.multiply(other).values[0]);
    }

    /**
     * @param {Vector} other
     */
    add(other) {
        return new Vector(super.add(other).values[0]);
    }
}

class Vector2 extends Vector {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        super([x, y]);
        this.x = x;
        this.y = y;
    }

    /**
     * Returns this vector in polar coordinates.
     * @returns {Polar}
     */
    toPolar() {
        const r = Math.sqrt(this.x ** 2 + this.y ** 2);
        const theta = Math.asin(this.y / r);
        return new Polar(r, theta);
    }

    multiply(other) {
        const values = super.multiply(other).values[0];
        return new Vector2(values[1], values[1]);
    }

    add(other) {
        const values = super.add(other).values[0];
        return new Vector2(values[0], values[1]);
    }
}

class Vector3 extends Vector {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        super([x, y, z]);
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Returns the cross product of this vector and another vector, treating this vector as being on the left hand side.
     *
     * @param {Vector3} other
     * @returns {Vector3}
     */
    cross(other) {
        const x = this.y * other.z - this.z * other.y;
        const y = this.z * other.x - this.x * other.z;
        const z = this.x * other.y - this.y * other.x;
        return new Vector3(x, y, z);
    }

    multiply(other) {
        const values = super.multiply(other).values[0];
        return new Vector3(values[0], values[1], values[2]);
    }

    add(other) {
        const values = super.add(other).values[0];
        return new Vector3(values[0], values[1], values[2]);
    }

    static get zero() {
        return new Vector3(0, 0, 0);
    }

    static x() {
        return new Vector3(1, 0, 0);
    }

    static y() {
        return new Vector3(0, 1, 0);
    }

    static z() {
        return new Vector3(0, 0, 1);
    }
}

class Polar {
    /**
     * @param {number} r
     * @param {number} theta
     */
    constructor(r, theta) {
        this.r = r;
        this.theta = theta;
    }

    toString() {
        const degrees = MathUtils.radToDegrees(this.theta).toFixed(1);
        return `${this.r.toFixed(1)} ${degrees}°`;
    }

    /**
     * Returns this object in cartesian coordinates.
     * @returns {Vector2}
     */
    toCartesian() {
        const x = Math.cos(this.theta) * this.r;
        const y = Math.sin(this.theta) * this.r;
        return new Vector2(x, y);
    }
}

class Quaternion {
    /**
     * @param {number} s
     * @param {Vector3} v
     */
    constructor(s, v) {
        this.s = s;
        this.v = v;
    }

    get length() {
        return this.norm();
    }

    toString() {
        return `${this.s.toFixed(2)} + ${this.v.x.toFixed(2)}i + ${this.v.y.toFixed(2)}j + ${this.v.z.toFixed(2)}k`;
    }

    /**
     * @param {Quaternion} quaternion
     */
    add(other) {
        const s = this.s + other.s;
        const v = this.v.add(other.v);
        return new Quaternion(s, v);
    }

    /**
     * @param {(number|Quaternion)} other
     * @returns {Quaternion}
     */
    multiply(other) {
        if (typeof other === 'number') {
            return new Quaternion(this.s * other, this.v.multiply(other));
        }
        const s = this.s * other.s - this.v.dot(other.v);
        const v = other.v.multiply(this.s).add(this.v.multiply(other.s)).add(this.v.cross(other.v));
        return new Quaternion(s, v);
    }

    norm() {
        const components = [this.s, this.v.x, this.v.y, this.v.z];
        return Math.sqrt(components.reduce((prev, curr) => prev + curr ** 2, 0));
    }

    unitNorm() {
        return this.normalised();
    }

    /**
     * Returns a normalized copy of this quaternion.
     *
     * @returns {Quaternion}
     */
    normalized() {
        return this.multiply(1 / this.length);
    }

    conjugate() {
        return new Quaternion(this.s, this.v.multiply(-1));
    }

    inverse() {
        return this.conjugate().multiply(1 / this.length ** 2);
    }

    /**
     * Creates a pure quaternion (a quaternion with a scalar value of zero). This is also known as a vector quaternion.
     *
     * @param {Vector3} v
     * @returns {Quaternion}
     */
    static pure(v) {
        return new Quaternion(0, v);
    }

    /**
     * Creates a scalar quaternion (a quaternion whose vector part is zero). This is also known as a real quaternion.
     *
     * @param {number} s
     * @returns {Quaternion}
     */
    static scalar(s) {
        return new Quaternion(s, Vector3.zero);
    }

    /**
     * Creates a quaternion from an axis and rotation.
     *
     * @param {number} degrees
     * @param {Vector3} axis
     */
    static fromRotation(degrees, axis) {
        const radians = MathUtils.degreesToRadians(degrees);
        const halfRadians = radians / 2;

        const q0 = Math.cos(halfRadians);
        const q1 = Math.sin(halfRadians) * MathUtils.directionCosine(axis, Vector3.x());
        const q2 = Math.sin(halfRadians) * MathUtils.directionCosine(axis, Vector3.y());
        const q3 = Math.sin(halfRadians) * MathUtils.directionCosine(axis, Vector3.z());
    }
}

export { Matrix, Vector, Vector2, Vector3, Polar, Quaternion, MathUtils };
