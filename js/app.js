// "use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gui;
var isClear = true;
// var geoList = [];
// var verticesList = [];
// var forcePList = [];
var userOpts;
var base;
var cell;

var material;

function Base(geo) {
  this.geo = geo;
  this.geoList = new THREE.Object3D();
  this.verticesList = [];
  this.forcePList = [];
  this.hem = null;
}

function Cell(geo) {
  this.geo = geo;
  this.radius = null;
  this.mesh = null;
  this.material = null;
}

//GUI is currently not working
function resetGui() {
  userOpts = {
    linkDistance: 6,
    radius: 5,
    growthSpeed: 0.001,
    maxRadius: null,
    reset: false,
    springF: 0.00001,
    planarF: 0.00001,
    bulgeF: 0.00001
  };
}

function clearScene() {
  if (scene.children.includes(base.geoList)) {
    console.log(`scene.children.length: ${scene.children.length}`);
    scene.remove(scene.children[scene.children.indexOf(base.geoList)]);
  }
  isClear = true;
}

function setupGui() {
  resetGui();
  gui = new dat.GUI();
  gui.add(userOpts, "linkDistance", 5.0, 15.0).name("Distance between cells");
  gui.add(userOpts, "radius", 5.0, 10.0).name("Radius");
  gui.add(userOpts, "growthSpeed", 0.0001, 0.001).name("Growth Speed");
  gui.add(userOpts, "reset").name("reset");
  var runObj = {
    add: function () {
      runSimulation()
    }
  };
  var clearObj = {
    add: function () {
      clearScene()
    }
  };
  gui.add(runObj, 'add').name("Run Simulation");
  gui.add(clearObj, 'add').name("Clear");
}

init();
console.log("init");
setupGui();
addToDOM();


function runSimulation() {
  loadBase();
  fillScene();
  console.log("fillScene");
  console.log("addToDOM");
  animate();
  console.log("animate");
}

// function createCell(radius){
//     var cell = new THREE.SphereGeometry( radius, 50, 50 );
// }

function loadBase() {
  var sphere = new THREE.SphereGeometry(userOpts.linkDistance, 4, 4);

  base = new Base(sphere);
  // Initial state /////
  // Create a base
  for (let v of sphere.vertices) {
    console.log(v);
    base.verticesList.push(v.clone());
  }

  console.log(userOpts.linkDistance);
  console.log("loadBase");
  console.log(base.verticesList[0].x);

}

