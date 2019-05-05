// "use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gui;
var strDownloadMime = "image/cell-growth";

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
    bulgeF: 0.00007
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
  gui.add(userOpts, "linkDistance", 2.0, 8.0).name("Distance between cells");
  gui.add(userOpts, "radius", 1.0, 7.0).name("Radius");
  gui.add(userOpts, "growthSpeed", 0.0001, 0.001).name("Growth Speed").listen();
  var saveObj = {
    add: function () {
      saveAsImage()
    }
  };
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
  // gui.add(resetObj, 'add').name("reset");
  gui.add(runObj, 'add').name("Run Simulation");
  gui.add(saveObj, "add").name("Screenshot");
  gui.add(clearObj, 'add').name("Clear");


}

init();

console.log("init");

setupGui();
addToDOM();


function runSimulation() {
  if (isClear === false){
    clearScene();
  }
  // loadModel();
  loadBase();

  fillScene();
  console.log("fillScene");
  console.log("addToDOM");

  animate();
  console.log("animate");
  render();
}

function loadBase() {
  // Initial state /////
  // Create a sphere geometry as a base
  var sphere = new THREE.SphereGeometry(userOpts.linkDistance, 4, 4);
  base = new Base(sphere);

  for (let v of sphere.vertices) {
    // console.log(v);
    base.verticesList.push(v.clone());
  }
  // console.log(userOpts.linkDistance);
  // console.log("loadBase");
  // console.log(base.verticesList[0].x);
}

// function loadModel(){
//     var loader = new THREE.GLTFLoader();
//   loader.load( 'model/carrot_1.gltf',
//     function ( gltf ) {
//     var mesh = gltf.scene;
//     mesh.children[0].material = new THREE.MeshLambertMaterial();
//     console.log(mesh.children);
//     scene.add(mesh);
//   },
//     // called while loading is progressing
// 	function ( xhr ) {
// 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
// 		},
//     function ( error ) {
// 	console.error( "something is wrong!");
// } );
//   render();
// 	requestAnimationFrame( animate );
// 	renderer.render( scene, camera );
// }

// Load an equirectangular image as cancas background
https://threejs.org/examples/webgl_panorama_equirectangular.html
function loadBackground(){
  var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
				// invert the geometry on the x-axis so that all of the faces point inward
				geometry.scale( - 1, 1, 1 );

				var texture = new THREE.TextureLoader().load( 'asset/blue.png' );
				var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 0.5, } );
        console.log(texture);
				mesh = new THREE.Mesh( geometry, material );

				scene.add( mesh );

}

// Save canvas to a jpg
// Source code: https://stackoverflow.com/questions/26193702/three-js-how-can-i-make-a-2d-snapshot-of-a-scene-as-a-jpg-image

function saveAsImage() {
        var imgData, imgNode;

        try {
            var strMime = "image/jpeg";
            imgData = renderer.domElement.toDataURL(strMime);

            saveFile(imgData.replace(strMime, strDownloadMime), "cell-growth.jpg");

        } catch (e) {
            console.log(e);
            // return;
        }

    }

    var saveFile = function (strData, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
        } else {
            location.replace(uri);
        }
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
    color: 0x577600,// 0x749BA6,
    transparent: true,
    specular: 0xDCE4EE,
    opacity: 0.6,
    shininess: 10
  });

  materialNew = new THREE.MeshPhongMaterial({
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

// Map the volume of the cell to the color (big: organg, small: green)
function volumeToColor(cellR, maxR) {
  getSphereVolume(cellR);
  let volumeRatio = maxR / cellR / 3;
  if (volumeRatio > 1) {
    console.log(`ratio > 1: ${volumeRatio}`);
    return 1;
  }
  else if (volumeRatio < 0) {
    console.log(`ratio < 0: ${volumeRatio}`);
    return 0;
  }
  else {
    console.log(`ratio in between: ${volumeRatio}`);
    return volumeRatio;
  }

}
function init() {
  var canvasWidth = window.innerWidth;
  var canvasHeight = window.innerHeight;
  var canvasRatio = canvasWidth / canvasHeight;

  //RENDERER
  renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});  // For saving images: preserve the buffers until manually cleared or overwritten
  // renderer.gammaInput(true);
  // renderer.gammaOutput(true);
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x1C1D26, 1.0);  // Background color
  renderer.setClearColor(0x000000);  // Background color


  //CAMERA
  camera = new THREE.PerspectiveCamera(90, canvasRatio, 0.1, 1000);
  camera.position.z = 60;
  camera.position.y = 80;
  camera.lookAt(0, -60, 0);

  // CONTROLS
  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 50, 0);
  // Create auto rotation effect
  cameraControls.autoRotate = true;
  cameraControls.autoRotateSpeed = 0.01;
  // Create friction effect for camera control
  cameraControls.enableDamping = true;
  cameraControls.dampingFactor = 0.2;
  // cameraControls.minDistance = 100;
  cameraControls.maxDistance = 500;
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

  loadBackground();

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
  console.log("render");
  var delta = clock.getDelta();
  cameraControls.update(delta);
  renderer.render(scene, camera);
}

