// "use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gui;
var geoList = [];
var verticesList = [];
var userOpts;

setupGui();
let growingRadius = userOpts.radius;
let counter = 0;
init();
console.log("init");
fillScene();
console.log("fillScene");
addToDOM();
console.log("addToDOM");
animate();
console.log("animate");

// function createCell(radius){
//     var cell = new THREE.SphereGeometry( radius, 50, 50 );
// }

function fillScene() {
  scene = new THREE.Scene();

  // LIGHTS
  scene.add(ambientLight);
  scene.add(light);

  // Initial state /////
  // Create a base
  var base = new THREE.SphereGeometry(userOpts.radius, 1, 1);

  //Turn face-vector data structure into half edge
  verticesList = base.vertices;
  var halfEdgeMesh = createHEStructure(base);
  console.log(halfEdgeMesh);

  // Create a cell
  var cell = new THREE.SphereGeometry(userOpts.radius, 50, 50);

  // Define material
  // var material = new THREE.MeshBasicMaterial( { color: 0x2194ce, wireframe:true } );
  var material = new THREE.MeshPhongMaterial({
    color: 0x749BA6,
    transparent: true,
    specular: 0xDCE4EE,
    opacity: 0.7,
    shininess: 10
  });

  // Create mesh for cells
  // Change the position of cells
  for (let vertex of verticesList) {
    var cellMesh = new THREE.Mesh(cell, material);
    cellMesh.position.x = vertex.x;
    cellMesh.position.y = vertex.y;
    cellMesh.position.z = vertex.z;
    console.log(vertex);
    scene.add(cellMesh);
    geoList.push(cellMesh);
  }

// // Create mesh for the base
// 	var baseMesh = new THREE.Mesh( base, material );
// 	scene.add(baseMesh);
}

function init() {
  var canvasWidth = window.innerWidth;
  var canvasHeight = window.innerHeight;
  var canvasRatio = canvasWidth / canvasHeight;

  //RENDERER
  renderer = new THREE.WebGLRenderer();
  // renderer.gammaInput(true);
  // renderer.gammaOutput(true);
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x1C1D26, 1.0);

  //CAMERA
  camera = new THREE.PerspectiveCamera(90, canvasRatio, 0.1, 1000);
  camera.position.z = 40;
  camera.lookAt(0, 0, 0);

  // CONTROLS
  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 0, 0);
  // Create auto rotation effect
  cameraControls.autoRotate = true;
  cameraControls.autoRotateSpeed = 0.01;
  // Create friction effect for camera control
  cameraControls.enableDamping = true;
  cameraControls.dampingFactor = 0.2;
  // cameraControls.minDistance = 100;
  cameraControls.maxDistance = 1000;
  // cameraControls.maxPolarAngle = Math.PI / 2;
  // cameraControls.update();

  //LIGHT
  ambientLight = new THREE.AmbientLight(0xFFFFFF);
  light = new THREE.AmbientLight(0xFFFFFF);

  light = new THREE.DirectionalLight(0xFFFFFF, 0.3);
  light.position.set(-800, 900, 300);
}

function addToDOM() {
// var container = document.getElementById('container');
//     var canvas = container.getElementsByTagName('canvas');
//     if (canvas.length>0) {
//         container.removeChild(canvas[0]);
//     }
//     container.appendChild( renderer.domElement );
  document.body.appendChild(renderer.domElement);  // .domElement: A canvas where the renderer draws its output.

}

// To modify the scene before the scene
function render() {
  var delta = clock.getDelta();
  cameraControls.update(delta);
  renderer.render(scene, camera);
}

