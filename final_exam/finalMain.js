  'use strict';

  // Global variables that are set and used
  // across the application
  let gl;

  // GLSL programs
  //https://stackoverflow.com/questions/29355582/webgl-multiple-shaders
  let gouraudShader; //for everything not involving textures
  let textureShader; //for all textured objects
  
  // VAOs for objects
  /**bottom-level foundation*/
  let foundationCube = null;
  let screwCyl = null;
  let arenaCyl = null;
  let stairCube = null;
  let checkerCube = null;
  let borderCube = null;
  
  /**bottom-level decorations*/
  let castleCone = null;
  let castleTopCyl = null;
  let castleCyl = null;
  
  let treeCone = null;
  let woodCyl = null;
  let soilCube = null;
  let railCyl = null; 
  
  let signCube = null;
  let signCyl = null;
  let textCyl = null;
  
  /** top-level objects*/ 
  let platCube = null;
  let scaffCube = null;
  let scaffCyl = null;
  let bumperSphere = null;
  let triangleCubes = null;
  
  /**bottom-level bridge*/
  let bridgeCube = null;
  //let bridgeXCoord = -4.0; //this will possibly be adjustable

	// textures
	let castleTexture;
	let bumperTexture;
	let bridgeTexture;
	let castleTopTexture;
	let castleBaseTexture;

	// interactive variables
	var screwAngle = 0.0;
	var bridgeXCoord = 0.0;
	var bumperX = 2.15;
	var bumperY = 4.5;
	

//
// load up the textures you will use in the shader(s)
// The setup for the globe texture is done for you
// Any additional images that you include will need to
// set up as well.
//
function setUpTextures(){
    //https://cpetry.github.io/TextureGenerator-Online/- online procedural texture maker
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
	}
   
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
	}
	bridgeTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, bridgeTexture);
    // load the actual image for canvas background
    var bridgeImage = document.getElementById ('bridge-texture')
    bridgeImage.crossOrigin = "";
	
	bridgeImage.onload = () => {
		//same as in assignment 7 for the bumper
		gl.bindTexture(gl.TEXTURE_2D, bridgeTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bridgeImage.width, bridgeImage.height,
		0, gl.RGBA, gl.UNSIGNED_BYTE, bridgeImage);
		gl.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	
	castleTopTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, castleTopTexture);
    // load the actual image for canvas background
    var castleTopImage = document.getElementById ('castle-top-texture')
    castleTopImage.crossOrigin = "";
	
	castleTopImage.onload = () => {
		//same as in assignment 7 for the bumper
		gl.bindTexture(gl.TEXTURE_2D, castleTopTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, castleTopImage.width, castleTopImage.height,
		0, gl.RGBA, gl.UNSIGNED_BYTE, castleTopImage);
		gl.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	
	castleBaseTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, castleBaseTexture);
    // load the actual image for canvas background
    var castleBaseImage = document.getElementById ('castle-base-texture')
    castleBaseImage.crossOrigin = "";
	
	castleBaseImage.onload = () => {
		//same as in assignment 7 for the bumper
		gl.bindTexture(gl.TEXTURE_2D, castleBaseTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, castleBaseImage.width, castleBaseImage.height,
		0, gl.RGBA, gl.UNSIGNED_BYTE, castleBaseImage);
		gl.texParameteri(gl.TEXTURE_2D,  gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		draw();
	}
	
}

//
// In this function, you must set up all of the uniform variables
// in the shaders required for the implememtation of the Phong
// Illumination model.
//
function setUpPhong(program, amb, base, ka, kd, ks, ke) {
    // Recall that you must set the program to be current using
    // the gl useProgram function
    gl.useProgram (program);
	
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
}

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
	1.0,3.0,300.0);
	gl.uniformMatrix4fv(program.uProjT, false, projMatrix);
    
    // set up your view
	let viewMatrix = glMatrix.mat4.create();
	glMatrix.mat4.lookAt(viewMatrix,[0, 4, 5.5], [0, 2, 2], [0, 1, 0]); //0, 2, 2]
	//[0, 5.0, 5.5], [0, 0, 0], [0, 1, 0]);
	//); good final angle
	// zoom out [0, 5, 8.70], [0, 2, 2], [0, 1, 0
	//[0, 4, -2.0], [0, 0, 0], [0, 1, 0]// aerial view
	//[6.0, 1.0, 0.5], [0, 0, 0], [0, 1, 0] //side-view
	gl.uniformMatrix4fv (program.uViewT, false, viewMatrix);
}

