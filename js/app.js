var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

var userOpts = {

}

  init();
  console.log("init");
  fillScene();
  console.log("fillScene");
  addToDOM();
  console.log("addToDOM");
  animate();
  console.log("animate");



function fillScene(){
  scene = new THREE.Scene();

  // LIGHTS
	scene.add( ambientLight );
	scene.add( light );

  // Initial state /////
  // Create a base
  var geometryList = [];
  var base = new THREE.SphereGeometry( 50, 10, 10 );
  let verticesList = base.vertices;

  // Create a cell
  var cell = new THREE.SphereGeometry( 5, 50, 50 );

  // Define material
  // var material = new THREE.MeshBasicMaterial( { color: 0x2194ce, wireframe:true } );
  var material = new THREE.MeshPhongMaterial( {color: 0x749BA6, transparent: true, specular: 0xDCE4EE, opacity: 0.7, shininess: 10 } );

  // Create mesh for cells
  // Change the position of cells
  for (let vertex of verticesList){
    var cellMesh = new THREE.Mesh( cell, material );
    cellMesh.position.x = vertex.x;
    cellMesh.position.y = vertex.y;
    cellMesh.position.z = vertex.z;
    console.log(vertex);
    scene.add(cellMesh);
}

// // Create mesh for the base
// 	var baseMesh = new THREE.Mesh( base, material );
// 	scene.add(baseMesh);
}

function init(){
  var canvasWidth = window.innerWidth;
  var canvasHeight = window.innerHeight;
  var canvasRatio = canvasWidth/canvasHeight;

  //RENDERER
  renderer = new THREE.WebGLRenderer();
  // renderer.gammaInput(true);
  // renderer.gammaOutput(true);
  renderer.setSize(canvasWidth,canvasHeight);
  renderer.setClearColor(0x1C1D26, 1.0);

  //CAMERA
  camera = new THREE.PerspectiveCamera( 90, canvasRatio, 0.1, 1000 );
  camera.position.z = 120;
  camera.lookAt(0,0,0);

  // CONTROLS
	cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
	cameraControls.target.set(0, 0, 0);
  // Create auto rotation effect
	cameraControls.autoRotate = true;
  cameraControls.autoRotateSpeed = 0.1;
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

function addToDOM(){
// var container = document.getElementById('container');
//     var canvas = container.getElementsByTagName('canvas');
//     if (canvas.length>0) {
//         container.removeChild(canvas[0]);
//     }
//     container.appendChild( renderer.domElement );
  document.body.appendChild( renderer.domElement );  // .domElement: A canvas where the renderer draws its output.

}

function render (){
  var delta = clock.getDelta();
  cameraControls.update(delta);
  renderer.render( scene, camera );
}

function animate () {
	//Draw the scene when refreshed
  window.requestAnimationFrame( animate );
  cameraControls.update(); // Only required if .enableDamping = true or .autoRotate = true
  // for (let geo of geometryList){
	// 	cube.rotation.x += 0.01;
	//   cube.rotation.y += 0.01;
	// }
  render();
}





