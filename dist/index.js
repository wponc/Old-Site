import * as THREE from 'https://unpkg.com/three@0.125.2/build/three.module.js';
// import * as THREE from '../node_modules/three/build/three.js'

// Intersection observer for lazy loading
const sections = document.querySelectorAll('section')
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    entry.target.classList.toggle("show", entry.isIntersecting)
    if (entry.isIntersecting) observer.unobserve(entry.target)
  })
  }, {
  threshold: .1,
  }
)

sections.forEach(section => {
    observer.observe(section)
  })
  
  
  
  // Clock for stepping through animation loop 
  const clock = new THREE.Clock();
  
  // Antialiasing to make site more performant
  let pixelRatio = window.devicePixelRatio
  let AA = true
  if (pixelRatio > 1) {
    AA = false
  }
  
  // Renderer instance, color management to polish matcaps
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: AA
  })
  //THREE.ColorManagement.enabled = true;
  //THREE.ColorManagement.legacyMode = false;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  
  // Manager for loading animation
  const textureloader = new THREE.TextureLoader();
  
  
  // Matcap textures used on model, torus, ground plane
  const gold = textureloader.load('./assets/matcaps/gold.jpg');
  gold.generateMipmaps = false
  gold.minFilter = THREE.NearestFilter
  
  // Scene & camera creation
  const cameraGroup = new THREE.Group()
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    .1, 
    1000
  );
  scene.add(cameraGroup)
  
  // Rendering
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  cameraGroup.add(camera)
  
  // Rotating torus knot visible on page load
  const torusgeom = new THREE.TorusKnotGeometry(2,.1,300,20,4,9)
  const torusmat = new THREE.MeshMatcapMaterial();
  torusmat.matcap = gold;
  const torusmesh = new THREE.Mesh(torusgeom, torusmat);
  scene.add(torusmesh);
  torusmesh.position.set(2.5,0,-.75);
  torusmesh.rotateY(300);
  torusmesh.rotateX(37);
  
  
  // Event listener for window resize
  window.addEventListener( 'resize', onWindowResize, false );
  function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
  
  // Brings viewer to section visible before page was refreshed 
  document.addEventListener("DOMContentLoaded", function(event) { 
    var scrollpos = localStorage.getItem('scrollpos');
    if (scrollpos) window.scrollTo(0, scrollpos);
  });
  window.onbeforeunload = function(e) {
    localStorage.setItem('scrollpos', window.scrollY);
  };
  
  // Size constants for use in parallax
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  // Cursor tracking for parallax effect
  const cursor = {}
  cursor.x = 0
  cursor.y = 0
  window.addEventListener('mousemove', (event) =>
  {
      cursor.x = event.clientX / sizes.width - 0.5
      cursor.y = event.clientY / sizes.height - 0.5
  })
  
  
  // Animation loop to rotate torus, update parallax, re-render scene
  let previousTime = 0
  function animate(){
    requestAnimationFrame(animate);
  
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
  
    torusgeom.rotateZ(.0004);
    const parallaxX = cursor.x * .1;
    const parallaxY = -cursor.y * .1;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
  
    renderer.render(scene, camera);
  }
  
  // Animation call
  animate();
  