//
// create shapes and VAOs for objects.
// Note that you will need to bindVAO separately for each object / program based
// upon the vertex attributes found in each program
//
function createShapes() {
//bottom level foundation shapes
	foundationCube = new Cube(10);
	foundationCube.VAO = bindVAO(foundationCube, textureShader);
	screwCyl = new Cylinder(5,5);
	screwCyl.VAO = bindVAO(screwCyl, gouraudShader); //can mix and match
	arenaCyl = new Cylinder(8,6);
	arenaCyl.VAO = bindVAO(arenaCyl,gouraudShader);
	stairCube = new Cube(10);
	stairCube.VAO = bindVAO(stairCube, gouraudShader);
	checkerCube = new Cube(10);
	checkerCube.VAO = bindVAO(checkerCube, textureShader);
	borderCube = new Cube(10, gouraudShader);
	borderCube.VAO = bindVAO(borderCube, gouraudShader);
	
//bottom-level decorations
	castleCyl = new Cylinder(20,20)
	castleCyl.VAO = bindVAO(castleCyl, textureShader);
	castleTopCyl = new Cylinder(8,6);
	castleTopCyl.VAO = bindVAO(castleTopCyl, textureShader);
	castleCone = new Cone(15,15);
	castleCone.VAO = bindVAO(castleCone, textureShader);	
	treeCone = new Cone(12,12);
	treeCone.VAO = bindVAO(treeCone, gouraudShader);
	woodCyl = new Cylinder(15,15);
	woodCyl.VAO = bindVAO(woodCyl, gouraudShader);
	soilCube = new Cube(3);
	soilCube.VAO = bindVAO(soilCube, gouraudShader);
	railCyl = new Cylinder(6,6);  
	railCyl.VAO = bindVAO(railCyl, gouraudShader);	
	signCube = new Cube(3);
	signCube.VAO = bindVAO(signCube,gouraudShader);
	signCyl = new Cylinder(10,10);
	signCyl.VAO = bindVAO(signCyl,gouraudShader);
	
	//top level
	platCube = new Cube(10);
	platCube.VAO = bindVAO(platCube, gouraudShader);
	scaffCube = new Cube(10);
	scaffCube.VAO = bindVAO(scaffCube, gouraudShader);
	scaffCyl = new Cylinder(15,15);
	scaffCyl.VAO = bindVAO(scaffCyl, gouraudShader);
	triangleCubes = new Cube(10);
	triangleCubes.VAO = bindVAO(triangleCubes, gouraudShader);
	bumperSphere = new Sphere(20,20);
	bumperSphere.VAO = bindVAO(bumperSphere, textureShader);
	//11. skinny cubes with tiny cylinders to form top-level bridges (one curves up and one curves down)
	//...cyl(15,15) and scale
	
	//9. Brown cubes for the sliding bridge (design with the intent of having it be interactive)...
	//there is an alternating pattern that could be done in loops...but just aim for a scaled cube(10) for now
	bridgeCube = new Cube(20);
	bridgeCube.VAO = bindVAO(bridgeCube, textureShader);
	
}

//
//  This function draws all of the shapes required for your scene
//
function drawShapes() {
	//https://antongerdelan.net/colour/ colour finder
	drawFoundation();
	drawBottomDecor();
	drawTopLevel();
	//set up model transform, bindVertexArray(obj.VAO), drawElements.
	/*function setUpPhong(program, amb, base, ka, kd, ks, ke)
	gl.uniformMatrix4fv(program.uModelT, false, cubeMatrix);
	gl.bindVertexArray(myCube.VAO);
	gl.drawElements(gl.TRIANGLES, myCube.indices.length, gl.UNSIGNED_SHORT, 0);*/

	

}

