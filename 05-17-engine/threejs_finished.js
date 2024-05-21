//!
//! Your task is to to finish the "Fundamentals" section of the Three.js tutorial
//! at https://threejs.org/manual/#en/fundamentals
//!
//! Be sure to read through the comments below to make sure that the tutorial code
//! can run in this environment.
//!
//! When completed, you should have a working example of three rotating cubes in
//! the viewport, just as in the tutorial.
//!
//! Have fun :)
//!

//! We can only use JavaScript here, so we use a dynamic import to load the
//! THREE.js module. It works just the same as it does in the tutorial.
const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.164.1/+esm');

//! Use the built-in canvas to render the image.
//! This is equivalent to what is done in the tutorial, just without your own
//! HTML canvas element.
const canvas = document.querySelector('.draw-canvas');

//! ... most of the code goes here
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

const lightColor = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(lightColor, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

function makeInstance(geo, color, x)
{
    const material = new THREE.MeshPhongMaterial({ color });

    const cube = new THREE.Mesh(geo, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
}
const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
];

//! You cannot use `requestAnimationFrame` directly here.
//! Instead, write the render function as described in the tutorial, without
//! the `requestAnimationFrame` calls and then use `setRenderLoop` to kick off
//! the render loop, like below.
function render(time)
{
    time *= 0.001;  // convert time to seconds

    // cubes.forEach((cube, ndx) =>
    // {
    //     const speed = 1 + ndx * .1;
    //     const rot = time * speed;
    //     cube.rotation.x = rot;
    //     cube.rotation.y = rot;
    // });

    renderer.render(scene, camera);
}
//! You only need to call `setRenderLoop` once, outside the loop itself.
setRenderLoop(render);