function animate() {
  // If the clear button is clicked
    if (isClear === false){

  //Draw the scene when refreshed
  window.requestAnimationFrame(animate);
  cameraControls.update(); // Only required if .enableDamping = true or .autoRotate = true


  // Iterate a list of every object in the scene
  for (let geo of base.geoList.children) {
    let len = base.geoList.children.length;
    console.log(`geoList's length: ${len}`);
    let i = base.geoList.children.indexOf(geo);

    // Store the position of next object into a vertex
    let nextP = base.geoList.children[(i + 1) % len].position;

    // Store the position of previous object into a vertex
    let preP;
    if (i === 0){
      preP = base.geoList.children[len -1].position;
    }
    else{
      preP = base.geoList.children[(i - 1) % len].position;
    }

    // When the cell has the space to grow
    if (cell.radius < userOpts.maxRadius) {
      geo.scale.x *= 1 + userOpts.growthSpeed;
      geo.scale.y *= 1 + userOpts.growthSpeed;
      geo.scale.z *= 1 + userOpts.growthSpeed;
      cell.radius *= 1 + userOpts.growthSpeed;
      // geo.material.color.setRGB(volumeToColor(cell.radius, userOpts.maxRadius), 0.6, 0);
    }

    // When the cell has reach the food limitation,
    // split into two (old & new) smaller cells
    else {
      console.log("split");

      // Shrink the old cell into 1/2 time
      geo.scale.x /= 2;
      geo.scale.y /= 2;
      geo.scale.z /= 2;
      cell.radius /= 2;
      // geo.material.color.setRGB(volumeToColor(cell.radius, userOpts.maxRadius), 0.6, 0);


      let random = [Math.random(), Math.random(), Math.random()];

      // // Clone a mesh
      // let newCell =  geo.clone();
      // base.geoList.children.splice(i, 0, newCell);
      // console.log(`Clone! Geo.position.x`);

      // Create a new cell
      // let newCell = createNewCell((i + 1) % len);
      // Correct the position of the new cell
      // newCell.position.set(geo.position.x, geo.position.y, geo.position.z);

      // let newCellP = geo.position.clone();
      // newCell.position.set(newCellP);
      // console.log("newCell.position:");
      // console.log(newCellP);

      // Create a new cell
      var cellMesh = new THREE.Mesh(cell.geo, material);
      var newCell = base.geoList.add(cellMesh);  //I actually don't know what data type of newCell is

      // Correct the position of the new cell
      console.log(geo.position.x);
      cellMesh.position.x += (geo.position.x - (random[0] * cell.radius));  // Randomness is here!!
      cellMesh.position.y += (geo.position.y - (random[1] * cell.radius));  // Randomness is here!!
      cellMesh.position.z += (geo.position.z - (random[2] * cell.radius));  // Randomness is here!!

      // // Create a new cell
      // let newCell = createNewCell((i + 1) % len);
      //
      // // Correct the position of the new cell
      // console.log(geo.position.x);
      // newCell.position.x = geo.position.x;
      // newCell.position.y = geo.position.y;
      // newCell.position.z = geo.position.z;
      //
      // newCell.position.x = geo.position.x - (random[0] * cell.radius);  // Randomness is here!!
      // newCell.position.y = geo.position.y - (random[1] * cell.radius);  // Randomness is here!!
      // newCell.position.z = geo.position.z - (random[2] * cell.radius);  // Randomness is here!!

      // Correct the position of the old cell
      geo.position.x += random[0] * cell.radius;  // Randomness is here!!
      geo.position.y += random[1] * cell.radius;  // Randomness is here!!
      geo.position.z += random[2] * cell.radius;  // Randomness is here!!

      let newHem = insertVertex(preP, (i + 1) % len, nextP, newCell.position);
      createForce(newHem);
    }

    // Apply bulge force to the cell
    // Check if every other cell is too close to itself
    for (let j = 0; j < base.geoList.children.length; j++) {
      // If any cell is too close to itself, move that cell
      if (geo.position.distanceTo(base.geoList.children[(j + 1) % len].position) < 2 * cell.radius) {
        base.geoList.children[(j +i) % len].position.x += base.forcePList[i % (len)].x;
        base.geoList.children[(j + i) % len].position.y += base.forcePList[i % (len)].y;
        base.geoList.children[(j + i) % len].position.z += base.forcePList[i % (len)].z;

        // console.log(`base.forcePList: ${base.forcePList[i % (len-1)].x}`);
      }
    }
  }
  }
  console.log("animate");
  render();

  }