//
//Draws the top-level
//
function drawTopLevel(){
	gl.useProgram(gouraudShader);
	//setup phong for birch part
	let topVec = [0,2.5,0];
	setUpPhong(gouraudShader,[0.910, 0.873, 0.664],[0.910, 0.873, 0.664],
	[0.6], [0.3],[.1],[20]);
	let platWth = 2.00
	let platHgt = .15;
	let platDpth = 1.17;
	let platScaleVec = [platWth,platHgt,platDpth]
	let platMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(platMatrix,platMatrix, topVec);
	glMatrix.mat4.scale(platMatrix, platMatrix, platScaleVec);
	gl.uniformMatrix4fv(gouraudShader.uModelT, false, platMatrix);
	gl.bindVertexArray(platCube.VAO);
	gl.drawElements(gl.TRIANGLES, platCube.indices.length, gl.UNSIGNED_SHORT,0);

//setup phong for pinkish borders
	setUpPhong(gouraudShader,[0.910, 0.419, 0.419],[0.830, 0.398, 0.398],
	[0.6], [0.1],[.3],[100]);
	let fplatScaleVec = [platWth,platHgt,.17]
	let ftopVec = [0,2.5,0.68];
	for(let fplats = 0; fplats < 2 ; fplats++){
		let fplatMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(fplatMatrix,fplatMatrix, ftopVec);
		glMatrix.mat4.scale(fplatMatrix, fplatMatrix, fplatScaleVec);
		gl.uniformMatrix4fv(gouraudShader.uModelT, false, fplatMatrix);
		gl.bindVertexArray(platCube.VAO);
		gl.drawElements(gl.TRIANGLES, platCube.indices.length, gl.UNSIGNED_SHORT,0);
		ftopVec[2] *= -1;
	}
	
	let splatScaleVec = [.15,platHgt,platDpth +.34]
	let stopVec = [-1.07,2.5,0.0];
	for(let splats = 0; splats < 2 ; splats++){
		let splatMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(splatMatrix,splatMatrix, stopVec);
		glMatrix.mat4.scale(splatMatrix, splatMatrix, splatScaleVec);
		gl.uniformMatrix4fv(gouraudShader.uModelT, false, splatMatrix);
		gl.bindVertexArray(platCube.VAO);
		gl.drawElements(gl.TRIANGLES, platCube.indices.length, gl.UNSIGNED_SHORT,0);
		stopVec[0] *= -1;
	}
	
	let lBound = 1.23;
	let mEntry = 1.94;
	let mExit = 2.7;
	let rBound = 3.3;
	let scaffTranVec = [lBound,2.5,0];
	let xInc = .275;
	let yDec = -.05;
	let yAcc = 0;
	let scaffScaleVec = [ .175, .05, .5];
	let lineRad = radians(90); //rotate Z
	let dipRad = radians(-15); //135
	let endRad = radians(30);
	let dipTranVec = [0, yDec, 0];
	for(; lBound < rBound ; lBound += xInc){
		//set up color for brown scaffold cubes
		scaffTranVec[0] = lBound;
		setUpPhong(gouraudShader,[0.350, 0.211, 0.112],[0.520, 0.256, 0.0676],
		[0.2], [0.1],[.7],[1]);
		let scaffMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(scaffMatrix,scaffMatrix, scaffTranVec);
		if(lBound >=mEntry && lBound < mExit){
			//glMatrix.mat4.translate(scaffMatrix,scaffMatrix,[0,-.02,0]);
			if( lBound > mEntry + xInc && lBound < mExit){
				glMatrix.mat4.translate(scaffMatrix,scaffMatrix,dipTranVec);
				scaffTranVec[1] += dipTranVec[1]; //make it level
				yAcc += yDec; //need a way to adjust both simply negate and multiply by 2 tp readjust for opposite
			}
			glMatrix.mat4.rotateZ(scaffMatrix, scaffMatrix,dipRad);
		}
		//we wamt the unequal railings of the reference
			glMatrix.mat4.scale(scaffMatrix, scaffMatrix, scaffScaleVec);
			gl.uniformMatrix4fv(gouraudShader.uModelT, false, scaffMatrix);
			gl.bindVertexArray(scaffCube.VAO);
			gl.drawElements(gl.TRIANGLES, scaffCube.indices.length, gl.UNSIGNED_SHORT,0);
			if(lBound < mExit){
				//do opposite rail cube
				scaffTranVec[0] *= -1;
				scaffTranVec[1] += (-yAcc * 2); //to adjust slanted up railings opposite of slanted down ones
				dipTranVec[1] *= -1;
				scaffMatrix = glMatrix.mat4.create();
				glMatrix.mat4.translate(scaffMatrix,scaffMatrix, scaffTranVec);
				if(lBound >=mEntry && lBound < mExit){
					//if( lBound > 1.94 + xInc && lBound < 2.7){
					//	glMatrix.mat4.translate(scaffMatrix,scaffMatrix,dipTranVec);
					//}
					glMatrix.mat4.rotateZ(scaffMatrix, scaffMatrix, dipRad);
				}
				glMatrix.mat4.scale(scaffMatrix, scaffMatrix, scaffScaleVec);
				gl.uniformMatrix4fv(gouraudShader.uModelT, false, scaffMatrix);
				gl.bindVertexArray(scaffCube.VAO);
				gl.drawElements(gl.TRIANGLES, scaffCube.indices.length, gl.UNSIGNED_SHORT,0);
				scaffTranVec[0] *= -1;
				scaffTranVec[1] += (yAcc * 2);
				dipTranVec[1] *= -1;
			}
	}
	//make railing cyls
	lBound = 1.23;
	let railTranVec = [lBound,2.5,0.3];
	xInc = .275;
	yAcc = 0;
	let railsScaleVec = [.1, xInc, .1];
	let trailsScaleVec = [.1, xInc * 3, .1]; //for trailing rails
	lineRad = radians(90); //rotate Z
	dipRad = radians(-15); //135
	endRad = radians(30);
	dipTranVec = [0, yDec, 0];
	//to get opposite z, set up a matrix with the z coord being negative
	for(; lBound < rBound ; lBound += xInc){
		//set up color for brown railsold cubes
		railTranVec[0] = lBound;
		setUpPhong(gouraudShader,[0.490, 0.171, 0.00],[0.870, 0.310, 0.00870],
		[0.7], [0.2],[.1],[10]);
		let railsMatrix = glMatrix.mat4.create();
		let paraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(railsMatrix,railsMatrix, railTranVec);
		//do same for parallel rail and revert
		railTranVec[2] *= -1;
		glMatrix.mat4.translate(paraMatrix,paraMatrix, railTranVec);
		railTranVec[2] *= -1;
		if(lBound >=mEntry && lBound < 2.7){
			//glMatrix.mat4.translate(railsMatrix,railsMatrix,[0,-.02,0]);
			if( lBound > mEntry + xInc && lBound < 2.7){
				glMatrix.mat4.translate(railsMatrix,railsMatrix,dipTranVec);
				glMatrix.mat4.translate(paraMatrix,paraMatrix,dipTranVec); //ditto for para
				railTranVec[1] += dipTranVec[1]; //make it level
				yAcc += yDec; //need a way to adjust both simply negate and multiply by 2 tp readjust for opposite
			}
			glMatrix.mat4.rotateZ(railsMatrix, railsMatrix,dipRad + lineRad);
			glMatrix.mat4.rotateZ(paraMatrix, paraMatrix,dipRad + lineRad);
		}else{
			glMatrix.mat4.rotateZ(railsMatrix, railsMatrix,lineRad);
			glMatrix.mat4.rotateZ(paraMatrix, paraMatrix,lineRad);
		}
		//we wamt the unequal railings of the reference
			glMatrix.mat4.scale(railsMatrix, railsMatrix, railsScaleVec);
			gl.uniformMatrix4fv(gouraudShader.uModelT, false, railsMatrix);
			gl.bindVertexArray(scaffCyl.VAO);
			gl.drawElements(gl.TRIANGLES, scaffCyl.indices.length, gl.UNSIGNED_SHORT,0);
		// ditto for para
			glMatrix.mat4.scale(paraMatrix, paraMatrix, railsScaleVec);
			gl.uniformMatrix4fv(gouraudShader.uModelT, false, paraMatrix);
			gl.bindVertexArray(scaffCyl.VAO);
			gl.drawElements(gl.TRIANGLES, scaffCyl.indices.length, gl.UNSIGNED_SHORT,0);
			if(lBound + xInc >= rBound){
				//draw the trail rails for this side
				//transform both by x step
				railTranVec[0] += xInc;
				railsMatrix = glMatrix.mat4.create();
				paraMatrix = glMatrix.mat4.create();
				glMatrix.mat4.translate(railsMatrix,railsMatrix, railTranVec);
				glMatrix.mat4.translate(railsMatrix,railsMatrix,dipTranVec);
				glMatrix.mat4.translate(paraMatrix,paraMatrix,dipTranVec); //ditto for para
				//do same for parallel rail and revert
				railTranVec[2] *= -1;
				glMatrix.mat4.translate(paraMatrix,paraMatrix, railTranVec);
				railTranVec[2] *= -1;
				glMatrix.mat4.rotateZ(railsMatrix, railsMatrix,dipRad + lineRad);
				glMatrix.mat4.rotateZ(paraMatrix, paraMatrix,dipRad + lineRad); //ditto
				//scale and draw
				glMatrix.mat4.scale(railsMatrix, railsMatrix, trailsScaleVec);
				gl.uniformMatrix4fv(gouraudShader.uModelT, false, railsMatrix);
				gl.bindVertexArray(scaffCyl.VAO);
				gl.drawElements(gl.TRIANGLES, scaffCyl.indices.length, gl.UNSIGNED_SHORT,0);
				//ditto for para
				glMatrix.mat4.scale(paraMatrix, paraMatrix, trailsScaleVec);
				gl.uniformMatrix4fv(gouraudShader.uModelT, false, paraMatrix);
				gl.bindVertexArray(scaffCyl.VAO);
				gl.drawElements(gl.TRIANGLES, scaffCyl.indices.length, gl.UNSIGNED_SHORT,0);
				//revert rail adjustments
				railTranVec[0] -= xInc;
			}
			
//drawing opposite x coord-rails
			if(lBound < mExit){
				//do opposite rail cube
				railTranVec[0] *= -1;
				railTranVec[1] += (-yAcc * 2); //to adjust slanted up railings opposite of slanted down ones
				dipTranVec[1] *= -1;
				railsMatrix = glMatrix.mat4.create();
				paraMatrix = glMatrix.mat4.create();
				glMatrix.mat4.translate(railsMatrix,railsMatrix, railTranVec);
				//do same for parallel rail and revert
				railTranVec[2] *= -1;
				glMatrix.mat4.translate(paraMatrix,paraMatrix, railTranVec);
				railTranVec[2] *= -1;
				if(lBound >=mEntry && lBound < mExit){

					glMatrix.mat4.rotateZ(railsMatrix, railsMatrix, dipRad + lineRad);
					glMatrix.mat4.rotateZ(paraMatrix, paraMatrix,dipRad + lineRad);

				}else{
					glMatrix.mat4.rotateZ(railsMatrix, railsMatrix,lineRad);
					glMatrix.mat4.rotateZ(paraMatrix, paraMatrix,lineRad); //ditto
				}
				glMatrix.mat4.scale(railsMatrix, railsMatrix, railsScaleVec);
				gl.uniformMatrix4fv(gouraudShader.uModelT, false, railsMatrix);
				gl.bindVertexArray(scaffCyl.VAO);
				gl.drawElements(gl.TRIANGLES, scaffCyl.indices.length, gl.UNSIGNED_SHORT,0);
				//ditto for para
				glMatrix.mat4.scale(paraMatrix, paraMatrix, railsScaleVec);
				gl.uniformMatrix4fv(gouraudShader.uModelT, false, paraMatrix);
				gl.bindVertexArray(scaffCyl.VAO);
				gl.drawElements(gl.TRIANGLES, scaffCyl.indices.length, gl.UNSIGNED_SHORT,0);
				if(lBound + xInc >= mExit){
					//draw the trail rails for this side
					//transform both by x step
					railTranVec[0] -= xInc;
					railsMatrix = glMatrix.mat4.create();
					paraMatrix = glMatrix.mat4.create();
					glMatrix.mat4.translate(railsMatrix,railsMatrix, railTranVec);
					glMatrix.mat4.translate(railsMatrix,railsMatrix,dipTranVec);
					glMatrix.mat4.translate(paraMatrix,paraMatrix,dipTranVec); //ditto for para
					//do same for parallel rail and revert
					railTranVec[2] *= -1;
					glMatrix.mat4.translate(paraMatrix,paraMatrix, railTranVec);
					railTranVec[2] *= -1;
					glMatrix.mat4.rotateZ(railsMatrix, railsMatrix,dipRad + lineRad);
					glMatrix.mat4.rotateZ(paraMatrix, paraMatrix,dipRad + lineRad); //ditto
					//scale and draw
					glMatrix.mat4.scale(railsMatrix, railsMatrix, trailsScaleVec);
					gl.uniformMatrix4fv(gouraudShader.uModelT, false, railsMatrix);
					gl.bindVertexArray(scaffCyl.VAO);
					gl.drawElements(gl.TRIANGLES, scaffCyl.indices.length, gl.UNSIGNED_SHORT,0);
					//ditto for para
					glMatrix.mat4.scale(paraMatrix, paraMatrix, trailsScaleVec);
					gl.uniformMatrix4fv(gouraudShader.uModelT, false, paraMatrix);
					gl.bindVertexArray(scaffCyl.VAO);
					gl.drawElements(gl.TRIANGLES, scaffCyl.indices.length, gl.UNSIGNED_SHORT,0);
					//revert rail adjustments
					railTranVec[0] += xInc;
				}
				//revert
				railTranVec[0] *= -1;
				railTranVec[1] += (yAcc * 2);
				dipTranVec[1] *= -1;
		}
	}
	setUpPhong(gouraudShader,[0.602, 0.697, 0.860],[0.155, 0.413, 0.860],[0.65], [0.2],[.3],[1]);
	//bounds for the resultant triangle

	let triScaleVec = [.3,1.0,1.0];
	let triTranVec = [3.8, 4.0, 0];
	let tzRot = radians(-30);
	let tyRot = radians(0);
	//settled for the best I could do with one cube since I couldn't get a double for loop to draw
	for(let tris = 0; tris < 2; tris++){
		//draw blue cube along x-axis
		let triMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(triMatrix,triMatrix, triTranVec);
		glMatrix.mat4.scale(triMatrix,triMatrix, triScaleVec);
		glMatrix.mat4.rotateZ(triMatrix,triMatrix, tzRot);
		glMatrix.mat4.rotateY(triMatrix,triMatrix, tyRot);
		gl.uniformMatrix4fv(gouraudShader.uModelT, false, triMatrix);
		gl.bindVertexArray(triangleCubes.VAO);
		gl.drawElements(gl.TRIANGLES, triangleCubes.indices.length, gl.UNSIGNED_SHORT,0);
		//set up for opposite triangle
		triTranVec[0] *= -1;
		tzRot *= -1;
	}
	
	//draw the bumper sphere
	gl.useProgram(textureShader);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, bumperTexture);
	gl.uniform1i(textureShader.uTheTexture,0); //clear the textures from before
	gl.uniform1i(textureShader.textureType, 0); // 0 for image
	let bumperTranVec = [bumperX,bumperY,0];
	let bumperScaleVec = [0.35,0.35,0.35];
	let bumperMatrix = glMatrix.mat4.create();
	let bumpyRot = radians(180);
	glMatrix.mat4.translate(bumperMatrix, bumperMatrix, bumperTranVec);
	glMatrix.mat4.scale(bumperMatrix,bumperMatrix,bumperScaleVec);
	glMatrix.mat4.rotateY(bumperMatrix, bumperMatrix, bumpyRot);
	gl.uniformMatrix4fv (textureShader.uModelT, false, bumperMatrix);
	gl.bindVertexArray(bumperSphere.VAO);
	gl.drawElements(gl.TRIANGLES, bumperSphere.indices.length, gl.UNSIGNED_SHORT, 0);
	
	//bottom birdge
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, bridgeTexture);
	gl.uniform1i(textureShader.uTheTexture,0); //clear the textures from before
	gl.uniform1i(textureShader.textureType, 0); // 0 for image
	
	let bridgeMatrix = glMatrix.mat4.create(); 
	glMatrix.mat4.translate(bridgeMatrix, bridgeMatrix, [bridgeXCoord,-.7,0]);
	glMatrix.mat4.scale(bridgeMatrix,bridgeMatrix,[10.75,.50,1.5]);
	gl.uniformMatrix4fv (textureShader.uModelT, false, bridgeMatrix);
	gl.bindVertexArray(bridgeCube.VAO);
	gl.drawElements(gl.TRIANGLES, bridgeCube.indices.length, gl.UNSIGNED_SHORT, 0);
}

