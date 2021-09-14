class MathUtils {
    static radiansToDegrees(radians) {
        return (radians / Math.PI) * 180;
    }

    static degreesToRadians(degrees) {
        return (degrees / 180) * Math.PI;
    }

    /**
     * @param {Vector3} axisOfRotation
     * @param {Vector3} unitVector
     */
    static directionCosine(axisOfRotation, unitVector) {
        return axisOfRotation.dot(unitVector) / axisOfRotation.length;
    }

    /**
     * @param {Array<number>} array
     */
    static sum(array) {
        return array.reduce((prev, curr) => prev + curr, 0);
    }

    /**
     * Multiples 2 or more matrices in the order given.
     *
     * @param {Array<Matrix>} matrices
     */
    static multiplyMatrices(matrices) {
        if (matrices.length < 2) throw Error('Multiplication requires at least two matrices');
        return matrices.slice(1).reduce((prev, curr) => prev.multiply(curr), matrices[0]);
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
     * @returns {number[]} the values in this matrix as a 1D array
     */
    toArray() {
        const range = new Array(this.columns).fill(0);
        return range.flatMap((_, i) => this.values.map((row) => row[i]));
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

        const range = new Array(other.columns).fill(0);
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
     * Creates a rotation matrix using homogenous coordinates.
     *
     * @param {number} degrees
     * @param {Vector3} axis
     */
    static rotate(degrees, axis) {
        const q = Quaternion.fromRotation(degrees, axis);
        const q0 = q.s;
        const q1 = q.v.x;
        const q2 = q.v.y;
        const q3 = q.v.z;

        // See: https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Rotation_matrices
        return new Matrix([
            [1 - 2 * (q2 ** 2 + q3 ** 2), 2 * (q1 * q2 - q0 * q3), 2 * (q0 * q2 + q1 * q3), 0],
            [2 * (q1 * q2 + q0 * q3), 1 - 2 * (q1 ** 2 + q3 ** 2), 2 * (q2 * q3 - q0 * q1), 0],
            [2 * (q1 * q3 - q0 * q2), 2 * (q0 * q1 + q2 * q3), 1 - 2 * (q1 ** 2 + q2 ** 2), 0],
            [0, 0, 0, 1]
        ]);
    }
}

class Vector extends Matrix {
    /**
     * @param {number[]} values
     */
    constructor(values) {
        super(values.map((value) => [value]));
        this._length = values.length;
    }

    get length() {
        return Math.sqrt(MathUtils.sum(this.values.map((row) => row[0] ** 2)));
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
        return this.values.reduce((prev, curr, i) => prev + curr[0] * other.values[i][0], 0);
    }

    /**
     * Multiply this vector by a scalar or another vector. If a vector is given, this vector is treated as being on
     * the left hand side. Returns a new vector.
     *
     * @param {(number|Matrix)} multiplier
     * @returns {Vector}
     */
    multiply(other) {
        const values = super.multiply(other).values;
        return new Vector(values.map((row) => row[0]));
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
    }

    get x() {
        return this.values[0][0];
    }

    set x(value) {
        this.values[0][0] = value;
    }

    get y() {
        return this.values[1][0];
    }

    set y(value) {
        this.values[1][0] = value;
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

    /**
     * @param {(number|Vector2)} other
     * @returns {Vector2}
     */
    multiply(other) {
        const values = super.multiply(other).values;
        return new Vector2(values[0][1], values[1][0]);
    }

    /**
     * @param {(number|Vector2)} other
     * @returns {Vector2}
     */
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
    }

    get x() {
        return this.values[0][0];
    }

    set x(value) {
        this.values[0][0] = value;
    }

    get y() {
        return this.values[1][0];
    }

    set y(value) {
        this.values[1][0] = value;
    }

    get z() {
        return this.values[2][0];
    }

    set z(value) {
        this.values[2][0] = value;
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

    /**
     * @param {(number|Vector3)} other
     * @returns {Vector3}
     */
    multiply(other) {
        const values = super.multiply(other).values;
        return new Vector3(values[0], values[1], values[2]);
    }

    /**
     * @param {(number|Vector3)} other
     * @returns {Vector3}
     */
    add(other) {
        const values = super.add(other).values[0];
        return new Vector3(values[0][0], values[1][0], values[2][0]);
    }

    static get zero() {
        return new Vector3(0, 0, 0);
    }

    static get one() {
        return new Vector3(1, 1, 1);
    }

    static get x() {
        return new Vector3(1, 0, 0);
    }

    static get y() {
        return new Vector3(0, 1, 0);
    }

    static get z() {
        return new Vector3(0, 0, 1);
    }
}

class Vector4 extends Vector {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     */
    constructor(x, y, z, w) {
        super([x, y, z, w]);
    }

    get x() {
        return this.values[0][0];
    }

    set x(value) {
        this.values[0][0] = value;
    }

    get y() {
        return this.values[1][0];
    }

    set y(value) {
        this.values[1][0] = value;
    }

    get z() {
        return this.values[2][0];
    }

    set z(value) {
        this.values[2][0] = value;
    }

    get w() {
        return this.values[3][0];
    }

    set w(value) {
        this.values[3][0] = value;
    }

    /**
     * Returns the cross product of this vector and another vector, treating this vector as being on the left hand side.
     *
     * @param {Vector4} other
     * @returns {Vector4}
     */
    cross(other) {
        const x = this.y * other.z - this.z * other.y;
        const y = this.z * other.x - this.x * other.z;
        const z = this.x * other.y - this.y * other.x;
        return new Vector4(x, y, z);
    }

    /**
     * @param {(number|Vector4)} other
     * @returns {Vector4}
     */
    multiply(other) {
        const values = super.multiply(other).values[0];
        return new Vector4(values[0], values[1], values[2]);
    }

    /**
     * @param {(number|Vector4)} other
     * @returns {Vector4}
     */
    add(other) {
        const values = super.add(other).values[0];
        return new Vector4(values[0], values[1], values[2]);
    }

    static get zero() {
        return new Vector4(0, 0, 0);
    }

    static get one() {
        return new Vector4(1, 1, 1);
    }

    static get x() {
        return new Vector4(1, 0, 0);
    }

    static get y() {
        return new Vector4(0, 1, 0);
    }

    static get z() {
        return new Vector4(0, 0, 1);
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
        const degrees = MathUtils.radiansToDegrees(this.theta).toFixed(1);
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
        const q1 = Math.sin(halfRadians) * MathUtils.directionCosine(axis, Vector3.x);
        const q2 = Math.sin(halfRadians) * MathUtils.directionCosine(axis, Vector3.y);
        const q3 = Math.sin(halfRadians) * MathUtils.directionCosine(axis, Vector3.z);

        return new Quaternion(q0, new Vector3(q1, q2, q3));
    }
}

export { Matrix, Vector, Vector2, Vector3, Vector4, Polar, Quaternion, MathUtils };
