// "use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gui;
// var geoList = [];
// var verticesList = [];
// var forcePList = [];
var userOpts;
var base;


function Base(geo){
  this.geo = geo;
  this.geoList = [];
  this.verticesList = [];
  this.forcePList = [];
}
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

  var sphere = new THREE.SphereGeometry(20, 4, 4);
  base = new Base(sphere);

  //Turn face-vector data structure into half edge
  base.verticesList = sphere.vertices;
  var halfEdgeMesh = createHEStructure(base.geo);

  // *******BUG: Head & tail in halfEdgeMesh became (0, 0, 0) after applying createForce(halfEdgeMesh)
  createForce(halfEdgeMesh);
  //console.log(halfEdgeMesh.edges[1].head.x);

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
  for (let vertex of base.verticesList) {
    var cellMesh = new THREE.Mesh(cell, material);
    cellMesh.position.x = vertex.x;
    cellMesh.position.y = vertex.y;
    cellMesh.position.z = vertex.z;
    console.log(vertex);
    scene.add(cellMesh);
    base.geoList.push(cellMesh);
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
  for (let geo of base.geoList) {
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
      console.log(base.verticesList[i]);
      console.log(i);

    } else {
      //Split the cell?
    }

    //TO-DO3: Apply velocity and forces to move the cell
      if(geo.position.distanceTo(base.geoList[(i + 1) % base.geoList.length].position) < 2 * userOpts.radius){
        geo.position.x += base.forcePList[i].x;
        geo.position.y += base.forcePList[i].y;
        geo.position.z += base.forcePList[i].z;
      }
      else{
        geo.position.x += base.verticesList[i].x * (3 * userOpts.growthSpeed);
        geo.position.y += base.verticesList[i].y * (3 * userOpts.growthSpeed);
        geo.position.z += base.verticesList[i].z * (3 * userOpts.growthSpeed);
      }

      console.log("animate");
      growingRadius *= (1 + userOpts.growthSpeed);
      console.log(growingRadius);
      i++;
  }

  render();
}

// Create Half-edge data structure
// Modified from https://observablehq.com/@2talltim/mesh-data-structures-traversal

function HalfEdge(tail, head) {
  this.tail = tail;
  this.head = head;
  this.next = null;
  this.pre = null;
  this.twin = null;
  this.face = null;
  this.adjacent = null;
}

function HalfEdgeMesh() {
  this.vertices = [];
  this.edges = [];
  this.geo = null; //Store the original geometry
}

// Create a half edge data structure from a face-vector data structure
function createHEStructure(geo) {
  var hem = new HalfEdgeMesh();
  hem.geo = geo;
  hem.vertices = geo.vertices;
  for (let f of geo.faces) {

    // Get vertices of faces and store in a 2*3 array in sequence
    let pointA = geo.vertices[f.a]; //f.a is an index node
    let pointB = geo.vertices[f.b];
    let pointC = geo.vertices[f.c];
    let vertPairs = [[pointA, pointB], [pointB, pointC], [pointC, pointA]];
    // console.log(vertPairs);

    // Create HalfEdge object and store them in HalfEdgeMesh object
    let i = 0;
    for (let v of vertPairs) {
      if (hem.edges.includes(v) === false) { //This code is not filtering the duplicates
        var he = new HalfEdge(v[0], v[1]);
        he.face = f;
        he.next = vertPairs[(i + 1) % 3];
        he.pre = vertPairs [(i + 1) % 3];
        console.log(he.next);
        i++;
        hem.edges.push(he);  // Note that all edges are stored twice!
      }
    // Create the twin of half and store them in HalfEdgeMesh & HalfEdge object

      if (hem.edges.includes([v[1], v[0]]) === false) {
        //console.log(![v[1], v[0]] in hem.edges);
        var heTwin = new HalfEdge(v[1], v[0]);
        // Question: How to store the coordinates of head and tail as the key for a halfedge object?
        hem.edges.push(heTwin);
        he.twin = heTwin;
      }
    }
  }
  return hem;
}