//
//Draws the bottom decorations
//
function drawBottomDecor(){
	gl.useProgram(textureShader);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, castleBaseTexture);
	gl.uniform1i(textureShader.uTheTexture,0); //clear the textures from before
	gl.uniform1i(textureShader.textureType, 0); // 0 for image
	
	let casZCoord = -1.65;
	let castleBaseMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(castleBaseMatrix,castleBaseMatrix, [0.0,2.05,casZCoord]);
	glMatrix.mat4.scale(castleBaseMatrix,castleBaseMatrix,[1.25,2.75,1.0]);
	glMatrix.mat4.rotateY(castleBaseMatrix,castleBaseMatrix, radians(85));
	gl.uniformMatrix4fv (textureShader.uModelT, false, castleBaseMatrix);
	gl.bindVertexArray(castleCyl.VAO);
	gl.drawElements(gl.TRIANGLES, castleCyl.indices.length, gl.UNSIGNED_SHORT, 0);

//castle cone 
	gl.bindTexture (gl.TEXTURE_2D, castleTopTexture);
	let casTopCylMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(casTopCylMatrix,casTopCylMatrix, [0.0,3.45,casZCoord]);
	glMatrix.mat4.scale(casTopCylMatrix,casTopCylMatrix,[2.0,.25,1.25]);
	glMatrix.mat4.rotateX(casTopCylMatrix,casTopCylMatrix, radians(180));
	gl.uniformMatrix4fv (textureShader.uModelT, false, casTopCylMatrix);
	gl.bindVertexArray(castleTopCyl.VAO);
	gl.drawElements(gl.TRIANGLES, castleTopCyl.indices.length, gl.UNSIGNED_SHORT, 0);
	
	let casTopMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(casTopMatrix,casTopMatrix, [0.0,4.60,casZCoord]);
	glMatrix.mat4.scale(casTopMatrix,casTopMatrix,[1.25,2.00,1.25]);
	gl.uniformMatrix4fv (textureShader.uModelT, false, casTopMatrix);
	gl.bindVertexArray(castleCone.VAO);
	gl.drawElements(gl.TRIANGLES, castleCone.indices.length, gl.UNSIGNED_SHORT, 0);

	gl.useProgram(gouraudShader);
	
	//draw the treeCyl before soil since it's birch
	let treeZCoord = -1.50;
	let treeXCoord = -1.15;
	let treeTranslate = [treeXCoord,.60,treeZCoord];
	let leavesTranslate = [treeXCoord,1.27,treeZCoord];
	for(let trees = 0; trees < 2; trees++){
		setUpPhong(gouraudShader,[0.330, 0.257, 0.257],[0.450, 0.297, 0.297],
		[0.7], [0.2],[.1],[10]); //make soil brown
		let soilMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(soilMatrix,soilMatrix, treeTranslate);
		glMatrix.mat4.scale(soilMatrix,soilMatrix,[.50,.10,0.5]);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, soilMatrix);
		gl.bindVertexArray(soilCube.VAO);
		gl.drawElements(gl.TRIANGLES, soilCube.indices.length, gl.UNSIGNED_SHORT, 0);
		//for tree stems
		setUpPhong(gouraudShader,[0.910, 0.873, 0.664],[0.910, 0.873, 0.664],
		[0.6], [0.3],[.1],[20]);
		let woodMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(woodMatrix,woodMatrix, treeTranslate);
		glMatrix.mat4.scale(woodMatrix,woodMatrix,[.1,1.10,0.1]);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, woodMatrix);
		gl.bindVertexArray(woodCyl.VAO);
		gl.drawElements(gl.TRIANGLES, woodCyl.indices.length, gl.UNSIGNED_SHORT, 0);
		//inner for loop for drawing leaves
		//leaves
		setUpPhong(gouraudShader,[0.140, 0.390, 0.174],[0.169, 0.770, 0.249],
			[0.6], [0.3],[.1],[20]);
		let leavesMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(leavesMatrix,leavesMatrix, leavesTranslate);
		glMatrix.mat4.scale(leavesMatrix,leavesMatrix,[0.75,0.75,0.75]);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, leavesMatrix);
		gl.bindVertexArray(treeCone.VAO);
		gl.drawElements(gl.TRIANGLES, treeCone.indices.length, gl.UNSIGNED_SHORT, 0);
		treeTranslate[0] *= -1; // draw opposite soil
		leavesTranslate[0] *= -1;
	}
	//draw the back base wood rails
	setUpPhong(gouraudShader,[0.800, 0.536, 0.456],[0.910, 0.575, 0.473],
		[0.6], [0.3],[.1],[20]);
	let baseRailScale = [0.15,.80,0.15];
	let railTranslate = [-2.15,1.00,-1.15];
	let railStepZ = -.35;
	let railStepX = -railStepZ;
	for(let backCyls = 0; backCyls < 3; backCyls++){
		let railMatrix = glMatrix.mat4.create();
		
		glMatrix.mat4.translate(railMatrix,railMatrix, railTranslate);
		glMatrix.mat4.scale(railMatrix,railMatrix,baseRailScale);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, railMatrix);
		gl.bindVertexArray(railCyl.VAO);
		gl.drawElements(gl.TRIANGLES, railCyl.indices.length, gl.UNSIGNED_SHORT, 0);

		//opposite X position
		railTranslate[0] *= -1; 
		railMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(railMatrix,railMatrix, railTranslate);
		glMatrix.mat4.scale(railMatrix,railMatrix,baseRailScale);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, railMatrix);
		gl.bindVertexArray(railCyl.VAO);
		gl.drawElements(gl.TRIANGLES, railCyl.indices.length, gl.UNSIGNED_SHORT, 0);
		railTranslate[0] *= -1; //back to normal
		//opposite Z position
		railTranslate[2] += railStepZ;
		railTranslate[0] += railStepX;
	}
