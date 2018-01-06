export class App {
  constructor () {
    this.canvas = document.getElementById('webgl2');
    this.gl = this.canvas.getContext('webgl2');
    if (!this.gl) {
      throw 'WebGL2 is not available';
    }

    this.loadGLSL('basic')
    .then((glslData) => {
      let vertexShaderSource = glslData.vert;
      let fragmentShaderSource = glslData.frag;

      let vertexShader = this.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
      let fragmentShader = this.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
      let program = this.createProgram(this.gl, vertexShader, fragmentShader);

      let positionAttributeLocation = this.gl.getAttribLocation(program, 'a_position');
      let positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

      // three 2d points
      let positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
      ];

      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
      let vao = this.gl.createVertexArray();
      this.gl.bindVertexArray(vao);
      this.gl.enableVertexAttribArray(positionAttributeLocation);

      let size = 2;          // 2 components per iteration
      let type = this.gl.FLOAT;   // the data is 32bit floats
      let normalize = false; // don't normalize the data
      let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      let offset = 0;        // start at the beginning of the buffer

      this.gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
      webglUtils.resizeCanvasToDisplaySize(this.gl.canvas);
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      // Clear the canvas
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.useProgram(program);

      this.gl.bindVertexArray(vao);

      let primitiveType = this.gl.TRIANGLES;
      let drawOffset = 0;
      let count = 3;
      this.gl.drawArrays(primitiveType, drawOffset, count);
    });
  }

  createShader (gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  loadGLSL (animationName) {
    let vert = fetch(`/webgl2/${animationName}.vert`).then(response => response.text());
    let frag = fetch(`/webgl2/${animationName}.frag`).then(response => response.text());

    return Promise.all([vert, frag]).then((code) => {
      return {
        vert: code[0],
        frag: code[1]
      }
    });
  }
}

new App();