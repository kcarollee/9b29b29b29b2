import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});

//CAMERA
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	camera.position.set(0, 0, 100);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	//scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()))
	renderer.render(scene, camera);

// ORBIT CONTROLS
	const controls = new OrbitControls( camera, renderer.domElement );

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
		depth: 3,  // Depth to extrude the shape
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
		color:0xFFFFFF,
	})
	const gap = 35;
	for (let i = 0; i < 3; i++){
		for (let j = 0; j < 3; j++){
			for (let k = 0; k < 3; k++){
				let index = Math.floor(Math.random() * 36);
				let url = "assets/svgs/svgFile " + "(" + (index + 1) + ").svg";
				let posX = -gap + i *  gap;
				let posY = -gap + j *  gap;
				let posZ = -gap + k *  gap;
				
				svgLoader.load(url, (data) => {
					svgToMesh(data, posX, posY, posZ);
				});
			}
		}
		
	}
	
	

	function svgToMesh(data, posX, posY, posZ){
		
		// The SVGLoader parses the file and provides paths
		const paths = data.paths;

		// Create a group to hold all the extruded shapes
		const group = new THREE.Group();
	
		paths.forEach((path) => {
			// Convert the SVG path into shapes
			const shapes = SVGLoader.createShapes(path);
	
			shapes.forEach((shape) => {
				// Create an ExtrudeGeometry from the shape
				const geometry = new THREE.ExtrudeGeometry(shape, extrusionSettings);
				
				
	
				// Create a mesh from the geometry and material
				const mesh = new THREE.Mesh(geometry, standardMaterial);
				group.add(mesh);
			});
		});

		let scale = 0.05;
		group.rotation.x = Math.PI;
		console.log(posX, posY, posZ)
		group.position.set(-scale * 500 + posX, scale * 500 + posY, posZ);
		group.scale.set(scale, scale, scale);
		// Add the group to the scene
		scene.add(group);
	}




	function render(time){
		time *= 0.001;
		controls.update();
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		renderer.render(scene, camera);
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