//draw the back tilted rails
	let topRailScale = [0.15,1.50,0.15];
	let topRailTranslate = [-1.85,1.44,-1.5];
	let trX = radians(90);
	let trY = radians(-135); //-135
	for (let anglCyls = 0; anglCyls < 2; anglCyls++){
		let railMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(railMatrix,railMatrix, topRailTranslate);
		glMatrix.mat4.rotateX(railMatrix,railMatrix, trX);
		glMatrix.mat4.rotateZ(railMatrix,railMatrix, trY);
		glMatrix.mat4.scale(railMatrix,railMatrix,topRailScale);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, railMatrix);
		gl.bindVertexArray(railCyl.VAO);
		gl.drawElements(gl.TRIANGLES, railCyl.indices.length, gl.UNSIGNED_SHORT, 0);
		topRailTranslate[0] *= -1;
		trY *= -1;
	}
//draw front base rails
	baseRailScale = [0.15,.20,0.15];
	railTranslate = [-2.15,.70,1.15];
	railStepZ *= -1;
	railStepX = railStepZ;
	for(let frontCyls = 0; frontCyls < 3; frontCyls++){
		let railMatrix = glMatrix.mat4.create();
		
		glMatrix.mat4.translate(railMatrix,railMatrix, railTranslate);
		glMatrix.mat4.scale(railMatrix,railMatrix,baseRailScale);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, railMatrix);
		gl.bindVertexArray(railCyl.VAO);
		gl.drawElements(gl.TRIANGLES, railCyl.indices.length, gl.UNSIGNED_SHORT, 0);

		//opposite X position
		railTranslate[0] *= -1; 
		railMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(railMatrix,railMatrix, railTranslate);
		glMatrix.mat4.scale(railMatrix,railMatrix,baseRailScale);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, railMatrix);
		gl.bindVertexArray(railCyl.VAO);
		gl.drawElements(gl.TRIANGLES, railCyl.indices.length, gl.UNSIGNED_SHORT, 0);
		railTranslate[0] *= -1; //back to normal
		//opposite Z position
		railTranslate[2] += railStepZ;
		railTranslate[0] += railStepX;
	}
	//undo last z loop inc
	railTranslate[0] += .07;
	railStepX += .07;
	railTranslate[2] -= railStepZ;
	for(let alignedCyls = 0; alignedCyls < 6; alignedCyls++){
		let railMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(railMatrix,railMatrix, railTranslate);
		glMatrix.mat4.scale(railMatrix,railMatrix,baseRailScale);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, railMatrix);
		gl.bindVertexArray(railCyl.VAO);
		gl.drawElements(gl.TRIANGLES, railCyl.indices.length, gl.UNSIGNED_SHORT, 0);
		railTranslate[0] += railStepX;
	}
