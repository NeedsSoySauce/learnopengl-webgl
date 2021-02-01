const vertexShaderSource = `
attribute vec4 position;

void main(void) {
  gl_Position = position;
}
`;

const fragmentShaderSource = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

function main() {
    const body = document.querySelector('body');
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;

    body.append(canvas);

    // Initialize the GL context
    const gl = canvas.getContext('webgl');

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Automatic formatting can make it hard to read arrays of vertex data
    // let vertices = new Float32Array([
    //   -0.5, -0.5, 0.0,
    //    0.0,  0.5, 0.0,
    //    0.5, -0.5, 0.0
    // ]);
    let vertices = new Float32Array([-0.5, -0.5, 0.0, 0.0, 0.5, 0.0, 0.5, -0.5, 0.0]);

    let bufferId = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    // Setup vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Failed to compile vertex shader: ' + gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        return;
    }

    // Setup fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Failed to compile fragment shader: ' + gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
        return;
    }

    // Setup shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Failed to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return;
    }

    gl.useProgram(shaderProgram);

    // Render the attached VBO
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}

window.onload = main;
