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
        return new Vector([this.values[index]]);
    }

    /**
     * @param {number} index
     * @returns {Vector}
     */
    getColumnVector(index) {
        return new Vector([this.values.map((row) => row[index])]);
    }

    /**
     * Multiply this matrix by a scalar or a another matrix. If a matrix is given, this matrix is treated as being on
     * the left hand side. Returns a new matrix.
     *
     * @param {(number|Matrix)} multiplier
     * @returns {Matrix}
     */
    multiply(multiplier) {
        if (typeof multiplier === 'number') {
            return new Matrix(this.values.map((row) => row.map((value) => value * multiplier)));
        }
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
     * @param {Vector} vector
     * @returns {number}
     */
    dot(vector) {
        if (this.length !== vector.length) {
            throw Error(`Cannot calculate the dot product of two vectors with a different length`);
        }
        return this.values[0].reduce((prev, curr, i) => prev + curr * vector.values[0][i], 0);
    }
}

export { Matrix, Vector };
