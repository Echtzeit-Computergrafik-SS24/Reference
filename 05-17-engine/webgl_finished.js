// Vertex Shader
const vertexShaderSource = `#version 300 es
	precision highp float;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

	in vec3 a_pos;
    in vec3 a_normal;

    out vec3 f_worldPos;
    out vec3 f_normal;

    void main() {
        vec4 worldPos = u_modelMatrix * vec4(a_pos, 1.0);
        f_worldPos = worldPos.xyz;
        f_normal = (u_modelMatrix * vec4(a_normal, 0.0)).xyz;
 		gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
	}
`;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// Fragment Shader
const fragmentShaderSource = `#version 300 es
	precision mediump float;

    uniform vec3 u_color;
    uniform vec3 u_viewPosition;
    uniform vec3 u_lightDirection;

    in vec3 f_worldPos;
    in vec3 f_normal;

	out vec4 o_fragColor;

	void main() {
        vec3 normal = normalize(f_normal);
        vec3 viewDirection = normalize(f_worldPos - u_viewPosition);
        vec3 halfWay = normalize(viewDirection + u_lightDirection);

        vec3 ambient = vec3(0.0);
        vec3 diffuse = max(0.0, dot(normal, u_lightDirection)) * u_color * 3.141592653589793 / 3.0;
        vec3 specular = pow(max(0.0, dot(normal, halfWay)), 30.0) * vec3(0.067);

		o_fragColor = vec4(vec3(ambient + diffuse + specular), 1.0);
	}
`;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// Shader Program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Box VAO
const boxVAO = gl.createVertexArray();
gl.bindVertexArray(boxVAO);

// Box Attributes
const boxAttributes = [
    -0.5, -0.5, -0.5, // position
    -1, 0, 0,         // normal
    -0.5, -0.5, 0.5,
    -1, 0, 0,
    -0.5, 0.5, -0.5,
    -1, 0, 0,
    -0.5, 0.5, 0.5,
    -1, 0, 0,

    0.5, -0.5, 0.5,
    1, 0, 0,
    0.5, -0.5, -0.5,
    1, 0, 0,
    0.5, 0.5, 0.5,
    1, 0, 0,
    0.5, 0.5, -0.5,
    1, 0, 0,

    -0.5, -0.5, -0.5,
    0, -1, 0,
    0.5, -0.5, -0.5,
    0, -1, 0,
    -0.5, -0.5, 0.5,
    0, -1, 0,
    0.5, -0.5, 0.5,
    0, -1, 0,

    -0.5, 0.5, 0.5,
    0, 1, 0,
    0.5, 0.5, 0.5,
    0, 1, 0,
    -0.5, 0.5, -0.5,
    0, 1, 0,
    0.5, 0.5, -0.5,
    0, 1, 0,

    0.5, -0.5, -0.5,
    0, 0, -1,
    -0.5, -0.5, -0.5,
    0, 0, -1,
    0.5, 0.5, -0.5,
    0, 0, -1,
    -0.5, 0.5, -0.5,
    0, 0, -1,

    -0.5, -0.5, 0.5,
    0, 0, 1,
    0.5, -0.5, 0.5,
    0, 0, 1,
    -0.5, 0.5, 0.5,
    0, 0, 1,
    0.5, 0.5, 0.5,
    0, 0, 1,
];
const boxAttributeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, boxAttributeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxAttributes), gl.STATIC_DRAW);

// Box Attribute Definitions
const boxPositionAttribute = gl.getAttribLocation(shaderProgram, 'a_pos');
gl.enableVertexAttribArray(boxPositionAttribute);
gl.vertexAttribPointer(
    boxPositionAttribute,
    3,
    gl.FLOAT,
    false,
    (3 + 3) * 4,
    0
);
const boxNormalAttribute = gl.getAttribLocation(shaderProgram, 'a_normal');
gl.enableVertexAttribArray(boxNormalAttribute);
gl.vertexAttribPointer(
    boxNormalAttribute,
    3,
    gl.FLOAT,
    false,
    (3 + 3) * 4,
    3 * 4
);

// Box Indices
const boxIndices = [
    0, 1, 2, 2, 1, 3,
    4, 5, 6, 6, 5, 7,
    8, 9, 10, 10, 9, 11,
    12, 13, 14, 14, 13, 15,
    16, 17, 18, 18, 17, 19,
    20, 21, 22, 22, 21, 23,
];
const boxIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

// View Matrix
gl.uniformMatrix4fv(
    gl.getUniformLocation(shaderProgram, "u_viewMatrix"), false,
    [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, -2, 1,
    ]
);

// Projection Matrix
gl.uniformMatrix4fv(
    gl.getUniformLocation(shaderProgram, "u_projectionMatrix"), false,
    [
        0.6516126864206029, 0, 0, 0,
        0, 1.3032253728412058, 0, 0,
        0, 0, -1.040816326530612, -1,
        0, 0, -0.2040816326530612, 0,
    ]
);



// View Position
gl.uniform3fv(
    gl.getUniformLocation(shaderProgram, "u_viewPosition"),
    [0, 0, 2]
);

// Light Direction
gl.uniform3fv(
    gl.getUniformLocation(shaderProgram, "u_lightDirection"),
    [-0.2182178902359924, 0.4364357804719848, 0.8728715609439696]
);

// General WebGL Setup
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
gl.cullFace(gl.BACK);
gl.depthFunc(gl.LEQUAL);

function render(time)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Model Matrix
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "u_modelMatrix"), false,
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    );

    // Color
    gl.uniform3fv(
        gl.getUniformLocation(shaderProgram, "u_color"),
        [0.267, 0.667, .533]
    );

    // Green Cube
    gl.drawElements(
        gl.TRIANGLES,
        boxIndices.length,
        gl.UNSIGNED_SHORT,
        0
    );

    //--------------

    // Model Matrix
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "u_modelMatrix"), false,
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -2, 0, 0, 1,
        ]
    );

    // Color
    gl.uniform3fv(
        gl.getUniformLocation(shaderProgram, "u_color"),
        [0.533, 0.267, .667]
    );

    // Lila Cube
    gl.drawElements(
        gl.TRIANGLES,
        boxIndices.length,
        gl.UNSIGNED_SHORT,
        0
    );

    //--------------

    // Model Matrix
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, "u_modelMatrix"), false,
        [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            2, 0, 0, 1,
        ]
    );

    // Color
    gl.uniform3fv(
        gl.getUniformLocation(shaderProgram, "u_color"),
        [0.667, 0.533, .267]
    );

    // Yellow Cube
    gl.drawElements(
        gl.TRIANGLES,
        boxIndices.length,
        gl.UNSIGNED_SHORT,
        0
    );
}
setRenderLoop(render);