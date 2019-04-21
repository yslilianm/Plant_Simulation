var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();


function fillScene(){
  scene = new THREE.Scene();

  // Initial state /////
  // Create a base
  var geometryList = [];
  var base = new THREE.SphereGeometry( 50, 5, 5 );
  let verticesList = base.vertices;

  // Create a cell
  var cell = new THREE.SphereGeometry( 5, 4, 4 );

  // Define material
  var material = new THREE.MeshBasicMaterial( { color: 0x2194ce, wireframe:true } );

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

// Create mesh for the base
	var baseMesh = new THREE.Mesh( base, material );
	scene.add(baseMesh);
}

function init(){
  var canvasWidth = window.innerWidth;
  var canvasHeight = window.innerHeight;
  var canvasRatio = canvasWidth/canvasHeight;

  //Renderer
  renderer = new THREE.WebGLRenderer();
  // renderer.gammaInput(true);
  // renderer.gammaOutput(true);
  renderer.setSize(canvasWidth,canvasHeight);
  renderer.setClearColor(0x1C1D26, 1.0);

  //Camera
  camera = new THREE.PerspectiveCamera( 90, canvasRatio, 0.1, 1000 );
  camera.position.z = 120;

  // CONTROLS
	cameraControls = new THREE.OrbitControls( camera );
	camera.position.set( 0, 20, 100 );
	cameraControls.update();
}

function addToDOM(){
// var container = document.getElementById('container');
//     var canvas = container.getElementsByTagName('canvas');
//     if (canvas.length>0) {
//         container.removeChild(canvas[0]);
//     }
//     container.appendChild( renderer.domElement );
  document.body.appendChild( renderer.domElement );
}

function render (){
  // var delta = clock.getDelta();
  // cameraControls.update(delta);
  renderer.render( scene, camera );
}

function animate () {
	//Draw the scene when refreshed
  window.requestAnimationFrame( animate );

	//Animating the cube
	// for (let geo of geometryList){
	// 	cube.rotation.x += 0.01;
	//   cube.rotation.y += 0.01;
	// }

}


  init();
  console.log("init");
  fillScene();
  console.log("fillScene");
  addToDOM();
  console.log("addToDOM");
  render();
  animate();
  console.log("animate");





