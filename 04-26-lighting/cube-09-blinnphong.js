// 1. Data ///////////////////////////////////////////////////////////////

// Create an object holding various data for a sphere.
const sphere = glance.createSphere("my-sphere", {
    longitudeBands: 32,
    latitudeBands: 16,
});

// Define the vertex positions of a triangle as a flat buffer of 2d
// coordinates in a space ranging from -1 to +1 in both X and Y.
const vertexPositions = new Float32Array(
    glance.interleaveArrays([sphere.positions, sphere.normals], 3)
);

// Create the position buffer in WebGL...
const positionBuffer = gl.createBuffer();
// ... bind it to the ARRAY_BUFFER target ...
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// ... and upload the data to it.
gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);


// Face indices define triangles, the index number corresponds to
// a vertex defined in the bound ARRAY_BUFFER target.
const faceIndices = new Uint16Array(sphere.indices);

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
    in vec3 a_normal;

    out vec3 f_normal;
    out vec3 f_viewDirection;

    void main() {
        vec4 worldPos = u_modelMatrix * vec4(a_pos, 1.0);
        vec4 viewPos = u_viewMatrix * worldPos;
        f_viewDirection = normalize(-viewPos.xyz);
        f_normal = (u_modelMatrix * vec4(a_normal, 0.0)).xyz;
 		gl_Position = u_projectionMatrix * viewPos;
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

    uniform vec3 u_lightDirection;

    in vec3 f_normal;
    in vec3 f_viewDirection;

	out vec4 o_fragColor;

	void main() {
        vec3 normal = normalize(f_normal);
        vec3 halfWay = normalize(f_viewDirection + u_lightDirection);

        float ambient = 0.07;
        float diffuse = max(0.0, dot(normal, u_lightDirection));
        float specular = pow(max(0.0, dot(normal, halfWay)), 64.0);

		o_fragColor = vec4(vec3(ambient + diffuse + specular), 1.0);
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

// The normal attribute has another location than the position-attribute.
const normalAttribute = gl.getAttribLocation(shaderProgram, 'a_normal');
if (normalAttribute !== -1) {
    // We need to enable the attribute location (ignore this for now).
    gl.enableVertexAttribArray(normalAttribute);
    // Here we tell WebGL how it can extract the attribute from the buffer
    // bound on the ARRAY_BUFFER target.
    gl.vertexAttribPointer(
        normalAttribute, // We want to define the 'a_normal' attribute
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
gl.uniformMatrix4fv(modelMatrixUniform, false, Mat4.identity());


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

// Light direction
const lightDirectionUniform = gl.getUniformLocation(shaderProgram, "u_lightDirection");
const lightDirection = new Vec3(1, 1, 1).normalize();
gl.uniform3fv(lightDirectionUniform, lightDirection);


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

    // Update the light direction.
    lightDirection.set(1, 1, 1).rotateY(time * 0.001).normalize();
    gl.uniform3fv(lightDirectionUniform, lightDirection);

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