function fillScene() {
  isClear = false;


  //Turn face-vector data structure into half edge
  var halfEdgeMesh = createHEStructure(base.geo);

  // *******BUG: Head & tail in halfEdgeMesh became (0, 0, 0) after applying createForce(halfEdgeMesh)
  createForce(halfEdgeMesh);
  //console.log(halfEdgeMesh.edges[1].head.x);

  // Create a cell
  var sphere = new THREE.SphereGeometry(userOpts.radius, 50, 50);
  userOpts.maxRadius = userOpts.radius * Math.pow(userOpts.radius, 1 / 2);
  cell = new Cell(sphere);
  cell.radius = userOpts.radius;

  // Define material
  // var material = new THREE.MeshBasicMaterial( { color: 0x2194ce, wireframe:true } );
  material = new THREE.MeshPhongMaterial({
    color: 0x749BA6,
    transparent: true,
    specular: 0xDCE4EE,
    opacity: 0.7,
    shininess: 10
  });

  material1 = new THREE.MeshPhongMaterial({
    color: 0x99DA5A,
    transparent: true,
    specular: 0xDCE4EE,
    opacity: 0.7,
    shininess: 10
  });
  cell.material = material;

  // Create mesh for cells
  // Change the position of cells
  for (let vertex of base.verticesList) {
    cell.mesh = new THREE.Mesh(cell.geo, material);
    cell.mesh.position.x = vertex.x;
    cell.mesh.position.y = vertex.y;
    cell.mesh.position.z = vertex.z;
    base.geoList.add(cell.mesh);
    console.log(`geoList.length ${base.geoList.children.length}`);

  }
  console.log("geoList add to the scene")
  scene.add(base.geoList);
//
// var starsMaterial = new THREE.PointsMaterial( { color: 0x888888 } );
// // // Create mesh for the base
// 	var baseMesh = new THREE.Mesh( base, starsMaterial );
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
  renderer.setClearColor(0x1C1D26, 1.0);  // Background color

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

  // SCENE
  scene = new THREE.Scene();

  // LIGHTS

  scene.add(ambientLight);
  scene.add(light);

  renderer.render(scene, camera);
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
  // let i = 0;
  // console.log(`growingRadius ${growingRadius}`);
  for (let geo of base.geoList.children) {
    let len = base.geoList.children.length;
    console.log(`geoList's length: ${len}`);
    let i = base.geoList.children.indexOf(geo);
    let nextP = base.geoList.children[(i + 1) % len].position;
    let preP;
    if (i === 0){
      preP = base.geoList.children[len -1].position;
    }
    else{
      preP = base.geoList.children[(i - 1) % len].position;

    }

    if (cell.radius < userOpts.maxRadius) {
      // // Make sure the index isn't out of bound
      // if (j < geoList.length - 1){
      //   // If two cells aren't overlapping
      //   if (verticesList[j].distanceTo(verticesList[j+1]) < 2 * userOpts.radius){
      //     // Apply bulge force
      //
      //   }
      // }
      // if (growingRadius < userOpts.maxRadius) {
      //TO-DO2: Apply turgor pressure to grow the cell
      // console.log("grow");
      geo.scale.x *= 1 + userOpts.growthSpeed;
      geo.scale.y *= 1 + userOpts.growthSpeed;
      geo.scale.z *= 1 + userOpts.growthSpeed;
      cell.radius *= 1 + userOpts.growthSpeed;
    }
    else {
      console.log("split");
      geo.scale.x /= 2;
      geo.scale.y /= 2;
      geo.scale.z /= 2;
      cell.radius /= 2;
      let newCell = createNewCell();
      let random = [Math.random(), Math.random(), Math.random()];
      console.log(random);
      newCell.position.x = geo.position.x;
      newCell.position.y = geo.position.y;
      newCell.position.z = geo.position.z;

      newCell.position.x += geo.position.x - (random[0] * cell.radius);  // Randomness is here!!
      newCell.position.y += geo.position.y - (random[1] * cell.radius);  // Randomness is here!!
      newCell.position.z += geo.position.z - (random[2] * cell.radius);  // Randomness is here!!
      geo.position.x += random[0] * cell.radius;  // Randomness is here!!
      geo.position.y += random[1] * cell.radius;  // Randomness is here!!
      geo.position.z += random[2] * cell.radius;  // Randomness is here!!

      let newHem = insertVertex(preP, (i + 1) % len, nextP, newCell.position);
      createForce(newHem);
    }

    for (let j = 0; j < base.geoList.children.length; j++) {
      if (geo.position.distanceTo(base.geoList.children[(j + 1) % len].position) < 2 * cell.radius) {
        base.geoList.children[(j + 1) % len].x += base.forcePList[i % (len-1)].x;
        base.geoList.children[(j + 1) % len].y += base.forcePList[i % (len-1)].y;
        base.geoList.children[(j + 1) % len].z += base.forcePList[i % (len-1)].z;
        // console.log(`base.forcePList: ${base.forcePList[i % (len-1)].x}`);
      }
    }
  }
  console.log("animate");
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

function HalfEdgeMesh(geo) {
  this.geo = geo; //Store the original geometry
  this.vertices = [];
  this.edges = [];
}

// Create a half edge data structure from a face-vector data structure
function createHEStructure(geo) {
  base.hem = new HalfEdgeMesh(geo);
  base.hem.vertices = geo.vertices;
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
      if (base.hem.edges.includes(v) === false) { //This code is not filtering the duplicates
        var he = new HalfEdge(v[0], v[1]);
        he.face = f;
        he.next = vertPairs[(i + 1) % 3];
        he.pre = vertPairs [(i + 1) % 3];

        i++;
        base.hem.edges.push(he);  // Note that all edges are stored twice!
      }

      // Create the twin of half and store them in HalfEdgeMesh & HalfEdge object
      if (base.hem.edges.includes([v[1], v[0]]) === false) {
        //console.log(![v[1], v[0]] in hem.edges);
        var heTwin = new HalfEdge(v[1], v[0]);
        // Question: How to store the coordinates of head and tail as the key for a halfedge object?
        base.hem.edges.push(heTwin);
        he.twin = heTwin;
      }
    }
  }
  return base.hem;
}

