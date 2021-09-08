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

    /**
     * @param {(number|Matrix)} multiplier
     */
    multiply(multiplier) {
        if (typeof multiplier === 'number') {
            return new Matrix(this.values.map((row) => row.map((value) => value * multiplier)));
        }
    }

    toString() {
        const strVals = this.values.map((row) => row.map((value) => value.toFixed(1)));
        const padding = Math.max(...strVals.flatMap((row) => row.map((value) => value.length)));
        return strVals.map((row) => row.map((value) => value.padStart(padding)).join(' ')).join('\n');
    }
}

export { Matrix };
