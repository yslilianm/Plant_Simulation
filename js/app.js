import * as THREE from 'three';
// Create three things: scene, camera and renderer
      const scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );

      var renderer = new THREE.WebGLRenderer()
			renderer.setSize( window.innerWidth, window.innerHeight);
      //Not sure what is this for
      document.body.appendChild( renderer.domElement );

      //Create geometry, material and mesh
      var geometry = new THREE.Geometry();

			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			scene.add( cube );

			camera.position.z = 5;
      //Rendering the scene
			var animate = function () {
				//Create a loop that causes the renderer to draw the scene every time the screen is refreshed
				requestAnimationFrame( animate );
        //Animating the cube
				//cube.rotation.x += 0.01;
				//cube.rotation.y += 0.01;

				renderer.render( scene, camera );
			};

			animate();
