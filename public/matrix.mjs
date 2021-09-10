class MathUtils {
    static radToDegrees(radians) {
        return (radians / Math.PI) * 180;
    }

    static degreesToRadians(degrees) {
        return (degrees / 180) * Math.PI;
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

    static rotate() {
        throw Error('I suck at math');
    }
}

class Vector extends Matrix {
    /**
     * @param {number[]} values
     */
    constructor(values) {
        super([values]);
        this.length = values.length;
    }

    /**
     * Returns the dot product of this vector and another vector.
     *
     * @param {Vector} other
     * @returns {number}
     */
    dot(other) {
        if (this.length !== other.length) {
            throw Error(`Cannot calculate the dot product of two vectors with a different length`);
        }
        return this.values[0].reduce((prev, curr, i) => prev + curr * other.values[0][i], 0);
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
     */
    polar() {
        const r = Math.sqrt(this.x ** 2 + this.y ** 2);
        const theta = Math.asin(this.y / r);
        return new Polar(r, theta);
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
}

export { Matrix, Vector, Vector2, Vector3 };
