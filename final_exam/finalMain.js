  'use strict';

  // Global variables that are set and used
  // across the application
  let gl;

  // GLSL programs
  //https://stackoverflow.com/questions/29355582/webgl-multiple-shaders
  let gouraudShader; //for everything not involving textures
  let textureShader; //for all textured objects
  
  // VAOs for objects
  /**bottom-level objects*/
  let foundationCube = null;
  let screwCyl = null;
  let arenaCyl = null;
  let stairCube = null;
  let checkerCube = null;
  let borderCube = null;
  
  let signCube = null;
  let signCyl = null;
  let castleCone = null;
  let castleCyl = null;
  let treeCone = null;
  let treeCyl = null;
  let treeCube = null;
  
  let railCyl = null;
  
  let bridgeCube = null;
  
  /** top-level objects*/
  let bumperSphere = null;

  // textures
	let castleTexture;
	let bumperTexture;
	
  // rotation
	var sphere_angles = [180.0, 180.0, 0.0];

//
// Here you set up your camera position, orientation, and projection
// Remember that your projection and view matrices are sent to the vertex shader
// as uniforms, using whatever name you supply in the shaders
//
function setUpCamera(program) {
    
    gl.useProgram (program);
    
    // set up your projection (from assignment 6)
	let projMatrix = glMatrix.mat4.create();
	glMatrix.mat4.perspective(projMatrix, radians(90),
	1.0,1.0,300.0);
	gl.uniformMatrix4fv(program.uProjT, false, projMatrix);
    
    // set up your view
	let viewMatrix = glMatrix.mat4.create();
	glMatrix.mat4.lookAt(viewMatrix, 
	[0, 0, 1], [0, 0, 0], [0, 1, 0]);
	
	gl.uniformMatrix4fv (program.uViewT, false, viewMatrix);
	
	//make default exactly like elevated, angle stage view in smash bros

}

//
// In this function, you must set up all of the uniform variables
// in the shaders required for the implememtation of the Phong
// Illumination model.
//
// Check out the source of the vertex shader in the HTML file
// assn6-shading.html taking note of the types of each of the
// uniforms.
//
// Note that the program object has member variables that store the
// location of attributes and uniforms in the shaders.  See the function
// initProgram for details.
//
//
//  You should also set up your Model transform here.

function setUpPhong(program, amb, base, ka, kd, ks, ke) {
    

    // Recall that you must set the program to be current using
    // the gl useProgram function
    gl.useProgram (program);
    
    //
    // set values for all your uniform variables
    // including the model transform
    // but not your view and projection transforms as
    // they are set in setUpCamera()
    //
	
	//light params
	gl.uniform3fv (program.ambientLight,amb ); //[0,1.15,0] ambient light position
	gl.uniform3fv (program.lightPosition, [-1,2,0]);
	gl.uniform3fv (program.lightColor, [1,1,1]) //make reflected color white
	//object color
	gl.uniform3fv (program.baseColor, base); // [0,1,0]make surface coloring green
	gl.uniform3fv (program.specHighlightColor, [1,1,1]);//specular lighting same as light
	
	//phong params (.1, .55, .35, 5
	gl.uniform1fv(program.ka, ka ); // [0.1] reflects in all directions
	gl.uniform1fv(program.kd, kd ); // [0.55] diffuse (shadows and highlights)
	gl.uniform1fv(program.ks, ks ); // [0.35] the specular (shiny spots)
	gl.uniform1fv(program.ke, ke ); // [5] the shininess constant, bigger the value, the tinier the shinies
    
    // set up your model transform...Add transformations
    // if you are moiving, scaling, or rotating the object.
    // Default is no transformations at all (identity matrix).
    //
    //let modelMatrix = glMatrix.mat4.create();
    //gl.uniformMatrix4fv (program.uModelT, false, modelMatrix);
    
    
}

//
// load up the textures you will use in the shader(s)
// The setup for the globe texture is done for you
// Any additional images that you include will need to
// set up as well.
//
function setUpTextures(){
    
    // flip Y for WebGL
    gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
    
    // get some texture space from the gpu
    castleTexture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, castleTexture);
    // load the actual image for canvas background
    var castleImage = document.getElementById ('castle-texture')
    castleImage.crossOrigin = "";
	castleImage.onload = () => {
		//https://stackoverflow.com/questions/39893834/background-img-for-canvas-webgl
		
		// load the texture data
		gl.bindTexture(gl.TEXTURE_2D, castleTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,castleImage);
		
		// set texturing parameters
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
        
    // repeat for bumper texture
    bumperTexture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, bumperTexture);
    // load the actual image for canvas background
    var bumperImage = document.getElementById ('bumper-texture')
    bumperImage.crossOrigin = "";
	
	bumperImage.onload = () => {
		//same as in assignment 7 for the bumper
		gl.bindTexture(gl.TEXTURE_2D, bumperTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bumperImage.width, bumperImage.height,
		0, gl.RGBA, gl.UNSIGNED_BYTE, bumperImage);
		gl.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
       
}

