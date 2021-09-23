class ObjectFileLoader {
    static _elementParsers = {
        v: { flatten: true, parser: ObjectFileLoader._parseFloats },
        vt: { flatten: true, parser: ObjectFileLoader._parseFloats },
        vn: { flatten: true, parser: ObjectFileLoader._parseFloats },
        f: { flatten: false, parser: ObjectFileLoader._parseFace },
        mtllib: { flatten: false, parser: ObjectFileLoader._parseMaterialLibrary }
    };

    /**
     * @param {string[]} items
     */
    static _parseFloats(items) {
        return items.map(parseFloat);
    }

    /**
     * @param {string[]} items
     */
    static _parseFace(items) {
        return items.map((item) => {
            const [v, vt, vn] = item.split('/').map(Number);
            return {
                vi: v - 1,
                vti: vt - 1,
                vni: vn - 1
            };
        });
    }

    /**
     * @param {string[]} items
     */
    static _parseMaterialLibrary(items) {
        return items[0];
    }

    /**
     * @param {string} path
     */
    static async _fetchText(path) {
        return await (await fetch(path)).text();
    }

    /**
     * @param {string} path
     */
    static _loadMaterial(path) {
        return ObjectFileLoader._fetchText(path);
    }

    /**
     * @param {string} text
     * @param {boolean} wireframe
     * @param {string} materialsPath
     * @param {string} texturesPath
     */
    static async fromText(text, wireframe = false, materialsPath = 'assets', texturesPath = 'assets') {
        const lines = text.split('\n');

        const elements = Object.fromEntries(Object.keys(ObjectFileLoader._elementParsers).map((key) => [key, []]));

        for (const line of lines) {
            const [type, ...items] = line.split(' ');

            if (!ObjectFileLoader._elementParsers[type]) continue;

            const { flatten, parser } = ObjectFileLoader._elementParsers[type];

            if (flatten) {
                elements[type].push(...parser(items));
            } else {
                elements[type].push(parser(items));
            }
        }

        console.log(elements);

        const vertices = elements.v;
        const textureCoordinates = elements.vt;
        const vertexNormals = elements.vn;
        const faces = elements.f;

        let drawMode = WebGL2RenderingContext.TRIANGLES;
        let indices;
        if (wireframe) {
            drawMode = WebGL2RenderingContext.LINES;
            indices = faces.flatMap((face) => {
                const faceIndices = face.map((elem) => elem.vi);

                const elems = [faceIndices[0], faceIndices[faceIndices.length - 1]];
                for (let i = 1; i < faceIndices.length; i++) {
                    elems.push(faceIndices[i]);
                    elems.push(faceIndices[i - 1]);
                }

                return elems;
            });
        } else {
            indices = faces.flatMap((face) => face.map((elem) => elem.vi));
        }

        console.log('lines', lines);
        console.log('vertices', vertices);
        console.log('textureCoordinates', textureCoordinates);
        console.log('vertexNormals', vertexNormals);
        console.log('faces', faces);
        console.log('indices', indices);

        return new ShapeData(vertices, indices, drawMode);
    }

    /**
     * @param {string} path
     * @param {boolean} wireframe
     */
    static async fromPath(path, wireframe = false) {
        const text = await ObjectFileLoader._fetchText(path);
        const assetPath = new URL(`${window.location.origin}/${path.split('/').slice(0, -1).join('/')}`).href;
        console.log(assetPath);
        return ObjectFileLoader.fromText(text, wireframe);
    }

    /**
     * @param {File} file
     * @returns {Promise<ShapeData>}
     */
    static async fromFile(file) {
        const reader = new FileReader();
        reader.readAsText(file);

        const executor = (resolve, reject) => {
            reader.addEventListener('load', () => {
                ObjectFileLoader.fromText(reader.result).then(resolve);
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
