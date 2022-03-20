/*
HA, CAUGHT YOU PEEKING!




































WAIT!!! STOP!!










































SERIOUSLY THE CODE BELOW IS REAL BAD, I DON'T KNOW WHAT I'M DOING
YOU WON'T LEARN MUCH OF ANYTHING FROM IT...
HONESTLY I'M SURPRISED IT RUNS AT ALL













































OK, LOOK, IT WAS MADE WITH THREE.JS SO 
GOOGLE THAT IF YOU WANT TO LEARN MORE









































dont say i didnt warn ya
*/
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js';
//import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
//import dat from 'dat.gui';
//import {gsap} from 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js';
//import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
//import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
//import {SMAAPass} from "three/examples/jsm/postprocessing/SMAAPass";
//import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
//import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
//import {CopyShader} from "three/examples/jsm/shaders/CopyShader";
//import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
//import {Text} from 'troika-three-text'

// SEE, LOOK AT ALL THIS MESS I DIDN'T BOTHER TO DELETE

//const gui = new dat.GUI();

/*
const world = {
  plane: {
    width: 100,
    height: 100,
    widthSegments: 100,
    heightSegments: 100
  }
};

function genPlane() {
  meshPlane.geometry.dispose()
  meshPlane.geometry = new THREE.PlaneGeometry(
    world.plane.width, 
    world.plane.height, 
    world.plane.widthSegments, 
    world.plane.heightSegments)
  
  const {array} = meshPlane.geometry.attributes.position
  for (let i = 0; i < array.length ; i ++){
  const x = array[i]
  const y = array[i + 1]
  const z = array[i + 2]
  
  array[i + 2] = z + Math.random()
}
const colors = [];
for (let i = 0; i < meshPlane.geometry.attributes.position.count; i++) {
  colors.push(1, 0.24, 0)
}

meshPlane.geometry.setAttribute(
  'color', 
  new THREE.BufferAttribute(new Float32Array(colors), 3));
}

gui.add(world.plane, 'width', 1, 500).onChange(() => {
  genPlane()
});

gui.add(world.plane, 'height', 1, 500).onChange(() => {
  genPlane()
});

gui.add(world.plane, 'heightSegments', 1, 500).onChange(() => {
  genPlane()
});

gui.add(world.plane, 'widthSegments', 1, 500).onChange(() => {
  genPlane()
});
*/


const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

var aspect = window.innerWidth / window.innerHeight;


const raycaster = new THREE.Raycaster()
const camera = new THREE.PerspectiveCamera(getFov(), aspect, 0.1, 100);
camera.position.set(0,0,20);
camera.lookAt( 0, 0, 0 );

function getFov() {
  if (aspect < 1) {
    if (aspect < 0.42){
      var fov = 75/aspect}
    else {
      var fov = 120
    }
  }

  else {
  var fov = 75
  }
return fov
}

//new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

/*
const renderPass = new RenderPass(scene, camera);

const copyPass = new ShaderPass(CopyShader);
copyPass.renderToScreen = true;

const bloom = new UnrealBloomPass({x: 1024, y: 1024}, 0.3, 0.0, 0.75);

const aa = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
*/

const listener = new THREE.AudioListener();
camera.add( listener );

const cubeRotate = new THREE.Audio( listener );

scene.add(cubeRotate)

const loader = new THREE.AudioLoader();
loader.load( './CubeRotate.wav', function( buffer ) {
  cubeRotate.setBuffer(buffer)
  cubeRotate.setLoop( false)
});

const ambience = new THREE.Audio(listener);

scene.add(ambience)

