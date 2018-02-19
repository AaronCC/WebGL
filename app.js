!function() {
  'use strict'
 
/* 
	** NOTE **
	This variation uses edge-wrapping for neighbor
	calculations (two nodes on directly opposite sides
	may be counted as neighbors).
*/

  // An integer rectangle
  function intRect(x,y,w,h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
  };
  
  // A single node
  function node(x,y,posX,posY,width,height,state) {
	this.alive = state;
	this.rect = new intRect(posX,posY,width,height);
	this.x = x;
	this.y = y;
	this.nextGen = false; // The next state		this.gl.texParameteri(gl.TEXTURE2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR )
	this.draw = function(ctx) {
		if(this.alive == true)
		{
			ctx.fillStyle = 'white';
		}
		else
		{
			ctx.fillStyle = 'black';
		}
		ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
	};
	// Returns the state of this node after this generation
	this.newState = function(neighbors) {
		let i = 0;
		for(var n = 0; n < neighbors.length; n++)
		{
			if(neighbors[n] != undefined) {

				if(neighbors[n].alive == true) 
				{ i++ };
			
			}
		}
		if(i == 3 && this.alive == false) 
		{ return true; }

		else if(this.alive == false) 
		{ return false; }

		else if(i > 3 || i < 2) 
		{ return false; }

		else if(i == 2 || i == 3)
		{ return true; }

		return false;
	};
  };

  const app = {
    canvas: null,
	glCanvas: null,
	buffer: null,
	gl: null,
	vSource: null,
	fSource: null,
	vShader: null,
	fShader: null,
	program: null,
	texture: null,
    ctx: null,
	nodes: null,
	nodes_2: null,
 	arrSize: 30,
	nodeCount: 30*30,

	getTexture() {
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.canvas
		)
		this.gl.texParameteri(this.gl.TEXTURE2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR )
		this.gl.texParameteri(this.gl.TEXTURE2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR )
	},

	webglSetup() {
		this.gl.clearColor( 1.0, 1.0, 1.0, 1.0)
		this.gl.clear( this.gl.COLOR_BUFFER_BIT )
		this.gl.activeTexture( this.gl.TEXTURE0 )
	},

	// Returns the neighbors of a given node
    getNeighbors(ind) {
		let neighbors = new Array(8);
		let as = this.arrSize;
		if(ind-(as+1) >= 0) { neighbors[0] = this.nodes[ind-(as+1)] };
		if(ind-(as) >= 0) { neighbors[1] = this.nodes[ind-(as)] };
		if(ind-(as-1) >= 0) { neighbors[2] = this.nodes[ind-(as-1)] };
		if(ind-1 >= 0) { neighbors[3] = this.nodes[ind-1] };
		if(ind+1 <=  this.nodeCount) { neighbors[4] = this.nodes[ind+1] };
		if(ind+(as+1) <=  this.nodeCount) { neighbors[5] = this.nodes[ind+(as+1)] };
		if(ind+(as) <=  this.nodeCount) { neighbors[6] = this.nodes[ind+(as)] };
		if(ind+(as-1) <= this.nodeCount) { neighbors[7] = this.nodes[ind+(as-1)] };
		return neighbors;
	},
      
    init() {
      this.canvas = document.getElementById('texture')
      this.ctx = this.canvas.getContext( '2d' )
      this.draw = this.draw.bind( this )
	  this.render = this.render.bind( this )
	  this.webglSetup = this.webglSetup.bind( this )
	  this.getTexture = this.getTexture.bind( this )
	  this.nodes = new Array(this.nodeCount);
	  this.canvas.width = this.canvas.height = 256;  

	  this.glCanvas = document.getElementById('gl');
	  this.glCanvas.width = this.glCanvas.height = 256;
	  this.gl = this.glCanvas.getContext( 'webgl' )

	  this.gl.viewport( 0, 0, this.gl.drawingBufferWidth+2, this.gl.drawingBufferHeight+2 )
	  this.buffer = this.gl.createBuffer()

	  this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.buffer )

	  var triangles = new Float32Array( [
	  	-1, -1,
		1, -1,
		-1, 1,
		-1, 1,
		1, -1,
		1, 1
	  ]);
	   
	  this.gl.bufferData(this.gl.ARRAY_BUFFER, triangles, this.gl.STATIC_DRAW )

	  this.vSource = document.getElementById('vertex').text
	  this.vShader = this.gl.createShader( this.gl.VERTEX_SHADER )
	  this.gl.shaderSource( this.vShader, this.vSource );
	  this.gl.compileShader( this.vShader )

	  console.log(this.gl.getShaderInfoLog( this.vShader ))

	  this.fSource = document.getElementById('fragment').text
	  this.fShader = this.gl.createShader( this.gl.FRAGMENT_SHADER )
	  this.gl.shaderSource( this.fShader, this.fSource );
	  this.gl.compileShader( this.fShader )

	  console.log(this.gl.getShaderInfoLog( this.fShader ))

	  this.program = this.gl.createProgram()
	  this.gl.attachShader( this.program, this.vShader )
	  this.gl.attachShader( this.program, this.fShader )
	  this.gl.linkProgram( this.program )
	  this.gl.useProgram( this.program )


	  var position = this.gl.getAttribLocation( this.program, 'aPosition' )
	  this.gl.enableVertexAttribArray( position )
	  this.gl.vertexAttribPointer( position, 2, this.gl.FLOAT, false, 0, 0 )
	  this.program.textureCoordAttribute = this.gl.getAttribLocation(
	  	this.program,
		'aTextureCoord'
	  );
	  this.gl.enableVertexAttribArray( this.program.textureCoordAttribute );
	  this.gl.vertexAttribPointer(
	  	this.program.textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0
	  );
	  this.program.samplerUniform = this.gl.getUniformLocation( this.program, 'uSampler')
	  this.gl.uniform1i( this.program.samplerUniform, 0 )

	  this.texture = this.gl.createTexture()

	  // Init nodes
	  for(let i = 0; i < this.nodeCount; i++)
	  {
	  	let x = i % this.arrSize;
		let y = (i - x) / this.arrSize;
		let size = 20;
		this.nodes[i] = new node(x,y,x*size,y*size,size,size,Math.floor(Math.random()*2));
	  }

      this.fullScreenCanvas()
      
      window.onresize = this.fullScreenCanvas.bind( this )  
      
      requestAnimationFrame( this.render )
    },
    
    fullScreenCanvas() {
      this.canvas.width  = this.height = window.innerWidth
      this.canvas.height = this.width  = window.innerHeight
    },
    
    // update your simulation here
    animate() {

     for(let i = 0; i < this.nodes.length; i++)
	 {
	 	let neighbors = this.getNeighbors(i); // Get the neighbors
		// Calculate next generation
		this.nodes[i].nextGen = this.nodes[i].newState(neighbors);
	 }
	 for(let i = 0; i < this.nodes.length; i++)
	 {
	 	// Update nodes to next generation
	 	this.nodes[i].alive = this.nodes[i].nextGen;
	 }
	 	
    },
    
    draw() {
      //requestAnimationFrame( this.draw )
      this.animate()
      
      // draw to your canvas here
      this.ctx.fillStyle = 'red'
      this.ctx.fillRect( 0,0, this.canvas.width, this.canvas.height )

	  for(let i = 0; i < this.nodes.length; i++)
	  {
	  	// Draw each node
		this.nodes[i].draw(this.ctx);
	  }
    },

	render() {
		requestAnimationFrame( this.render, this.glCanvas ) 
		this.webglSetup()
		
		this.draw()

		this.getTexture()

		this.gl.drawArrays( gl.TRIANGLE, 0, 5 )

	}
  }
  
  window.onload = app.init.bind( app )
  
}()
