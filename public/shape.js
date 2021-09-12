const triangle = () => {
    // Could be one line but it's easier to read when formatted like this
    const vertices = [
        [-0.5, -0.5, +0.0],
        [+0.0, +0.5, +0.0],
        [+0.5, -0.5, +0.0]
    ];
    return vertices.flatMap((vertex) => vertex);
};

export { triangle };
