// 1. Shaders //////////////////////////////////////////////////////////////////

// Earth -----------------------------------------------------------------------

// const earthVSSource = `#version 300 es
// 	precision highp float;

//     uniform mat4 u_modelMatrix;
//     uniform mat4 u_viewMatrix;
//     uniform mat4 u_projectionMatrix;

// 	in vec3 a_pos;
//     in vec3 a_normal;
//     in vec2 a_texCoord;

//     out vec3 f_worldPos;
//     out vec3 f_normal;
//     out vec2 f_texCoord;
//     flat out vec3 f_viewPosition;

//     void main() {
//         vec4 worldPos = u_modelMatrix * vec4(a_pos, 1.0);
//         f_worldPos = worldPos.xyz;
//         f_viewPosition = (inverse(u_viewMatrix) * vec4(0, 0, 0, 1)).xyz;
//         f_normal = (u_modelMatrix * vec4(a_normal, 0.0)).xyz;
//         f_texCoord = a_texCoord;
//  		gl_Position = u_projectionMatrix * u_viewMatrix * worldPos;
// 	}
// `;

// const earthFSSource = `#version 300 es
// 	precision mediump float;

//     uniform vec3 u_lightDirection;
//     uniform sampler2D u_texAmbient;
//     uniform sampler2D u_texDiffuse;
//     uniform sampler2D u_texSpecular;

//     in vec3 f_worldPos;
//     in vec3 f_normal;
//     in vec2 f_texCoord;
//     flat in vec3 f_viewPosition;

// 	out vec4 o_fragColor;

// 	void main() {
//         vec3 texAmbient = texture(u_texAmbient, f_texCoord).rgb;
//         vec3 texDiffuse = texture(u_texDiffuse, f_texCoord).rgb;
//         vec3 texSpecular = texture(u_texSpecular, f_texCoord).rgb;

//         vec3 normal = normalize(f_normal);
//         vec3 viewDirection = normalize(f_viewPosition - f_worldPos);
//         vec3 halfWay = normalize(viewDirection + u_lightDirection);

//         float ambientIntensity = 0.07;
//         vec3 ambient = max(vec3(ambientIntensity), texAmbient);

//         float diffuseIntensity = max(0.0, dot(normal, u_lightDirection)) * (1.0 - ambientIntensity);
//         vec3 diffuse = texDiffuse * diffuseIntensity;

//         float specularIntensity = pow(max(0.0, dot(normal, halfWay)), 64.0);
//         vec3 specular = vec3(specularIntensity) * texSpecular;

// 		o_fragColor = vec4(ambient + diffuse + specular, 1.0);
// 	}
// `;

// const earthVertexShader = gl.createShader(gl.VERTEX_SHADER);
// gl.shaderSource(earthVertexShader, earthVSSource);
// gl.compileShader(earthVertexShader);

// const earthFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
// gl.shaderSource(earthFragmentShader, earthFSSource);
// gl.compileShader(earthFragmentShader);

// const earthShaderProgram = gl.createProgram();
// gl.attachShader(earthShaderProgram, earthVertexShader);
// gl.attachShader(earthShaderProgram, earthFragmentShader);
// gl.linkProgram(earthShaderProgram);
// gl.useProgram(earthShaderProgram);

// Skybox ----------------------------------------------------------------------

const skyboxVSSource = `#version 300 es
    precision highp float;

    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

    in vec3 a_pos;

    out vec3 f_texCoord;

    void main() {
        // Use the local position of the vertex as texture coordinate.
        f_texCoord = vec3(1, -1, -1) * a_pos;

        // By setting Z == W, we ensure that the vertex is projected onto the
        // far plane, which is exactly what we want for the background.
        vec4 ndcPos = u_projectionMatrix * u_viewMatrix * vec4(a_pos, 0.0);
        gl_Position = ndcPos.xyww;
    }
`;

const skyboxFSSource = `#version 300 es
    precision mediump float;

    uniform samplerCube u_skybox;

    in vec3 f_texCoord;

    out vec4 o_fragColor;

    void main() {
        // The fragment color is simply the color of the skybox at the given
        // texture coordinate (local coordinate) of the fragment on the cube.
        o_fragColor = texture(u_skybox, f_texCoord);
    }
`;

const skyboxVertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(skyboxVertexShader, skyboxVSSource);
gl.compileShader(skyboxVertexShader);

const skyboxFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(skyboxFragmentShader, skyboxFSSource);
gl.compileShader(skyboxFragmentShader);

const skyboxShaderProgram = gl.createProgram();
gl.attachShader(skyboxShaderProgram, skyboxVertexShader);
gl.attachShader(skyboxShaderProgram, skyboxFragmentShader);
gl.linkProgram(skyboxShaderProgram);
gl.useProgram(skyboxShaderProgram);


// 2. Data /////////////////////////////////////////////////////////////////////

// Earth -----------------------------------------------------------------------

// // Create an object holding various data for the earth.
// const earth = glance.createSphere("my-earth", {
//     longitudeBands: 64,
//     latitudeBands: 32,
// });

// // Define the vertex attributes for the earth.
// const earthAttributeData = new Float32Array(
//     glance.interleaveArrays([earth.positions, earth.normals, earth.texCoords], [3, 3, 2])
// );

// // Create a buffer to store the earth attributes.
// const earthAttributeBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, earthAttributeBuffer);
// gl.bufferData(gl.ARRAY_BUFFER, earthAttributeData, gl.STATIC_DRAW);

// // Create a buffer to store the earth indices.
// const earthIndexData = new Uint16Array(earth.indices);
// const earthIndexBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earthIndexBuffer);
// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, earthIndexData, gl.STATIC_DRAW);

// const earthPositionAttribute = gl.getAttribLocation(earthShaderProgram, 'a_pos');
// gl.enableVertexAttribArray(earthPositionAttribute);
// gl.vertexAttribPointer(
//     earthPositionAttribute, // We want to define the 'a_pos' attribute
//     3,               // It has three components (x, y, z)
//     gl.FLOAT,        // We are using a 32bit float to store the number
//     false,           // It is not normalized (ignore this)
//     (3 + 3 + 2) * 4, // Stride in bytes
//     0 * 4            // Offset in bytes
// );
// const earthNormalAttribute = gl.getAttribLocation(earthShaderProgram, 'a_normal');
// gl.enableVertexAttribArray(earthNormalAttribute);
// gl.vertexAttribPointer(
//     earthNormalAttribute, // We want to define the 'a_normal' attribute
//     3,               // It has three components (r, g, b)
//     gl.FLOAT,        // We are using a 32bit float to store the number
//     false,           // It is not normalized (ignore this)
//     (3 + 3 + 2) * 4, // Stride in bytes (same as the first attribute)
//     3 * 4            // Offset in bytes
// );
// const earthTexCoordAttribute = gl.getAttribLocation(earthShaderProgram, 'a_texCoord');
// gl.enableVertexAttribArray(earthTexCoordAttribute);
// gl.vertexAttribPointer(
//     earthTexCoordAttribute, // We want to define the 'a_texCoord' attribute
//     2,               // It has two components (u, v)
//     gl.FLOAT,        // We are using a 32bit float to store the number
//     false,           // It is not normalized (ignore this)
//     (3 + 3 + 2) * 4, // Stride in bytes (same as all attributes)
//     (3 + 3) * 4,     // Offset in bytes
// );

// Skybox ----------------------------------------------------------------------

// Create the Skybox attributes and -indices.
const skybox = glance.createBox("my-skybox");

const skyboxAttributeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, skyboxAttributeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skybox.positions), gl.STATIC_DRAW);

const skyboxIndexBuffer = gl.createBuffer();
const skyboxIndexData = new Uint16Array(skybox.indices);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexData, gl.STATIC_DRAW);

const skyboxPositionAttribute = gl.getAttribLocation(skyboxShaderProgram, 'a_pos');
gl.enableVertexAttribArray(skyboxPositionAttribute);
gl.vertexAttribPointer(
    skyboxPositionAttribute, // We want to define the 'a_pos' attribute
    3,               // It has three components (x, y, z)
    gl.FLOAT,        // We are using a 32bit float to store the number
    false,           // It is not normalized (ignore this)
    (3) * 4,         // Stride in bytes
    0 * 4            // Offset in bytes
);

// 3. Textures /////////////////////////////////////////////////////////////////

