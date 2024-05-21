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
                vec3 specular = pow(max(0.0, dot(normal, halfWay)), 32.0) * vec3(0.067);

                o_fragColor = vec4(vec3(ambient + diffuse + specular), 1.0);
            }
        `;

const boxShader = glance.createShader(gl, "my-shader", vertexShaderSource, fragmentShaderSource, {
    u_viewMatrix: glance.Mat4.fromTranslation(0, 0, -2),
    u_projectionMatrix: glance.Mat4.perspective((75 / 180) * Math.PI, 2, 0.1, 5),
    u_viewPosition: new glance.Vec3(0, 0, 2),
    u_lightDirection: new glance.Vec3(-1, 2, 4).normalize(),
});

const box = glance.createBox("my-box");
const boxIBO = glance.createIndexBuffer(gl, box.indices);
const boxABO = glance.createAttributeBuffer(gl, "box-abo", {
    a_pos: { data: box.positions, height: 3 },
    a_normal: { data: box.normals, height: 3 },
});
const boxVAO = glance.createVAO(gl, "box-vao", boxIBO, glance.buildAttributeMap(boxShader, [boxABO]));

const greenBoxDrawCall = glance.createDrawCall(gl, boxShader, boxVAO, {
    uniforms: {
        u_modelMatrix: () => glance.Mat4.identity(),
        u_color: () => [0.267, 0.667, 0.533],
    },
    cullFace: gl.BACK,
    depthTest: gl.LESS,
});

const lilaBoxDrawCall = glance.createDrawCall(gl, boxShader, boxVAO, {
    uniforms: {
        u_modelMatrix: () => glance.Mat4.fromTranslationX(-2),
        u_color: () => [0.533, 0.267, 0.667],
    },
    cullFace: gl.BACK,
    depthTest: gl.LESS,
});

const yellowBoxDrawCall = glance.createDrawCall(gl, boxShader, boxVAO, {
    uniforms: {
        u_modelMatrix: () => glance.Mat4.fromTranslationX(2),
        u_color: () => [0.667, 0.533, 0.267],
    },
    cullFace: gl.BACK,
    depthTest: gl.LESS,
});

gl.clearColor(0, 0, 0, 1);

function render(time)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    glance.performDrawCall(gl, greenBoxDrawCall, time);
    glance.performDrawCall(gl, lilaBoxDrawCall, time);
    glance.performDrawCall(gl, yellowBoxDrawCall, time);
}
setRenderLoop(render);