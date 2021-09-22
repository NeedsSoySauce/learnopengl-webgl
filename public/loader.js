class ObjectFileLoader {
    static fromText(text) {
        const lines = text.split('\n');
        const vertices = lines
            .filter((line) => line.startsWith('v '))
            .flatMap((line) => line.split(' ').splice(1).map(Number));
        const textureCoordinates = lines
            .filter((line) => line.startsWith('vt '))
            .flatMap((line) => line.split(' ').splice(1).map(Number));
        const vertexNormals = lines
            .filter((line) => line.startsWith('vn '))
            .flatMap((line) => line.split(' ').splice(1).map(Number));
        const faces = lines
            .filter((line) => line.startsWith('f '))
            .map((line) =>
                line
                    .split(' ')
                    .splice(1)
                    .map((elem) => {
                        const [v, vt, vn] = elem.split('/').map(Number);
                        return {
                            vertexIndex: v - 1,
                            textureIndex: vt - 1,
                            normalIndex: vn - 1
                        };
                    })
            );

        const indices = faces.flatMap((face) => face.map((elem) => elem.vertexIndex));

        console.log('lines', lines);
        console.log('vertices', vertices);
        console.log('textureCoordinates', textureCoordinates);
        console.log('vertexNormals', vertexNormals);
        console.log('faces', faces);
        console.log('indices', indices);

        return new ShapeData(vertices, indices, WebGL2RenderingContext.TRIANGLES);
    }

    /**
     * @param {File} file
     * @returns {Promise<ShapeData>}
     */
    static async load(file) {
        const reader = new FileReader();
        reader.readAsText(file);

        const executor = (resolve, reject) => {
            reader.addEventListener('load', () => {
                resolve(ObjectFileLoader.fromText(reader.result));
            });
        };

        return new Promise(executor);
    }
}

class ShapeData {
    /**
     * @param {number[]} vertices
     * @param {number[]} indices
     * @param {GLenum} drawMode
     */
    constructor(vertices, indices, drawMode) {
        this.vertices = vertices;
        this.indices = indices;
        this.drawMode = drawMode;
    }
}

export { ObjectFileLoader, ShapeData as ObjectModel };