function animate() {
  //Draw the scene when refreshed
  window.requestAnimationFrame(animate);
  cameraControls.update(); // Only required if .enableDamping = true or .autoRotate = true

  //Morph the cells
  let i = 0;
  let velocity = userOpts.growthSpeed;
  for (let geo of geoList) {
    // // Make sure the index isn't out of bound
    // if (j < geoList.length - 1){
    //   // If two cells aren't overlapping
    //   if (verticesList[j].distanceTo(verticesList[j+1]) < 2 * userOpts.radius){
    //     // Apply bulge force
    //
    //   }
    // }
    if (growingRadius < userOpts.maxRadius) {
      //TO-DO2: Apply turgor pressure to grow the cell
      geo.scale.x *= 1 + userOpts.growthSpeed;
      geo.scale.y *= 1 + userOpts.growthSpeed;
      geo.scale.z *= 1 + userOpts.growthSpeed;
      console.log(verticesList[i]);
      console.log(i);

      //TO-DO3: Apply velocity and forces to move the cell
      geo.position.x += verticesList[i].x * (3 * userOpts.growthSpeed);
      geo.position.y += verticesList[i].y * (3 * userOpts.growthSpeed);
      geo.position.z += verticesList[i].z * (3 * userOpts.growthSpeed);

      console.log("animate");
      growingRadius *= (1 + userOpts.growthSpeed);
      console.log(growingRadius);
      i++;

    } else {
      //Split the cell?
    }
  }


  render();
}

// Create Half-edge data structure
// Modified by https://observablehq.com/@2talltim/mesh-data-structures-traversal

function HalfEdge(tail, head){
  this.tail = tail;
  this.head = head;
  this.next = null;
  this.twin = null;
  this.face = null;
}

function HalfEdgeMesh () {
  this.vertices = [];
  this.edges = [];
  this.geo = null; //Store the original geometry
}


 function createHEStructure(geo){
  var hem = new HalfEdgeMesh();
  hem.geo = geo;
  for (let f of geo.faces){
    let pointA = geo.vertices[f.a];
    let pointB = geo.vertices[f.b];
    let pointC = geo.vertices[f.c];
    hem.vertices.push(pointA);
    hem.vertices.push(pointB);
    hem.vertices.push(pointC);
    let vertPairs = [[pointA, pointB], [pointB, pointC], [pointC, pointA]]
    let i = 0;
    for (let v of vertPairs){
      if ([v[0], v[1]] in hem.edges === false){
        var he = new HalfEdge(v[0],v[1]);
        he.face = f;
        he.next = vertPairs[(i + 1) % 3];
        i++;
        hem.edges.push(he);
      }

      if (![v[1], v[0]] in hem.edges){
        var heTwin = new HalfEdge(v[1],v[0]);
        hem.edges.push(heTwin);
        he.twin = heTwin;
      }
    }
  }
  return hem;
}

//GUI is currently not working
function resetGui() {
  userOpts = {
    linkDistance: 6,
    radius: 5,
    growthSpeed: 0.0005,
    maxRadius: 10,
    reset: false
  };
}

function setupGui() {

  resetGui();

  gui = new dat.GUI();

  gui.add(userOpts, "linkDistance", 5.0, 15.0).name("Distance between cells");
  gui.add(userOpts, "radius", 5.0, 10.0).name("Radius");
  gui.add(userOpts, "growthSpeed", 0.0001, 0.001).name("Growth Speed");
  gui.add(userOpts, "reset").name("reset");
}

// function resetGui() {
//   effectController = {
//     wrap: 'repeat',
//     repeat: 3,
//     showPoly: false,
//     mtlName: 'water',
//     reset: false
//   };
// }
//
// function setupGui() {
//
//   resetGui();
//
//   gui = new dat.GUI();
//   gui.add(effectController, "wrap", ['repeat', 'mirrored repeat', 'clamp to edge']).name("wrap mode");
//   gui.add(effectController, "repeat", 0.0, 10.0).name("texture repeat");
//   gui.add(effectController, "showPoly").name("show polygon");
//   gui.add(effectController, "mtlName", ['crate', 'grid', 'water', 'concrete', 'letterR']).name("texture image");
//   gui.add(effectController, "reset").name("reset");
// }








