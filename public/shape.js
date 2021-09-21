const triangle = () => {
    // Could be one line but it's easier to read when formatted like this
    const vertices = [
        [-0.5, -0.5, +0.0],
        [+0.0, +0.5, +0.0],
        [+0.5, -0.5, +0.0]
    ];
    return vertices.flatMap((vertex) => vertex);
};

const cube = (sideLength = 1) => {
    const length = sideLength / 2;
    const vertices = [
        [-0.5, +0.5, -0.5], // Back Top left
        [-0.5, +0.5, +0.5], // Front Top Left
        [+0.5, +0.5, +0.5], // Front Top Right
        [+0.5, +0.5, -0.5], // Back Top Right
        [-0.5, -0.5, -0.5], // Back Bottom left
        [-0.5, -0.5, +0.5], // Front Bottom Left
        [+0.5, -0.5, +0.5], // Front Bottom Right
        [+0.5, -0.5, -0.5] // Back Bottom Right
    ];
    const indices = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4]
    ];
    return {
        drawMode: WebGL2RenderingContext.LINES,
        vertices: vertices.flatMap((vertex) => vertex),
        indices: indices.flatMap((v) => v)
    };
};

const plane = (size = 10) => {
    const halfSize = size / 2;

    // Corners

    const vertices = [
        [-halfSize, 0, halfSize],
        [-halfSize, 0, -halfSize],
        [halfSize, 0, -halfSize],
        [halfSize, 0, halfSize]
    ];
    const indices = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0]
    ];

    for (let i = -halfSize + 1; i < halfSize; i++) {
        vertices.push([-halfSize, 0, i]);
        vertices.push([halfSize, 0, i]);
        indices.push([vertices.length - 2, vertices.length - 1]);
    }

    for (let i = -halfSize + 1; i < halfSize; i++) {
        vertices.push([i, 0, -halfSize]);
        vertices.push([i, 0, halfSize]);
        indices.push([vertices.length - 2, vertices.length - 1]);
    }

    return {
        drawMode: WebGL2RenderingContext.LINES,
        vertices: vertices.flatMap((vertex) => vertex),
        indices: indices.flatMap((v) => v)
    };
};

const pyramid = () => {
    // TODO convert to index buffer
    const vertices = [
        [+0.0, +0.5, +0.0],
        [-0.5, -0.5, -0.5],
        [-0.5, -0.5, +0.5],
        [+0.5, -0.5, +0.5],
        [+0.5, -0.5, -0.5]
    ];
    return vertices.flatMap((vertex) => vertex);
};

export { triangle, pyramid, cube, plane };