//draw front rail cylinders
	topRailScale = [0.15,1.35,0.15];
	topRailTranslate = [-1.85,.87,1.5];
	trX = radians(-90);
	trY = radians(-135); //-135
	for(let fanglCyls = 0; fanglCyls < 2; fanglCyls++){
		let railMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(railMatrix,railMatrix, topRailTranslate);
		glMatrix.mat4.rotateX(railMatrix,railMatrix, trX);
		glMatrix.mat4.rotateZ(railMatrix,railMatrix, trY);
		glMatrix.mat4.scale(railMatrix,railMatrix,topRailScale);
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, railMatrix);
		gl.bindVertexArray(railCyl.VAO);
		gl.drawElements(gl.TRIANGLES, railCyl.indices.length, gl.UNSIGNED_SHORT, 0);
		topRailTranslate[0] *= -1;
		trX *= -1;
	}
//draw front center rail
	let trZ = radians(90);
	topRailScale = [0.15,2.75,0.15];
	topRailTranslate = [0,.87,1.92];
	let railMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(railMatrix,railMatrix, topRailTranslate);
	glMatrix.mat4.rotateZ(railMatrix,railMatrix, trZ);
	glMatrix.mat4.scale(railMatrix,railMatrix,topRailScale);
	gl.uniformMatrix4fv (gouraudShader.uModelT, false, railMatrix);
	gl.bindVertexArray(railCyl.VAO);
	gl.drawElements(gl.TRIANGLES, railCyl.indices.length, gl.UNSIGNED_SHORT, 0);
	