// Calculate a position for the mixture of the spring, planar, and bulge forces
// Equations reference:
//   springForce: sum((adjacentPoint + vertex - adjacentPoint) * radius) /n
//   planarForce: sum(adjacentPoint)/n
//   bulgeForce: Normalize (Vertex - adjacentPoint) * radius
function createForce(hem) {
  let n = hem.geo.vertices.length;
  let twiceN = n * 2;
  for (let v of hem.vertices) {
    console.log("v")
    let vSum = [0, 0, 0];
    let vPlanarSum = [0, 0, 0];
    let vSub = [0, 0, 0];
    let bulgeSum = 0;
    for (let he of hem.edges) {
      if (he.next !== null) {
        let vIndex = he.next.indexOf(v);
        let adjaIndex = (he.next.indexOf(v) + 1) % 2;
        if (vIndex !== -1) { // Select the edges that contain the vertex

          // Sum(adjacentPoint) >> for springForce position
          //*****BUG: Numbers with e notation (e.g., e-16) does not operate correctly******
          vSum[0] += he.next[adjaIndex].x; // Add the adjacent vector to the sum
          vSum[1] += he.next[adjaIndex].y;
          vSum[2] += he.next[adjaIndex].z;

          // Sum(adjacentPoint) >> for planarForce position
          vPlanarSum[0] = vSum[0]; // Add the adjacent vector to the sum
          vPlanarSum[1] = vSum[1];
          vPlanarSum[2] = vSum[2];

          // vertex - adjacentPoint >> for springForce position
          vSub[0] = v.x - he.next[adjaIndex].x;
          vSub[1] = v.y - he.next[adjaIndex].y;
          vSub[2] = v.z - he.next[adjaIndex].z;

          // (adjacentPoint - Vector) * surfaceNormal >> for bulgeForce position
          let vSubtract = getOppoVector(vSub);
          let dotNr = he.face.normal.dot(vSubtract);
          console.log("he.next[adjaIndex] is:");
          console.log(he.next[adjaIndex]);
          console.log("dotNr");
          console.log(dotNr);
          bulgeSum += getBulgDist(userOpts.radius, he.next[adjaIndex], dotNr);
          console.log(getBulgDist(userOpts.radius, he.next[adjaIndex], dotNr));

          // Normalize (Vertex - adjacentPoint) * radius >> for springForce position
          let vSubSum = new THREE.Vector3(vSub[0], vSub[1], vSub[2]);
          vSum[0] += vSubSum.normalize().x * userOpts.radius;
          vSum[1] += vSubSum.normalize().y * userOpts.radius;
          vSum[2] += vSubSum.normalize().z * userOpts.radius;

        } else {
          console.log(`skip ${he.next.indexOf(v)}`);
        }
      }
    }
    // Create a vector for spring force position
    var springVector = new THREE.Vector3(vSum[0] / twiceN, vSum[1] / twiceN, vSum[2] / twiceN); //Diminish the duplicates
    var planarVector = new THREE.Vector3(vPlanarSum[0]/ twiceN,vPlanarSum[1]/ twiceN,vPlanarSum[2]/ twiceN);

    //
    var bulgeVector = v.multiplyScalar(bulgeSum/twiceN).add(v);
    // console.log("springVector");
    // console.log(springVector);
    // console.log("planarVector");
    // console.log(planarVector);
    // console.log("bulgeVector");
    // console.log(bulgeVector.x, bulgeVector.y, bulgeVector.z, bulgeVector);
    var forcePosition = getForcePosition(springVector, planarVector, bulgeVector, v);
    // console.log("forcePosition");
    // console.log(forcePosition.x, forcePosition.y, forcePosition.z);
    base.forcePList.push(forcePosition)
  }

  return base.forcePList;
}

function getForcePosition(springV, planarV, bulgeV, vector){

  let sum = new THREE.Vector3(0, 0, 0);
  //BUG: There are some big numbers in vectors that I have no idea where it's from
  // console.log("springV - vector.y");
  // console.log(springV.sub(vector).y);
  // let x = springV.sub(vector);
  // console.log("springV - vector * userOpts.springF.y");
  // console.log(x.multiplyScalar(userOpts.springF).y);

  sum.add(springV.sub(vector).multiplyScalar(userOpts.springF * getSphereVolume(userOpts.radius)));
  // console.log("sum.add(1)");
  // console.log(sum.add(springV.sub(vector).multiplyScalar(userOpts.springF * userOpts._mass)));

  sum.add(planarV.sub(vector).multiplyScalar(userOpts.planarF* getSphereVolume(userOpts.radius)));
  // console.log("sum.add(2)");
  // console.log(sum.add(planarV.sub(vector).multiplyScalar(userOpts.planarF * userOpts._mass)));

  sum.add(bulgeV.sub(vector).multiplyScalar(userOpts.bulgeF * getSphereVolume(userOpts.radius)));
  return sum;
}

// Calculate distance for the bulge force
// Equation: sum( square root( (linkLength^2) - |adjaPoint|^2 + dotProduct^2 ) + dotProduct) / n
function getBulgDist(linkLength, adjaPoint, dotProduct) {

  let sqLinkLength = Math.pow(linkLength, 2);
  let sqAdjaPoint = adjaPoint.lengthSq();
  let sqDotProduct = Math.pow(dotProduct, 2);
  let sum = sqLinkLength - sqAdjaPoint + sqDotProduct;
  let sqrt;
  if(isNaN(Math.sqrt(sum))){
    sqrt = 0;
  }
  else{
    sqrt = Math.sqrt(sum);
  }
  return sqrt + dotProduct;
}

// Get an opposite vector from an array contains a vector coordinate
function getOppoVector(vectorArray){
  let x = vectorArray[0] * (-1);
  let y = vectorArray[1] * (-1);
  let z = vectorArray[2] * (-1);

  return new THREE.Vector3(x, y, z);
}

// Get the volume of a sphere
function getSphereVolume(r){
  return Math.pow(r, 3) * Math.PI * 4/3;
}


//GUI is currently not working
function resetGui() {
  userOpts = {
    linkDistance: 6,
    radius: 5,
    growthSpeed: 0.0005,
    maxRadius: 15,
    reset: false,
    springF: 0.00001,
    planarF: 0.00001,
    bulgeF: 0.00007
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








