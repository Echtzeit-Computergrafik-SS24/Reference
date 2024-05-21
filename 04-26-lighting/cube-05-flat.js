// 1. Data ///////////////////////////////////////////////////////////////

// Define the vertex positions of a triangle as a flat buffer of 2d
// coordinates in a space ranging from -1 to +1 in both X and Y.
const vertexPositions = new Float32Array([
//   X    Y    Z    R    G    B
    -.5, -.5, 0.5, 1.0, 0.0, 0.0, // front
    0.5, -.5, 0.5, 1.0, 0.0, 0.0,
    -.5, 0.5, 0.5, 1.0, 0.0, 0.0,
    0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
    0.5, -.5, -.5, 0.0, 1.0, 0.0, // back
    -.5, -.5, -.5, 0.0, 1.0, 0.0,
    0.5, 0.5, -.5, 0.0, 1.0, 0.0,
    -.5, 0.5, -.5, 0.0, 1.0, 0.0,
    -.5, -.5, -.5, 0.0, 0.0, 1.0, // bottom
    0.5, -.5, -.5, 0.0, 0.0, 1.0,
    -.5, -.5, 0.5, 0.0, 0.0, 1.0,
    0.5, -.5, 0.5, 0.0, 0.0, 1.0,
    -.5, 0.5, 0.5, 1.0, 1.0, 0.0, // top
    0.5, 0.5, 0.5, 1.0, 1.0, 0.0,
    -.5, 0.5, -.5, 1.0, 1.0, 0.0,
    0.5, 0.5, -.5, 1.0, 1.0, 0.0,
    0.5, -.5, 0.5, 1.0, 0.0, 1.0, // left
    0.5, -.5, -.5, 1.0, 0.0, 1.0,
    0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
    0.5, 0.5, -.5, 1.0, 0.0, 1.0,
    -.5, -.5, -.5, 0.0, 1.0, 1.0, // right
    -.5, -.5, 0.5, 0.0, 1.0, 1.0,
    -.5, 0.5, -.5, 0.0, 1.0, 1.0,
    -.5, 0.5, 0.5, 0.0, 1.0, 1.0,
]);

// Create the position buffer in WebGL...
const positionBuffer = gl.createBuffer();
// ... bind it to the ARRAY_BUFFER target ...
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// ... and upload the data to it.
gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);


// Face indices define triangles, the index number corresponds to
// a vertex defined in the bound ARRAY_BUFFER target.
const faceIndices = new Uint16Array([
    0, 1, 2,    // front
    2, 1, 3,
    4, 5, 6,    // back
    6, 5, 7,
    8, 9, 10,   // top
    10, 9, 11,
    12, 13, 14, // bottom
    14, 13, 15,
    16, 17, 18, // left
    18, 17, 19,
    20, 21, 22, // right
    22, 21, 23,
]);

// Upload the indices to a buffer bound on the ELEMENT_ARRAY_BUFFER
// target.
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceIndices, gl.STATIC_DRAW);

// 2. Shader /////////////////////////////////////////////////////////////

// Define the Vertex Shader Source, ignoring the details for now.
const vertexShaderSource = `#version 300 es
	precision highp float;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

	in vec3 a_pos;
    in vec3 a_color;

    out vec3 f_color;

    void main() {
        f_color = vec3(0.11);
 		gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_pos, 1.0);
	}
`;

// Create the vertex shader object in WebGL...
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
// ... upload the source into the shader ...
gl.shaderSource(vertexShader, vertexShaderSource);
// ... and compile the shader. We ignore potential errors here.
gl.compileShader(vertexShader);


// Define the Fragment Shader Source.
const fragmentShaderSource = `#version 300 es
	precision mediump float;

    in vec3 f_color;

	out vec4 o_fragColor;

	void main() {
		o_fragColor = vec4(f_color, 1.0);
	}
`;

// Compile the fragment shader in WebGL.
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);


// In order to use them, we have to link the two shaders together into
// a Shader Program.
// Create one first,
const shaderProgram = gl.createProgram();
// attach the two shaders (the order of attachment does not matter),
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
// link the program, also ignoring errors
gl.linkProgram(shaderProgram);
// ... and tell WebGL to use the program for all future draw calls,
// or at least until we tell it to use another program instead.
gl.useProgram(shaderProgram);

