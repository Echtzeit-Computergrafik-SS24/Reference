// 1. Data ///////////////////////////////////////////////////////////////

// Define the vertex positions of a triangle as a flat buffer of 2d
// coordinates in a space ranging from -1 to +1 in both X and Y.
const vertexPositions = new Float32Array([
    // X   Y   R    G    B
    -.8, -.8, 1.0, 0.0, 0.0, // bottom left
    0.8, -.8, 0.0, 1.0, 0.0, // bottom right
    -.8, 0.8, 0.0, 0.0, 1.0, // top left
    0.8, 0.8, 1.0, 1.0, 0.0, // top right
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
    0, 1, 2, // first triangle
    1, 3, 2, // second triangle
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

	in vec2 a_pos;
    in vec3 a_color;

    out vec3 f_color;

    void main() {
        f_color = a_color;
 		gl_Position = vec4(a_pos, 0.0, 1.0);
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
    2,               // It has two components (x, y)
    gl.FLOAT,        // We are using a 32bit float to store the number
    false,           // It is not normalized (ignore this)
    (2 + 3) * 4,     // Stride in bytes (see below)
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
// We need to enable the attribute location (ignore this for now).
gl.enableVertexAttribArray(colorAttribute);
// Here we tell WebGL how it can extract the attribute from the buffer
// bound on the ARRAY_BUFFER target.
gl.vertexAttribPointer(
    colorAttribute,  // We want to define the 'a_color' attribute
    3,               // It has three components (r, g, b)
    gl.FLOAT,        // We are using a 32bit float to store the number
    false,           // It is not normalized (ignore this)
    (2 + 3) * 4,     // Stride in bytes (same as the first attribute)
    2 * 4            // Offset in bytes
);

// 4. Rendering //////////////////////////////////////////////////////////

// The render loop is called once per frame drawn to the screen.
// @param time  The time in milliseconds since the start of the program.
function myRenderLoop(time)
{
    /// Draw the triangle.
    gl.drawElements(
        gl.TRIANGLES,       // We want to draw triangles (always use this)
        6,                  // Draw 6 vertices from the index buffer
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