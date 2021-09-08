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
        return this.values.map((row) => row.map((value) => value.toFixed(1).padStart(5)).join(' ')).join('\n');
    }
}

export { Matrix };