const textureUrls = [
    // Earth
    'https://echtzeit-computergrafik-ss24.github.io/img/earth-ambient.avif',
    'https://echtzeit-computergrafik-ss24.github.io/img/earth-diffuse.avif',
    'https://echtzeit-computergrafik-ss24.github.io/img/earth-specular.avif',
    // Skybox
    'https://echtzeit-computergrafik-ss24.github.io/img/skybox-right-label.avif',
    'https://echtzeit-computergrafik-ss24.github.io/img/skybox-left-label.avif',
    'https://echtzeit-computergrafik-ss24.github.io/img/skybox-bottom-label.avif',
    'https://echtzeit-computergrafik-ss24.github.io/img/skybox-top-label.avif',
    'https://echtzeit-computergrafik-ss24.github.io/img/skybox-front-label.avif',
    'https://echtzeit-computergrafik-ss24.github.io/img/skybox-back-label.avif',
];

// Create all textures.
const textures = [gl.createTexture(), gl.createTexture(), gl.createTexture(), gl.createTexture()];
const [ambientTexture, diffuseTexture, specularTexture, skyboxTexture] = textures;

let cubeMapFacesLoaded = 0;
for (let texUrlIdx = 0; texUrlIdx < textureUrls.length; texUrlIdx++) {
    const cubeMapIndex = texUrlIdx - 3;
    const isCubeMap = cubeMapIndex >= 0;
    const textureIdx = Math.min(texUrlIdx, textures.length - 1);
    const texture = textures[textureIdx];

    // Bind the texture to the right target.
    const bindTarget = isCubeMap ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;
    gl.bindTexture(bindTarget, texture);

    // Define the placeholder texture data.
    const dataTarget = isCubeMap ? gl.TEXTURE_CUBE_MAP_POSITIVE_X + cubeMapIndex : gl.TEXTURE_2D;
    gl.texImage2D(dataTarget,
        0,               // Level
        gl.RGBA,         // Internal format of the texture (how it is stored on the gpu).
        1,               // The placeholder is only 1 pixel wide...
        1,               // ... and 1 pixel high.
        0,               // The legacy "border" parameter must always be 0.
        gl.RGBA,         // The format of the data we use to define the texture.
        gl.UNSIGNED_BYTE,// The data type of the texture data.
        new Uint8Array([0, 0, 0, 255]), // The actual texture data is a single, opaque, black pixel.
    );

    // Create a new Javascript "Image" object, which is provided by the browser.
    let image = new Image();
    image.crossOrigin = "anonymous";    // ask for CORS permission
    // Define a callback to run when the image data has been loaded.
    // Note that this function is not executed immediately but some time in the future,
    // likely after the first frame has been drawn.
    image.onload = () =>
    {
        // If the texture is a cube map, we need to keep track of how many faces have been loaded.
        if (isCubeMap) {
            cubeMapFacesLoaded++;
        }

        // (Re-)bind the texture.
        // We don't have any other textures in this example, but in a real-world
        // scenario, we cannot be certain anymore, that the texture we want to
        // define is the one currently bound.
        gl.bindTexture(bindTarget, texture);

        // Tell WebGL to flip texture data vertically when loading it.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // Redefine the texture.
        // You will notice that his function has fewer arguments.
        // That is because WebGL can automatically query the size of the texture
        // from the `image` object.
        gl.texImage2D(dataTarget,
            0,                  // Level
            gl.RGBA,            // internal format
            gl.RGBA,            // (source) format
            gl.UNSIGNED_BYTE,   // data type
            image,              // new texture data
        );

        // Define sampling parameter.
        if (!isCubeMap || (cubeMapFacesLoaded === 6)) {
            gl.generateMipmap(bindTarget);
            gl.texParameteri(bindTarget, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        gl.texParameteri(bindTarget, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(bindTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(bindTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(bindTarget, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        // Afterwards, we can destroy the image object.
        image = null;
    };

    // Load the image AFTER defining the callback, in case the load finishes before the callback
    // had a chance to be assigned (not likely but possible).
    image.src = textureUrls[texUrlIdx];
}

// 4. Rendering ////////////////////////////////////////////////////////////////

// Uniform values.
let pan = 0;
let tilt = 0;
let zoom = 3;
const earthModelMatrix = Mat4.identity();
const viewMatrix = Mat4.fromTranslation(0, 0, -zoom);
const projectionMatrix = Mat4.perspective(
    Math.PI / 4, // fov
    1.0, // aspect ratio
    0.1, // near
    10.0, // 4_000_000 // far
);
const lightDirection = new Vec3(.3, -.3, -1).normalize();

// Handle earth uniforms.
// const earthModelMatrixUniform = gl.getUniformLocation(earthShaderProgram, "u_modelMatrix");
// const earthViewMatrixUniform = gl.getUniformLocation(earthShaderProgram, "u_viewMatrix");
// const earthProjectionMatrixUniform = gl.getUniformLocation(earthShaderProgram, "u_projectionMatrix");
// const lightDirectionUniform = gl.getUniformLocation(earthShaderProgram, "u_lightDirection");
// const earthAmbientTextureUniform = gl.getUniformLocation(earthShaderProgram, "u_texAmbient");
// const earthDiffuseTextureUniform = gl.getUniformLocation(earthShaderProgram, "u_texDiffuse");
// const earthSpecularTextureUniform = gl.getUniformLocation(earthShaderProgram, "u_texSpecular");

// gl.uniformMatrix4fv(earthModelMatrixUniform, false, earthModelMatrix);
// gl.uniformMatrix4fv(earthProjectionMatrixUniform, false, projectionMatrix);
// gl.uniformMatrix4fv(earthViewMatrixUniform, false, viewMatrix);
// gl.uniform3fv(lightDirectionUniform, lightDirection);
// gl.uniform1i(earthAmbientTextureUniform, 0);
// gl.uniform1i(earthDiffuseTextureUniform, 1);
// gl.uniform1i(earthSpecularTextureUniform, 2);

// Handle skybox uniforms.
const skyboxViewMatrixUniform = gl.getUniformLocation(skyboxShaderProgram, "u_viewMatrix");
const skyboxProjectionMatrixUniform = gl.getUniformLocation(skyboxShaderProgram, "u_projectionMatrix");
const skyboxTextureUniform = gl.getUniformLocation(skyboxShaderProgram, "u_skybox");

gl.uniformMatrix4fv(skyboxProjectionMatrixUniform, false, projectionMatrix);
gl.uniform1i(skyboxTextureUniform, 0);

// Enbable backface culling.
// gl.enable(gl.CULL_FACE);
// gl.cullFace(gl.BACK);

// The render loop is called once per frame drawn to the screen.
// @param time  The time in milliseconds since the start of the program.
function myRenderLoop(time)
{
    // Always clear the canvas before drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Do not draw anything until all textures are loaded.
    if (cubeMapFacesLoaded < 6) {
        return;
    }

    // Update uniform values
    earthModelMatrix.reset().rotateY(time * 0.0001);
    viewMatrix.reset().translateZ(-zoom).rotateX(tilt).rotateY(pan);

    // (Re-)Bind the active textures
    // gl.activeTexture(gl.TEXTURE0 + 0);
    // gl.bindTexture(gl.TEXTURE_2D, ambientTexture);
    // gl.activeTexture(gl.TEXTURE0 + 1);
    // gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
    // gl.activeTexture(gl.TEXTURE0 + 2);
    // gl.bindTexture(gl.TEXTURE_2D, specularTexture);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

    // Update Uniforms
    // gl.uniformMatrix4fv(earthModelMatrixUniform, false, earthModelMatrix);
    // gl.uniformMatrix4fv(earthViewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix4fv(skyboxViewMatrixUniform, false, viewMatrix);

    // // Draw the geometry.
    // gl.drawElements(
    //     gl.TRIANGLES,       // We want to draw triangles (always use this)
    //     earthIndexData.length, // Draw all vertices from the index buffer
    //     gl.UNSIGNED_SHORT,  // Data type used in the index buffer
    //     0                   // Offset (in bytes) in the index buffer
    // );
    gl.drawElements(
        gl.TRIANGLES,           // We want to draw triangles (always use this)
        skyboxIndexData.length, // Draw all vertices from the index buffer
        gl.UNSIGNED_SHORT,      // Data type used in the index buffer
        0                       // Offset (in bytes) in the index buffer
    );

    // Stop the loop if an error occurred
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        throw new Error(`WebGL error: ${error}`);
    }
}
setRenderLoop(myRenderLoop);

onMouseDrag((e) =>
{
    const cameraSpeed = 0.007;
    const halfPi = Math.PI / 2;
    pan += e.movementX * cameraSpeed;
    tilt = glance.clamp(tilt + e.movementY * cameraSpeed, -halfPi, halfPi);
});

onMouseWheel((e) =>
{
    const zoomSpeed = 0.2;
    const minZoom = 1.5;
    const maxZoom = 5;
    zoom = glance.clamp(zoom * (1 + Math.sign(e.deltaY) * zoomSpeed), minZoom, maxZoom);
});