function insertVertex(pre, nextIndex, next, vertex){
  var geometry = new THREE.Geometry();
  geometry.vertices.push( new THREE.Vector3(pre.x, pre.y, pre.z) );
  geometry.vertices.push( new THREE.Vector3( vertex.x, vertex.y, vertex.z ) );
  geometry.vertices.push( new THREE.Vector3( next.x, next.y, next.z ) );
  base.hem.vertices.splice(nextIndex, 0, vertex);
  var he = new HalfEdge(pre, vertex);
  he.next = [vertex, next];
  he.pre = [base.hem.vertices[nextIndex - 2], pre];
  he.face = new THREE.Face3(0, 1, 2);
  base.hem.edges.splice(nextIndex, 0, he);

// Create the twin of half and store them in HalfEdgeMesh & HalfEdge object
      if (base.hem.edges.includes([vertex, pre]) === false) {
        //console.log(![v[1], v[0]] in hem.edges);
        var heTwin = new HalfEdge(vertex, pre);
        // Question: How to store the coordinates of head and tail as the key for a halfedge object?
        base.hem.edges.push(heTwin);
        he.twin = heTwin;
      }
      return base.hem;
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
    // console.log("v")
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
          // console.log("he.next[adjaIndex] is:");
          // console.log(he.next[adjaIndex]);
          // console.log("dotNr");
          // console.log(dotNr);
          bulgeSum += getBulgDist(userOpts.radius, he.next[adjaIndex], dotNr);
          //console.log(getBulgDist(userOpts.radius, he.next[adjaIndex], dotNr));

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
    var planarVector = new THREE.Vector3(vPlanarSum[0] / twiceN, vPlanarSum[1] / twiceN, vPlanarSum[2] / twiceN);
    var bulgeVector = v.multiplyScalar(bulgeSum / twiceN).add(v);
    // console.log("springVector");
    // console.log(springVector);
    // console.log("planarVector");
    // console.log(planarVector);
    // console.log("bulgeVector");
    // console.log(bulgeVector.x, bulgeVector.y, bulgeVector.z, bulgeVector);
    var forcePosition = getForcePosition(springVector, planarVector, bulgeVector, v);
    // console.log("forcePosition");
    // console.log(forcePosition.x, forcePosition.y, forcePosition.z);
    base.forcePList.push(forcePosition.clone());
  }

  return base.forcePList;
}

function getForcePosition(springV, planarV, bulgeV, vector) {

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

  sum.add(planarV.sub(vector).multiplyScalar(userOpts.planarF * getSphereVolume(userOpts.radius)));
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
  if (isNaN(Math.sqrt(sum))) {
    sqrt = 0;
  } else {
    sqrt = Math.sqrt(sum);
  }
  return sqrt + dotProduct;
}

// Get an opposite vector from an array contains a vector coordinate
function getOppoVector(vectorArray) {
  let x = vectorArray[0] * (-1);
  let y = vectorArray[1] * (-1);
  let z = vectorArray[2] * (-1);

  return new THREE.Vector3(x, y, z);
}

// Get the volume of a sphere
function getSphereVolume(r) {
  return Math.pow(r, 3) * Math.PI * 4 / 3;
}

function createNewCell(radius) {
  var cellMesh = new THREE.Mesh(cell.geo, material1);
  base.geoList.add(cellMesh);
  return cellMesh;
}


/**
 * Calculate the nutrient movement according to reaction-diffusion equation
 * @param {float} concentration        Concentration of nutrient.
 * @param {float} time                 Time.
 * @param {float} change               Short amount of time.
 * @param {float} coefficient          Coefficient of nutrient.
 * @param {function} reactFunction     The reaction when something happens.
 */
function getNutrientExpandPosition(concentration, time, change, coefficient, reactFunction) {
  var nPosition = Math.sqrt(concentration * time * change);
  return nPosition;
}

// function getCellGrowth(rateOfWaterIncrease, volume){
//   rateOfWaterIncrease = lpr * ();
// }


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








