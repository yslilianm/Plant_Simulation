const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight);

document.body.appendChild( renderer.domElement );

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
	scene.add(cellMesh);
}

// Create mesh for the base
	var baseMesh = new THREE.Mesh( base, material );
	scene.add(baseMesh);


camera.position.z = 120;

//Rendering the scene
var animate = function () {
	//Create a loop that causes the renderer to draw the scene every time the screen is refreshed
	requestAnimationFrame( animate );

	//Animating the cube
	// for (let geo of geometryList){
	// 	cube.rotation.x += 0.01;
	//   cube.rotation.y += 0.01;
	// }

	renderer.render( scene, camera );
};
animate();