//somewhat brownish-orange for sign
	setUpPhong(gouraudShader,[0.680, 0.369, 0.224],[0.680, 0.369, 0.224],
	[0.6], [0.3],[.1],[20]);
//sign cube
	let signMatrix = glMatrix.mat4.create();
	let signTranslateVec = [.7,.95,-1.10]; //slightly to right and in front of castle
	glMatrix.mat4.translate(signMatrix,signMatrix, signTranslateVec);
	glMatrix.mat4.scale(signMatrix,signMatrix,[.25,.25,.25]);
	gl.uniformMatrix4fv (gouraudShader.uModelT, false, signMatrix);
	gl.bindVertexArray(signCube.VAO);
	gl.drawElements(gl.TRIANGLES, signCube.indices.length, gl.UNSIGNED_SHORT, 0);
//sign post
	signTranslateVec = [.7,.9,-1.10]
	signMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(signMatrix,signMatrix, signTranslateVec);
	glMatrix.mat4.scale(signMatrix,signMatrix,[.1,.5,.1]);
	gl.uniformMatrix4fv (gouraudShader.uModelT, false, signMatrix);
	gl.bindVertexArray(signCyl.VAO);
	gl.drawElements(gl.TRIANGLES, signCyl.indices.length, gl.UNSIGNED_SHORT, 0);
}