//const loader = new THREE.AudioLoader();
loader.load('./Windows95StartupPaul.mp3', function(buffer2){
  ambience.setBuffer(buffer2)
  ambience.setLoop(true)
  ambience.setVolume(0.5)
  ambience.play()
});
 /*
const myText = new Text()
scene.add(myText)

myText.text = 
  "Thanks for checking out my website! As you can see, it's not quite done. Feel free to contact me at harrisondaniell24@gmail.com also feel free to click these orange buttons!"
myText.fontSize = 0.025
myText.position.z = 1
myText.position.x = -0.2
myText.position.y= 0.2
myText.color = 0x000000
myText.textAlign = "center"
myText.maxWidth = 0.8


// Update the rendering:
myText.sync()


function canvasDrawText(ctx, canvas, text, x, y) {
    // if x isn't provided
    if (x === undefined || x === null) {
      x = canvas.width / 2;
      ctx.textAlign = 'center';
    } else {
      ctx.textAlign = 'left';
    }
    
    // if y isn't provided
    if ( y === undefined || y === null ) {
      y = canvas.height / 2;
      ctx.textBaseline = 'middle';
    } else {
      ctx.textBaseline = 'alphabetic';
    }

    // actually draw the text
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
}

function newCardBacksideTexture(cardBackSideText) {
    // Create an IMG element to hold the card back side image and load it.
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    canvas.width = 10;
    canvas.height = 10;
    
    const canvasTex = new THREE.CanvasTexture(canvas);

    // Create a document element to house the back side image for cards.
    const imgBackSide = document.createElement('img');
    imgBackSide.onload = () => {
      ctx.drawImage(imgBackSide, 0, 0);

      // Draw the card label on top of the background.
      ctx.font    = 'bolder 90px Verdana';
      canvasDrawText(ctx, canvas, cardBackSideText);
      // dynamicTexture.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      
      canvasTex.needsUpdate = true;
    };
    

    return canvasTex;
}*/

//var anisotropy = renderer.capabilities.getMaxAnisotropy()

const textureLoader = new THREE.TextureLoader();

//texture.anisotropy = anisotropy

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const material =  [ 
  new THREE.MeshLambertMaterial({map: textureLoader.load('./right.png')}),
  new THREE.MeshLambertMaterial({map: textureLoader.load('./left.png')}),
  new THREE.MeshLambertMaterial({map: textureLoader.load('./top.png')}),
  new THREE.MeshLambertMaterial({map: textureLoader.load('./bottom.png')}),
  new THREE.MeshLambertMaterial({map: textureLoader.load('./front.png')}),
  new THREE.MeshBasicMaterial()
];

const box = new THREE.Mesh(boxGeometry, material);

const plane = new THREE.PlaneGeometry(100, 100, 100, 100);
const materialPlane = new THREE.MeshPhongMaterial({
  flatShading: THREE.FlatShading,
  //vertexColors: true,
  color: 0x010101
});
const meshPlane = new THREE.Mesh(plane, materialPlane);
meshPlane.position.set(0,0,-10)
meshPlane.receiveShadow = true;

const {array} = meshPlane.geometry.attributes.position;
const randomValues = []
for (let i = 0; i < array.length ; i++){

  if (i % 3 === 0) {
  const x = array[i]
  const y = array[i + 1]
  const z = array[i + 2]
  
  array[i] = x + (Math.random() - 0.5)
  array[i + 1] = y + (Math.random() - 0.5)
  array[i + 2] = z + Math.random()
}
  randomValues.push((Math.random() - 0.5) * 3)
};

meshPlane.geometry.attributes.position.randomValues = randomValues
meshPlane.geometry.attributes.position.originalPosition = 
  meshPlane.geometry.attributes.position.array


scene.add(meshPlane);
scene.add(box);

/*
const colors = [];
for (let i = 0; i < meshPlane.geometry.attributes.position.count; i++) {
  colors.push(0.01, 0.01, 0.01)
};


meshPlane.geometry.setAttribute(
  'color', 
  new THREE.BufferAttribute(new Float32Array(colors), 3));
*/

const light = new THREE.PointLight(0xffffff, 2.5);
light.position.set(0, 0, 1);
light.castShadow = true;

scene.add(light);

/*
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloom);
composer.addPass(aa);
*/

const pointer = new THREE.Vector2();