/** Create Half-edge data structure
 * Modified from https://observablehq.com/@2talltim/mesh-data-structures-traversal
 *
 * @param tail {vertex}
 * @param head {vertex}
 */
function HalfEdge(tail, head) {
  this.tail = tail;
  this.head = head;
  this.next = null;
  this.pre = null;
  this.twin = null;
  this.face = null;
  this.adjacent = null;
}

/** Create a mesh using half edges
 * Modified from https://observablehq.com/@2talltim/mesh-data-structures-traversal
 *
 * @param geo {geometry}
 */
function HalfEdgeMesh(geo) {
  this.geo = geo; //Store the original geometry
  this.vertices = [];
  this.edges = [];
}

/** Create a half edge data structure from a face-vector data structure
 *
 * @param geo {geometry}
 * @returns {HalfEdgeMesh}
 */
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

/** Insert the vertex of the new cell to the half edge data structure
 *
 * @param pre {array} [tailVertex, headVertex]
 * @param nextIndex {number}
 * @param next {array} [tailVertex, headVertex]
 * @param vertex {vertex}
 * @returns {HalfEdgeMesh}
 */
function insertVertex(pre, nextIndex, next, vertex){

  // Create a new geometry populated by previous, current, and new vertices for its face
  var geometry = new THREE.Geometry();
  geometry.vertices.push( new THREE.Vector3(pre.x, pre.y, pre.z) );
  geometry.vertices.push( new THREE.Vector3( vertex.x, vertex.y, vertex.z ) );
  geometry.vertices.push( new THREE.Vector3( next.x, next.y, next.z ) );
  base.hem.vertices.splice(nextIndex, 0, vertex);

  // Create an half edge object and add properties
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

/** Calculate a position for the mixture of the spring, planar, and bulge forces
 * Equations reference:
 *   springForce: sum((adjacentPoint + vertex - adjacentPoint) * radius) /n
 *   planarForce: sum(adjacentPoint)/n
 *   bulgeForce: Normalize (Vertex - adjacentPoint) * radius
 *
 *   @param hem {HalfEdgeMesh}
 */
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

/** Get an opposite vector from an array contains a vector coordinate
 *
 * @param vectorArray {array}
 * @returns {Vector3}
 */
function getOppoVector(vectorArray) {
  let x = vectorArray[0] * (-1);
  let y = vectorArray[1] * (-1);
  let z = vectorArray[2] * (-1);

  return new THREE.Vector3(x, y, z);
}

/** Get the volume of a sphere
 *
 * @param r {number}
 * @returns {number}
 */

function getSphereVolume(r) {
  return Math.pow(r, 3) * Math.PI * 4 / 3;
}

function createNewCell(index) {
  var cellMesh = new THREE.Mesh(cell.geo, materialNew);
  // base.geoList.children.splice(index, 0, cellMesh);
  base.geoList.add(cellMesh);
  return cellMesh;
}


/**
 * Calculate the nutrient movement according to reaction-diffusion equation
 * @param {number} concentration        Concentration of nutrient.
 * @param {number} time                 Time.
 * @param {number} change               Short amount of time.
 * @param {number} coefficient          Coefficient of nutrient.
 * @param {function} reactFunction     The reaction when something happens.
 */
function getNutrientExpandPosition(concentration, time, change, coefficient, reactFunction) {
  var nPosition = Math.sqrt(concentration * time * change);
  return nPosition;
}