//
// create shapes and VAOs for objects.
// Note that you will need to bindVAO separately for each object / program based
// upon the vertex attributes found in each program
//
function createShapes() {
	//bottom level
	//1. multi-faceted cylinder for the bottom center platform... cyl(8,6)..pentagon screw cyl(5,10)
	arenaCyl = new Cylinder(8,6);
	arenaCyl.VAO = bindVAO(arenaCyl,gouraudShader);
	
	//5. long, red cubes for the staircases leading to the checkerboard.... cube(10) and scale
	stairCube = new Cube(10);
	stairCube.VAO = bindVAO(stairCube, gouraudShader);
	//6. a stretched out checkerboard cube for the checkerboard the stairs lead to.... cube(10) and scale
	checkerCube = new Cube(10);
	checkerCube.VAO = bindVAO(checkerCube, textureShader);
	// 7. Long pale-brown cubes lining checkerboard cube....cube(10) and scale
	borderCube = new Cube(10, gouraudShader);
	
	//2. tall cylinder with top cone for castle tower... cyl(20,20), cone(15,15)
	castleCyl = new Cylinder(20,20)
	castleCyl.VAO = bindVAO(castleCyl, gouraudShader);
	castleCone = new Cone(15,15);
	castleCone.VAO = bindVAO(castleCone, gouraudShader);
	
	//3. skinny, brown cylinder with several green cones for trees.... cone(12,12), cyl(15,15) and scale
	//4. tan skinny cylinders for weird wooden railing on cylindrical arena... cyl(15,15) and scale
	
	//8. Cubes of differing magnitudes along slanted stairs....cube(2) and scale
	//9. Brown cubes for the sliding bridge (design with the intent of having it be interactive)...
	//there is an alternating pattern that could be done in loops...but just aim for a scaled cube(10) for now

	//top level
	//10. skinny stretched out cube for the red and pale-green platform cube(2) scaled to heck
	//10. sphere with smash bumper texture sphere(20.20)
	//11. skinny cubes with tiny cylinders to form top-level bridges (one curves up and one curves down)
	//...cyl(15,15) and scale
	//12. blue cubes to form two side triangles...for loop of cubes for now.
	//Might make triangular prism if time allows
}