function onPointerMove( event ) {

  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onClick(event) {

  let intersectUp = raycaster.intersectObject( up );
  let intersectDown = raycaster.intersectObject( down );
  let intersectLeft = raycaster.intersectObject( left );
  let intersectRight = raycaster.intersectObject( right );

  if ( intersectUp.length > 0 ) {
    if (box.rotation.x < 1.5) {
    boxUp()}
    else {
      return
    }
  }
  else if ( intersectDown.length > 0 ) {
    if (box.rotation.x > -1.5) {
      boxDown()}
      else {
        return
    }
  }

  else if ( intersectLeft.length > 0 ) {
    if (box.rotation.y < 1.5) {
      boxLeft()}
      else {
       return
    }
  }

  else if ( intersectRight.length > 0 ) {
     if (box.rotation.y > -1.5) {
      boxRight()}
      else {
       return
    }
  }
  }

function onTouch(event) {
  pointer.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
  onClick()
}

function boxUp() {

  gsap.to(box.rotation, {x: box.rotation.x + (Math.PI / 2)})
    cubeRotate.play()
  }

function boxDown() {
  gsap.to(box.rotation, {x: box.rotation.x - (Math.PI / 2)})
    cubeRotate.play()
  }

function boxLeft() {
  gsap.to(box.rotation, {y: box.rotation.y + (Math.PI / 2)})
    cubeRotate.play()
  }

function boxRight() {
  gsap.to(box.rotation, {y: box.rotation.y - (Math.PI / 2)})
    cubeRotate.play()
  }

/*
const mouse = {
  x: undefined,
  y: undefined
};

const interactionManager = new InteractionManager(
  renderer,
  box,
  renderer.domElement
);
*/

const button1 = new THREE.PlaneGeometry(0.15,0.05,1,1);
const button2 = new THREE.PlaneGeometry(0.05,0.15,1,1);
const materialUp = new THREE.MeshLambertMaterial({
  emissive: 0xF4511E,
  transparent: true});
const materialDown = new THREE.MeshLambertMaterial({
  emissive: 0xF4511E,
  transparent: true});
const materialLeft = new THREE.MeshLambertMaterial({
  emissive: 0xF4511E,
  transparent: true});
const materialRight = new THREE.MeshLambertMaterial({
  emissive: 0xF4511E,
  transparent: true});

const up = new THREE.Mesh(button1, materialUp);
up.position.set(0,0.16,1.25);
//up.callback = function() {cubeUp();};

const down = new THREE.Mesh(button1, materialDown);
down.position.set(0,-0.16,1.25);
//down.callback = function() {cubeDown();};

const left = new THREE.Mesh(button2, materialLeft);
left.position.set(-0.16,0,1.25);
//left.callback = function() {cubeLeft();};

const right = new THREE.Mesh(button2, materialRight);
right.position.set(0.16,0,1.25);
//right.callback = function() {cubeRight();};

scene.add(up);
scene.add(down);
scene.add(left);
scene.add(right);

const array2 = [up,down,left,right]


function setCanvasDimensions(
  canvas,
  width,
  height,
  set2dTransform = false
) {
  const ratio = window.devicePixelRatio;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  if (set2dTransform) {
    canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  }
}


window.onresize = function () {
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;

  if (camera.aspect < 1) {
    if (camera.aspect < 0.42){
    gsap.to(camera, {fov: 75/camera.aspect})}
    else {
      gsap.to(camera, {fov: 120})}
    }
  

  else {
    gsap.to(camera, {fov: 75})
  }

  camera.updateProjectionMatrix();

  renderer.setSize( width, height);

  setCanvasDimensions(renderer.domElement, width, height);

};

let frame = 0
function wobble(){

  gsap.to(box.rotation, {x: 0})
  gsap.to(box.rotation, {y: 0})
  gsap.to(box.rotation, {z: (Math.sin(frame))*0.1}) 
  gsap.to(box.position, {x: (Math.cos(frame))*0.05})
  gsap.to(box.position, {y: (Math.sin(frame))*0.05})
  gsap.to(box.position, {z: 0})

  box.position.needsUpdate = true

  //light.position.x = (Math.cos(frame))*0.05;
  //light.position.y = (Math.sin(frame))*0.05;


/*
  const intersect = raycaster.intersectObject(meshPlane)
  if (intersect.length > 0) {
    const {color} = intersect[0].object.geometry.attributes
    color.setX(intersect[0].face.a, 1)
    color.setY(intersect[0].face.a, 0.24)
    color.setZ(intersect[0].face.a, 0)

    color.setX(intersect[0].face.b, 1)
    color.setY(intersect[0].face.b, 0.24)
    color.setZ(intersect[0].face.b, 0)

    color.setX(intersect[0].face.c, 1)
    color.setY(intersect[0].face.c, 0.24)
    color.setZ(intersect[0].face.c, 0)

    color.needsUpdate = true

    const initialColor = {
      r: 1, g: 0.24, b: 0}

    const hoverColor = {
      r: 1, g: 1, b: 1}

    gsap.TweenMax.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
    color.setX(intersect[0].face.a, hoverColor.r)
    color.setY(intersect[0].face.a, hoverColor.g)
    color.setZ(intersect[0].face.a, hoverColor.b)

    color.setX(intersect[0].face.b, hoverColor.r)
    color.setY(intersect[0].face.b, hoverColor.g)
    color.setZ(intersect[0].face.b, hoverColor.b)

    color.setX(intersect[0].face.c, hoverColor.r)
    color.setY(intersect[0].face.c, hoverColor.g)
    color.setZ(intersect[0].face.c, hoverColor.b)
    color.needsUpdate = true
     }
    })
  }
  */

};

function wobbleUp(){

  //gsap.to(box.rotation, {x: 0})
  //gsap.to(box.rotation, {y: (Math.sin(frame))*0.1})
  gsap.to(box.rotation, {z: 0})
  gsap.to(box.position, {x: (Math.cos(frame))*0.05})
  gsap.to(box.position, {y: (Math.sin(frame))*0.05})
  gsap.to(box.position, {z: 0})

  box.position.needsUpdate = true
};

function wobbleDown(){

  //gsap.to(box.rotation, {x: 0})
 // gsap.to(box.rotation, {y: (Math.sin(frame))*0.1})
  gsap.to(box.rotation, {z: 0})
  gsap.to(box.position, {x: (Math.cos(frame))*0.05})
  gsap.to(box.position, {y: (Math.sin(frame))*0.05})
  gsap.to(box.position, {z: 0})

  box.position.needsUpdate = true
};

function wobbleLeft(){

  //gsap.to(box.rotation, {x: (Math.sin(frame))*0.1})
  //gsap.to(box.rotation, {y: (Math.sin(frame))*0.1})
  gsap.to(box.rotation, {z: 0})
  gsap.to(box.position, {x: (Math.cos(frame))*0.05})
  gsap.to(box.position, {y: (Math.sin(frame))*0.05})
  gsap.to(box.position, {z: 0})

  box.position.needsUpdate = true
};

function wobbleRight(){

  //gsap.to(box.rotation, {x: (Math.sin(frame))*0.1})
  //gsap.to(box.rotation, {y: (Math.sin(frame))*0.1})
  gsap.to(box.rotation, {z: 0})
  gsap.to(box.position, {x: (Math.cos(frame))*0.05})
  gsap.to(box.position, {y: (Math.sin(frame))*0.05})
  gsap.to(box.position, {z: 0})

  box.position.needsUpdate = true
};

function buttonanimate() {

  var intersectup = raycaster.intersectObject(up, true);
  var intersectdown = raycaster.intersectObject(down, true);
  var intersectleft = raycaster.intersectObject(left, true);
  var intersectright = raycaster.intersectObject(right, true);

  if (intersectup.length > 0) {

    gsap.to(up.position, {z: 1.26})
  
}
  else if (intersectdown.length > 0) {

    gsap.to(down.position, {z: 1.26});
}

  else if (intersectleft.length > 0) {

    gsap.to(left.position, {z: 1.26});
}

  else if (intersectright.length > 0) {

    gsap.to(right.position, {z: 1.26});
}

  else {

    gsap.to(up.position, {z: 1.25});
    gsap.to(down.position, {z: 1.25});
    gsap.to(left.position, {z: 1.25});
    gsap.to(right.position, {z: 1.25});
  }

  
      };

function reset(){
  gsap.to(up.position, {z: 1.25});
  gsap.to(down.position, {z: 1.25});
  gsap.to(left.position, {z: 1.25});
  gsap.to(right.position, {z: 1.25});

  gsap.to(up.material, {opacity: 1});
  gsap.to(down.material, {opacity: 1});
  gsap.to(left.material, {opacity: 1});
  gsap.to(right.material, {opacity: 1});

  gsap.to(box.rotation, {x: 0})
  gsap.to(box.rotation, {y: 0})
  gsap.to(box.rotation, {z: 0}) 
  gsap.to(box.position, {x: 0})
  gsap.to(box.position, {y: 0})
  gsap.to(box.position, {z: 0})

  box.position.needsUpdate = true
  box.rotation.needsUpdate = true

}

function animate(){
  requestAnimationFrame(animate)
  frame += 0.01
  renderer.render(scene, camera)
  raycaster.setFromCamera(pointer, camera)



  gsap.to(camera.position, {duration: 1, z: 1.5})

  if (box.rotation.x > 0 & -0.1 < box.rotation.y > 0.1){
    wobbleUp()
    gsap.to(up.position, {x: 0, y: 0.3});
    //gsap.to(down.position, {x: 0, y: -0.16});
    gsap.to(left.position, {x: -0.3, y: 0});
    gsap.to(right.position, {x: 0.3, y: 0});
    gsap.to(up.material, {opacity: 0});
    //gsap.to(down.material, {opacity: 0});
    gsap.to(left.material, {opacity: 0});
    gsap.to(right.material, {opacity: 0});
  }

  else if (box.rotation.x < 0 & -0.1 < box.rotation.y > 0.1 ){
    wobbleDown()
    //gsap.to(up.position, {x: 0, y: 1});
    gsap.to(down.position, {x: 0, y: -0.3});
    gsap.to(left.position, {x: -0.3, y: 0});
    gsap.to(right.position, {x: 0.3, y: 0});

    //gsap.to(up.material, {opacity: 0});
    gsap.to(down.material, {opacity: 0});
    gsap.to(left.material, {opacity: 0});
    gsap.to(right.material, {opacity: 0});
  }

  else if (box.rotation.y < 0 ){
    wobbleLeft()
    gsap.to(up.position, {x: 0, y: 0.3});
    gsap.to(down.position, {x: 0, y: -0.3});
    //gsap.to(left.position, {x: -1, y: 0});
    gsap.to(right.position, {x: 0.3, y: 0});

    gsap.to(up.material, {opacity: 0});
    gsap.to(down.material, {opacity: 0});
    //gsap.to(left.material, {opacity: 0});
    gsap.to(right.material, {opacity: 0});
  }

  else if (box.rotation.y > 0 ){
    wobbleRight()
    gsap.to(up.position, {x: 0, y: 0.3});
    gsap.to(down.position, {x: 0, y: -0.3});
    gsap.to(left.position, {x: -0.3, y: 0});
    //gsap.to(right.position, {x: 1, y: 0});

    gsap.to(up.material, {opacity: 0});
    gsap.to(down.material, {opacity: 0});
    gsap.to(left.material, {opacity: 0});
   // gsap.to(right.material, {opacity: 0});
  }

  else {
    wobble()
    gsap.to(up.position, {x: 0, y: 0.16});
    gsap.to(down.position, {x: 0, y: -0.16});
    gsap.to(left.position, {x: -0.16, y: 0});
    gsap.to(right.position, {x: 0.16, y: 0});

    gsap.to(up.material, {opacity: 1});
    gsap.to(down.material, {opacity: 1});
    gsap.to(left.material, {opacity: 1});
    gsap.to(right.material, {opacity: 1});
  }

  if (down.material.opacity < 0.9 & up.material.opacity < 0.9 & left.material.opacity < 0.9 & right.material.opacity < 0.9) {
    reset()
  }

  //console.log(down.material.opacity)
  //console.log(box.rotation.z)

  const {array, originalPosition, randomValues} = meshPlane.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.sin(frame + randomValues[i]) * 0.001
    array[i + 1] = originalPosition[i + 1] + Math.cos(frame + randomValues[i + 1]) * 0.001
  }

  meshPlane.geometry.attributes.position.needsUpdate = true

  buttonanimate()


  //texture.needsUpdate = true

  renderer.render( scene, camera )

};

animate();
console.log(ambience)
//console.log(left.position.y)
//renderer.render(scene, camera);

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener( 'click', onClick );
window.addEventListener('resize', onresize, false);
window.addEventListener( 'touchstart', onTouch );