// 3. Attribute Mapping //////////////////////////////////////////////////

// So far, we've given WebGL a buffer of numbers and a shader that takes
// a vec2 as input. We now need to tell WebGL how to get the 2D
// coordinates out of the buffer, so the shader can use them.

// First, get the "attribute" (vertex shader input) location from the
// shader, so we can address it
const vertexAttribute = gl.getAttribLocation(shaderProgram, 'a_pos');
// We need to enable the attribute location (ignore this for now).
gl.enableVertexAttribArray(vertexAttribute);
// Here we tell WebGL how it can extract the attribute from the buffer
// bound on the ARRAY_BUFFER target.
gl.vertexAttribPointer(
    vertexAttribute, // We want to define the 'a_pos' attribute
    3,               // It has three components (x, y, z)
    gl.FLOAT,        // We are using a 32bit float to store the number
    false,           // It is not normalized (ignore this)
    (3 + 3) * 4,     // Stride in bytes (see below)
    0 * 4            // Offset in bytes (see below)
);
// The Stride is the width of a vertex in the ARRAY_BUFFER.
// In this case we only have 2 components à 4 bytes = 8.
// The Offset is the offset of *this* particular attribute within the
// width of the vertex.
// If we had two 2D attributes, the Stride would be 16 for both,
// and the second attribute would have an Offset of 8.

// The color attribute has another location than the position-attribute.
const colorAttribute = gl.getAttribLocation(shaderProgram, 'a_color');
if (colorAttribute !== -1) {
    // We need to enable the attribute location (ignore this for now).
    gl.enableVertexAttribArray(colorAttribute);
    // Here we tell WebGL how it can extract the attribute from the buffer
    // bound on the ARRAY_BUFFER target.
    gl.vertexAttribPointer(
        colorAttribute,  // We want to define the 'a_color' attribute
        3,               // It has three components (r, g, b)
        gl.FLOAT,        // We are using a 32bit float to store the number
        false,           // It is not normalized (ignore this)
        (3 + 3) * 4,     // Stride in bytes (same as the first attribute)
        3 * 4            // Offset in bytes
    );
}

// 4. Rendering //////////////////////////////////////////////////////////

// Define the variables needed to update the shader uniform.
// That is the location of the uniform on the shader...
const modelMatrixUniform = gl.getUniformLocation(shaderProgram, "u_modelMatrix");
// ... and the actual model matrix as a glance.Mat4 object.
const modelMatrix = Mat4.identity();


// Since the projection matrix does not change, we can define it outside of
// the render loop.
gl.uniformMatrix4fv(
    gl.getUniformLocation(shaderProgram, "u_projectionMatrix"), false,
    Mat4.perspective(
        Math.PI / 4, // fov
        1.0, // aspect ratio
        0.1, // near
        5.0, // far
    ),
);

// The view matrix is also constant, so we can define it here.
gl.uniformMatrix4fv(
    gl.getUniformLocation(shaderProgram, "u_viewMatrix"), false,
    // Note that the camera's position in the world would be (0, 0, 3), but
    // for rendering, it needs to be at the origin, which is why we move the
    // whole world in the opposite direction.
    Mat4.fromTranslation(0, 0, -3),
);


// Enbable backface culling.
// This only needs to happen once.
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);


// The render loop is called once per frame drawn to the screen.
// @param time  The time in milliseconds since the start of the program.
function myRenderLoop(time)
{
    // Always clear the canvas before drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update the model matrix
    modelMatrix.reset();
    modelMatrix.rotateY(time * 0.001);
    modelMatrix.rotateZ(time * 0.001);
    gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);

    /// Draw the triangle.
    gl.drawElements(
        gl.TRIANGLES,       // We want to draw triangles (always use this)
        faceIndices.length, // Draw all vertices from the index buffer
        gl.UNSIGNED_SHORT,  // Data type used in the index buffer
        0                   // Offset (in bytes) in the index buffer
    );

    // Stop the loop if an error occurred
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        throw new Error(`WebGL error: ${error}`);
    }
}
setRenderLoop(myRenderLoop);