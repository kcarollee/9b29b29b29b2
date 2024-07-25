import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

//CAMERA
	const fov = 90;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 150);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	//scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()))
	renderer.render(scene, camera);

// ORBIT CONTROLS
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;

// CUBEMAP TEXTURE
	const envTexture = new THREE.CubeTextureLoader()
		.setPath('./assets/cubemaps/cubemap1/')
		.load([
			'px.png', 'nx.png', // Positive X, Negative X
			'py.png', 'ny.png', // Positive Y, Negative Y
			'pz.png', 'nz.png'  // Positive Z, Negative Z
	]);

	scene.environment = envTexture;


// FONT VECTORS
	const svgPathsArr = [];
	const svgLoader = new SVGLoader();
	const extrusionSettings = {
		depth: 100,  // Depth to extrude the shape
		bevelEnabled: true,
		bevelThickness: 20,
		bevelSize: 10,
		bevelOffset: 0,
		bevelSegments: 5
	};

	// Create a material
	const standardMaterial = new THREE.MeshStandardMaterial({
		color: 0xFFFFFF,
		metalness: 0.8,  // Higher values make the surface more reflective
		roughness: 0.0,  // Lower values make the surface smoother
		side: THREE.DoubleSide,
		envMap: envTexture  // Apply the environment map
	});

	const basicMaterial = new THREE.MeshBasicMaterial({
		color:0xFF0000,
	})
	const gap = 35;

	const answerStrings = ["", "", ""];
	for (let i = 0; i < 3; i++){
		for (let j = 0; j < 3; j++){
			for (let k = 0; k < 3; k++){
				let index = Math.floor(Math.random() * 36);
				let url = "assets/svgs/svgFile " + "(" + (index + 1) + ").svg";
				let posX = -gap + k *  gap;
				let posY = gap - j *  gap;
				let posZ = gap - i *  gap;
				let mat;
				let mode;
				if (Math.random() < 0.5) {
					mat = standardMaterial;
					answerStrings[i] += indexToCode(index);
					mode = 'answer';
				}
				else {
					mat = basicMaterial;
					mode = 'obstacle';
				}
				
				svgLoader.load(url, (data) => {
					svgToMesh(data, posX, posY, posZ, mat, mode);
				});
			}
		}
	}

	console.log(answerStrings);
	
	
	function indexToCode(index){
		// NUMBER
		if (index < 26){
			return String.fromCharCode(index + 65);
		}
		else {
			return String.fromCharCode(index + 22);
		}
	}

	const groupArr = [];
	function svgToMesh(data, posX, posY, posZ, material, mode){
		
		// The SVGLoader parses the file and provides paths
		const paths = data.paths;

		// Create a group to hold all the extruded shapes
		const group = new THREE.Group();
		group.name = mode;
		paths.forEach((path) => {
			// Convert the SVG path into shapes
			const shapes = SVGLoader.createShapes(path);
			shapes.forEach((shape) => {
				// Create an ExtrudeGeometry from the shape
				const geometry = new THREE.ExtrudeGeometry(shape, extrusionSettings);
				// Create a mesh from the geometry and material
				const mesh = new THREE.Mesh(geometry, material);
				group.add(mesh);
			});
		});

		let scale = 0.05;
		group.rotation.x = Math.PI;
		//console.log(posX, posY, posZ)
		group.position.set(-scale * 500 + posX, scale * 500 + posY + 20, posZ);
		group.scale.set(scale, scale, scale);
		groupArr.push(group);
		// Add the group to the scene
		scene.add(group);
	}

// ANSWER SUBMISSION
	// JavaScript to handle form submission
	let answerAnimationTriggered = false;
	let answerAnimationCount = 0;
	document.getElementById('submit-button').addEventListener('click', function(event) {
		// Prevent default form submission behavior
		event.preventDefault();

		// Retrieve the values from the inputs
		const input1Value = document.getElementById('input1').value;
		const input2Value = document.getElementById('input2').value;
		const input3Value = document.getElementById('input3').value;

		// ANSWER EVENT
		if (input1Value === answerStrings[0] &&
			input2Value === answerStrings[1] &&
			input3Value === answerStrings[2] ){
			answerAnimationTriggered = true;
			console.log("ANSWER");
		}
		// WRONG ANSWER
		else {
			console.log("WRONG");
		}
	});

	// Prevent form submission on Enter key press
	document.querySelectorAll('input').forEach(input => {
		input.addEventListener('keydown', function(event) {
			if (event.key === 'Enter') {
				event.preventDefault(); // Prevent the default Enter key action
			}
		});
	});

	function answerAnimation(){
		if (answerAnimationTriggered){
			groupArr.forEach(function(group){
				group.position.add(new THREE.Vector3(
					(Math.random() - 0.5) * 2.0, 
					(Math.random() - 0.5) * 2.0, 
					(Math.random() - 0.5) * 2.0)
				);
			})
		}
	}

	

// RAYCASTER
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	function updateRaycaster(){
		raycaster.setFromCamera( pointer, camera );
		// calculate objects intersecting the picking ray
		let intersects = raycaster.intersectObjects( scene.children );
		//console.log(intersects[0])
	}

	function onPointerMove( event ) {

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components

		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	}
	window.addEventListener( 'pointermove', onPointerMove );

	function onPointerClick( event ){
		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		
		let intersects = raycaster.intersectObjects( scene.children );
		//console.log(intersects[0]);
		if (intersects[0].object.parent.name == "obstacle"){
			intersects[0].object.parent.scale.set(0, 0, 0);
		}
	}
	window.addEventListener('pointerdown', onPointerClick);

// HINT BUTTON
	document.getElementById('hint-button').addEventListener('click', function() {
		const hintImage = document.getElementById('hint-image');
		if (hintImage.style.display == 'none' || hintImage.style.display == '') {
			hintImage.style.display = 'block';
		} else {
			hintImage.style.display = 'none';
		}
	});



	function render(time){
		answerAnimation();
		time *= 0.001;
		controls.update();
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		renderer.render(scene, camera);
		updateRaycaster();
		requestAnimationFrame(render);
	}

	function resizeRenderToDisplaySize(renderer){
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = canvas.clientWidth * pixelRatio | 0; // or 0
		const height = canvas.clientHeight * pixelRatio | 0; // 0
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize){
			renderer.setSize(width, height, false);
		}
		return needResize;
	}
	requestAnimationFrame(render);
}

main();