//
//  This function draws all of the shapes required for your scene
//
    function drawShapes() {
        //set up model transform, bindVertexArray(obj.VAO), drawElements.
		/*function setUpPhong(program, amb, base, ka, kd, ks, ke)
		gl.uniformMatrix4fv(program.uModelT, false, cubeMatrix);
		gl.bindVertexArray(myCube.VAO);
		gl.drawElements(gl.TRIANGLES, myCube.indices.length, gl.UNSIGNED_SHORT, 0);*/
		let arenaMatrix = glMatrix.mat4.create();
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, arenaMatrix);
		setUpPhong(gouraudShader,[150, 75, 0],[160,80,0],
		[0.5], [0.4],[.1],[10]);
		gl.bindVertexArray(arenaCyl.VAO);
		gl.drawElements(gl.TRIANGLES, arenaCyl.indices.length, gl.UNSIGNED_SHORT, 0);
    }


  //
  // Use this function to create all the programs that you need
  // You can make use of the auxillary function initProgram
  // which takes the name of a vertex shader and fragment shader
  //
  // Note that after successfully obtaining a program using the initProgram
  // function, you will beed to assign locations of attribute and unifirm variable
  // based on the in variables to the shaders.   This will vary from program
  // to program.
  //
  function initPrograms() {
	gouraudShader = initProgram('phong-per-vertex-V', 'phong-per-vertex-F');
  // PHONG PROGRAMS
    gl.useProgram(gouraudShader);
	let program = gouraudShader;
    // We attach the location of these shader values to the program instance
    // for easy access later in the code
    program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    program.aNormal = gl.getAttribLocation(program, 'aNormal');
      
    // uniforms for gouraud
    program.uModelT = gl.getUniformLocation (program, 'modelT');
    program.uViewT = gl.getUniformLocation (program, 'viewT');
    program.uProjT = gl.getUniformLocation (program, 'projT');
    program.ambientLight = gl.getUniformLocation (program, 'ambientLight');
    program.lightPosition = gl.getUniformLocation (program, 'lightPosition');
    program.lightColor = gl.getUniformLocation (program, 'lightColor');
    program.baseColor = gl.getUniformLocation (program, 'baseColor');
    program.specHighlightColor = gl.getUniformLocation (program, 'specHighlightColor');
    program.ka = gl.getUniformLocation (program, 'ka');
    program.kd = gl.getUniformLocation (program, 'kd');
    program.ks = gl.getUniformLocation (program, 'ks');
    program.ke = gl.getUniformLocation (program, 'ke');
	
	// uniforms for texture
	textureShader = initProgram('texture-V', 'texture-F');
	gl.useProgram(textureShader);
	program = textureShader;
	// We attach the location of these shader values to the program instance
	// for easy access later in the code
	program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
	program.aUV = gl.getAttribLocation(program, 'aUV');

	// uniforms - you will need to add references for any additional
	// uniforms that you add to your shaders
	program.uTheTexture = gl.getUniformLocation (program, 'theTexture');
	program.uTheta = gl.getUniformLocation (program, 'theta');
	program.textureType = gl.getUniformLocation (program, 'textureType');  
  }


  // creates a VAO and returns its ID
  function bindVAO (shape, program) {
      //create and bind VAO
      let theVAO = gl.createVertexArray();
      gl.bindVertexArray(theVAO);
      
      // create and bind vertex buffer
      let myVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.points), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      
      // add code for any additional vertex attribute
	  // create, bind, and fill buffer for normal values
	  // normals can be obtained from the normals member of the
	  // shape object.  3 floating point values (x,y,z) per vertex are
	  // stored in this array.
	  if( program == gouraudShader){
		  let myNormalBuffer = gl.createBuffer();
			  gl.bindBuffer(gl.ARRAY_BUFFER, myNormalBuffer);
			  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.normals), gl.STATIC_DRAW);
			  gl.enableVertexAttribArray(program.aNormal);
			  gl.vertexAttribPointer(program.aNormal,3, gl.FLOAT, false, 0,0);
		  }
	// create, bind, and fill buffer for uv's
	// uvs can be obtained from the uv member of the
	// shape object.  2 floating point values (u,v) per vertex are
	// stored in this array.
	else if( program == textureShader){
		let uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.uv), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(program.aUV);
		gl.vertexAttribPointer(program.aUV, 2, gl.FLOAT, false, 0, 0);
	}
      
      // Setting up the IBO
      let myIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

      // Clean
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      
      return theVAO;
  }


/////////////////////////////////////////////////////////////////////////////
//
//  You shouldn't have to edit anything below this line...but you can
//  if you find the need
//
/////////////////////////////////////////////////////////////////////////////

// Given an id, extract the content's of a shader script
// from the DOM and return the compiled shader
function getShader(id) {
  const script = document.getElementById(id);
  const shaderString = script.text.trim();

  // Assign shader depending on the type of shader
  let shader;
  if (script.type === 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else if (script.type === 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else {
    return null;
  }

  // Compile the shader using the supplied shader code
  gl.shaderSource(shader, shaderString);
  gl.compileShader(shader);

  // Ensure the shader is valid
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


  //
  // compiles, loads, links and returns a program (vertex/fragment shader pair)
  //
  // takes in the id of the vertex and fragment shaders (as given in the HTML file)
  // and returns a program object.
  //
  // will return null if something went wrong
  //
  function initProgram(vertex_id, fragment_id) {
    const vertexShader = getShader(vertex_id);
    const fragmentShader = getShader(fragment_id);

    // Create a program
    let program = gl.createProgram();
      
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Could not initialize shaders');
      return null;
    }
    return program;
  }


  //
  // We call draw to render to our canvas
  //
  function draw() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      
    // draw your shapes
    drawShapes();

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  // Entry point to our application
  function init() {
      
    // Retrieve the canvas
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) {
      console.error(`There is no canvas with id ${'webgl-canvas'} on this page.`);
      return null;
    }

    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);

    // Retrieve a WebGL context
    gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error(`There is no WebGL 2.0 context`);
        return null;
      }
      
    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);
      
    // Set the clear color to be black
    gl.clearColor(0, 0, 0, 1);
      
    // some GL initialization
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.0,0.0,0.0,0.0) //set alpha from 1 to 0
    gl.depthFunc(gl.LEQUAL)
    gl.clearDepth(1.0)

    // Read, compile, and link your shaders
    initPrograms();
	
	//set up textures
	setUpTextures()
	
	//set up the camera
	setUpCamera();
    
    // create and bind your current object
    createShapes();
    
    // do a draw
    draw();
  }
