//!
//! Exercise Time!
//! ==============
//! The goal of this exercise is to add a reflection of the skybox to the torus
//! knot (the object in the center of the screen). The torus knot will not
//! reflect itself, only the environment, but that's okay. The torus knot has a
//! fragment shader with a basic blinn-phong lighting model, which you are free
//! to modify or replace.
//!
//! You will only need to modify the torus knot's fragment shader.
//! Everything else is already set up.
//!
//! Hints:
//! ======
//! - The reflection is a simple texture lookup in the skybox texture.
//! - The reflection direction is the mirror of the view direction.
//! - GLSL has a built-in function to reflect a vector, called `reflect`.
//!


const blinnPhongFSSource = `#version 300 es
	precision mediump float;

    /// World-space position of the camera.
    uniform vec3 u_viewPosition;

    /// Skybox texture (cubemap-)sampler
    uniform samplerCube u_skybox;

    /// Interpolated normal of the fragment in world-space.
    in vec3 f_normal;

    /// Interpolated position of the fragment in world-space.
    in vec3 f_position;

    /// Output color of the fragment.
	out vec4 o_fragColor;

	void main() {
        // Constants
        vec3 lightDirection = normalize(vec3(-1.0, 1.0, -1.0));
        float ambient = 0.07;   // Ambient intensity in range [0, 1]
        float shininess = 64.0; // Specular shininess

        vec3 normal = normalize(f_normal);
        vec3 viewDirection = normalize(u_viewPosition - f_position);
        vec3 halfWay = normalize(viewDirection + lightDirection);

        float diffuse = max(0.0, dot(normal, lightDirection));
        float specular = pow(max(0.0, dot(normal, halfWay)), shininess);

        o_fragColor = vec4(vec3(ambient + diffuse + specular), 1.0);
	}
`;


//!
//! The rest of the code is written using the Glance library, which is different
//! from the WebGL code you've seen so far. The Glance library is a thin layer
//! on top of WebGL that simplifies the process of creating and managing
//! resources like shaders, buffers, and textures.
//! Feel free to have a look, but you don't need to understand it to complete
//! this exercise.
//!

// =====================================================================
// Shader
// =====================================================================

// Torus Knot (continued)
const blinnPhongVSSource = `#version 300 es
	precision highp float;

    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

	in vec3 a_pos;
    in vec3 a_normal;

    out vec3 f_normal;
    out vec3 f_position;

    void main() {
        vec4 worldPosition = vec4(a_pos, 1.0);
        f_position = worldPosition.xyz;
        f_normal = a_normal;

 		gl_Position = u_projectionMatrix * u_viewMatrix * worldPosition;
	}
`;

const blinnPhongShader = glance.createShader(
    gl,
    "shader-blinn-phong",
    blinnPhongVSSource,
    blinnPhongFSSource,
    {
        u_skybox: 0,
    },
);

// Skybox
const skyboxVSSource = `#version 300 es
    precision highp float;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    in vec3 a_pos;
    out vec3 f_texCoord;
    void main() {
        f_texCoord = a_pos;
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
        o_fragColor = texture(u_skybox, f_texCoord);
    }
`;

const skyboxShader = glance.createShader(gl, "shader-skybox", skyboxVSSource, skyboxFSSource, {
    u_skybox: 0,
});

// =====================================================================
// Geometry
// =====================================================================

// Torus Knot
const geo = glance.createTorusKnot("test-geo", {
    knotRadius: .6,
    tubeRadius: .2,
    tubeSegments: 128,
    radialSegments: 24,
});
const geoIBO = glance.createIndexBuffer(gl, geo.indices);
const geoABO = glance.createAttributeBuffer(gl, "geo-abo", {
    a_pos: { data: geo.positions, height: 3 },
    a_normal: { data: geo.normals, height: 3 },
});
const geoVAO = glance.createVAO(gl, "geo-vao", geoIBO, glance.buildAttributeMap(blinnPhongShader, [geoABO]));

// Skybox
const skybox = glance.createBox("skybox-geo");
const skyboxIBO = glance.createIndexBuffer(gl, skybox.indices);
const skyboxABO = glance.createAttributeBuffer(gl, "skybox-abo", {
    a_pos: { data: skybox.positions, height: 3 },
});
const skyboxVAO = glance.createVAO(
    gl,
    "skybox-vao",
    skyboxIBO,
    glance.buildAttributeMap(skyboxShader, [skyboxABO]),
);
const skyboxTexture = await glance.loadCubemapNow(gl, "skybox-texture", [
    "/img/skybox-berlin-right.avif",
    "/img/skybox-berlin-left.avif",
    "/img/skybox-berlin-top.avif",
    "/img/skybox-berlin-bottom.avif",
    "/img/skybox-berlin-front.avif",
    "/img/skybox-berlin-back.avif",
]);

// =====================================================================
// Interaction
// =====================================================================

//! `Sticky` variables are kept between runs of the app, so your camera
//! does not reset itself every time.
const pan = Sticky("pan", 1.9);
const tilt = Sticky("tilt", 0);
const zoom = Sticky("zoom", 4.5);

//! `Cached` values are read on every frame draw, but change a lot less
//! frequent. They also have a simple dependency tracking setup, which
//! means that they update automatically once one of their dependencies
//! has changed.
const viewPos = Cached(
    Vec3.zero(),
    (v) => v.set(0, 0, zoom.getRef()).rotateX(tilt.getRef()).rotateY(pan.getRef()),
    [zoom, tilt, pan],
);

const viewMatrix = Cached(
    Mat4.identity(),
    (m) => m.lookAt(
        viewPos.getRef(),
        glance.Vec3.zero(),
        glance.Vec3.yAxis(),
    ),
    [viewPos],
);

const projectionMatrix = Cached(
    Mat4.identity(),
    (m) =>
    {
        return m.perspective(Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.4, 30);
    },
    [],
);

onMouseDrag((e) =>
{
    pan.update((v) => v - e.movementX * 0.007);
    tilt.update((v) => glance.clamp(v - e.movementY * 0.007, -Math.PI / 2, Math.PI / 2));
});

onMouseWheel((e) =>
{
    const factor = 1 + Math.sign(e.deltaY) * 0.25;
    zoom.update((v) => glance.clamp(v * factor, 1.5, 20));
});

onResize(() =>
{
    projectionMatrix.setDirty();
});

// =====================================================================
// Rendering
// =====================================================================

//! These `DrawCall` objects contain all information about a WebGL draw
//! call. We will actually get to something very much like that in the
//! later half of the lecture.
const geoDrawCall = glance.createDrawCall(gl, blinnPhongShader, geoVAO, {
    uniforms: {
        u_viewMatrix: () => viewMatrix.getRef(),
        u_projectionMatrix: () => projectionMatrix.getRef(),
        u_viewPosition: () => viewPos.getRef(),
    },
    textures: [[0, skyboxTexture]],
    cullFace: gl.BACK,
    depthTest: gl.LESS,
});

const skyboxDrawCall = glance.createDrawCall(gl, skyboxShader, skyboxVAO, {
    uniforms: {
        u_viewMatrix: () => viewMatrix.getRef(),
        u_projectionMatrix: () => projectionMatrix.getRef(),
    },
    textures: [[0, skyboxTexture]],
    cullFace: gl.NONE,
    depthTest: gl.LEQUAL,
});

//! With everything wrapped into data object (with callbacks, where
//! necessary), the actual render loop itself is tiny.
setRenderLoop((time) =>
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    glance.performDrawCall(gl, geoDrawCall, time);
    glance.performDrawCall(gl, skyboxDrawCall, time);
});