//
// Draw all the foundation pieces minus the bridge
//
function drawFoundation(){
	gl.useProgram(gouraudShader);
		
	//x rotation controls up and down, y does left to right, z goes clockwise
	//arena cylinder 
	setUpPhong(gouraudShader,[0.430, 0.226, 0.1162],[0.630, 0.356, 0.208],
	[0.5], [0.4],[.1],[10]);
	let arenaMatrix = glMatrix.mat4.create();
	glMatrix.mat4.scale(arenaMatrix,arenaMatrix,[5.0, .75, 5.0])
	glMatrix.mat4.rotateY(arenaMatrix,arenaMatrix,radians(68));
	gl.uniformMatrix4fv (gouraudShader.uModelT, false, arenaMatrix);
	gl.bindVertexArray(arenaCyl.VAO);
	gl.drawElements(gl.TRIANGLES, arenaCyl.indices.length, gl.UNSIGNED_SHORT, 0);
	
//stair cubes
	//all middle cubes going to be 0.5 up amd 0.0 close
	let cubeStartTranslateVec = [2.25, 0.5, 0];
	let cubeOppTranslateVec = [-2.25, 0.5, 0];
	let stairScaleVec = [.345, .15, 2.25]
	//setup phong for stairs once
	setUpPhong(gouraudShader,[0.820, 0.123, 0.123],[0.820, 0.123, 0.123],
	[0.7], [0.2],[.1],[200]);
	//for each of the 3 stairs,
	// and translate right by (n-1) * .25, draw
	// to draw corresponding opposite stair, repeat above, except for negative x coord
	for(let sNum = 0; sNum < 3; sNum++){
		let stairMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(stairMatrix, stairMatrix, cubeStartTranslateVec);
		glMatrix.mat4.scale(stairMatrix,stairMatrix,stairScaleVec);

		gl.uniformMatrix4fv (gouraudShader.uModelT, false, stairMatrix);
		gl.bindVertexArray(stairCube.VAO);
		gl.drawElements(gl.TRIANGLES, stairCube.indices.length, gl.UNSIGNED_SHORT, 0);
		// figure out how to get opposite stair and put in loop
		let oppstairMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(oppstairMatrix, oppstairMatrix, cubeOppTranslateVec);
		glMatrix.mat4.scale(oppstairMatrix,oppstairMatrix,stairScaleVec);
		
		gl.uniformMatrix4fv (gouraudShader.uModelT, false, oppstairMatrix);
		gl.bindVertexArray(stairCube.VAO);
		gl.drawElements(gl.TRIANGLES, stairCube.indices.length, gl.UNSIGNED_SHORT, 0);

		cubeStartTranslateVec[0]-= .345;	//move towards center
		cubeOppTranslateVec[0] += .345;	//opposite of start
		stairScaleVec[1] += .05;		//scale y (+.05)) 
	}
	
//center checker cube... change to textureProgram
	gl.useProgram(textureShader);
	gl.activeTexture(gl.TEXTURE1);
	gl.uniform1i(textureShader.uTheTexture,1); //clear the textures from before
	gl.uniform1i(textureShader.textureType, 1); // 1 for procedural texture
	
	let checkerMatrix = glMatrix.mat4.create(); 
	glMatrix.mat4.translate(checkerMatrix, checkerMatrix, [0,0.5,0]);
	glMatrix.mat4.scale(checkerMatrix,checkerMatrix,[2.85,.25,2.25]);
	gl.uniformMatrix4fv (textureShader.uModelT, false, checkerMatrix);
	gl.bindVertexArray(checkerCube.VAO);
	gl.drawElements(gl.TRIANGLES, checkerCube.indices.length, gl.UNSIGNED_SHORT, 0);
	
// the foundation below the arena
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture (gl.TEXTURE_2D, bridgeTexture);
	gl.uniform1i(textureShader.uTheTexture,0); //clear the textures from before
	gl.uniform1i(textureShader.textureType, 0); // 0 for image
	
	let foundMatrix = glMatrix.mat4.create(); 
	glMatrix.mat4.translate(foundMatrix, foundMatrix, [0,-.88,0]);
	glMatrix.mat4.scale(foundMatrix,foundMatrix,[1.75,1.00,5.0]);
	gl.uniformMatrix4fv (textureShader.uModelT, false, foundMatrix);
	gl.bindVertexArray(foundationCube.VAO);
	gl.drawElements(gl.TRIANGLES, foundationCube.indices.length, gl.UNSIGNED_SHORT, 0);
	
//TODO revert to old texture		
	let screwTranslateVec = [0,-.6,2.65];
	for(let screws = 0; screws < 2; screws++){
		let screwMatrix = glMatrix.mat4.create(); 
		glMatrix.mat4.translate(screwMatrix, screwMatrix, screwTranslateVec);
		glMatrix.mat4.rotateX(screwMatrix,screwMatrix,radians(80.0));
		glMatrix.mat4.rotateY(screwMatrix,screwMatrix,radians(18.0));
		glMatrix.mat4.rotateY(screwMatrix,screwMatrix,screwAngle);
		glMatrix.mat4.scale(screwMatrix,screwMatrix,[.75,.25,.75]);
		gl.uniformMatrix4fv (textureShader.uModelT, false, screwMatrix);
		gl.bindVertexArray(screwCyl.VAO);
		gl.drawElements(gl.TRIANGLES, screwCyl.indices.length, gl.UNSIGNED_SHORT, 0);
		screwTranslateVec[2] *= -1;
	}
	
//border cubes, opposite z-coords
	gl.useProgram(gouraudShader);
	//setup phong for birch corders once
	setUpPhong(gouraudShader,[0.910, 0.873, 0.664],[0.910, 0.873, 0.664],
	[0.6], [0.3],[.1],[20]);
	// [1.80,.25,1.17]-- scaling vector in case I find a way to make right triangles
	let borderScaleVec = [5.00,.25,1.17]
	let borderMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(borderMatrix,borderMatrix, [0,0.5,-1.71]);
	glMatrix.mat4.scale(borderMatrix, borderMatrix, borderScaleVec);
	gl.uniformMatrix4fv(gouraudShader.uModelT, false, borderMatrix);
	gl.bindVertexArray(borderCube.VAO);
	gl.drawElements(gl.TRIANGLES, borderCube.indices.length, gl.UNSIGNED_SHORT,0);
	//for the opposite border
	borderMatrix = glMatrix.mat4.create();
	glMatrix.mat4.translate(borderMatrix,borderMatrix, [0,0.5, 1.71]);
	glMatrix.mat4.scale(borderMatrix, borderMatrix, borderScaleVec);
	gl.uniformMatrix4fv(gouraudShader.uModelT, false, borderMatrix);
	gl.uniformMatrix4fv(gouraudShader.uModelT, false, borderMatrix);
	gl.bindVertexArray(borderCube.VAO);
	gl.drawElements(gl.TRIANGLES, borderCube.indices.length, gl.UNSIGNED_SHORT,0);
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
	program.uModelT = gl.getUniformLocation (program, 'modelT');
    program.uViewT = gl.getUniformLocation (program, 'viewT');
    program.uProjT = gl.getUniformLocation (program, 'projT');

	// uniforms - you will need to add references for any additional
	// uniforms that you add to your shaders
	program.uTheTexture = gl.getUniformLocation (program, 'theTexture');
	program.uTheta = gl.getUniformLocation (program, 'theta');
	program.textureType = gl.getUniformLocation (program, 'textureType');  
  }


  // creates a VAO and returns its ID
  function bindVAO (shape, program) {
	  gl.useProgram (program);
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
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    gl.clearColor(0, 0, 0, 0); //set to 1 for black, 0 for transparent
      
    // some GL initialization
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.0,0.0,0.0,0.0) //set to 1 for black, 0 for transparent
    gl.depthFunc(gl.LEQUAL)
    gl.clearDepth(1.0)

    // Read, compile, and link your shaders
    initPrograms();
	
	//set up textures
	setUpTextures()
	
	//set up the camera
	setUpCamera(gouraudShader);
    setUpCamera(textureShader);
    // create and bind your current object
    createShapes();
    
    // do a draw
    draw(); //problem in draw...
  }
