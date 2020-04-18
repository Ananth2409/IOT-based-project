
"use strict";
/**
 * Create whiteboard API
 */
var board=null;
var pencil_draw = false;
/** Currently holds the imagedata of the tabs */
var canvas_diagram = [];
var tab_size = 0;
var current_tab = 1;
/** Instance of Browser Class for defining browser */
var Browser = new Browser();
var erasor_state = false;
var lastcursor = null;
var shapeStrokeColor = "0,0,0";
var shapeFillColor = "0,0,255";
var shapeFillOpacity = "1";
var shapeStrokeWidth = "1";
var backgroundImage = null;
var backgroundShow = true;
var videoPlayer = null;
var PENTAGON_SIDES = 3;
var MOUSE_STATE = null;
var lastMove = null;
var removeGalleryElement = null;
//console.log('whiteboard js: ');
var selectedId=null;
var currentImage=null; 
var object_data=null;
var currentUrl=null;
var percentage=null;
var base_url = window.location.origin;
var shape = null;
var end_point=null;
var start_point=null;
var snapMonitor = [0,0];
var fig_dup;





/**LineArrow type
 * TODO: this should not be present here but retrieved from LineArrow object
 **/
var linearrowType = '';
/**Current selecte linearrow (-1 if none selected)*/
var selectedLineArrowId = -1;

/**Currently selected LineArrowPoint (if -1 none is selected)*/
var selectedLineArrowPointId = -1;
/* Cloud highlights 2 {LineArrowPoint}s whose are able to connect. */
var currentCloud = [];

var StopWatch = function() {

  var offset,
      clock,
      interval,time;

  // initialize
  

  // private functions
  function start() {
    reset();
    if (!interval) {
      offset   = Date.now();
      interval = setInterval(update, 1);
    }
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function reset() {
    clock = 0;
    time();
  }

  function update() {
    clock += delta();
    time();
  }

  function time() {
    return clock; 
  }

  function delta() {
    var now = Date.now(),
        d   = now - offset;

    offset = now;
    return d;
  }

  // public API
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.time = time;
};
// Closure
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();
var Timer = new StopWatch();
function Browser() {
    var N = navigator.appName.toLowerCase();
    var ua = navigator.userAgent.toLowerCase();
    var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    var temp = ua.match(/version\/([\.\d]+)/i);
    if(M && temp != null) {
        M[2]= temp[1];
    }
    M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];

    this.webkit = M[0].indexOf("chrome") > -1 || M[0].indexOf("safari") > -1;
    this.opera = M[0].indexOf("opera") > -1;
    this.msie = M[0].indexOf("msie") > -1;
    this.mozilla = M[0].indexOf("firefox") > -1;
    this.version = M[1];
}

function WHITEBOARD(){
    this.tagId = 'whiteboard';
    this.canvas_diagram = [];
    this.width = '960';
    this.height = '600';
    this.top = 100;
    this.bottom =110;
}
WHITEBOARD.hostURL = window.location.protocol + '//' + window.location.host+'/ce-static/whiteboard/';
WHITEBOARD.API_HOST = window.location.protocol + '//' + window.location.host+'/';
WHITEBOARD.debugSolutions = [];
WHITEBOARD.visualMagnet = true;
WHITEBOARD.rotateImage = new Image();
WHITEBOARD.rotateImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAATCAYAAACQjC21AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAXNJREFUeNqs1L9LVlEcBvDPfX0xaopMwZaGikYJIwmyzcXQuYQG1+BgTtGkm04J99RfEP3Ypam1jMKUxpDEVt9qFITSlq9wk+tL+r4PHJ57vvc5D+d+z7lPUZalI3ARdzGOyziPH/iGN3iN7ymlfxY1aoxO4wk2sIjbuIDe4NGob2Ap53ymnWE/3mMWPXiFSQygCJ6Meg8e4l3Oub9qOBfPvVjGNWziBqai1gpNK+ZT8X4z9Ms551PQxHyIz2IkRDexrT0+h+5DrFvEbFGW5X4I9mOMYNX/4zo+Yg9Xqj0son/HMZNSWo0Tb2L68KGMVnp6HDwPHqu7NvMnMP0SfLUZn9opfgafa+gO+oJ/dctwKPhrtwzvB78t2oRDx/fwJBiIO9jAs5TSVieGw1jBpdjho6PSZi1+wT94iYlKfA3G/AU+hdk6JlJKuwfhUEULt7CAB7gXow6/8RSPU0o7B8VmjXAHM1iKxL4TO6lL7K3Dif13AIeZW0TGx+CfAAAAAElFTkSuQmCC';
WHITEBOARD.arrowImage = new Image();
WHITEBOARD.arrowImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAeZJREFUeNq0lrFu2lAUhv+YW2HJA0YFBAZFBSmbPSAGBqsLsJiRSAzeuuQd0hfgHbKEjalL5Q2xlbETXpAlExBFYBYPWBgF5A6BKGnANrX5JS/nHp/P/7nn6vrKcRwc1Ov1bgHAMIwS/lOpVOo3AFSr1R+H2JXjOBgMBl9UVb3bx+4RXC0A4Hn+QRCEJwIAe0AYxfH2Q1VVhSAI3yPlcvmbbdufAXxF+Po1nU6vKdM0b0J28c6RaZo3xE+mYRjodrueeZlMBpVK5UOc+AF0Oh3E43HXPMuyTq4RL0C73UYikTiZE4vFPB1SbouapiGbzSIajSISibx7JpMJbNv2tTGuTkRRhCiKH+KKoiCdTiOZTGK1WgVzckyKomA+n78CdF3HbrcDwzCYzWbBIf8CNpsNOI57aQkhWK/XwSDHALIsg6bpcNrlBqBpGtvtNhjEywHHca5nxBNyTotGoxEajcZ5kHMAy+UStVoNPM/7h/T7fYzHY9+b3Gw2TwJOHsZSqYThcIjFYgFCiCugWCx6TthRJzRNQ5Zl5HI5zzH1M8LE7eV6vR7KpUKxLKsd7uQLqMWyrEZJkvSIC0qSpEcKAPL5/M8LuGnt6778EgGAruufVFW9sywrG7Q6wzB/eJ5/KBQKzwDwdwCFKeks4W77yAAAAABJRU5ErkJggg==';
WHITEBOARD.protractor_src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWQAAADJCAYAAAAU7kikAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAG8BJREFUeNrsnW2IXNd5x/9z587cnd3ZF63tyJbiF6gwlEWBCn9QkcDFlIQxVUUg2E0CsQq1HYodf0hMShL0wcSGYhfaOCV1klJh6ga7KSVWsUkLwgs2jcEYWqE0mP0Qy94gOdFK2p23O3Nnbj/cc3dHo32Zmft2nnP/PxCz2sSjmfvym2f+5znnFHzfByGEkOyxeAgIIYRCJoQQQiETQgiFTAghhEImhBAKmRBCCIVMCCEUMiGEEAqZEEIoZEIIIRQyIYRQyIQQQihkQggxC3t1rcmjQHSitsPvlwDMDv3uLvVnkIvqzyAbAC7s8Lxv8pCTrDi4OH2jkHlISAaiPQpgn5LsEoCFof+vk9Jrcof+fk2J+wKAqwB+QXGTNCl8fKXBo0CSkO6Sql7DxztTFG0S4v5IVd4XBh4paxJrhUwhkyjiPaBke1xVuUuCpRtF1hdUdf22kvVvKGpCIZM0BHxc/TnEw7IrK0rQb1PQhEImFDAFTShkQgETCppQyIQCpqCJYCGz7S2fEv4SgAd4SLTikPpzSv39nDpXlHOOoJDzIeJZ9XiKh0MMDwx8aJ5R53CDYjYbRhZmV8MPqZ/385AYwWUl5NdYNZsBM2TzJVxTf5gJm82KEvKblDOFTPSS8BKALwI4wkOSS94H8BNszR6knIUKmRmyXBEfAHACwEkejtxzZODD+GfYGgykmIXBClmeiJcAPA5GEmR3VgC8pKpmillIhUwhyxHxUQDfRP7WiiDRcAH8NYKV6yhmCplEkHD4+BhFTGIQ8w/BQUAKmUwk4ofAvmGSDGfA1jkthcxBPb1EzAkcJA1OqT9nBn5HMWsAhayPiB8HpzOTbMR8DpwJSCFTxBQx0YJwmjbFTCHnVsTfBCdyED3F/D7FTCHnRcYcrCO6cwTAq9jKmCnllGCXRXoiZh8xkYgL4DvgBJNEYJdF+iKeBfAsOLOOyMQB8DwYY6QChZyciIFgwI5rTRATYIyRAowskpHxUQCneSiIoXA6dkxwpl6yImY8QfLECoBvgzFGbEJmZBGPiAHGEyR/HEIQY/xs4HcUcwQsHoLIMj4K4A3KmOSYk+oeODpQoJAJYIU8uYg5uYOQGzmNoBuD1TIr5FRlvKS+qlHGhNzIEVUtL7FaZoWchow5046QvXkebJEbG3ZZjC5idlAQMj7sxNiF4S4LRhajyTiMKChjQsYj7MRghDECjCz2ljEjCkKiwwhjBBhZ7CziWQDfA7Cfh4OQ2GCEMQAji9FkHEYUlDEh8cIIYxcYWdwsY864IyR5nsfWDD9GGBTyTSJmREFIupxEMLvva2CEAYCRRShjRhSEZMN+MMKgkAdkfFR9fSKEZMfz4FoYuY4s2NImDN+/8e/dXh/d3o2/LBULKBVvrDMKBR47IZxGzlvj8ipkylgjyYZibXV6ALD5uB111xvr+avOzpd4pVzcfAxFTnlnzuA9mTsp51HINQDfBRcGSlW6fd9Hu9uH6/XQ798o3XElOw67Pffw/zYo70q5CMsCHLuIqZIFq1CgrNOV8mfyKOW8TQypIeik4BToBOl4fbQ6PbS6PXQ9P3HppkEo65JdQKVURKVcRNnmmHjCrCDowDBWynndwomLA1HAFLRcKRs7sy+PQg5l/CqvbQqYghbLwyZKOW9Cpoxj4nqzSwFHEPT8dIkHhVLeU8gmD+qFEz7YYzwhG20PDdejhCdg81i5QNfxsd7yULILmHFszE5xguyEvArgafWzkbmyqRUyZTwh7W4P6y0PbrdPCSdYOTslC3MVG1OlIg/K+DwN4IIJUs5DhRzOvjvN63Y0Ol4fdddDo92jhFOqnOsuNj/0ZqaKqDo2M+fReR7AMyZWyqYJmRM+RqTX91Fve6i7Hvp9SjhbOXtoOD1YVlBBV6dsFC02Pe+BkbP6TBJyGFNQxntUw2uNDrqeTwlrKOf1loeqY6NkF7A4U2bVvDunVHRhjJRNETIzY4rYLDm7QNfzKebR4gtjBvpMGNSrATgA4Me8Nm+m4fZwrdlhLCGYqmPDsoCF6TJmHA4C7sBfAPiNNCmb1ofMPmOKmGImIeL6lE3rsqCMh7je7GK9tTVYRMwhPJ/9PrBWB+YqNiec3MirSspikSzkGoCXeQ1SxHkVMxAMAlLMN/AyBM/mkyrkcNU2h9EEowmKOfiZUQagnPA9CF0lTuLQLZfQRLDG8KXrbazVO1hveZRxzsW83vKwVu/g0vX2TTur5JBDyhHitoOSViHXADyedxmvNTpotHuUMLm5YlbtcjNTRSzOlPMu5cfVz2IqZUlCDmfhnWQ8wXiC7CFmAK1OK+8xxkkAVyVJWYqQcz0l2veBy+ttTuogY0u53wc22gXsn5vK6xZUpxAM8omQsgQh53pKNOMJElnMjDGeBHBRgpR1H9QLZ+Hlbkp0u9vD6tUWZUxiE3OjHVxT7W4vj4fgeeUSrQf6JFTIuZsSzaqYJFYtI4gxclot/xjAgxTy5NXxd/N2xVy6zqyYpCPmjtfG7fNTeXv7oVO0jC50jSxq6s+RvFwl7W4PH11pUcYkNSl3PR8fXcldhHFkwC+skEfkAIIgPhcwoiBZVspYz12E8SSAtynk0avjv8/DVcF2NqKTmHMWYWi55oVuQq4B+AZysEZFw+1hrd6hiIk2Uq7CxkdXWlis5mIyiaNcA52krJOQw81JHzD9SvjdRgetDiMKomelDACtThG3zhofYTyArehCCynrNKg3ixzsFL16tUUZE+3F3OoEPcs54LRyDyvkoerY+LWNV6+2uA7FiFSdGy9Np2TBGpr7WyoWYBctrNU7AIDFahler49u78blzvq+D7fb37EaJDtEGI6N1astHNxXMf3tapMn6yBk43PjjtfHbzdcyngH6VoW4NjFTcE6JQvFQmHktRdmnErY7P8GsHf26ftAT0k6FLjr9dDvU9Y7SXn//BRsy9jFMLTJk7MWsvG5ccfr4/J1N/c3eShfp2ShUi7CsS2UilYmC94UCoBdKMB2ihgWuO8D3V4frtdHq9PbrKzzev62Zve1sX/eMXn3ay3y5KyFbHRu3O728Nv1fHZSDAu4Ui6KqLAKBaBsWyjbFmangvfg9X20Or1cC7ruesB1mC7l08h4T74shWx0bhzucZeXG1eqgEe6SawCZqfs3As6lLLhe/h9DxnmyVkJOdz5w8jcOC8yDiVsFwuYq5RysxD6sKAbbg92sQBPDSaafN4H35uhUt6PDHcayUrIszB054889BhXHRuWBcxVSptSyjMzTnHzw2ij7cGyYPQAbvi+er5v6nTrkwD+JS8Vcg3AsyaexU/WXbjdvpE3YlgNz1VszEzZJo+4R6s0VOXs9X002sHmoyZWzeH78XouPjVn5BfdZ7OILtIWcthVYdwmpabKuOrYsIsF3FItmzyYk0isMT9dwvx0CR2vD7seRBomXR/Be7HxybqRUj6kXJVqdJFFhWxcV4WJMq46NirlIuYqNkUckbJt4Y6FKXS8PiqtolGRluFSPo2UF7RPU8jhQJ5RXG92jZJxKOJbquW8boqZqJhvnS3D94ErdXPGGkIpX292TRzoeyjNKjlNIRs3kGdKN8VgPjxXKVHECVMoYFPM662uETmzwd0Xp0yMLIwbyNtQAzYmyNjwvlKtxRzmzNebXWOkbBct01ogv4mUBvjSELJxA3kdr49rja7om6fq2HBKFm6bdVgRa8D8dAlzlRJ+uyF7PCJ83aWiUTP6jgBYSkPIhY+vNNIQ8hsmyVjy2hRhD/Et1TKmSuKqGHfo7x8BuDj0u7sA3Dn0O1GjTe1uD1fqHdG9zFXHNm2atQvg83FL+eDidKoVslEDeb4P8TLWPJ5wByR7YeBxkDcnuAYHWVLSXhqQt1bCnioVcXBfRXSMEU6zvvMWY5budJDCAF/SFfJDAF415YysXm1tDsBIE7GGnRMugHcA/Ld63E649w/8fBjA3NBz3APg7qHffQjg10O/WwdwfuDvyzsI+xiAP1SPWkja9yE2xgi/jRm2nvLDAF5LqkJOUsg1AN9FkL8YIWNpXyHDG+K2WS2+Om4n4DeHpHtsQLKfAbAvATG6AK4C+N8Beb8zJOuaboKWGmMYKOX3AXwnrio5zchiyRQZf7LuirwRKuXM90V7X1242wn4MIB/BXAcwO0pf/W8fYd/8xKCNXGXVUX9X+rmGxR0LYvrOowxPll3AdhirsVwkXuDJo4kOsCXVIVcA/DvMGA1N4m9xlXHznLn4BV1sYYXbHNAwPdnIOAoDAsaAKYHrvEaMugekrhjedWxsTBjzGJUsQ3wpRVZ/BOChmrRSOuoCL8eHliopJ0V/w7Af6gLdGNAwicAfFmQgEcR9CsAzg7IeVaJ+U8A3JrWC/F94DfXZMVoVcfGHfuM2QrqRQBfkyBkY6pjSYN4GUUU5wC8NCThYwAeAXAvzOYDdVOeH5Lz40hxSzJpy73OVWxT8uRYquQ0MuSjJsg4zI0ZUWzLmaFq+NMAngFwH/LDvUrIAPAegL8F8DGAF9SHVC2Nb4m3zpbRcHsAZFTK/T5MyZMd5bpYs+S4K2QjquONtidiJl4GEcUZBC0/dwP4PxVJPAGDdwwfN0a42uhgsVr+IwC/j6CL46E0xCwpwjAoT45cJQ9XyHH3Qomvjr2+L0bGTsnCwX2Jy9hVleCDAN5VFfERAG8B+DplPFDdFIDFahkA3rrW7P5AHat31bF7ETfPNIz13z64rwKnZG0uFqUrdTcoeLy+b0qVHBtxCtmIWXmXr7fFyDiFr30vqgrg3xDEW6GIH6V+d2chmA35ljpmtjqGnx+IORLhU3OOGClfvt424VR/CTfPBtVCyAcQbBAoFgm5cdWxMTNVTFrG5xDMSPqlksm3ALxOEU/Eo+rYfUsdy1+qY3suSSnPTBW1l3KYJwvnkHJfPN90YsqQawi2zxa7opuE3DiFtShcAE8hWEOiiaBljRKOlx8haJ2bRrCWxt8hodhHQg+9IXnyCoIWuLGz5KQy5AOSZez7oIy34olfAfg9AD+njBOrmH+ujvGvkowxgiU9ba0r5TBP9mXHybFVyXEIuQbgryQfzcvrbe1lvH/eSUrGw/HEC0oQHKxLDkcd4xeSjjHmp0vYP+9oL+XL6+Lz5L9EDFlyHEKelVwdN9weup6+H88Jryv7rJLCZQSDT68jX73EWXOfOuZH1Dl4AQnsrFO2Le2l3PX8zX5qoRxRLsxUyOI7K6419V0TIEEZu6oi+1hVaIwn9IgxbHVOHkbMLXK6S7nuerjW7Eg/j49HrZKj3umzSHGaaNysNTradlWEs+8SkPE5BLnlZQCLqkJjPKFHjPG6OieX1TmKNcIo2xYWq2VtpdzvB/ekYB6IWiVHudtFV8e+DzTaeq4BEA7gJTAVOowomgjasIzaeNYQnlXnpplEhDHjFLUd6Ku7HhrtnvQBvkhVctTyS2x1rOtAXkLdFJe3iSg+S/dpy2eTjDB07r4wYIAvkhMnFXINW/tLiUPXgbxwBl7MMl4B8OdKyocYUYiOMFbilLKuM/oMGOB7aNIqOUqFfErq0dJxIC+h6dBhw3oYUXydnhMZYTyhzuHX4pSyrtOsDRjgm9iNkwr5gNQjpeNAXkIyPjMg4x8yohDNF9Q5DKV8Jk4p28WCdlI2YIBvIkdOIuQagiZoceg6kGdZSELG7w7I2PTF4vPAvQNSfi1OKd+xMAXL0uvNGjDAN9GiQ5OeBpGbl+o4kFd1bNw2G6uMX1QyXkWw2hhlbJaUw8G+dxHjlOvbZh0towvBA3wTDe5NIuQliUen4/W1G8gLOypi7DV+GsE03FUEA0LEPMLBvlV1rp+O40nLtqVl50XX89Hx+lLP1diuHNcEYnuP1xp6DeQl0FHxNIC6qp4oY/N5HcEWWvW4pKxj50Xd9SRnyWP3JE9Smolbt0LH6jjm3PiMujFXkfAC6EQr/lmd8zpiypQ/Nedolyd3PV/q7iJju3KSClkcuq0JG3NufAZbmTEr43xWyqvqGohFyrrlyeESnUJJrEKuSRSy7wOtjj5N5jHnxucQjLhTxpTyqroWIq9/UbYt7XYcaXXEdlyM5c1xrCBymc0rdX2y46pjwy4W4sqNV7C1LsUP6aTcE14LLyCGySOLM2XYxYI2b67uerhSF5klH8IYCw6NWyGzOo7IHQtTccl4cNLH7fRR7hnsU45lRt/t81OsklOOLawxnvCL0o7CequrVXW8MBNbR8WgjNlnTAalHFbK3476ZIUCtGqFq7se1lsis+SRY4tRhXwAAhekWW/pM5BnWYhrI8evArgbwQaklDEZ5j51bSwihna4+emSVl0XOt3TY7AfI06lHuVQ1wCckHYErjf1+SSNsaviDIACgl5j7vBBduJRdY3E0g53i2aL2ut0b4/BiVGq5FE/+05KrI51iSuckhVHV8UKtjoq2GtM9uJFbHVeRMqTp0pFOCU9yuQgthBZJY/k0FGOsrip0oZWx9/G1ig6IaMQW56sW2/yRluklPeMLUaNLERRd/WojsOe40L07qGnEWSCzI3JONyLmPJknQb4BA/ufSmqkGsAjkl6x17f12a9Y8tCHD3HZ7C1RgVzYzIuseXJOg3w9fuQOJ362F4F7iiHV1R3hS6tblXHxi3VctSnccHcmERnME+OtDefLgN8QqvkPV26l5CPSnvHjbYeE0HsYgFTpci7Rj+FIAM8TaeQiJxW19JTUZ5kqlTUZgafLvf6mByNIuTjkt6pLuumxlQdnwNwEcBhBL2lhEThPnUtXUTE9S50aoMTuFby8UmFLC4/vtbUI66wLMTR5vYS2FVB4iXsungpypOUbUuLLFloC9yuOfJeH3Oi8mO3m/2nZdWxsTAduTp+EcHI+B9D4AzJNE61ejwPYG3of1tUlSB47La9n78M4H11jT056RMtTJfR7yPzAki3tWpGPAeYRMii8uN2V48TY1nAjBMpO3YBvKnOzQ/oELwHYBnAr5WAQ5b3+O/uH/j5MIB71O/yHv88CuBPAXzo+3hy0pbMGaeIa0197v0YxmvS5Ki6x8cSsqj8WIe4Iqbq+KmcRxUfADirhLs+ony3Y3mbn0NJz6mfTyCffd1PAHiuUMBXAfyD5Cq57npwWpY0IR8ft0IWlx/rskVTxOo4rwN5oYTPRhDwuJIe/PdO5EzOnwXwMoCLDbc38TU74xSxVs/+zegQVY5JmCO/OU6FLCZ/02EaZTgrLyJ5G8j7TwDfV5Xwcgb//vLA41lVOT+hhGU6/wjgc9eaHcw4lYmfJLzms/52utH24lpNMQ2ccStkUflxQ5Op0hFn5a0g2EX4GMwfjMpaxLvJeV29NtPF7AA4dnBf5cGO139j0q6g+elS5p0OdddDyS5IEnLo2JsqZGvcjEM3fF+PuGJmKnKGFbYkPWmwBN5DMKD0HLZyYt0Iq+Xn1Gt9z+Dz8QiAZtm2vprxtR+ZrudL203k+KgVsqj8uNnpaTGYF7FRfgVBdvxpmLkdkwvgGwi6JJaFvObBivmw+sA07ZvLveqau9jx+hP3zlcdGw2nl/ngXrPTizqGkybb5sjWuBmHbujQhxjDRJCwOjZxivRPAXxOxQDLAl//snrtn1PvxTROR62SdZkoIqwn2Rm1QhaVH+twEmKsjk0b5X9SWFU8SsW8DLMWetqskr2+D9sqTHwPZJ0lC5wkcnSUCllUfqyDjOcqkQbzXjWwOr6EIH81RcaDUj6v3tsl06pk2yo8O+kTzEzpsVay9Bx5WMjMj8fELhaiLEDvAngHQbuVKdXxBwD+DPoO2sUh5bPqPX5gUJU8B+CdSYVmW4XMV4ELc2RBHFtda9b2qpCZH49RHVejtdr8RFXHXzHkxv4pgMcMFfF2Yn4M5uTKXwHQjLLGcFWDKll6jmxJvoJ0OPgRex/D/OgLBtzQP4LcgbsoUv6+eu/S+QIAzE+XHs7oXsijkLGXkMVsaKpDVhRxJ97LCCaCHDZExq/kTMaDUn7FECkfBrARZWskHXanFpYjL+0m5Fkp7yLr/DiGqdKvqbjiEeE38Xs5lvGwlKVPInkkamyR9UaoAnPk2d2ELKbDQoevJhFXmArjCsmLCH2AYMJHnmU8KOVvQPZA330AsDhTfjCjeyKPscXx3YS8QCGPRsRG+BX1eEK4hPIygDeOlB8T/h5ODF2jad8beRPywk5CrkFIhqxDRlQpR6oEwlXdJAtZetTCY7OzkJsI+uOzuDeMccSILA22vg1/loloedMhP56OdtFdgOze478B8CGr4x2r5A/VMZLIZk/ypE8wXS4yRx4dZ7fIQgReL/sFqSNkZeFXwfuF3rDvwdxJH3FK+SzkDvLdHyW20CFH1sERkzAoZDFrWHR72X4fiZiRva2+EkoV8jOU8chSfkawkJvqWs3iHhHviDE5up2Q90l59a6X7deRiBnZL9SjxO6KH2FrnzuyN+uQ2Z9839C1mvY9It4RY7JvOyGLmRTSz/DbSAz58UUEGZ00XLDfeJIq+RV17KQxp67Vicg6R+7LSiyWthPyXRJeuQ6jpznNj5+jjCeW8nMCX7f4HFlQp8Vdw0KuAbhTwivv9vpa7J83IVLzY5cyjixlaVVy5Bw5S+quh66cgb07w9a3wQpZRMtb1mF9TvNjVsf5q5LF58iCBvac4QpZzBoWWYf1EUePw51BWB2zSpZApBw5604LYQN7s4NC5oDeqB9lduT8+A+E3ZQvU8ixCfllYa85Uo4c4V4xwhVjsjQoZDFkPU89wvKCFxEsKCRtuc1X6NLYOCvs9R5W1+xEVXIp4x1EJK6NbPEeGZ2qY6M4+X5NF9TjPYLe8gc867GyLuyY3jN07Y4pZEuLffYo5ITQoY0lwv55V9VXwLuFVXSMK+JjWViVfLe6Zq+mfK8Y5YxJhCyiBznrlreIgxThaLUj6PqQ9hWbxzRenKFrN+17JhLCWt/2CRRyth93MQxSSJqhx7giOS4Jeq1zGd8zop0xBjIH9bIkwiBF2O4kaUBvGYwrkjqukiZbHB66htO6Z3IJhTwGdnHiw3UBwWj1PYLe7ts844lKWQr3qGv3o5TvGQqZJMY19ShpQO9DnrbEOC/otYbX7EWetvSEvCDhxfYzHjKN8GG/MVBtSMDlrcFjrFgcuobTumeMcMYYLAwKWcRMPbeb7YhphAGK/xFWIZ8H8+MkWRZUJR8euobTumeMcMYYcFCP7MgaDwGPMUkfCpnsVMERHmNCIetJDFNA7+dRJITsJeSalBebdUAfw1RQKbP0uG8eia2Y4HoWo7G61qxZkkQhKKAf5hfCXu953h6J846Q1xlp+nTW61kIWvHNAQB+dI1Bw53s5K7VO2/0fR+3zpZFvM/fbXTeagpculAS0+WiqOvBKhSwWC3zxCUMhTwiddeLvLDRxSstHkgCAGh2euKuB8F7WYqBg3qEEEIhE0IIoZAJIYRCJoQQQiETQgiFTAghhEImhBAKmRBCyLiEE0POjfofNNzeAzxshBApTDrDNmlmnOJN3v3/AQBPuwDBIJji8QAAAABJRU5ErkJggg==';
WHITEBOARD.protractor_arrow_src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWQAAADJCAYAAAAU7kikAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAA/dJREFUeNrs2r2KXGUcwOHfbBI/sxg1BiOIkFbUC9hKsPMiRG1stbW21dZGxdILsBMsghegYhsiASMxfizrR6JujkX+C4OfBFYHN88DL7PDzBxe9sz85j3v7mpZluCwrVarf3rKmeps9fEGp/lUdbm68ndP8hnhv7LlV8AG7FTvVLsbnsfuzGPHKUGQuR29Up2v3qsu3sqiuzpWnajuXBt3zbhjHl/dwjEvzjzOz7xgs1eWLsf4V95Yf9yyeKJ6vXqmert6cYL6QHW6m1sYZ6pHq1Nrkd1ai+xqLbxVv1b7BzsL8/Nq7f6N6ufqWvVddWm2J65UV6tvquvVW9UL1QcT5k9tWSDIHMUg31+9PONk9VP1anX3xHer+mECeWFud6u96sfqlxn7E9iD2Db3b6xd7R2M47OSPlHdU21X9034z83tvfPaSzOn12ZO31dvzPhWkBFkjkKQt6vnJr4P/+7h693cu32zzf9R76Xq+Vmtr/tyIv3usix7ziiCzP85yOeqZ2fr4Xj10KyIz86q+cFZmX5efVZ9WH1SfTGr1MN2snqkerJ6unq8emxWxV/PavjyrJi/mu2Qa9X7y7JccEYRZI7ClsWfOTYhPDWhPj2B3p4YfzRhPIw352q+CHYmynsT4KsT3t3ZGtn/qwP4jCDIALcZ//YGIMgACDKAIAMgyACCDIAgAwgyAIIMIMgACDKAIAMgyACCDIAgAwgyAIIMIMgACDKAIAMgyACCDIAgAyDIAIIMgCADCDIAggwgyAAIMoAgAyDIAIIMgCADCDIAggwgyAAIMoAgAyDIAIIMgCADCDIAggyAIAMIMgCCDCDIAAgygCADIMgAggyAIAMIMgCCDCDIAAgygCADIMgAggyAIAMIMgCCDCDIAAgyAIIMIMgACDKAIAMgyACCDIAgAwgyAIIMIMgACDKAIAMgyACCDIAgAwgyAIIMIMgACDKAIAMgyAAIMoAgAyDIAIIMgCADCDIAggwgyAAIMoAgAyDIAIIMgCADCDIAggwgyAAIMoAgAyDIAIIMgCADCDIAggyAIAMIMgCCDCDIAAgygCADIMgAggyAIAMIMgCCDCDIAAgygCADIMgAggyAIAMIMgCCDCDIAAgyAIIMIMgACDKAIAMgyACCDIAgAwgyAIIMIMgACDKAIAMgyACCDIAgAwgyAIIMIMgACDKAIAMgyAAIMoAgAyDIAIIMgCADCDIAggwgyAAIMoAgAyDIAIIMgCADCDIAggwgyAAIMoAgAyDIAIIMgCADIMgAggyAIAMIMgCCDCDIAAgygCADIMgAggyAIAMIMgCCDCDIAAgygCADIMgAggyAIAMIMgCb8hsAAAD//wMA8aWCwQJhamIAAAAASUVORK5CYII=';
WHITEBOARD.protractor_move_src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAZ9JREFUeNrEl79Lw1AQxz+N1X9BbLRBsP7YxFFwL06uLvVfky5i6eDo2hZULLSjIhWq2MF/wahx+QZizEsTeU0Obsi9y32Sl3t3F/ifuMCl1KUgcYE+EEj7RcBrMWgUXlsUtG6ARuF129BNYJQCDXUk37niZATvAlPgHvAT1n2tTeVrXTxgbHhTL08gJyf4BZgk2CdaWxgYoGIjjmPYzmZOcCXF/zjpMzgJ0CvgzGJetBTTM4HXgTawDzSANUMgP6MNxdhSzLYYv7bIBS6AI11/AI9KmiDi9wUcJpTIGXADLOk6vKcB7AArsg+AU/mzIUNQkA7EpFsgNNSuQ4lSylanJdcT8AosK1EC4BM4AFZjD/+uslmN+PrqVtum5Ioep55uGqY0907CW3RShoahfHrR41SNOL1FDvsk/lRzqp0pV2bAszgtMf6AwyZwAuxZLJnnwEO8iVQNHSit0wQZbaFc2+pO3xltVttiXWUwLo2wGtmWpmboOx2TeFb7wK2OZNP2sDfOUBzGWYe9vPPWvPHWW1R5LWWgL/UXxtpP288AlQzgvsgnAY0AAAAASUVORK5CYII=';
WHITEBOARD.selectedClass = null;
WHITEBOARD.currentSelectedClass = null;
WHITEBOARD.getChapters = null;
WHITEBOARD.unsavedjsonpath = null;
WHITEBOARD.whiteboardId = null;
WHITEBOARD.firstExecute = true;
WHITEBOARD.firstExecuteTab = true;
WHITEBOARD.interactivity = false;
WHITEBOARD.delete_tab = null;
WHITEBOARD.saveprogress = false;
WHITEBOARD.textEditor = false;
WHITEBOARD.backgrounds = {};
/**Creates a {Point} out of JSON parsed object
 **/
WHITEBOARD.load = function(id,property,o,callback){
    // if(board!=null)
    // {
    //     alert("Already board is loaded. Please unload it");
    //     return;
    // }    
    board = new WHITEBOARD();
    board.tagId = id;
    if(property)
    {
        /*if(property.width>board.width)
            board.width = property.width;*/
        if(property.height>board.height)
            board.height = property.height;
        var w = Number(window.innerWidth);
        if(w>=1440)
          board.width = 1280;
        else if(w>=1281&&1399>=w)
          board.width = 1200;
        else if(w>=1024 && 1280>=w)
          board.width = 940;
        else
        {  
          board.width = w;
        }    
        board.top = property.top;
        board.bottom = property.bottom;
    }

    /*Need to change inside this prototype*/
    if(o)
    {
        //o = JSON.parse(decodeURIComponent(o));
        /*board.width = o[0].c.width;
        board.height = o[0].c.height;*/
        board.canvas_diagram = o;
        canvas_diagram = o;
    }
    WHITEBOARD.firstExecuteTab = true;
    board.execute(callback);
	//("callback",callback)
    

}
/**Creates a {Point} out of JSON parsed object
 **/
WHITEBOARD.addScreenshot = function(video){
    if(board==null)
    {
        alert("Please initialize the board first");
        return;
    }
    var width = video.videoWidth;
    var height = video.videoHeight; 
    var main_canvas = getCanvas();
    var temp_screen = document.createElement("canvas");
    var resizeScreen = false;
    if(main_canvas.width<video.videoWidth)
    {
        width = main_canvas.width;
        height = (video.videoHeight/video.videoWidth)*main_canvas.width;
        resizeScreen = true;
    }
    else if(main_canvas.height<video.videoHeight)
    {
        width = (video.videoWidth/video.videoHeight)*main_canvas.height;
        height = main_canvas.width;
        resizeScreen = true;
    }
    var ctx_screen = temp_screen.getContext('2d');
    if(resizeScreen)
    {
        var data=temp_screen.toDataURL();
        // resize the canvas
        temp_screen.width = $(container).width();
        temp_screen.height = $(container).height();
        //alert($(container).width());

        // scale and redraw the canvas content
        var img=new Image();
        img.onload=function(){
            ctx_screen.drawImage(img,0,0,img.width,img.height);
        }
        img.src=data;
    }
    else
    {
        temp_screen.width = video.videoWidth ;
        temp_screen.height = video.videoHeight;
        temp_screen.getContext('2d').drawImage(video, 0, 0, temp_screen.width, temp_screen.height);
    }
    
    //var imgData=ctx_screen.getImageData(0,0,temp_screen.width,temp_screen.height);
    var imgDataURL = temp_screen.toDataURL();
    //creates a container
    var cmdFigureCreate = new InsertedImageFigureCreateCommand("ImageData", main_canvas.width/2, main_canvas.height/2,imgDataURL);
    cmdFigureCreate.execute();
    History.addUndo(cmdFigureCreate);
    //state = STATE_NONE;    
    
}
WHITEBOARD.loadPlayerScreenShot = function(imgDataURL)
{
  window.setTimeout(function(){
    var main_canvas = getCanvas();
    var cmdFigureCreate = new InsertedImageFigureCreateCommand("ImageData", main_canvas.width/2, main_canvas.height/2,imgDataURL.data);
    cmdFigureCreate.execute();
    History.addUndo(cmdFigureCreate);  
  },1000);
  
}
WHITEBOARD.unload = function(id){
    document.getElementById(id).innerHTML = '';
    board = null;
    pencil_draw = false;
    canvas_diagram = [];
    tab_size = 0;
    current_tab = 1;
    erasor_state = false;
    lastcursor = null;
    shapeStrokeColor = "0,0,0";
    shapeFillColor = "0,0,255";
    shapeFillOpacity = "1";
    shapeStrokeWidth = "1";
    backgroundImage = null;
    backgroundShow = true;
    videoPlayer = null;
    PENTAGON_SIDES = 3;
    MOUSE_STATE = null;
    lastMove = null;
    snapMonitor = [0,0];
    linearrowType = '';
    selectedLineArrowId = -1;
    selectedLineArrowPointId = -1;
    currentCloud = [];
    //reset(getCanvas());
    STACK.reset();
    History.reset();
    LineArrow_MANAGER.reset();
    WHITEBOARD.selectedClass = null;
    WHITEBOARD.getChapters = null;
    WHITEBOARD.unsavedjsonpath = null;
    WHITEBOARD.whiteboardId = null;
    WHITEBOARD.firstExecuteTab = true;
    $('input[name="whiteboardtitle"]').val('');
    /*clearPencil();
    clearPencilCanvas();*/
}
WHITEBOARD.json = function(){
    var tempObj = [];
    save();
    for(var i = 0;i < canvas_diagram.length;i++)
    {
        //var obj  = eval('(' + canvas_diagram[i] + ')'); 
        var obj = canvas_diagram[i];
        //delete obj['p'];
        tempObj.push(obj);
    }
    
    
    return tempObj;
}
WHITEBOARD.encodedURIJSON = function(){
  return encodeURIComponent(JSON.stringify(WHITEBOARD.json()));
}
WHITEBOARD.playVideo = function(){
    if(board==null)
    {
        alert("Please initialize the board first");
        return;
    }
    localStorage.setItem("WHITEBOARD_JSON", JSON.stringify(WHITEBOARD.json()));
	////console.log("json",WHITEBOARD.json())
    var playerCommands = History.COMMANDS;
    STACK.reset();
    WHITEBOARD.unload("myID");
    WHITEBOARD.load("myID",{"width":1360,"height":600,"position":"relative"});
    
    
    
    ////console.log("asdf");
    (function myLoop (i) {  
        var timeout = 100;
        if (i)
            timeout = playerCommands[playerCommands.length-(i)].timeGap;
        setTimeout(function () {   
            /*////console.log(playerCommands[playerCommands.length-i]);
            if(!playerCommands[playerCommands.length-i].firstDraw&&playerCommands[playerCommands.length-i].imgFileName =='Pencil')
            {
                var fig = STACK.figureGetById(playerCommands[playerCommands.length-i].figureId);
                fig.primitives[0].imageData = playerCommands[playerCommands.length-i].imageData;
                fig.primitives[0].setUrl('Pencil',playerCommands[playerCommands.length-i].imageData);
                pencil_draw = true;
                ////console.log("NEew s");
            }
            else if(playerCommands[playerCommands.length-i].firstDraw&&playerCommands[playerCommands.length-i].imgFileName =='Pencil')
            {
                playerCommands[playerCommands.length-i].execute();
                ////console.log("Command Executed");
                pencil_draw = true;
            }
            else
                playerCommands[playerCommands.length-i].execute();
            draw();*/
            var buffer = document.getElementById("canvas_main");
            var buffer_context = buffer.getContext("2d");
            ////console.log(playerCommands[playerCommands.length-i].main_data);
            var im = new Image();
            var im2 = new Image();
            im.src = playerCommands[playerCommands.length-i].main_data;
            im2.src = playerCommands[playerCommands.length-i].pencil_data;
            buffer_context.clearRect(0,0,buffer.width,buffer.height);
            im.onload=function(){
                im2.onload = function(){
                    buffer_context.drawImage(im, 0, 0);
                    buffer_context.drawImage(im2, 0, 0);    
                };
            };
            
            if (--i) myLoop(i);      //  decrement i and call myLoop again if i > 0
       }, timeout)
    })(playerCommands.length);

}
WHITEBOARD.stopVideo = function(){
    if(board==null)
    {
        alert("Please initialize the board first");
        return;
    }
    WHITEBOARD.load("myID",{"width":1360,"height":600,"position":"relative"},JSON.parse(localStorage.getItem("WHITEBOARD_JSON")));
    WHITEBOARD.load("myPage",{"width":1360,"height":600,"position":"relative"},JSON.parse(localStorage.getItem("WHITEBOARD_JSON")));
}
WHITEBOARD.prototype = {
    constructor : WHITEBOARD,
    
    /*
     *Creates and Renders the Canvas with tools
     **/
    execute:function(callback){
		//console.log("callback",callback)
        //Temporay HTML Needs to change with dom objects.
        var mainHTML = '';
        var tablist = '<ul class="tabstyles"><li id="add_tab" class="clickaddtobg"><a href="#add"><img src="'+WHITEBOARD.hostURL+'images/add-icon.png" alt="Add"></a></li></ul>';
        //var addtabcontent = '<div id="add"> <div class="tabcontnt-inner"> <div class="pagebg"> <div class="pagebg-inner"> <div class="choosebg"> <p class="pgbg-title">Choose a page Background</p> <ul class="pgbgtypes clearfix"> <li data-bg = "-1"> <a href="javascript:void(0);" > <p class="backgroungbg bg1"></p> <p class="pgname">No Background</p> </a> </li> <li data-bg = "0"> <a href="javascript:void(0);" > <p class="backgroungbg bg2"></p> <p class="pgname">Blank Page</p> </a> </li> <li  data-bg = "1"> <a href="javascript:void(0);"> <p class="backgroungbg bg3"></p> <p class="pgname">Double Line Page</p> </a> </li> <li data-bg = "2"> <a href="javascript:void(0);"> <p class="backgroungbg bg4"></p> <p class="pgname">Four Line Page</p> </a> </li> <li data-bg = "3"> <a href="javascript:void(0);"> <p class="backgroungbg bg5"></p> <p class="pgname">Four Line Page With Space</p> </a> </li> <li data-bg = "4"> <a href="javascript:void(0);"> <p class="backgroungbg bg6"></p> <p class="pgname">Graph Paper(cm)</p> </a> </li> <li data-bg = "5"> <a href="javascript:void(0);"> <p class="backgroungbg bg7"></p> <p class="pgname">Graph Paper(inch)</p> </a> </li> <li data-bg = "6"> <a href="javascript:void(0);"> <p class="backgroungbg bg8"></p> <p class="pgname">Math Square Line</p> </a> </li> <li data-bg = "7"> <a href="javascript:void(0);"> <p class="backgroungbg bg9"></p> <p class="pgname">Single Line Page</p> </a> </li> <li data-bg = "8"> <a href="javascript:void(0);"> <p class="backgroungbg bg10"></p> <p class="pgname">Venn With Lines</p> </a> </li> </ul> </div> </div> </div> </div> </div>';
        //var addtabcontent = '<div class="whiteboard-overlay whitebgover"> <div class="whiteboard-overlay-inner"> <a href="javascript:closeAddTab();" class="closeoverlay">X</a><div class="tabhoriz tabhorizstyle whiteboard-tab-nav"> <div class="whiteboard-tabs"> <ul class="whiteboard-tabslist"> <li><a href="#open">Open</a></li> <li><a href="#new">New</a></li> </ul> </div> <div id="open"> <div class="tabs recent-open-files"> <ul> <li><a href="#recent-file">Recent Files</a></li> <li><a href="#open-existing">Open Existing</a></li> </ul> <div id="recent-file" class="clearfix"> <div class="open-left-list vscroll"> <ul class="whiteboard-subject-list disable"> <li><a href="#">Chemical reactions and equations</a> <span>04</span></li> <li><a href="#">Acids, Bases and Salts</a> <span></span></li> <li><a href="#">Metals and Non-Metals</a> <span>02</span></li> <li><a href="#">Carbon and its Compounds</a> <span>02</span></li> <li><a href="#">Periodic classification of elements</a> <span></span></li> <li><a href="#">Life Processes</a> <span></span></li> <li><a href="#">Control and Coordination</a> <span></span></li> <li><a href="#">How Do Organisms Reproduce?</a> <span>05</span></li> <li><a href="#">Heredity and Evolution</a> <span>04</span></li> <li><a href="#">Light-Reflection and Refraction</a> <span>02</span></li> <li><a href="#">The Human Eye and the Colourful World</a> <span></span></li> <li><a href="#">Electricity</a> <span>02</span></li> <li><a href="#">Magnetic Effects of Electric Current</a> <span></span></li> <li><a href="#">Sources of Energy</a> <span>02</span></li> <li><a href="#">Our Environment</a> <span>04</span></li> <li><a href="#">Management of Natural Resources</a> <span>02</span></li> <li><a href="#">Model Test Paper Summative Assessment I</a> <span>06</span></li> <li><a href="#">Model Test Paper Summative Assessment II</a> <span>04</span></li> </ul> </div> <div class="open-right-list vscroll"> <ul class="bglist"> <li> <a href="whiteboard1.html"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-1</p> <p class="small-text">01 hour ago</p> </a> </li> <li> <a href="whiteboard2.html"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-2</p> <p class="small-text">06 hour ago</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-3</p> <p class="small-text">18 hour ago</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-4</p> <p class="small-text">a day ago</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-5</p> <p class="small-text">Dec 31st, 04:50pm</p> </a> </li> </ul> </div> </div> <div id="open-existing"> <div class="open-left-list vscroll"> <ul class="whiteboard-subject-list disable"> <li class="active"><a href="#">Chemical reactions and equations</a> <span>04</span></li> <li><a href="#">Acids, Bases and Salts</a> <span></span></li> <li class="active"><a href="#">Metals and Non-Metals</a> <span>02</span></li> <li class="active"><a href="#">Carbon and its Compounds</a> <span>02</span></li> <li><a href="#">Periodic classification of elements</a> <span></span></li> <li><a href="#">Life Processes</a> <span></span></li> <li><a href="#">Control and Coordination</a> <span></span></li> <li class="active"><a href="#">How Do Organisms Reproduce?</a> <span>05</span></li> <li class="active"><a href="#">Heredity and Evolution</a> <span>04</span></li> <li><a href="#">Light-Reflection and Refraction</a> <span>02</span></li> <li><a href="#">The Human Eye and the Colourful World</a> <span></span></li> <li><a href="#">Electricity</a> <span>02</span></li> <li><a href="#">Magnetic Effects of Electric Current</a> <span></span></li> <li class="active"><a href="#">Sources of Energy</a> <span>02</span></li> <li class="active"><a href="#">Our Environment</a> <span>04</span></li> <li><a href="#">Management of Natural Resources</a> <span>02</span></li> <li><a href="#">Model Test Paper Summative Assessment I</a> <span>06</span></li> <li><a href="#">Model Test Paper Summative Assessment II</a> <span>04</span></li> </ul> </div> <div class="open-right-list vscroll"> <ul class="bglist"> <li> <a href="whiteboard1.html"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-1</p> <p class="small-text">01 hour ago</p> </a> </li> <li> <a href="whiteboard2.html"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-2</p> <p class="small-text">06 hour ago</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-3</p> <p class="small-text">18 hour ago</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-4</p> <p class="small-text">a day ago</p> </a> </li> </ul> </div> </div> </div> </div> <div id="new"> <div class="bgtemplate-layout vscroll"> <p class="title-panel">Backgrounds</p> <ul class="bglist pgbgtypes"> <li data-bg="-1"> <a href="javascript:void(0);" class="selectnobg"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-1.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">No Background</p> </a> </li> <li data-bg="0"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-2.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Blank Page</p> </a> </li> <li data-bg="1"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-3.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Double Line <br>Page</p> </a> </li> <li data-bg="2"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-4.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Four Line Page</p> </a> </li> <li data-bg="3"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-5.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Four Line Page<br>with Space</p> </a> </li> <li data-bg="4"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-6.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Graph Paper <br>(cm)</p> </a> </li> <li data-bg="5"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-7.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Graph Paper <br>(inch)</p> </a> </li> <li data-bg="6"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-8.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Math Square <br>Line</p> </a> </li> <li data-bg="7"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-9.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Single Line <br>Paper</p> </a> </li> <li data-bg="8"> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-10.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Venn with Lines</p> </a> </li> </ul> <p class="title-panel mt10">Templates</p> <ul class="bglist"> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/template-1.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Template-1</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/template-2.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Template-2</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/template-3.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Template-3</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/template-4.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Template-4</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/template-5.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Template-5</p> </a> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/template-6.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Template-6</p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/template-7.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">Template-7</p> </a> </li> </ul> </div> </div> </div> </div> </div>';
        var addtabcontent = '<div class="whiteboard-overlay whitebgover"> <div class="whiteboard-overlay-inner"> <div class="tabhoriz tabhorizstyle whiteboard-tab-nav"> <div id="open"> <div class="tabs recent-open-files"> <ul> <li><a href="#recent-file">Current Subject</a></li> <li><a href="#open-existing">Open Subject</a></li> </ul> <div id="recent-file" class="clearfix"> <div class="open-left-list vscroll"> <ul class="whiteboard-subject-list disable" id="currentSubjectChapters">  </ul> </div> <div class="open-right-list vscroll"> <ul class="bglist" id="currentSubjectWhiteboards"  style="min-width:300px">  </ul> </div> </div> <div id="open-existing"> <div class="open-left-list vscroll"><div class="field-wrapper" style="width:230px"> <select name="OpenClass" style="background: #8f8f90; border: none; border-bottom: 2px solid #000; color: white; font-weight: bolder; font-size: 12px; height:30px;" placeholder="Class" required>  </select> </div> <div class="field-wrapper" style="width:230px">  <select name="OpenSubject" placeholder="Subject"  style="background: #8f8f90; border: none; border-bottom: 2px solid #000; color: white; font-weight: bolder; font-size: 12px; height:30px;" required> </select></div><ul class="whiteboard-subject-list disable" id="otherSubjectChapters">  </ul> </div> <div class="open-right-list vscroll"> <ul class="bglist" id="otherSubjectWhiteboards" style="min-width:300px">   </ul> </div> </div> </div> </div> </div> </div> </div>';
        var canvastabcontent = '<div id="one"> <div class="tabcontnt-inner"> <div id="editor"> <div style="width: 100%"> <div  id="container"><canvas id="canvas_background" width="900" height="550" style="position:absolute;margin: 0px auto;display: block;border: 1px solid #E5E5E5;background-repeat: repeat;background-color: #FFFFFF;"><div id="white"></div></canvas><canvas id="canvas_main" width="900" height="550" style="position:absolute;margin: 0px auto;display: block;border: 1px solid #E5E5E5;"> Your browser does not support HTML5. Please upgrade your browser to any modern version. </canvas><canvas id="canvas_pencil" width="900" height="550" style="position:absolute;margin: 0px auto;display: block;border: 1px solid #E5E5E5;"> Your browser does not support HTML5. Please upgrade your browser to any modern version. </canvas><canvas id="canvas_temp" width="900" height="550" style="position:absolute;margin: 0px auto;display: none;border: 1px solid #E5E5E5;"> Your browser does not support HTML5. Please upgrade your browser to any modern version.</canvas>  <canvas id="canvas_dummy" width="900" height="550" style="margin: 0px auto;display: none;border: 1px solid #E5E5E5;background-repeat: repeat;"> Your browser does not support HTML5. Please upgrade your browser to any modern version. </canvas><canvas id="canvas_app" width="900" height="550" style="position:absolute;margin: 0px auto;display: block;border: 1px solid #E5E5E5;"> Your browser does not support HTML5. Please upgrade your browser to any modern version. </canvas><div id="shape-tools" style="position:absolute;display:none;z-index:3;"><button type="button" id="del-btn" onclick="action(\'delete-figure\')">Delete</button><select id="storkeColor"><option value="255,0,0">Red</option><option value="0,255,0">Green</option><option value="0,0,255">Blue</option></select><select id="fillColor"><option value="255,0,0">Red</option><option value="0,255,0">Green</option><option value="0,0,255">Blue</option></select><select id="strokeWidth"><option value="1">1</option><option value="3">3</option><option value="5">5</option></select><select id="fillOpacity"><option value="0">0%</option><option value="0.3">30%</option><option value="0.5">50%</option><option value="1">100%</option></select></div><div id="crop-button" style="position:absolute;display:none;"> <button type="button" id="crop-btn" onclick="cropandPasteCanvas()" style="background-color: #262626;color: #929292;">Crop</button> </div> </div> </div> </div> <div id="minimap" style="display:none;"></div> <div id="text-editor"><div class="textLine"><div class="label">Text</div><textarea class="text" spellcheck="false" style="font-size: 12px; font-family: Arial; text-align: center"></textarea></div></div><div id="text-editor-tools" style=visibility: visible;></div></div> </div>';
        //var canvastabcontent = '<div id="one"> <div class="tabcontnt-inner"> <img src="'+WHITEBOARD.hostURL+'images/whiteboard.png" alt=""> </div> </div> <div id="two"> <div class="tabcontnt-inner"> <img src="'+WHITEBOARD.hostURL+'images/whiteboard2.png" alt=""> </div> </div>';
         //var whiteboardoverlay = '<div class="whiteboard-overlay"> <ul class="created-whiteboards"> <li><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboard-overview1.jpg" alt="">01</a></li> </ul> </div>';
        var whiteboardoverlay = '<div class="overlaywhitbg vscroll"> <ul class="bglist created-whiteboards"> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-1</p> <p class="small-text small-text-white alertpopup">Close <img src="'+WHITEBOARD.hostURL+'images/tag-cross.png"></p> </a> </li> <li> <a href="javascript:void(0);"> <img src="'+WHITEBOARD.hostURL+'images/preview.jpg" alt="Whiteboard" class="border-img"/> <p class="text-bold">White Board-2</p> <p class="small-text small-text-white alertpopup">Close <img src="'+WHITEBOARD.hostURL+'images/tag-cross.png"></p> </a> </li> </ul> </div>';
        //var tools = '<div class="sitewidth clearfix" style="background: #262626;width:100%"> <div class="action-icons-left"> <ul class="action-icons-whiteboard"> <li class="overviewclick"><a href="javascript:void(0);"><span class="icon1"></span></a></li> </ul> </div> <div class="action-icons-left"> <ul class="action-icons-whiteboard dividerpattern"> <li><a href="javascript:action(\'none\');"><span class="icon2"></span></a></li> <li><a href="javascript:action(\'layers\');"><span class="icon3"></span></a></li> <li><a href="javascript:void(0);"><span class="icon4"></span><span class="arrowsmall"></span></a></li> </ul> </div> <div class="action-icons-left"> <ul class="action-icons-whiteboard"> <li><a href="javascript:action(\'pencil\');"><span class="icon5"></span><span class="arrowsmall"></span></a></li> <li><a href="javascript:action(\'text\');"><span class="icon6"></span></a></li> <li><a href="javascript:action(\'marker\');"><span class="icon7"></span></a></li> <li><a href="javascript:action(\'shape\');" title="Shapes"><span class="icon8"></span><span class="arrowsmall"></span></a></li> <li><a href="javascript:void(0);"><span class="icon9"></span><span class="arrowsmall"></span></a></li> <li><a href="javascript:action(\'copy-paste\');"><span class="icon10"></span><span class="arrowsmall"></span></a></li> </ul> </div> <div class="action-icons-left"> <ul class="action-icons-whiteboard dividerpattern"> <li><a href="javascript:action(\'gallery\');"><span class="icon11"></span><span class="arrowsmall"></span></a></li> <li><a href="javascript:action(\'background-visiblity\');"><span class="icon12"></span></a></li> <li><a href="javascript:action(\'undo\');"><span class="icon13"></span></a></li> <li><a href="javascript:action(\'redo\');"><span class="icon14"></span></a></li> <li><a href="javascript:void(0);"><span class="icon15"></span></a></li> <li><a href="javascript:void(0);"><span class="icon16"></span></a></li> </ul> </div> <div class="action-icons-left"> <ul class="action-icons-whiteboard"> <li><a href="javascript:action(\'save\');"><span class="icon17"></span></a></li> <li><a href="javascript:action(\'delete-figure\');"><span class="icon18"></span></a></li> </ul> </div> </div>';
        var ul_background_tab = '<div class="whiteboard-change-flyout whiteboard-temp black-flyout"> <div class="template-options"> <ul class="questindi clearfix qnaire"> <li class="quest-active" data-tab="1" style="margin: auto;"><a href="javascript:void(0);">Backgrounds</a></li> <!--<li class=""  data-tab="2"><a href="javascript:void(0);">Templates</a></li>--> </ul> </div> <div class="template-models"> <ul class="clearfix"> <li class="questionera background_tabs" id="tab-1">  </li> <li class="hidequiz questionera" id="tab-2"> <ul class="clearfix  vscroll">  </ul> </li> </ul> </div> </div>';
        //<li data-bg="-1"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-1.jpg" alt="" /></a></li> <li data-bg="0"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-2.jpg" alt="" /></a></li> <li data-bg="1"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-3.jpg" alt="" /></a></li> <li data-bg="2"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-4.jpg" alt="" /></a></li> <li data-bg="3"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-5.jpg" alt="" /></a></li> <li data-bg="4"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-6.jpg" alt="" /></a></li> <li data-bg="5"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-7.jpg" alt="" /></a></li> <li data-bg="6"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-8.jpg" alt="" /></a></li> <li data-bg="7"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-9.jpg" alt="" /></a></li> <li data-bg="8"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-10.jpg" alt="" /></a></li>
        var ul_action_icon = '<ul class="action-icons-whiteboard action-icons-left">';
        var ul_action_icon_divider = '<ul class="action-icons-whiteboard action-icons-left dividerpattern">';
        var ul_close = '</ul>';
        
        var icon_overview = '<li><a href="javascript:void(0);" class="flyout-link overviewclick" data-tooltip="View Tabs" data-placement="top"><span class="overview"></span></a></li>';
        
        var icon_resource = '<li><a href="javascript:void(0);" class="flyout-link resource-link" data-tooltip="Open File" data-placement="top"><span class="resource"></span></a></li>';
        var icon_background = '<li><a href="javascript:void(0);"  class="flyout-link" data-tooltip="Background" data-placement="top"><span class="hideshow"></span></a>'+ul_background_tab+'</li>';
    
        var icon_move = '<li><a href="javascript:action(\'none\');"  data-tooltip="Select" data-placement="top"><span class="move"></span></a></li>';
        var icon_pencil ='<li><a href="javascript:action(\'pencil\');"  data-tooltip="Draw" class="flyout-link pencil-tool" data-placement="top"><span class="pen"></span><i class="tools-more"></i></a> <div class="whiteboard-change-flyout whiteboard-pens black-flyout"> <ul class="clearfix"> <li><a href="javascript:selectcolor(\'black\');" data-tooltip="Black Color"><span class="black-color"></span></a></li> <li><a href="javascript:selectcolor(\'red\');"  data-tooltip="Red Color"><span class="red-color"></span></a></li> <li><a href="javascript:selectcolor(\'green\');" data-tooltip="Green Color"><span class="green-color"></span></a></li> <li><a href="javascript:selectcolor(\'blue\');"  data-tooltip="Blue Color"><span class="blue-color"></span></a></li><li><a href="javascript:selectcolor(\'jscolor\');" data-tooltip="Custom Color"><span class="colorSelector"><span class="customColor" style="background: white;" id="jsColorBtn"></span><i class="color-more"></i><input type="hidden" id="jsColor"/></span></a></li> <li><a href="javascript:selectcolor(\'erasor\');" data-tooltip="Eraser"><span class="big-nib"></span></a></li> <li><a href="javascript:selectcolor(\'clear\');"  data-tooltip="Delete"><span class="pen-delete"></span></a></li> <li><a href="javascript:selectsize(\'small\');"  data-tooltip="Very Thin"><span class="point-level1"></span></a></li> <li><a href="javascript:selectsize(\'medium\');"  data-tooltip="Thin"><span class="point-level2"></span></a></li> <li><a href="javascript:selectsize(\'large\');" data-tooltip="Thick"><span class="point-level3"></span></a></li> </ul> </div> </li> <li><a href="javascript:action(\'marker\')"  data-tooltip="Highlighter" class="flyout-link" data-placement="top"><span class="brush"></span><i class="tools-more"></i></a> <div class="whiteboard-change-flyout whiteboard-pens whiteboard-pens-highlight black-flyout"> <ul class="clearfix"> <li><a href="javascript:selectcolor(\'black\');" data-tooltip="Black Color"><span class="black-color"></span></a></li> <li><a href="javascript:selectcolor(\'red\');"  data-tooltip="Red Color"><span class="red-color"></span></a></li> <li><a href="javascript:selectcolor(\'green\');" data-tooltip="Green Color"><span class="green-color"></span></a></li> <li><a href="javascript:selectcolor(\'blue\');"  data-tooltip="Blue Color"><span class="blue-color"></span></a></li><li><a href="javascript:selectcolor(\'jscolor\');" data-tooltip="Custom Color"><span class="colorSelector"><span class="customColor" style="background: white;" id="jsColorBtnHighlight"></span><i class="color-more"></i></span></a></li><li><a href="javascript:selectsize(\'medium_highlight\');"  data-tooltip="Thin"><span class="point-level2"></span></a></li> <li><a href="javascript:selectsize(\'large_highlight\');" data-tooltip="Thick"><span class="point-level3"></span></a></li></ul> </div></li></li>';
        var icon_video='<li><a href="javascript:action(\'video\');" data-tooltip="Rectangle"><ion-icon name="videocam" title="Video"></ion-icon></a></li>  ';
        var icon_trend = '<li><a href="javascript:action(\'trend\');"><i class="fa fa-line-chart fa-1x" title="Trend Graph" style="zoom:1.0; margin-top:10px;"></i></a></li> '
        var icon_shape = '<li><a href="javascript:action(\'slider\');" data-tooltip="Rectangle"><ion-icon name="beaker" title="Slider"></ion-icon></a></li>  ';
        var icon_image ='<li><a href="javascript:void(0);<i class="fa fa-photo" title="Menu" style="padding-top:0px;margin-left: 0px;cursor: pointer;display: block;width: 0px;height:0px";></i></a></li>'
        var icon_circle='<li><a href="javascript:action(\'circle\');"><i class="fa fa-circle fa-1x" title="Button" ></i></a></li>'
        var icon_geometry = '<li><a href="javascript:action(\'protractor\');" data-tooltip="Protractor"><span class="radial-scaling"></span></a></li>';
        var icon_protractor = '<li><a href="javascript:action(\'gauge\');" data-tooltip="Protractor"><ion-icon name="speedometer" style="zoom:1.5;" title="Gauge"></ion-icon></a></li>';
        var icon_line = '<li><a href="javascript:void(0);" class="flyout-link" data-placement="top" data-tooltip="Line"><span class="line"></span><i class="tools-more"></i></a> <div class="whiteboard-change-flyout whiteboard-directional black-flyout"> <ul class="clearfix"> <li><a href="javascript:action(\'linearrow-straight\');"  data-tooltip="Line"><span class="line-scale"></span></a></li> <li><a href="javascript:action(\'linearrow-end\');" data-tooltip="Line with arrow( End )"><span class="right-dir"></span></a></li> <li><a href="javascript:action(\'linearrow-start\');" data-tooltip="Line with arrow( Start )"><span class="left-dir"></span></a></li> <li><a href="javascript:action(\'linearrow-both\');" data-tooltip="Line with arrow( Both )"><span class="both-dir"></span></a></li> </ul> </div> </li>';
        //var icon_text = '<li><a href="javascript:void(0);"<i class="fa fa-upload" aria-hidden="true"></i>';
        var icon_text = '<li><a href="javascript:action(\'text\');" class="flyout-link" data-tooltip="Text" data-placement="top"><i class="fa fa-text-height" title="Text"></i></a></li>';
        var icon_crop = '<li><a href="javascript:void(0);" class="flyout-link"  data-tooltip="Crop" data-placement="top"><span class="crop"></span><i class="tools-more"></i></a> <div class="whiteboard-change-flyout whiteboard-crop black-flyout"> <ul class="clearfix"> <li><a href="javascript:action(\'copy-paste\');" data-tooltip="Crop Region"><span class="crop-resize"></span></a></li> <li><a href="javascript:action(\'free-copy-paste\');"  data-tooltip="Crop Free Hand"><span class="crop-selection"></span></a></li> </ul> </div> </li> ';
        var icon_layers= '<li><a href="javascript:action(\'layers\');"  data-tooltip="Layers" data-placement="top" class="flyout-link"><span class="layer"></span><i class="tools-more"></i></a> <div class="whiteboard-change-flyout vscroll whiteboard-layer black-flyout"> <ul class="clearfix" id="layers_list">  </ul> </div> </li> ';
        
        //var icon_gallery = '<li><a href="javascript:void(0);" class="flyout-link" data-tooltip="Image Gallery"><span class="grallery"></span><i class="tools-more"></i></a> <div class="whiteboard-change-flyout whiteboard-gallery black-flyout"> <ul class="clearfix subject-list vscroll galleryaccordion"> <li><a href="javascript:void(0);" class="subject-link"><span class="view-toggle"></span>Environmental Science</a> <ul class="detail-list clearfix"> <li><a href="javascript:void(0);"><span></span><div>Environment - 1</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Environment - 2</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Environment - 3</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Environment - 4</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Environment - 5</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Environment - 6</div></a></li> </ul> </li> <li><a href="javascript:void(0);" class="subject-link  active"><span class="view-toggle"></span>Biology</a> <ul class="detail-list clearfix"> <li><a href="javascript:void(0);"><span class="view-active"></span><div>Human Body</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Hormones</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Animal Kingdom</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Human</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Environment</div></a></li> <li><a href="javascript:void(0);"><span></span><div>Classification of animals</div></a></li> </ul> </li> <li><a href="javascript:void(0);" class="subject-link"><span class="view-toggle"></span>Physics</a></li> <li><a href="javascript:void(0);" class="subject-link"><span class="view-toggle"></span>Geography</a></li> <li><a href="javascript:void(0);" class="subject-link"><span class="view-toggle"></span>History</a></li> <li><a href="javascript:void(0);" class="subject-link"><span class="view-toggle"></span>Mathematics</a> </li> </ul> <!-- Subject ellaborative description--> <div class="subject-ellabration"> <ul class="clearfix vscroll"> <li><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/heart-subject.png" alt="" />Heart : ExternalView</a></li> <li><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/brain-subject.png" alt="" />Brain</a></li> <li><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/kidney-subject.png" alt="" />Kidney : Cross Section</a></li> </ul> </div> </div> </li>';
        var icon_gallery = '<li><a href="javascript:void(0);" class="flyout-link"  data-tooltip="Image Gallery" data-placement="top"><span class="fa fa-image" title="Menu" onclick=getImage()  style="padding-top:0px;margin-left: 0px;cursor: pointer;display: block;width: 0px;height:0px";></span></a><div class="whiteboard-change-flyout whiteboard-gallery black-flyout"><div class="gallery-head clearfix">Image Gallery <div class="flyBoard_searchBar"><input type="text" id="gallery_search" class="search_text" style="display:none"></div></div><div class="upload_rel_cont subject-list"><ul class="clearfix subject-list vscroll galleryaccordion" id="WhiteboardGallery" style="overflow-x:hidden;padding-bottom:30px"></ul><a href="javascript:action(\'image_upload\');" class="upload_fixed_btn">Upload Image</a></div><div class="subject-ellabration"><ul class="clearfix vscroll" style="display:none"></ul></div></div></li>';
        var icon_hideshow = '<li><a href="javascript:action(\'background-visiblity\');" class="flyout-link"><span class="hideshow"></span></a></li>';
        
        var icon_undo = '<li><a href="javascript:action(\'undo\');" class="flyout-link" data-tooltip="Undo" data-placement="top"><span class="undo"></span></a></li>';
        var icon_redo = '<li><a href="javascript:action(\'redo\');" class="flyout-link" data-tooltip="Redo" data-placement="top"><span class="redo"></span></a></li>';
        var icon_reset = '<li><a href="javascript:action(\'reset\');" class="flyout-link" data-tooltip="Reset" data-placement="top"><span class="reset"></span></a></li>';
        var icon_rename = '<li><a href="javascript:void(0);" class="renamepopup flyout-link" data-tooltip="Rename Whiteboard" data-placement="top"><span class="rename"></span></a></li>';
        var icon_assignment = '<li><a href="javascript:void(0);" class="assignmentpopup flyout-link" data-tooltip="Home Assignment" data-placement="top"><span class="assign"></span></a></li>';
        var icon_save = '<li><a href="javascript:void(0);" class="savepopup flyout-link" data-tooltip="Save" data-placement="bottom"><span class="save"></span></a></li>';
        var icon_export = '<li><a class="exportpopup flyout-link" download="whiteboard-screenshot.png" data-tooltip="Export" data-placement="top"><span class="export"></span></a></li>';
        var icon_delete = '<li><a href="javascript:void(0);" class="deletemsg flyout-link"  data-tooltip="Delete Whiteboard" data-placement="top"><span class="delete"></span></a></li>';

        var icon_close = '<li><a href="javascript:void(0);" data-tooltip="Close Whiteboard" data-placement="top"><span class="closeboard"></span></a></li>';
        //var popup_save = '<div class="rename-whiteboard-dialog dialoghide"> <p class="popup-title rename-whitebrd-title">New Board</p> <div class="dialog-content"> <form class="formstyles" id="newWhiteBoard"> <div class="detailform"> <div class="field-wrapper"> <label for="title">Title</label> <input name="title" placeholder="Title" required/> </div> </div> <p class="activityfromhead mb15">Organize</p> <div class="detailform"> <div class="twofields clearfix"> <div class="field-wrapper"> <label for="class">Class</label> <select name="class" placeholder="Class" required> <option value="" selected="selected">Class</option> <option value="c1">Class 12</option> <option value="c2">Class 8</option> <option value="c3">Class 11</option> <option value="c4">Class 4</option> <option value="c5">Class 6</option> </select> </div> <div class="field-wrapper"> <label for="subject">Subject</label> <select name="subject" placeholder="Subject" required> <option value="" selected="selected">Subject</option> <option value="Eg">English</option> <option value="Ma">Mathematics</option> <option value="Ph">Physics</option> <option value="Sc">Science</option> <option value="Ch">Chemistry</option> <option value="Ge">Geography</option> </select> </div> </div> <div class="field-wrapper"> <label for="chapter">Chapter</label> <select name="chapter" placeholder="Chapter" required> <option value="" selected="selected">Chapter</option> <option value="c1">The Human Eye and a Colourful World</option> <option value="c2">Light-Reflection and Refraction</option> <option value="c3">Electricity</option> <option value="c4">Magnetic Effects of Electric Current</option> <option value="c5">Sources of Energy</option> </select> </div> <div class="field-wrapper"> <label for="topic">Topic</label> <select name="topic" placeholder="Topic" required> <option value="" selected="selected">Topic</option> <option value="t1">The Human Eye</option> <option value="t2">Defects of Vision and Their Correction</option> <option value="t3">Refraction of Light Through a Prism</option> <option value="t4">Dispersion of White Light by a Glass Prism</option> <option value="t5">Atmospheric Refraction</option> <option value="t6">Scattering of Light</option> </select> </div> </div> <div class="bottombuttons"> <button type="submit" class="ternary-btn width100">Save</button> <button type="button" class="button4 width100 dialog-close">Cancel</button> </div> </form> </div> </div>';
        var tools = '<section class="action-icons-bg " style="width:0px"> <div class="" margin-right: 5px auto;"><div class="sitewidth clearfix">';
            //tools += ul_action_icon + icon_overview + ul_close;
            //tools += ul_action_icon_divider + icon_resource + icon_background + ul_close;
            //tools += ul_action_icon_divider + icon_move + ul_close;
            //tools += ul_action_icon + icon_pencil + ul_close;
			tools += ul_action_icon_divider + icon_protractor ;
			tools += ul_action_icon_divider + icon_circle;
            tools += ul_action_icon_divider + icon_shape;
            tools += ul_action_icon_divider + icon_gallery;
            tools += ul_action_icon_divider + icon_trend;
            tools += ul_action_icon_divider + icon_video;
            tools += ul_action_icon_divider + icon_text;
            //tools += ul_action_icon + icon_undo + icon_redo + icon_reset + ul_close;
            //tools += ul_action_icon_divider + icon_rename + ul_close;
            //tools += ul_action_icon + icon_save + icon_export + icon_delete + ul_close;
            //tools += ul_action_icon_divider + icon_close + ul_close;
            //tools += '</div> </div></section>';
        // var penciltools = '<div class="pencil-tools clearfix" id="pencil_tools" style="display:none"> <ul class="action-icons-whiteboard dividerpattern"> <li><a href="javascript:selectcolor(\'black\');"><span class="colorbox black selected"></span></a></li> <li><a href="javascript:selectcolor(\'red\');"><span class="colorbox red"></span></a></li> <li><a href="javascript:selectcolor(\'green\');"><span class="colorbox green"></span></a></li> <li><a href="javascript:selectcolor(\'blue\');"><span class="colorbox blue"></span></a></li> <li><a href="javascript:selectcolor(\'erasor\');"><span class="colorbox blue"></span></a></li> <li><span class="empty"></span></li> <li></li> <li><a href="javascript:selectsize(\'small\');"><span class="sizebox small selected">&bull;</span></a></li> <li><a href="javascript:selectsize(\'medium\');"><span class="sizebox medium">&bull;</span></a></li> <li><a href="javascript:selectsize(\'large\');"><span class="sizebox large">&bull;</span></a></li> </ul> </div>';
        //var shapetools = '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <div class="pencil-tools clearfix" id="shape_tools" style="display:none"> <ul class="action-icons-whiteboard dividerpattern"> <li><a href="javascript:action(\'rectangle\');"><span class="shapebox rectangle"></span></a></li> <li><a href="javascript:action(\'square\');"><span class="shapebox square"></span></a></li> <li><a href="javascript:action(\'circle\');"><span class="shapebox circle"></span></a></li> <li><a href="javascript:action(\'ellipse\');"><span class="shapebox ellipse"></span></a></li> <li><a href="javascript:action(\'pentagon\');"><span class="shapebox pentagon"></span></a></li>  </ul> </div>';
        var layers = '<div class="pencil-tools layers clearfix" id="layers_tools" style="display:none"> <ul class="action-icons-whiteboard dividerpattern">  </ul> </div>';
        var gallery = '<div class="pencil-tools gallery clearfix" id="gallery_images" style="display:none"> <ul class="action-icons-whiteboard dividerpattern"> <li id="gallery_0"><img src="'+WHITEBOARD.hostURL+'images/gallery/africa_th.png"></li> <li id="gallery_1"><img src="'+WHITEBOARD.hostURL+'images/gallery/cycle_th.png"></li><li id="gallery_2"><img src="'+WHITEBOARD.hostURL+'images/gallery/ship_th.png"></li> </ul> </div>';
        //String HTML
        mainHTML = '<section class="sitewidth">';
            mainHTML += '<div class="whiteboardbg" style="width:'+board.width+'px;top:'+board.top+';right:0px;left:0px;margin: 0 auto;">';
                mainHTML += '<div class="tabs clearfix">';
                    mainHTML += tablist+'<div class="tabcont">'+canvastabcontent+'</div>';
                mainHTML += '</div>';
                mainHTML += addtabcontent;
                mainHTML += whiteboardoverlay;
            mainHTML += '</div>';
        mainHTML += '</section>';
        mainHTML += tools;
        //mainHTML += popup_save;
        // if(WHITEBOARD.firstExecute)
        // {
        //   mainHTML +='<div class="polygon-side-dialog dialoghide"> <p class="popup-title">Polygon Sides</p> <div class="dialog-content"> <p class="chaptertitle" style="margin-left: -10px;margin-bottom: 10px;"> <button type="button" class="button9 polygon-btns" onclick="createPentagon(3)">3</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(4)">4</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(5)">5</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(6)">6</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(7)">7</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(8)">8</button> </p> <p class="chaptertitle" style="margin-left: -10px;margin-bottom: 10px;"> <button type="button" class="button9 polygon-btns" onclick="createPentagon(9)">9</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(10)">10</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(11)">11</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(12)">12</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(13)">13</button> <button type="button" class="button9 polygon-btns" onclick="createPentagon(14)">14</button> </p> <div class="bottombuttons" style="text-algin:center"> <button type="button" class="button5 width100 dialog-close" onclick="closedialog()">Cancel</button> </div> </div> </div>';
        //   mainHTML +='<div class="rename-whiteboard-dialog dialoghide"> <p class="popup-title rename-whitebrd-title">New Board</p> <div class="dialog-content"> <form class="formstyles" id="newWhiteBoard" action="javascript:void(0)"> <div class="detailform"> <div class="field-wrapper"> <label for="title">Title</label> <input name="whiteboardtitle" placeholder="Title" required/> </div> </div> <p class="activityfromhead mb15">Organize</p> <div class="detailform"> <div class="twofields clearfix"> <div class="field-wrapper"> <label for="wb_class">Class</label> <select name="wb_class" placeholder="Class" required>  </select> </div> <div class="field-wrapper"> <label for="wb_subject">Subject</label> <select name="wb_subject" placeholder="Subject" required> </select> </div> </div> <div class="field-wrapper"> <label for="wb_chapter">Chapter</label> <select name="wb_chapter" placeholder="Chapter" required>  </select> </div> <div class="field-wrapper"> <label for="wb_topic">Topic</label> <select name="wb_topic" placeholder="Topic">  </select> </div> </div> <div class="bottombuttons"> <button type="button" class="ternary-btn width100" id="newWhiteBoardSave">Save</button> <button type="button" class="button4 width100 save-dialog-close">Cancel</button> </div> </form> </div> </div>';
        //   mainHTML +='<div class="alert-unsaved-message-dialog dialoghide"> <p class="popup-title">Do you want to load the unsaved whiteboard?</p> <div class="dialog-content"> <p class="chaptertitle"></p> <div class="bottombuttons"> <button type="button" class="ternary-btn width100" id="continueunsave">Continue</button> <button type="button" class="button4 clearDraft" style="width: 100px;" id="createnewWhiteboard">Create New</button> </div> </div> </div>';
        //   mainHTML +='<div class="alert-clear-message-dialog dialoghide"> <p class="popup-title alert-title">Alert</p> <div class="dialog-content"> <p class="chaptertitle">Whiteboard contents for this tab will be lost, are you sure you want to clear the tab ?</p> <div class="bottombuttons"> <button type="button" class="button10 width100" id="clear-tab">OK</button> <button type="button" class="button7 width100 dialog-close">Cancel</button> </div> </div> </div>';
        //   mainHTML +='<div class="addattach-activity-dialog add-image-dialog dialoghide"> <p class="popup-title">Upload Image</p> <div class="dialog-content"> <form class="formstyles"> <div class="addattach-form"> <div class="browsing browsing-fields clearfix"> <div class="field-wrapper wd65" style="margin-right: 5px;width: 60%;"> <input name="sname" id="fileNameImage" value="Please Select the image" disabled=""> </div> <div class="field-wrapper choosefile wd30"> <span class="att-txt">Browse Image</span> <input id="imageFileChooser" type="file" name="files"> </div> </div> <div class="field-wrapper"> <label for="title">Title</label> <input name="title" id="category3" placeholder="Title"> </div> <div class="field-wrapper"> <label for="categories">Type</label> <select name="categories" id="category1"> </select> </div> <div class="field-wrapper"> <label for="categories">Type</label> <select name="categories" id="category2"> </select> </div> <div class="bottombuttons"> <button type="button" class="ternary-btn width100 attachadddialog" id="uploadImage">Add</button> <button type="button" class="button4 width100 dialog-close">Cancel</button> </div> </div> </form> </div> </div>';
        //   mainHTML +='<div class="delete-confirm-dialog dialoghide"> <p class="popup-title delete-title">Delete Confirmation</p> <div class="dialog-content"> <p class="chaptertitle">Are you sure you want to delete the whiteboard ?</p> <div class="bottombuttons"> <button type="button" class="button9 width100" id="delete_whiteboard_confirm">Delete</button> <button type="button" class="button5 width100 dialog-close">Cancel</button> </div> </div> </div>';
        //   mainHTML +='<div class="delete-tab-confirm-dialog dialoghide"> <p class="popup-title delete-title">Delete Confirmation</p> <div class="dialog-content"> <p class="chaptertitle">Are you sure you want to delete the whiteboard slide ?</p> <div class="bottombuttons"> <button type="button" class="button9 width100" id="delete_whiteboard_tab_confirm">Delete</button> <button type="button" class="button5 width100 dialog-close">Cancel</button> </div> </div> </div>';
        //   mainHTML +='<div class="network-error-dialog dialoghide"> <p class="popup-title delete-title">Network Error</p> <div class="dialog-content"> <p class="">Unable to save whiteboard due to network issues. <br/><b>Try again</b> after sometime.</p> <div class="bottombuttons"> <button type="button" class="button9 width100" id="network_retry_confirm">Try Again</button> <button type="button" class="button5" id="close_network_popup" style="width:200px">Ignore, I shall save later</button></div> </div> </div>';
        //   mainHTML +='<div class="delete-gallery-confirm-dialog dialoghide"> <p class="popup-title delete-title">Delete Confirmation</p> <div class="dialog-content"> <p class="chaptertitle">Are you sure you want to delete the gallery image ?</p> <div class="bottombuttons"> <button type="button" class="button9 width100" id="delete_whiteboard_gallery_confirm">Delete</button> <button type="button" class="button5 width100 dialog-close">Cancel</button> </div> </div> </div>';
        // }
        /*mainHTML += '<section class="action-icons-bg">';
            mainHTML += penciltools;
            mainHTML += shapetools;
            mainHTML += layers;
            mainHTML += gallery;
            mainHTML += tools;
        mainHTML += '</section>';
        */var element = document.getElementById(this.tagId);
        element.innerHTML = mainHTML;
		////console.log("ele",mainHTML)
        /*element.style.width = this.width+"px";
        element.style.height = this.height+"px";
        element.style.position = 'absolute';
        element.style['overflow-y'] = 'scroll';
        element.style['overflow-x'] = 'hidden';*/
        canvasProps = new CanvasProps(this.width-70, this.height-150, CanvasProps.DEFAULT_FILL_COLOR);
        ////console.log("init",canvasProps)
        //getImage();
        
        // $(document).ready(function(){
        //          var socket = io.connect('http://127.0.0.1:4000');
        //          //console.log(socket);
        //          socket.on('connect', function(){ 
        //             //console.log("connect");
        //          });
        //          var url = window.location.href;
        //          //console.log("adadaf",url.split(/\//)[6])
        //          var projectId = url.split(/\//)[6];
        //          //console.log("adadaf",projectId)
        //          socket.on("project-"+projectId,function(message)
        //          {  
        //              //console.log("projectid")
        //              var object = JSON.parse(message);
        //              //console.log("message",message)
        //              var new_status_on;
        //              var new_status_off;
        //              for(i=0;i<=STACK.figures.length;i++)
        //              {
        //               var text = STACK.figures[i].tag_id
        //               var obj = STACK.figures[i];
        //                 if(text==object.tag_id){
        //                 var componentlibrary_id=STACK.figures[i].componentLibraryId
        //                 //console.log("object_data",object_data)
        //                 if(object_data!=null){
        //                 for(i=0;i<object_data.length;i++){
        //                   if(object_data[i].id==componentlibrary_id)
        //                   { 
        //                     new_status_on=object_data[i].status_on;
        //                     new_status_off=object_data[i].status_off;
        //                     break;
        //                   }
        //                 }
        //               }
        //                 var message=object.output
        //                 if(message==1){
        //                   if(obj.name=="Image")
        //                   { 
        //                     obj.primitives[0].setUrl(base_URL+"/"+new_status_on,base_URL+"/"+new_status_on);
        //                     }else 
        //                     { 
        //                       updateShape(obj.id,'style.fillStyle',"rgba(116,204,84)");
        //                       updateShape(obj.id,'style.strokeStyle',"rgba(116,204,84)");
        //                     }
        //                   }
        //                   else if(message==0){
        //                     if(obj.name=="Circle")
        //                     {
        //                     updateShape(obj.id,'style.fillStyle',"rgba(255,59,60)");
        //                     updateShape(obj.id,'style.strokeStyle',"rgba(255,59,60)");
        //                     }
        //                     else
        //                     {
        //                       obj.primitives[0].setUrl(base_URL+"/"+new_status_off,base_URL+"/"+new_status_off);
        //                     }
        //                   }
        //                   else{
        //                     if(obj.name=="Rectangle")
        //                   {
        //                     //console.log("rectangle",obj.name)
        //                     //console.log("rectangle tagid",object.output)
        //                     updateShape(obj.id,'percentage',object.output)
        //                     figure_Rectangle(message)
        //                   } 
        //                 }
        //             draw();
                        
                        
                      
        //               }
        //           }
        //        });
        //     });
            init(callback);
        if(WHITEBOARD.firstExecute)
        {
          //Dialog Box
          $('.polygon-side-dialog').dialog({ autoOpen: false, draggable: false, resizable: false, modal: true, autoReposition: true});
          $( ".alert-message-dialog, .delete-confirm-dialog, .delete-tab-confirm-dialog, .network-error-dialog, .delete-gallery-confirm-dialog, .alert-unsaved-message-dialog, .alert-clear-message-dialog, .addattach-activity-dialog, .rename-whiteboard-dialog, .save-confirmation-dialog" ).dialog({ autoOpen: false, draggable: false, resizable: false, modal: true, autoReposition: true});

          $(window).resize(function(){
            $(".alert-message-dialog, .delete-confirm-dialog, .delete-tab-confirm-dialog, .network-error-dialog, .delete-gallery-confirm-dialog, .alert-unsaved-message-dialog, .alert-clear-message-dialog, .addattach-activity-dialog, .rename-whiteboard-dialog, .save-confirmation-dialog").dialog("option", "position", {my: "center", at: "center", of: window});
          });

          //Close Dialog Popup
          $( ".dialog-close" ).click(function() {
            $( ".alert-message-dialog, .delete-confirm-dialog, .delete-tab-confirm-dialog, .network-error-dialog, .delete-gallery-confirm-dialog, .alert-unsaved-message-dialog, .alert-clear-message-dialog, .addattach-activity-dialog, .rename-whiteboard-dialog, .save-confirmation-dialog" ).dialog( "close" );
            return false;
          });

          $( ".alert-message-dialog, .delete-confirm-dialog, .delete-tab-confirm-dialog, .network-error-dialog, .delete-gallery-confirm-dialog, .alert-unsaved-message-dialog, .alert-clear-message-dialog, .addattach-activity-dialog, .rename-whiteboard-dialog, .save-confirmation-dialog" ).dialog({ width: 400 });
        }
          WHITEBOARD.selectedClass = $().schoolclass();
          WHITEBOARD.selectedClass.chapterid = $().chapter();
          $('#currentSubjectChapters').populateChaptersList(WHITEBOARD.selectedClass.gradeId,WHITEBOARD.selectedClass.subjectId);
          
          if(WHITEBOARD.currentSelectedClass != null)
            WHITEBOARD.selectedClass = WHITEBOARD.currentSelectedClass;
          //WHITEBOARD.getChapters = getwbChapters(WHITEBOARD.selectedClass.grade,WHITEBOARD.selectedClass.subject);
          //Initialize the select boxes of select box

          /*For the open Box Dropdowns*/
          $('select[name="OpenClass"]').populateClasses(function(){
            var flag = false;
            $('select[name="OpenClass"] option').each(function(){
              if($(this).value==WHITEBOARD.selectedClass.gradeId)
              {  
                flag = true;
                return false;
              }
            });
            if(flag)
            {
              $('select[name="OpenClass"]').val(WHITEBOARD.selectedClass.gradeId);
              $('select[name="OpenSubject"]').populateSubjects($('select[name="OpenClass"]').val(),function(){
                $('select[name="OpenSubject"]').val(WHITEBOARD.selectedClass.subjectId);
                 //$('#currentSubjectChapters').populateChaptersList(WHITEBOARD.selectedClass.grade,WHITEBOARD.selectedClass.subject);
              });
            }
          });
          $('select[name="OpenClass"]').change(function(){
            $('select[name="OpenSubject"]').populateSubjects($(this).val());
            $('#otherSubjectChapters').populateChaptersList($('select[name="OpenClass"]').val(),$('select[name="OpenSubject"]').val());
            
          });
          $('select[name="OpenSubject"]').change(function(){
            $('#otherSubjectChapters').populateChaptersList($('select[name="OpenClass"]').val(),$('select[name="OpenSubject"]').val());
          });

          $('select[name="wb_class"]').populateClasses(function(){
            var flag = false;
            for(var i = 0, opts = document.getElementsByName("wb_class")[0].options; i < opts.length; ++i)
             if( opts[i].value === WHITEBOARD.selectedClass.gradeId )
             {
                flag = true; 
                break;
             }
            /*$('select[name="wb_class"] option').each(function(){
              if($(this).value==WHITEBOARD.selectedClass.gradeId)
              {  
                flag = true;
                return false;
              }
            });*/
            if(flag)
            {
              $('select[name="wb_class"]').val(WHITEBOARD.selectedClass.gradeId);
            }
              $('select[name="wb_subject"]').populateSubjects($('select[name="wb_class"]').val(),function(){
                $('select[name="wb_subject"]').val(WHITEBOARD.selectedClass.subjectId);
                $('select[name="wb_chapter"]').populateChapters(WHITEBOARD.selectedClass.gradeId,WHITEBOARD.selectedClass.subjectId,function(){
                  $('select[name="wb_chapter"]').val(WHITEBOARD.selectedClass.chapterid);
                  $('select[name="wb_topic"]').populateTopics($('select[name="wb_chapter"]').val());
                });
              });
            //}
          });
          //$('select[name="subject"]').populateSubjects($('select[name="class"]').val());
          $('select[name="wb_class"]').change(function(){
            ////console.log("on class selection changes...")
            $('select[name="wb_subject"]').populateSubjects($(this).val());
            $('select[name="wb_chapter"]').populateChapters($('select[name="wb_class"]').val(),$('select[name="wb_subject"]').val(),function(){
              $('select[name="wb_topic"]').populateTopics($(this).val());
            });
          });
          $('select[name="wb_subject"]').change(function(){
            $('select[name="wb_chapter"]').populateChapters($('select[name="wb_class"]').val(),$('select[name="wb_subject"]').val(),function(){
              $('select[name="wb_topic"]').populateTopics($(this).val());
            });
          });
          
          $('select[name="wb_chapter"]').change(function(){
            $('select[name="wb_topic"]').populateTopics($(this).val());
          });

          
        WHITEBOARD.firstExecute = false;
        
    }

    
};
function getImage(){
    ////console.log("getimagecalled")
            var url="/project/library";
            var str='';
            $.getJSON(url,function (data) {
            ////console.log("jsondata",data)
            object_data=data.data
            //str=str+'<ul><li>'+ +'</li></ul>'
            $.each(data.data, function (index, value){
                //k=data.data[index].default_images
                //var data_json=JSON.stringify(value)
                var imageurl="http://127.0.0.1:8000/"+value.default_image;
                var image=base_URL+"/"+value.default_image;
                //str=str+'<ul><li><a href="javascript:insertComponent('+ index +')"><img src="http://127.0.0.1:8000/'+value.default_image+'" width="25" height="25"></a></li><li>'+value.name+'</li></ul>'
                str=str+'<ul><li><a href="javascript:insertComponent('+ index +')"><img src='+base_URL+"/"+value.default_image+' width="25" height="25"></a></li><li>'+value.name+'</li></ul>'
                $("#WhiteboardGallery").html(str);
        });     
                
        
            // str.onclick = function() {
            //     window.location.href = '';
            // }
            // document.body.appendChild(str);
    });
    
}


function insertComponent(index){

    ////console.log("e value",object_data);
    
            currentImage=object_data[index]
            currentUrl=base_URL+"/"+object_data[index].default_image;
            ////console.log("current",currentImage)
            action(currentImage)
 
            }

/**
  * Creates an instance of Point
  **/

function Point(x, y){
    /**The x coordinate of point*/
    this.x = x;
    
    /**The y coordinate of point*/
    this.y = y;
    
    /**The {@link Style} of the Point*/
    this.style = new Style();
    
    /**Serialization type*/
    this.oType = 'Point'; //object type used for JSON deserialization
}

/**Creates a {Point} out of JSON parsed object
 **/
Point.load = function(o){
    var newPoint = new Point(Number(o.x), Number(o.y));
    newPoint.style = Style.load(o.style);
    return newPoint;
}


/**Creates an array of points from an array of {JSONObject}s
 **/
Point.loadArray = function(v){
 
    var newPoints = [];
    for(var i=0; i< v.length; i++){
        newPoints.push(Point.load(v[i]));
    }
    return newPoints;
}


/**Clones an array of points
 **/
Point.cloneArray = function(v){
    var newPoints = [];
    for(var i=0; i< v.length; i++){
        newPoints.push(v[i].clone());
    }
    return newPoints;
}

Point.prototype = {
    constructor : Point,
    
    /*
     *Transform a point by a tranformation matrix. 
     **/
    transform:function(matrix){
        if(this.style!=null){
            this.style.transform(matrix);
        }
        var oldX = this.x;
        var oldY = this.y;
        this.x = matrix[0][0] * oldX + matrix[0][1] * oldY + matrix[0][2];
        this.y = matrix[1][0] * oldX + matrix[1][1] * oldY + matrix[1][2];
    },

    /**Paint current {Point} withing a context
     **/
    paint:function(context){
		
        if(this.style != null){
            this.style.setupContext(context);
        }
        if(this.style.strokeStyle != ""){
            context.fillStyle = this.style.strokeStyle;
            context.beginPath();
            var width = 1;
            if(this.style.lineWidth != null){
                width = parseInt(this.style.lineWidth);
            }
            context.arc(this.x, this.y, width, 0,Math.PI/180*360,false);
            context.fill();
        }
    },


    /**Tests if this point is similar to other point
     **/
    equals:function(anotherPoint){
        if(! (anotherPoint instanceof Point) ){
            return false;
        }
        return (this.x == anotherPoint.x)
        && (this.y == anotherPoint.y)
        && this.style.equals(anotherPoint.style);
    },

    /**Clone current Point
     **/
    clone: function(){
        var newPoint = new Point(this.x, this.y);
        newPoint.style = this.style.clone();
        return newPoint;
    },

    /**Tests to see if a point (x, y) is within a range of current Point
     **/
    near:function(x, y, radius){
        var distance = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));

        return (distance <= radius);
    },

    contains: function(x,y){
        return this.x == x && this.y == y;
    },

    toString:function(){
        return 'point(' + this.x + ',' + this.y + ')';
    },

    getPoints:function(){
        return [this];
    },
    
    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },

    /**
     **/
    toSVG: function(){
        var r = '';

        r += "\n" + repeat("\t", INDENTATION) + '<circle cx="' + this.x + '" cy="' + this.y + '" r="' + 1 + '"' ;
        r += this.style.toSVG();
        r += '/>';

        return r;
    }


};




/**
  * Creates an instance of a Line. A Line is actually a segment and not a pure
  * geometrical Line
  **/
function Line(startPoint, endPoint){
    /**Starting {@link Point} of the line*/
    this.startPoint = startPoint;
    
    /**Ending {@link Point} of the line*/
    this.endPoint = endPoint;
    
    /**The {@link Style} of the line*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    /**Serialization type*/
    this.oType = 'Line'; //object type used for JSON deserialization
}

/**Creates a {Line} out of JSON parsed object
 **/
Line.load = function(o){
    var newLine = new Line(
        Point.load(o.startPoint),
        Point.load(o.endPoint)
    );

    newLine.style = Style.load(o.style);
    return newLine;
}

Line.prototype = {
    contructor: Line,
    
    transform:function(matrix){
        this.startPoint.transform(matrix);
        this.endPoint.transform(matrix);
        if(this.style!=null){
            this.style.transform(matrix);
        }

   },

    paint:function(context){
       
        context.beginPath();
        
        if(this.style != null){
            this.style.setupContext(context);
        }
        context.moveTo(this.startPoint.x, this.startPoint.y);
        if(this.style.dashLength==0){
            context.lineTo(this.endPoint.x, this.endPoint.y);
            context.closePath(); // added for line's correct Chrome's displaying
        }
        else{

            //get the length of the line
            var lineLength=Math.sqrt(Math.pow(this.startPoint.x-this.endPoint.x,2)+Math.pow(this.startPoint.y-this.endPoint.y,2));

            //get the angle
            var angle = Util.getAngle(this.startPoint,this.endPoint);

            //draw a dotted line
            var move=false;
            for(var i=0; i<lineLength; i+=(this.style.dashLength)){
                var p = this.startPoint.clone();

                //translate to origin of start
                p.transform(Matrix.translationMatrix(-this.startPoint.x,-this.startPoint.y))

                //move it north by incremental dashlengths
                p.transform(Matrix.translationMatrix(0, -i));

                //rotate to correct location
                p.transform(Matrix.rotationMatrix(angle));

                //translate back
                p.transform(Matrix.translationMatrix(this.startPoint.x,this.startPoint.y))

                if (move==false){
                    context.lineTo(p.x, p.y);
                    move=true;
                }
                else{
                    context.moveTo(p.x, p.y);
                    move=false;
                }
            }
        }

        if(this.style.strokeStyle != null && this.style.strokeStyle != ""){
            context.stroke();
        }
    },

    clone:function(){
        var ret = new Line(this.startPoint.clone(), this.endPoint.clone());
        ret.style = this.style.clone();
        return ret;
    },

    equals:function(anotherLine){
        if(!anotherLine instanceof Line){
            return false;
        }
        return this.startPoint.equals(anotherLine.startPoint)
        && this.endPoint.equals(anotherLine.endPoint)
        && this.style.equals(anotherLine.style);
    },

    /** Tests to see if a point belongs to this line (not as infinite line but more like a segment)
     **/
    contains: function(x, y){
        // if the point is inside rectangle bounds of the segment
        if (Math.min(this.startPoint.x, this.endPoint.x) <= x
            && x <= Math.max(this.startPoint.x, this.endPoint.x)
            && Math.min(this.startPoint.y, this.endPoint.y) <= y
            && y <= Math.max(this.startPoint.y, this.endPoint.y)) {

            // check for vertical line
            if (this.startPoint.x == this.endPoint.x) {
                return x == this.startPoint.x;
            } else { // usual (not vertical) line can be represented as y = a * x + b
                var a = (this.endPoint.y - this.startPoint.y) / (this.endPoint.x - this.startPoint.x);
                var b = this.startPoint.y - a * this.startPoint.x;
                return y == a * x + b;
            }
        } else {
            return false;
        }
    },

    /*
     *See if we are near a {Line} by a certain radius (also includes the extremities into computation)
     **/
    near:function(x,y,radius){
        
        if(this.endPoint.x === this.startPoint.x){ //Vertical line, so the vicinity area is a rectangle
            return ( (this.startPoint.y-radius<=y && this.endPoint.y+radius>=y) 
                    || (this.endPoint.y-radius<=y && this.startPoint.y+radius>=y))
            && x > this.startPoint.x - radius && x < this.startPoint.x + radius ;
        }
        
        if(this.startPoint.y === this.endPoint.y){ //Horizontal line, so the vicinity area is a rectangle
            return ( (this.startPoint.x - radius<=x && this.endPoint.x+radius>=x) 
                    || (this.endPoint.x-radius<=x && this.startPoint.x+radius>=x))
                    && y>this.startPoint.y-radius && y<this.startPoint.y+radius ;
        }


        var startX = Math.min(this.endPoint.x,this.startPoint.x);
        var startY = Math.min(this.endPoint.y,this.startPoint.y);
        var endX = Math.max(this.endPoint.x,this.startPoint.x);
        var endY = Math.max(this.endPoint.y,this.startPoint.y);
        
        //First we need to find a,b,c of the line equation ax + by + c = 0
        var a = this.endPoint.y - this.startPoint.y;
        var b = this.startPoint.x - this.endPoint.x;        
        var c = -(this.startPoint.x * this.endPoint.y - this.endPoint.x * this.startPoint.y);

        //Secondly we get the distance "Mathematics for Computer Graphics, 2nd Ed., by John Vice, page 227"
        var d = Math.abs( (a*x + b*y + c) / Math.sqrt(Math.pow(a,2) + Math.pow(b,2)) );

        //Thirdly we get coordinates of closest line's point to target point
        var closestX = (b * (b*x - a*y) - a*c) / ( Math.pow(a,2) + Math.pow(b,2) );
        var closestY = (a * (-b*x + a*y) - b*c) / ( Math.pow(a,2) + Math.pow(b,2) );

        var r = ( d <= radius && endX>=closestX && closestX>=startX && endY>=closestY && closestY>=startY ) //the projection of the point falls INSIDE of the segment
            || this.startPoint.near(x,y,radius) || this.endPoint.near(x,y,radius); //the projection of the point falls OUTSIDE of the segment 

        return  r;

    },

    /**we need to create a new array each time, or we will affect the actual shape*/
    getPoints:function(){
        var points = [];
        points.push(this.startPoint);
        points.push(this.endPoint);
        return points;
    },
    
    getPoint: function(t){
        var Xp = t * (this.endPoint.x - this.startPoint.x) + this.startPoint.x;
        var Yp = t * (this.endPoint.y - this.startPoint.y) + this.startPoint.y;
        
        return new Point(Xp, Yp);
    },    
    
    /**
     * */
    getMiddle : function(){
        return Util.getMiddle(this.startPoint, this.endPoint);
    },
    
    
    getLength : function(){
        return Util.getLength(this.startPoint, this.endPoint);
    },

    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },

    /**String representation*/
    toString:function(){
        return 'line(' + this.startPoint + ',' + this.endPoint + ')';
    },

    /**Render the SVG fragment for this primitive*/
    toSVG:function(){
        //<line x1="0" y1="0" x2="300" y2="300" style="stroke:rgb(99,99,99);stroke-width:2"/>
        var result = "\n" + repeat("\t", INDENTATION) + '<line x1="' + this.startPoint.x + '" y1="' + this.startPoint.y + '" x2="' + this.endPoint.x  + '" y2="' + this.endPoint.y + '"';
        result += this.style.toSVG();
        result += " />"
        return  result;
    }
}



/**
  * Creates an instance of a Polyline
  **/
function Polyline(){
    /**An {Array} of {@link Point}s*/
    this.points = [];
    
    /**The {@link Style} of the polyline*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    /**The starting {@link Point}. 
     **/
    this.startPoint = null;
    
    /**Serialization type*/
    this.oType = 'Polyline'; //object type used for JSON deserialization
}

/**Creates a {Polyline} out of JSON parsed object
 **/
Polyline.load = function(o){
    var newPolyline = new Polyline();
    newPolyline.points = Point.loadArray(o.points);
    newPolyline.style = Style.load(o.style);
    newPolyline.startPoint = Point.load(o.startPoint);
    return newPolyline;
};

Polyline.prototype = {
    constructor : Polyline,
    
    addPoint:function(point){
        if(this.points.length==0){
            this.startPoint=point;
        }
        this.points.push(point);

        // update bound coordinates for gradient
        this.style.gradientBounds = this.getBounds();
    },
    
    transform:function(matrix){
        if(this.style!=null){
            this.style.transform(matrix);
        }
        for(var i=0; i<this.points.length; i++){
            this.points[i].transform(matrix);
        }
    },
    
    getPoints:function(){
        return Point.cloneArray(this.points);
    },
    
    getVisualPoint:function (t){
        var l = this.getLength();

        
        var walked = 0;
        var i;
        for(i=0; i< this.points.length-1; i++){
            if( walked + Util.distance(this.points[i], this.points[i+1]) > l * t ){
                break;
            }
            
            walked += Util.distance(this.points[i], this.points[i+1]);
        }
        
        var rest = l * t - walked;
        var currentSegmentLength = Util.distance(this.points[i], this.points[i+1]);
        
        //find the position/ration of the middle of Polyline on current segment
        var segmentPercent = rest / currentSegmentLength;
        var THEpoint = new Line(this.points[i], this.points[i+1]).getPoint(segmentPercent);
        
        return THEpoint;
    },

    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },

    clone:function(){
        var ret=new Polyline();
        for(var i=0; i<this.points.length; i++){
            ret.addPoint(this.points[i].clone());
        }
        ret.style=this.style.clone();
        return ret;
    },
    
    getLength : function(){
        var l = 0;
        for(var i=0; i< this.points.length-1; i++){
            l += Util.distance(this.points[i], this.points[i+1]);
        }
        
        return l;
    },
    

    equals:function(anotherPolyline){
        if(!anotherPolyline instanceof Polyline){
            return false;
        }
        if(anotherPolyline.points.length == this.points.length){
            for(var i=0; i<this.points.length; i++){
                if(!this.points[i].equals(anotherPolyline.points[i])){
                    return false;
                }
            }
        }
        else{
            return false;
        }

        if(!this.style.equals(anotherPolyline.style)){
            return false;
        }

        if(!this.startPoint.equals(anotherPolyline.startPoint)){
            return false;
        }



        return true;
    },
    
    
    paint:function(context){
        
        if(this.style != null){
            this.style.setupContext(context);
        }
        
        Log.info("Polyline:paint() start");
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for(var i=1; i<this.points.length; i++){
            context.lineTo(this.points[i].x, this.points[i].y);
            //Log.info("Polyline:paint()" + " Paint a line to [" + this.points[i].x + ',' + this.points[i].y  + ']');
        }
               
        
        if(this.style.fillStyle!=null && this.style.fillStyle!=""){
            context.fill();
            //Log.info("Polyline:paint() We have fill: " + this.style.fillStyle)
        }
        
        if(this.style.strokeStyle !=null && this.style.strokeStyle != ""){
            //Log.info("Polyline:paint() We have stroke: " + this.style.strokeStyle)
            context.strokeStyle = this.style.strokeStyle;
            context.stroke();
        }
    },


    contains:function(x, y){
        return Util.isPointInside(new Point(x, y), this.getPoints())
    },


    near:function(x, y, radius){
        for(var i=0; i< this.points.length-1; i++){
            var l = new Line(this.points[i], this.points[i+1]);
            
            if(l.near(x,y,radius)){
                return true;
            }
        }
        
        return false;
    },

    toString:function(){
        var result = 'polyline(';
        for(var i=0; i < this.points.length; i++){
            result += this.points[i].toString() + ' ';
        }
        result += ')';
        return result;
    },

    /**Render the SVG fragment for this primitive*/
    toSVG:function(){
        //<polyline points="0,0 0,20 20,20 20,40 40,40 40,60" style="fill:white;stroke:red;stroke-width:2"/>
        var result = "\n" + repeat("\t", INDENTATION) + '<polyline points="';
        for(var i=0; i < this.points.length; i++){
            result += this.points[i].x + ',' + this.points[i].y + ' ';
        }
        result += '"';
        result += this.style.toSVG();
        result += '/>';

        return result;
    }
}


/**
  * Creates an instance of a Polygon
  **/
function Polygon(){
    /**An {Array} of {@link Point}s*/
    this.points = [];
    
    /**The {@link Style} of the polygon*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    /**Serialization type*/
    this.oType = 'Polygon'; //object type used for JSON deserialization
    this.canvas = getCanvas();
}

Polygon.load = function(o){
  
    var newPolygon = new Polygon();
    newPolygon.points = Point.loadArray(o.points);
    newPolygon.style = Style.load(o.style);
    return newPolygon;
}


Polygon.prototype = {
    contructor : Polygon,
    
    addPoint:function(point){
        this.points.push(point);
        //s//console.log("point",point)
        // update bound coordinates for gradient
        this.style.gradientBounds = this.getBounds();
    },


    getPosition:function(){
        return [this.points[0].x,[this.points[0].y]];
    },


    paint:function(context){
        
        context.beginPath();
        if(this.style!=null){
            this.style.setupContext(context);
        }
        if(this.points.length > 1){
            context.moveTo(this.points[0].x, this.points[0].y);
            for(var i=1; i<this.points.length; i++){
                context.lineTo(this.points[i].x, this.points[i].y)
            }
        }
        context.closePath();

        //fill current path
        if(this.style.fillStyle != null && this.style.fillStyle != ""){
            context.fill();
        }

        //stroke current path 
        if(this.style.strokeStyle != null && this.style.strokeStyle != ""){
            context.stroke();
        }
    },

    getPoints:function(){
        var p = [];
        for (var i=0; i<this.points.length; i++){
            p.push(this.points[i]);
        }
        return p;
    },


    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },

    fill:function(context,color){
        context.fillStyle=color;
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for(var i=1; i<this.points.length; i++){
            context.lineTo(this.points[i].x, this.points[i].y);
        }
        context.lineTo(this.points[0].x, this.points[0].y);
        context.closePath();
        context.fill();
    },

    near:function(x,y,radius){
        var i=0;
        for(i=0; i< this.points.length-1; i++){
            var l = new Line(this.points[i], this.points[i+1]);
            if(l.near(x,y,radius)){
                return true;
            }
        }
        l=new Line(this.points[i], this.points[0]);
        if(l.near(x,y,radius)){
            return true;
        }
        return false;
    },
    
    
    equals:function(anotherPolygon){
        if(!anotherPolygon instanceof Polygon){
            return false;
        }
        if(anotherPolygon.points.length == this.points.length){
            for(var i=0; i<this.points.length; i++){
                if(!this.points[i].equals(anotherPolygon.points[i])){
                    return false;
                }
            }
        }
        //TODO: test for all Polygon members
        return true;
    },

    clone:function(){
        var ret=new Polygon();
        for(var i=0; i<this.points.length; i++){
            ret.addPoint(this.points[i].clone());
        }
        ret.style = this.style.clone();
        
        return ret;
    },

    contains:function(x, y, includeBorders){
        var inPath = false;
        var p = new Point(x,y);
        if(!p){
            alert('Polygon: P is null');
        }

        if (includeBorders) {
            return Util.isPointInsideOrOnBorder(p, this.points);
        } else {
            return Util.isPointInside(p, this.points);
        }
    },

    transform:function(matrix,textPolyHandler){
        if(this.style!=null){
            this.style.transform(matrix);
        }
        if(textPolyHandler&&selectedFigureId!=-1)
        {  
          this.points[1].transform(matrix);
          this.points[2].transform(matrix);
          var startPoint = new Point(this.points[1].x-10,this.points[1].y);
          var endPoint = new Point(this.points[2].x-10,this.points[2].y); 
          var fig = STACK.figureGetById(selectedFigureId);
          var center = fig.primitives[0].points[0];
          //var endAngle = Util.getAngle(HandleManager.shape.rotationCoords[0],new Point(newX,newY));
          var startAngle = Util.getAngle(fig.primitives[0].points[0],fig.primitives[0].points[1]);//new Point(lastMove[0],lastMove[1])
          var rotAngle =  startAngle-1.5708;
          var equivTransfMatrix = Matrix.mergeTransformations(
              Matrix.translationMatrix(-center.x, -center.y), 
              Matrix.rotationMatrix(rotAngle), 
              Matrix.translationMatrix(center.x,center.y)
              );
          startPoint.transform(equivTransfMatrix);
          this.points[0].x=startPoint.x;
          this.points[0].y=startPoint.y;
          var center = fig.primitives[0].points[3];
          //var endAngle = Util.getAngle(HandleManager.shape.rotationCoords[0],new Point(newX,newY));
          var startAngle = Util.getAngle(fig.primitives[0].points[3],fig.primitives[0].points[2]);//new Point(lastMove[0],lastMove[1])
          var rotAngle =  startAngle-1.5708;
          var equivTransfMatrix = Matrix.mergeTransformations(
              Matrix.translationMatrix(-center.x, -center.y), 
              Matrix.rotationMatrix(rotAngle), 
              Matrix.translationMatrix(center.x,center.y)
              );
          endPoint.transform(equivTransfMatrix);
          this.points[3].x=endPoint.x;
          this.points[3].y=endPoint.y;
        }
        else
          for(var i=0; i < this.points.length; i++){
              this.points[i].transform(matrix);
          }
    },

    toString:function(){
        var result = 'polygon(';
        for(var i=0; i < this.points.length; i++){
            result += this.points[i].toString() + ' ';
        }
        result += ')';
        return result;
    },

    /**Render the SVG fragment for this primitive*/
    toSVG:function(){
        //<polygon points="220,100 300,210 170,250" style="fill:#cccccc; stroke:#000000;stroke-width:1"/>
        var result = "\n" + repeat("\t", INDENTATION) + '<polygon points="';
        for(var i=0; i < this.points.length; i++){
            result += this.points[i].x + ',' + this.points[i].y + ' ';
        }
        result += '" '
        //+  'style="fill:#cccccc;stroke:#000000;stroke-width:1"'
        +  this.style.toSVG()
        +  ' />';
        return result;
    }
}


function DottedPolygon(pattern){
    /**An {Array} of {@link Point}s*/
    this.points = [];
    
    /**The {@link Style} of the polygon*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    /**An {Array} of {Integer}s*/
    this.pattern = pattern;
    
    /**Serialization type*/
    this.oType = 'DottedPolygon'; //object type used for JSON deserialization
}

DottedPolygon.load = function(o){
    var newPolygon = new DottedPolygon(o.pattern);
    newPolygon.points = Point.loadArray(o.points);
    newPolygon.style = Style.load(o.style);
    return newPolygon;
}


DottedPolygon.prototype = {
    contructor : DottedPolygon,
    
    addPoint:function(point){
        this.points.push(point);
    },


    getPosition:function(){
        return [this.points[0].x,[this.points[0].y]];
    },


    paint:function(context){
                
        if(this.style != null){
            this.style.setupContext(context);
        }

        //simply ignore anything that don't have at least 2 points
        if(this.points.length < 2){
            return;
        }

        var clonnedPoints = Point.cloneArray(this.points);      

        //first fill
        if(this.style.fillStyle != null && this.style.fillStyle != ""){         
            context.beginPath();
            context.moveTo(clonnedPoints[0].x, clonnedPoints[0].y);
            for(i=1;i<clonnedPoints.length; i++){
                    context.lineTo(clonnedPoints[i].x, clonnedPoints[i].y);
            }
            context.fill();
        }

        //then stroke
        if(this.style.strokeStyle != null && this.style.strokeStyle != ""){ 
            context.beginPath(); //begin a new path
            Util.decorate(context, clonnedPoints, this.pattern);
            context.stroke();
        }

        //context.restore();
    },


    getPoints:function(){
        var p = [];
        for (var i=0; i<this.points.length; i++){
            p.push(this.points[i]);
        }
        return p;
    },


    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },


    near:function(x,y,radius){
        var i=0;
        for(i=0; i< this.points.length-1; i++){
            var l=new Line(this.points[i], this.points[i+1]);
            if(l.near(x,y,radius)){
                return true;
            }
        }
        l = new Line(this.points[i], this.points[0]);
        if(l.near(x,y,radius)){
            return true;
        }
        return false;
    },
    
    
    equals:function(anotherPolygon){
        if(!anotherPolygon instanceof DottedPolygon){
            return false;
        }
        if(anotherPolygon.points.length == this.points.length){
            for(var i=0; i<this.points.length; i++){
                if(!this.points[i].equals(anotherPolygon.points[i])){
                    return false;
                }
            }
        }
        //TODO: test for all DottedPolygon's pattern
        return true;
    },


    clone:function(){
        var ret = new DottedPolygon();
        for(var i=0; i<this.points.length; i++){
            ret.addPoint(this.points[i].clone());
        }
        ret.style=this.style.clone();
        return ret;
    },


    contains:function(x, y){
        var inPath = false;
        var p = new Point(x,y);
        if(!p){
            alert('DottedPolygon: P is null');
        }
        
        return Util.isPointInside(p, this.points);
    },

    transform:function(matrix){
        if(this.style != null){
                this.style.transform(matrix);
        }
        for(var i=0; i < this.points.length; i++){
                this.points[i].transform(matrix);
        }
    },

    toString:function(){
        var result = 'dottedpolygon(';
        for(var i=0; i < this.points.length; i++){
                result += this.points[i].toString() + ' ';
        }
        result += ')';
        return result;
    },

    /**Render the SVG fragment for this primitive*/
    toSVG:function(){        
        var result = "\n" + repeat("\t", INDENTATION) + '<text x="20" y="40">DottedPolygon:toSVG() - no implemented</text>';
        
        return result;
    }
}


function QuadCurve(startPoint, controlPoint, endPoint){
    /**The start {@link Point}*/
    this.startPoint = startPoint;
    
    /**The controll {@link Point}*/
    this.controlPoint = controlPoint;
    
    /**The end {@link Point}*/
    this.endPoint = endPoint;
    
    /**The {@link Style} of the quad*/
    this.style = new Style();
    
    this.style.gradientBounds = this.getBounds();

    /**Serialization type*/
    this.oType = 'QuadCurve'; //object type used for JSON deserialization
}

QuadCurve.load = function(o){
    var newQuad = new QuadCurve(
        Point.load(o.startPoint),
        Point.load(o.controlPoint),
        Point.load(o.endPoint)
    );
    newQuad.style = Style.load(o.style);
    return newQuad;
};

QuadCurve.loadArray = function(v){
    var quads = [];

    for(var i=0; i<v.length; i++){
        quads.push(QuadCurve.load(v[i]));
    }

    return quads;
};

QuadCurve.prototype = {
    constructor : QuadCurve,
    
    transform:function(matrix){
        if(this.style!=null){
            this.style.transform(matrix);
        }
        this.startPoint.transform(matrix);
        this.controlPoint.transform(matrix);
        this.endPoint.transform(matrix);
    },


    //TODO: dynamically adjust until the length of a segment is small enough
    //(1 unit)?
    getPoints:function(){
        var STEP = 0.01;
        var points = [];
        for(var t = 0; t<=1; t+=STEP){
            points.push(this.getPoint(t));
        }
        
        return points;
    },
    
    getPoint:function(t){
        var a = Math.pow((1 - t), 2);            
        var b = 2 * (1 - t) * t;
        var c = Math.pow(t, 2);
        var Xp = a * this.startPoint.x + b * this.controlPoint.x + c * this.endPoint.x;
        var Yp = a * this.startPoint.y + b * this.controlPoint.y + c * this.endPoint.y;
        
        return new Point(Xp, Yp);
    },
    
    getVisualPoint:function (t){
        var points = this.getPoints();
        var polyline = new Polyline();
        polyline.points = points;
        
        return polyline.getVisualPoint(t);
    },    
    
    getLength:function(){
        var poly = new Polyline();
        
        for(var t=0; t<=1; t+=0.01){
            poly.addPoint(this.getPoint(t));
        }
       
       return poly.getLength();
    },


    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },


    paint:function(context){
        
        context.beginPath();
        
        if(this.style!=null){
            this.style.setupContext(context);
        }
        
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.quadraticCurveTo(this.controlPoint.x, this.controlPoint.y, this.endPoint.x, this.endPoint.y);

        //then LineWidth
        /*if(this.style.lineWidth!=null && this.style.lineWidth!=""){
            context.lineWidth = this.style.lineWidth;
        }*/

        //first fill
        if(this.style.fillStyle!=null && this.style.fillStyle!=""){
            context.fill();
        }

        //then stroke
        if(this.style.strokeStyle!=null && this.style.strokeStyle!=""){
            context.stroke();
        }
        
        
        if(false){ //structure polyline
            var polyline = new Polyline();
            polyline.style.strokeStyle = '#ccc';
            polyline.points = this.getPoints();
            polyline.paint(context);
            context.stroke();
            
            context.fillStyle = "#F00";
            context.fillRect(this.startPoint.x-2, this.startPoint.y-2, 4, 4);
            context.fillRect(this.controlPoint.x-2, this.controlPoint.y-2, 4, 4);
            context.fillRect(this.endPoint.x-2, this.endPoint.y-2, 4, 4);
        }
    },

    deprecated__near:function(x, y, radius){
        var polls=100;
        if(!Util.isPointInside(new Point(x,y), [this.startPoint, this.controlPoint, this.endPoint]) 
                && !this.startPoint.near(x,y,radius) && ! this.endPoint.near(x,y,radius)){
            return false;//not inside the control points, so can't be near the line
        }
        var low=0;
        var high=polls;
        var i=(high-low)/2;
        while(i >= low && i <= high && high-low>0.01){//high-low indicates>0.01 stops us from taking increasingly tiny steps
            i=low+(high-low)/2 //we want the mid point

            //don't fully understand this
            var t = i / polls;
            var fromEnd = Math.pow((1.0 - t), 2); //get how far from end we are and square it
            var a = 2.0 * t * (1.0 - t);
            var fromStart = Math.pow(t, 2); //get how far from start we are and square it
            var newX = fromEnd * this.startPoint.x + a * this.controlPoint.x + this.fromStart * this.endPoint.x;//?
            var newY = fromEnd * this.startPoint.y + a * this.controlPoint.y + this.fromStart * this.endPoint.y;//?
            var p = new Point(newX,newY);
            if(p.near(x, y, radius)){
                return true;
            }

            //get distance between start and the point we are looking for, and the current point on line
            var pToStart=Math.sqrt(Math.pow(this.startPoint.x-p.x,2)+Math.pow(this.startPoint.y-p.y,2));
            var myToStart=Math.sqrt(Math.pow(this.startPoint.x-x,2)+Math.pow(this.startPoint.y-y,2));

            //if our point is closer to start, we know that our cursor must be between start and where we are
            if(myToStart<pToStart){
                high=i;
            }
            else if(myToStart!=pToStart){
                low=i;
            }
            else{
                return false;//their distance is the same but the point is not near, return false.
            }
            return this.startPoint.near(x,y,radius)|| this.endPoint.near(x,y,radius);
            }
    },
    
    near:function(x, y, radius){
        var points = this.getPoints();
        var polyline = new Polyline();
        polyline.points = points;
        return polyline.near(x, y, radius);
    },

    clone:function(){
        var ret=new QuadCurve(this.startPoint.clone(),this.controlPoint.clone(),this.endPoint.clone());
        ret.style=this.style.clone();
        return ret;
    },

    equals:function(anotherQuadCurve){
        if(!anotherQuadCurve instanceof QuadCurve){
            return false;
        }

        return this.startPoint.equals(anotherQuadCurve.startPoint)
        && this.controlPoint.equals(anotherQuadCurve.controlPoint)
        && this.endPoint.equals(anotherQuadCurve.endPoint)
        && this.style.equals(anotherQuadCurve.style);
    },

    /**
     *@deprecated
     **/
    deprecated_contains:function(x, y){
        return this.near(x,y,3);
        points=[this.startPoint,this.controlPoint,this.endPoint];
        return Util.isPointInside(new Point(x,y),points);
    },

    deprecated_2_contains:function(x,y) {

        var x1 = this.startPoint.x;
        var y1 = this.startPoint.y;
        var xc = this.controlPoint.x;
        var yc = this.controlPoint.y;
        var x2 = this.endPoint.x;
        var y2 = this.endPoint.y;

        var kx = x1 - 2 * xc + x2;
        var ky = y1 - 2 * yc + y2;
        var dx = x - x1;
        var dy = y - y1;
        var dxl = x2 - x1;
        var dyl = y2 - y1;

        var t0 = (dx * ky - dy * kx) / (dxl * ky - dyl * kx);
        if (t0 < 0 || t0 > 1 || t0 != t0) {
            return false;
        }

        var xb = kx * t0 * t0 + 2 * (xc - x1) * t0 + x1;
        var yb = ky * t0 * t0 + 2 * (yc - y1) * t0 + y1;
        var xl = dxl * t0 + x1;
        var yl = dyl * t0 + y1;

        return (x >= xb && x < xl) ||
        (x >= xl && x < xb) ||
        (y >= yb && y < yl) ||
        (y >= yl && y < yb);
    },
    
    contains:function(x,y) {
        var points = this.getPoints();
        var polyline = new Polyline();
        polyline.points = points;
        return polyline.contains(x, y);
    },

    toString:function(){
        return 'quad(' + this.startPoint + ',' + this.controlPoint + ',' + this.endPoint + ')';
    },

    toSVG:function(){
        var result = "\n" + repeat("\t", INDENTATION) + '<path d="M';
        result += this.startPoint.x + ',' + this.endPoint.y;
        result += ' Q' + this.controlPoint.x + ',' + this.controlPoint.y;
        result += ' ' + this.endPoint.x + ',' + this.endPoint.y;

        result += '" '
        +  this.style.toSVG()
        +  ' />';

        return result;
    }
};


function CubicCurve(startPoint, controlPoint1, controlPoint2, endPoint){
    /**The start {@link Point}*/
    this.startPoint = startPoint;
    
    /**The first controll {@link Point}*/
    this.controlPoint1 = controlPoint1;
    
    /**The second controll {@link Point}*/
    this.controlPoint2 = controlPoint2;
    
    /**The end {@link Point}*/
    this.endPoint = endPoint;
    
    /**The {@link Style} of the quad*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    /**Object type used for JSON deserialization*/
    this.oType = 'CubicCurve';
}

CubicCurve.load = function(o){
    var newCubic = new CubicCurve(
        Point.load(o.startPoint),
        Point.load(o.controlPoint1),
        Point.load(o.controlPoint2),
        Point.load(o.endPoint)
    );

    newCubic.style = Style.load(o.style);
    return newCubic;
}


CubicCurve.prototype = {
    constructor : CubicCurve,
    
    
    transform:function(matrix){
        if(this.style != null){
            this.style.transform(matrix);
        }
        this.startPoint.transform(matrix);
        this.controlPoint1.transform(matrix);
        this.controlPoint2.transform(matrix);
        this.endPoint.transform(matrix);
    },
    
    
    paint:function(context){
        
        context.beginPath();
        if(this.style != null){
            this.style.setupContext(context);
            Log.info("stroke style : " + this.style.strokeStyle);
        }
        
        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.bezierCurveTo(
            this.controlPoint1.x, this.controlPoint1.y, 
            this.controlPoint2.x, this.controlPoint2.y, 
            this.endPoint.x, this.endPoint.y
        );


        if(this.style.fillStyle != null && this.style.fillStyle != ""){
            context.fill();
        }

        if(this.style.strokeStyle != null && this.style.strokeStyle != ""){
            context.stroke();
        }
        Log.groupEnd();
    },


    clone:function(){
        var ret = new CubicCurve(this.startPoint.clone(),this.controlPoint1.clone(), this.controlPoint2.clone(),this.endPoint.clone());
        ret.style = this.style.clone();
        return ret;
    },


    equals:function(anotherCubicCurve){
        if(!anotherCubicCurve instanceof CubicCurve){
            return false;
        }
        return this.startPoint.equals(anotherCubicCurve.startPoint)
        && this.controlPoint1.equals(anotherCubicCurve.controlPoint1)
        && this.controlPoint2.equals(anotherCubicCurve.controlPoint2)
        && this.endPoint.equals(anotherCubicCurve.endPoint);
    },

    contains:function(x, y) {
       var poly = new Polyline();
       for(var t=0; t<=1; t=t+0.01){ //101 points :D
           var a = Math.pow((1 - t), 3);            
            var b = 3 * t * Math.pow((1 - t), 2);
            var c = 3 * Math.pow(t, 2) * (1 - t);
            var d = Math.pow(t, 3);
            var Xp = a * this.startPoint.x + b * this.controlPoint1.x + c * this.controlPoint2.x + d * this.endPoint.x;
            var Yp = a * this.startPoint.y + b * this.controlPoint1.y + c * this.controlPoint2.y + d * this.endPoint.y;
            poly.addPoint(new Point(Xp, Yp));
       }
       
       return poly.contains(x, y);
    },


    near:function(x, y, radius){        
       
        var poly = new Polyline();
        
        for(var t=0; t<=1; t+=0.01){
            var a = Math.pow((1 - t), 3);            
            var b = 3 * t * Math.pow((1 - t), 2);
            var c = 3 * Math.pow(t, 2) * (1 - t);
            var d = Math.pow(t, 3);
            var Xp = a * this.startPoint.x + b * this.controlPoint1.x + c * this.controlPoint2.x + d * this.endPoint.x;
            var Yp = a * this.startPoint.y + b * this.controlPoint1.y + c * this.controlPoint2.y + d * this.endPoint.y;
            poly.addPoint(new Point(Xp, Yp));
        }
       
       return poly.near(x, y, radius);
    },

    getPoints:function(){
        var STEP = 0.01;
        var points = [];
        for(var t = 0; t<=1; t+=STEP){
            points.push(this.getPoint(t));
        }
        
        return points;
    },

    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },
    
    getLength:function(){
        var poly = new Polyline();
        
        poly.points = this.getPoints();      
       
       return poly.getLength();
    },
    
    getPoint: function(t){
        var a = Math.pow((1 - t), 3);            
        var b = 3 * t * Math.pow((1 - t), 2);
        var c = 3 * Math.pow(t, 2) * (1 - t);
        var d = Math.pow(t, 3);
        var Xp = a * this.startPoint.x + b * this.controlPoint1.x + c * this.controlPoint2.x + d * this.endPoint.x;
        var Yp = a * this.startPoint.y + b * this.controlPoint1.y + c * this.controlPoint2.y + d * this.endPoint.y;
        
        return new Point(Xp, Yp);
    },
    
    getVisualPoint:function (t){
        var points = this.getPoints();
        var polyline = new Polyline();
        polyline.points = points;
        
        return polyline.getVisualPoint(t);
    },
    


    toString:function(){
        return 'quad(' + this.startPoint + ',' + this.controlPoint1 + ',' + this.controlPoint2 + ',' + this.endPoint + ')';
    },

    toSVG:function(){
        var result = "\n" + repeat("\t", INDENTATION) +  '<path d="M';
        result += this.startPoint.x + ',' + this.endPoint.y;
        result += ' C' + this.controlPoint1.x + ',' + this.controlPoint1.y;
        result += ' ' + this.controlPoint2.x + ',' + this.controlPoint2.y;
        result += ' ' + this.endPoint.x + ',' + this.endPoint.y;

        result += '" ' + this.style.toSVG() +  '  />';
        return result;
    }
}



function Arc(x, y, radius, startAngle, endAngle, direction, styleFlag){
    /**End angle. Required for dashedArc*/
    this.endAngle = endAngle;
    
    /**Start angle. required for dashedArc*/
    this.startAngle = startAngle;
    
    /**The center {@link Point} of the circle*/
    this.middle = new Point(x,y); 
    
    /**The radius of the circle*/
    this.radius = radius;
    
    /**An {Array} of {@link QuadCurve}s used to draw the arc*/
    this.curves = [];
    
    /**Accuracy. It tells the story of how many QuadCurves we will use*/
    var numControlPoints = 8;
    
    /**The start {@link Point}*/
    this.startPoint = null;
    
    /**The end {@link Point}*/
    this.endPoint = null;
    
    /**The start angle, in radians*/
    this.startAngleRadians = 0;
    
    /**The end angle, in radians*/
    this.endAngleRadians = 0;

    //code shamelessly stollen from the above site.
    var start = Math.PI/180 * startAngle; //convert the angles back to radians
    this.startAngleRadians = start;
    this.endAngleRadians = Math.PI/180 * endAngle;
    var arcLength = (Math.PI/180*(endAngle-startAngle))/ numControlPoints;
    for (var i = 0; i < numControlPoints; i++) {
        if (i < 1)
        {
            this.startPoint = new Point(x + radius * Math.cos(arcLength * i),y + radius * Math.sin(arcLength * i))
        }
        var startPoint=new Point(x + radius * Math.cos(arcLength * i),y + radius * Math.sin(arcLength * i))

        //control radius formula
        //where does it come from, why does it work?
        var controlRadius = radius / Math.cos(arcLength * .5);

        //the control point is plotted halfway between the arcLength and uses the control radius
        var controlPoint=new Point(x + controlRadius * Math.cos(arcLength * (i + 1) - arcLength * .5),y + controlRadius * Math.sin(arcLength * (i + 1) - arcLength * .5))
        if (i == (numControlPoints - 1))
        {
            this.endPoint = new Point(x + radius * Math.cos(arcLength * (i + 1)),y + radius * Math.sin(arcLength * (i + 1)));
        }
        var endPoint=new Point(x + radius * Math.cos(arcLength * (i + 1)),y + radius * Math.sin(arcLength * (i + 1)));


        //if we arent starting at 0, rotate it to where it needs to be

        //move to origin (O)
        startPoint.transform(Matrix.translationMatrix(-x,-y));
        controlPoint.transform(Matrix.translationMatrix(-x,-y));
        endPoint.transform(Matrix.translationMatrix(-x,-y));

        //rotate by angle (start)
        startPoint.transform(Matrix.rotationMatrix(start));
        controlPoint.transform(Matrix.rotationMatrix(start));
        endPoint.transform(Matrix.rotationMatrix(start));

        //move it back to where it was
        startPoint.transform(Matrix.translationMatrix(x,y));
        controlPoint.transform(Matrix.translationMatrix(x,y));
        endPoint.transform(Matrix.translationMatrix(x,y));

        this.curves.push(new QuadCurve(startPoint,controlPoint,endPoint));
    }

    /**The style flag - see  contructor's arguments*/
    this.styleFlag = styleFlag;
    
    
    /**The {@link Style} of the arc*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    /**Adding a reference to the end point makes the transform code hugely cleaner*/
    this.direction = direction;
    
    /**Object type used for JSON deserialization*/
    this.oType = 'Arc';
}

Arc.load = function(o){
	////console.log("arc called")
    var newArc = new Arc();

    newArc.endAngle = o.endAngle;
    newArc.startAngle = o.startAngle;
    newArc.middle = Point.load(o.middle);
    newArc.radius = o.radius
    newArc.curves = QuadCurve.loadArray(o.curves);

    newArc.startPoint = Point.load(o.startPoint);
    newArc.endPoint = Point.load(o.endPoint);
    newArc.startAngleRadians = o.startAngleRadians;
    newArc.endAngleRadians = o.endAngleRadians;

    newArc.styleFlag = o.styleFlag;
    newArc.style = Style.load(o.style);
    newArc.direction = o.direction;

    return newArc;
}

Arc.loadArray = function(v){
    var newArcs = [];

    for(var i=0; i<v.length; i++){
        newArcs.push(Arc.load(v[i]));
    }

    return newArcs;
}



Arc.prototype = {
    
    constructor : Arc,
    
    transform:function(matrix){
        //transform the style
        if(this.style != null){
            this.style.transform(matrix);
        }

        //transform the center of the circle
        this.middle.transform(matrix);

        //transform each curve
        for(var i=0; i<this.curves.length; i++){
            this.curves[i].transform(matrix);
        }
    },


    paint:function(context){
        
        context.beginPath();
        
        if(this.style!=null){
            this.style.setupContext(context);
        }
        context.lineWidth = this.style.lineWidth;
        //context.arc(x,y,radius,(Math.PI/180)*startAngle,(Math.PI/180)*endAngle,direction);                        
        context.moveTo(this.curves[0].startPoint.x, this.curves[0].startPoint.y);
        for(var i=0; i<this.curves.length; i++){
            context.quadraticCurveTo(this.curves[i].controlPoint.x, this.curves[i].controlPoint.y
                ,this.curves[i].endPoint.x, this.curves[i].endPoint.y);
        }

        if(this.styleFlag == 1){
            context.closePath();
        }
        else if(this.styleFlag == 2){
            context.lineTo(this.middle.x, this.middle.y);
            context.closePath();
        }

        //first fill
        if(this.style.fillStyle!=null && this.style.fillStyle!=""){
            context.fill();
        }

        //then stroke
        if(this.style.strokeStyle!=null && this.style.strokeStyle!=""){
            context.stroke();
        }

    },

    clone:function(){
        var ret = new Arc(this.middle.x, this.middle.y, this.radius, this.startAngle, this.endAngle, this.direction, this.styleFlag);
		
        for (var i=0; i< this.curves.length; i++){
            ret.curves[i]=this.curves[i].clone();
        }
        ret.style=this.style.clone();
        return ret;
    },

    equals:function(anotherArc){
        if(!anotherArc instanceof Arc){
            return false;
        }

        //check curves
        for(var i = 0 ; i < this.curves.lenght; i++){
            if(!this.curves[i].equals(anotherArc.curves[i])){
                return false;
            }
        }

        return this.startAngle == anotherArc.startAngle
        && this.endAngle == anotherArc.endAngle
        && this.middle.equals(anotherArc.middle)
        && this.radius == anotherArc.radius
        && this.numControlPoints == anotherArc.numControlPoints
        && this.startPoint.equals(anotherArc.startPoint)
        && this.endPoint.equals(anotherArc.endPoint)
        && this.startAngleRadians == anotherArc.startAngleRadians
        && this.endAngleRadians == anotherArc.endAngleRadians
    ;
    },

    near:function(thex,they,theradius){
        for(var i=0; i<this.curves.length; i++){
            if(this.curves[i].near(thex,they,theradius)){
                return true;
            }
        }
        //return (distance && angle) || finishLine || startLine || new Point(x,y).near(thex,they,theradius);

        return false;
    },

    contains: function(thex,they){
        var p = this.getPoints();
        return Util.isPointInside((new Point(thex,they)), p);

    },

    getPoints:function(){
        var p = [];
        if(this.styleFlag ==2){
            p.push(this.middle);
        }
        for(var i=0; i<this.curves.length; i++){
            var c = this.curves[i].getPoints();
            for(var a=0; a<c.length; a++){
                p.push(c[a]);
            }
        }
        return p;
    },

    getBounds:function(){
        return Util.getBounds(this.getPoints());
    },

    toString:function(){
        return 'arc(' + new Point(this.x,this.y) + ','  + this.radius + ',' + this.startAngle + ',' + this.endAngle + ',' + this.direction + ',' + this.text + ')';
    },


    toSVG: function(){
        var r = "\n" + repeat("\t", INDENTATION) + '<path d="';
        r += ' M' + this.curves[0].startPoint.x  + ',' + this.curves[0].startPoint.y
        for(var i=0; i<this.curves.length; i++){
            r += ' Q' + this.curves[i].controlPoint.x  + ',' + this.curves[i].controlPoint.y
            + ' ' + this.curves[i].endPoint.x + ',' + this.curves[i].endPoint.y;
        }
        r += '" ';
        r += this.style.toSVG();
        r += '/>';
        return r;
    }
}



function Ellipse(centerPoint, width, height) {
    /**"THE" constant*/
    var EToBConst = 0.2761423749154;

    /**Width offset*/
    var offsetWidth = width * 2 * EToBConst;
    
    /**Height offset*/    
    var offsetHeight = height * 2 * EToBConst;
    
    /**The center {@link Point}*/
    this.centerPoint = centerPoint;
    
    /**Top left {@link CubicCurve}*/
    this.topLeftCurve = new CubicCurve(new Point(centerPoint.x-width,centerPoint.y),new Point(centerPoint.x-width,centerPoint.y-offsetHeight),new Point(centerPoint.x-offsetWidth,centerPoint.y-height),new Point(centerPoint.x,centerPoint.y-height));
    
    /**Top right {@link CubicCurve}*/
    this.topRightCurve = new CubicCurve(new Point(centerPoint.x,centerPoint.y-height),new Point(centerPoint.x+offsetWidth,centerPoint.y-height),new Point(centerPoint.x+width,centerPoint.y-offsetHeight),new Point(centerPoint.x+width,centerPoint.y));
    
    /**Bottom right {@link CubicCurve}*/
    this.bottomRightCurve = new CubicCurve(new Point(centerPoint.x+width,centerPoint.y),new Point(centerPoint.x+width,centerPoint.y+offsetHeight),new Point(centerPoint.x+offsetWidth,centerPoint.y+height),new Point(centerPoint.x,centerPoint.y+height));
    
    /**Bottom left {@link CubicCurve}*/
    this.bottomLeftCurve = new CubicCurve(new Point(centerPoint.x,centerPoint.y+height),new Point(centerPoint.x-offsetWidth,centerPoint.y+height),new Point(centerPoint.x-width,centerPoint.y+offsetHeight),new Point(centerPoint.x-width,centerPoint.y));
    
    /**The matrix array*/
    this.matrix = null; //TODO: do we really need this?
    
    /**The {@link Style} used*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    /**Oject type used for JSON deserialization*/
    this.oType = 'Ellipse'; 
}

Ellipse.load = function(o){
    var newEllipse= new Ellipse(new Point(0,0), 0, 0); //fake ellipse (if we use a null centerPoint we got errors)

    newEllipse.offsetWidth = o.offsetWidth;
    newEllipse.offsetHeight = o.offsetHeight;
    newEllipse.centerPoint = Point.load(o.centerPoint);
    newEllipse.topLeftCurve = CubicCurve.load(o.topLeftCurve);
    newEllipse.topRightCurve = CubicCurve.load(o.topRightCurve);
    newEllipse.bottomRightCurve = CubicCurve.load(o.bottomRightCurve);
    newEllipse.bottomLeftCurve = CubicCurve.load(o.bottomLeftCurve);
    this.matrix = Matrix.clone(o.matrix);
    newEllipse.style = Style.load(o.style);

    return newEllipse;
}


Ellipse.prototype = {
    constructor: Ellipse,
    
    transform:function(matrix){
        this.topLeftCurve.transform(matrix);
        this.topRightCurve.transform(matrix);
        this.bottomLeftCurve.transform(matrix);
        this.bottomRightCurve.transform(matrix);
        this.centerPoint.transform(matrix);
        if(this.style){
            this.style.transform(matrix);
        }
    },

    paint:function(context){
        if(this.style!=null){
            this.style.setupContext(context);
        }
        context.beginPath();
        context.moveTo(this.topLeftCurve.startPoint.x, this.topLeftCurve.startPoint.y);
        context.bezierCurveTo(this.topLeftCurve.controlPoint1.x, 
            this.topLeftCurve.controlPoint1.y, this.topLeftCurve.controlPoint2.x, 
            this.topLeftCurve.controlPoint2.y, this.topLeftCurve.endPoint.x, 
            this.topLeftCurve.endPoint.y);
        context.bezierCurveTo(this.topRightCurve.controlPoint1.x, 
            this.topRightCurve.controlPoint1.y, this.topRightCurve.controlPoint2.x, 
            this.topRightCurve.controlPoint2.y, this.topRightCurve.endPoint.x, 
            this.topRightCurve.endPoint.y);
        context.bezierCurveTo(this.bottomRightCurve.controlPoint1.x, 
            this.bottomRightCurve.controlPoint1.y, this.bottomRightCurve.controlPoint2.x, 
            this.bottomRightCurve.controlPoint2.y, this.bottomRightCurve.endPoint.x, 
            this.bottomRightCurve.endPoint.y);
        context.bezierCurveTo(this.bottomLeftCurve.controlPoint1.x, 
            this.bottomLeftCurve.controlPoint1.y, this.bottomLeftCurve.controlPoint2.x,
            this.bottomLeftCurve.controlPoint2.y, this.bottomLeftCurve.endPoint.x, 
            this.bottomLeftCurve.endPoint.y);

        //first fill
        if(this.style.fillStyle!=null && this.style.fillStyle!=""){
            context.fill();
        }

        //then stroke
        if(this.style.strokeStyle!=null && this.style.strokeStyle!=""){
            context.stroke();
        }

    },

    contains:function(x,y){
        var points = this.topLeftCurve.getPoints();
        var curves = [this.topRightCurve, this.bottomRightCurve, this.bottomLeftCurve];
        for(var i=0; i<curves.length; i++){
            var curPoints = curves[i].getPoints();

            for(var a=0; a<curPoints.length; a++){
                points.push(curPoints[a]);
            }
        }
        return Util.isPointInside(new Point(x,y), points);

        return false;
    },

    near:function(x,y,radius){
        return this.topLeftCurve.near(x,y,radius) || this.topRightCurve.near(x,y,radius) || this.bottomLeftCurve.near(x,y,radius) || this.bottomRightCurve.near(x,y,radius);
    },

    equals:function(anotherEllipse){
        if(!anotherEllipse instanceof Ellipse){
            return false;
        }

        return this.offsetWidth == anotherEllipse.offsetWidth
        && this.offsetHeight == anotherEllipse.offsetHeight
        && this.centerPoint.equals(anotherEllipse.centerPoint)
        && this.topLeftCurve.equals(anotherEllipse.topLeftCurve)
        && this.topRightCurve.equals(anotherEllipse.topRightCurve)
        && this.bottomRightCurve.equals(anotherEllipse.bottomRightCurve)
        && this.bottomLeftCurve.equals(anotherEllipse.bottomLeftCurve);
    //TODO: add this && this.matrix.equals(anotherEllipse.bottomLeftCurve)
    //TODO: add this && this.style.equals(anotherEllipse.bottomLeftCurve)
    },

    clone:function(){
        var ret=new Ellipse(this.centerPoint.clone(),10,10);
        ret.topLeftCurve=this.topLeftCurve.clone();
        ret.topRightCurve=this.topRightCurve.clone();
        ret.bottomLeftCurve=this.bottomLeftCurve.clone();
        ret.bottomRightCurve=this.bottomRightCurve.clone();
        ret.style=this.style.clone();
        return ret;
    },

    toString:function(){
        return 'ellipse('+this.centerPoint+","+this.xRadius+","+this.yRadius+")";
    },

    toSVG: function(){
        var result = "\n" + repeat("\t", INDENTATION) +  '<path d="M';
        result += this.topLeftCurve.startPoint.x + ',' + this.topLeftCurve.startPoint.y;

        //top left curve
        result += ' C' + this.topLeftCurve.controlPoint1.x + ',' + this.topLeftCurve.controlPoint1.y;
        result += ' ' + this.topLeftCurve.controlPoint2.x + ',' + this.topLeftCurve.controlPoint2.y;
        result += ' ' + this.topLeftCurve.endPoint.x + ',' + this.topLeftCurve.endPoint.y;

        //top right curve
        result += ' C' + this.topRightCurve.controlPoint1.x + ',' + this.topRightCurve.controlPoint1.y;
        result += ' ' + this.topRightCurve.controlPoint2.x + ',' + this.topRightCurve.controlPoint2.y;
        result += ' ' + this.topRightCurve.endPoint.x + ',' + this.topRightCurve.endPoint.y;

        //bottom right curve
        result += ' C' + this.bottomRightCurve.controlPoint1.x + ',' + this.bottomRightCurve.controlPoint1.y;
        result += ' ' + this.bottomRightCurve.controlPoint2.x + ',' + this.bottomRightCurve.controlPoint2.y;
        result += ' ' + this.bottomRightCurve.endPoint.x + ',' + this.bottomRightCurve.endPoint.y;

        //bottom left curve
        result += ' C' + this.bottomLeftCurve.controlPoint1.x + ',' + this.bottomLeftCurve.controlPoint1.y;
        result += ' ' + this.bottomLeftCurve.controlPoint2.x + ',' + this.bottomLeftCurve.controlPoint2.y;
        result += ' ' + this.bottomLeftCurve.endPoint.x + ',' + this.bottomLeftCurve.endPoint.y;

        result += '" ' + this.style.toSVG() +  '  />';
        return result;

    },


    getPoints:function(){
        var points = [];
        var curves = [this.topLeftCurve, this.topRightCurve,this.bottomRightCurve,this.bottomLeftCurve];

        for(var i=0; i<curves.length; i++){
            var curPoints = curves[i].getPoints();
            for(var a=0; a<curPoints.length; a++){
                points.push(curPoints[a]);
            }
        }
        return points;
    },


    getBounds:function(){
        return Util.getBounds(this.getPoints());
    }
}



function DashedArc(x, y, radius, startAngle, endAngle, direction, styleFlag, dashGap){
    /**The "under the hood" {@link Arc}*/
    this.arc = new Arc(x, y, radius, startAngle, endAngle, direction, styleFlag);
    
    /*The {@link Style} used**/
    this.style = this.arc.style;
    
    /**The gap between dashes*/
    this.dashWidth = dashGap;
    
    /**An {Array} or {@link Arc}s*/
    this.lines = []; //an {Array} of {Arc}s

    //init the parts
    for(var i=0; i<100; i += this.dashWidth){
        var a = new Arc(x, y, radius+this.style.lineWidth/2, (endAngle-startAngle)/100*i, (endAngle-startAngle)/100*(i+1), false);
        a.style.strokeStyle = this.style.strokeStyle;
        this.lines.push(a);
    }

    /**Object type used for JSON deserialization*/
    this.oType = 'DashedArc'; 
}


DashedArc.load = function(o){
    var newDashedArc = new DashedArc(100,100,30,0,360,false,0,6); //fake dashed (if we do not use it we got errors - endless loop)
    newDashedArc.style.fillStyle="#ffffff"

    newDashedArc.arc = Arc.load(o.arc);
    newDashedArc.style = newDashedArc.arc.style; //strange but...
    newDashedArc.dashWidth = o.dashWidth;
    newDashedArc.lines = Arc.loadArray(o.lines);


    return newDashedArc;
}


DashedArc.prototype = {
    constructor: DashedArc,
    
    transform:function(matrix){
        this.arc.transform(matrix);
        for (var i=0; i<this.lines.length; i++){
            this.lines[i].transform(matrix);
        }
    },

    getBounds:function(){
        
        return this.arc.getBounds();
    },

    getPoints:function(){
        return this.arc.getPoints();
    },

    contains:function(x,y){
        return this.arc.contains(x,y);
    },

    near:function(x,y,radius){
        return this.arc.near(x,y,radius);
    },


    toString:function(){
        return this.arc.toString();
    },


    toSVG: function(){
        throw 'Arc:toSVG() - not implemented';
    },

    /***/
    equals:function(anotherDashedArc){
        if(!anotherDashedArc instanceof DashedArc){
            return false;
        }


        if(this.lines.length != anotherDashedArc.lines.length){
            return false;
        }
        else{
            for(var i in this.lines){
                if(!this.lines[i].equals(anotherDashedArc.lines[i])){
                    return false;
                }
            }
        }

        return this.arc.equals(anotherDashedArc.arc)
        && this.style.equals(anotherDashedArc.style)
        && this.dashWidth == anotherDashedArc.dashWidth;
    },

    clone:function(){
        return this.arc.clone();
    },

    paint:function(context){
		
        this.style.setupContext(context);
        context.lineCap="round"//this.style.lineCap;
        for(var i=0; i<this.lines.length; i++){
            context.beginPath();
            this.lines[i].paint(context);
            context.stroke();
        }
        this.style.strokeStyle=null;
        this.arc.paint(context)
    }

}


function Path() {
    /**An {Array} that will store all the basic primitives: {@link Point}s, {@link Line}s, {@link CubicCurve}s, etc that make the path*/
    this.primitives = [];
    
    /**The {@link Style} used for drawing*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    /**Object type used for JSON deserialization*/
    this.oType = 'Path'; 
}

Path.load = function(o){
    var newPath = new Path(); //fake path

    newPath.style = Style.load(o.style);

    for(var i=0; i< o.primitives.length; i++){
        /**We can not use instanceof Point construction as
         *the JSON objects are typeless... so JSONObject are simply objects */
        if(o.primitives[i].oType == 'Point'){
            newPath.primitives.push(Point.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Line'){
            newPath.primitives.push(Line.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Polyline'){
            newPath.primitives.push(Polyline.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Polygon'){
            newPath.primitives.push(Polygon.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'QuadCurve'){
            newPath.primitives.push(QuadCurve.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'CubicCurve'){
            newPath.primitives.push(CubicCurve.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Arc'){
            newPath.primitives.push(Arc.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Ellipse'){
            newPath.primitives.push(Ellipse.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'DashedArc'){
            newPath.primitives.push(DashedArc.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Path'){
            newPath.primitives.push(Path.load(o.primitives[i]))
        }

    }

    return newPath;
}


Path.prototype = {
    constructor : Path,
    
    transform:function(matrix){
        for(var i = 0; i<this.primitives.length; i++ ){
            this.primitives[i].transform(matrix);
        }
    },

    addPrimitive:function(primitive){
 
        this.primitives.push(primitive);
        

        // update bound coordinates for gradient
        //this.style.gradientBounds = this.getBounds();
    },

    contains: function(x,y){
        var points = [];
        for(var i=0; i<this.primitives.length; i++){
            if(this.primitives[i].contains(x,y)){
                return true;
            }
            var curPoints = this.primitives[i].getPoints();
            for(var a=0; a<curPoints.length; a++){
                points.push(curPoints[a]);
            }
        }
        return Util.isPointInside(new Point(x,y),points);
    },

    near: function(x,y,radius){
        var points = [];
        for(var i=0; i<this.primitives.length; i++){
            if(this.primitives[i].near(x,y,radius)){
                return true;
            }
        }
        return false;
    },

    getPoints:function(){
        var points = [];
        for (var i=0; i<this.primitives.length; i++){
            points = points.concat(this.primitives[i].getPoints());
        }
        return points;
    },
    getBounds:function(){

        var points = [];
        for (var i in this.primitives) {
            var bounds = this.primitives[i].getBounds();
            points.push(new Point(bounds[0], bounds[1]));
            points.push(new Point(bounds[2], bounds[3]));
        }
        
        return Util.getBounds(points);
    },

    clone:function(){
        var ret = new Path();
        for (var i=0; i<this.primitives.length; i++){
            ret.addPrimitive(this.primitives[i].clone());
            if(this.primitives[i].parentFigure){
                ret.primitives[i].parentFigure=ret;
            }
        }
        ret.style=this.style
        return ret;
    },

    equals : function(anotherPath){
        if(!anotherPath instanceof Path){
            return false;
        }

        for(var i=0; i<this.primitives.length; i++){
            if(!this.primitives[i].equals(anotherPath.primitives[i])){
                return  false;
            }
        }
        return true;
    },

    paint:function(context){
        context.save();

        if(this.style != null){
            this.style.setupContext(context);
        }

        if(this.style.fillStyle != null && this.style.fillStyle != "" ){
            context.beginPath();
            context.moveTo(this.primitives[0].startPoint.x,this.primitives[0].startPoint.y);
            for(var i = 0; i<this.primitives.length; i++ ){
                var primitive  = this.primitives[i];
                if(primitive instanceof Line){
                    context.lineTo(primitive.endPoint.x,primitive.endPoint.y);
                }
                else if(primitive instanceof Polyline){
                    for(var a=0; a<primitive.points.length; a++){
                        context.lineTo(primitive.points[a].x,primitive.points[a].y);
                    }
                }
                else if(primitive instanceof QuadCurve){
                    context.quadraticCurveTo(primitive.controlPoint.x, primitive.controlPoint.y, primitive.endPoint.x, primitive.endPoint.y);
                }
                else if(primitive instanceof CubicCurve){
                    context.bezierCurveTo(primitive.controlPoint1.x, primitive.controlPoint1.y, primitive.controlPoint2.x, primitive.controlPoint2.y, primitive.endPoint.x, primitive.endPoint.y)
                }
            }
            context.fill();
        }

        //PAINT STROKE
        //This loop draws the lines of each individual shape. Each part might have a different strokeStyle !
        if(this.style.strokeStyle != null && this.style.strokeStyle != "" ){
            for(var i = 0; i<this.primitives.length; i++ ){
                var primitive  = this.primitives[i];

                context.save();
                context.beginPath();

                //TODO: what if a primitive does not have a start point?
                context.moveTo(primitive.startPoint.x,primitive.startPoint.y);

                if(primitive instanceof Line){
                    context.lineTo(primitive.endPoint.x,primitive.endPoint.y);
                    context.closePath(); // added for line's correct Chrome's displaying
                //Log.info("line");
                }
                else if(primitive instanceof Polyline){
                    for(var a=0; a<primitive.points.length; a++){
                        context.lineTo(primitive.points[a].x,primitive.points[a].y);
                    //Log.info("polyline");
                    }
                }
                else if(primitive instanceof QuadCurve){
                    context.quadraticCurveTo(primitive.controlPoint.x, primitive.controlPoint.y, primitive.endPoint.x, primitive.endPoint.y);
                //Log.info("quadcurve");
                }
                else if(primitive instanceof CubicCurve){
                    context.bezierCurveTo(primitive.controlPoint1.x, primitive.controlPoint1.y, primitive.controlPoint2.x, primitive.controlPoint2.y, primitive.endPoint.x, primitive.endPoint.y)
                //Log.info("cubiccurve");
                }
                else if(primitive instanceof Arc){
                    context.arc(primitive.startPoint.x, primitive.startPoint.y, primitive.radius, primitive.startAngleRadians, primitive.endAngleRadians, primitive.text, true)
                //Log.info("arc" + primitive.startPoint.x + " " + primitive.startPoint.y);
                }
                else
                {
                //Log.info("unknown primitive");
                }

                //save primitive's old style
                var oldStyle = primitive.style.clone();

                //update primitive's style
                if(primitive.style == null){
                    primitive.style = this.style;
                }
                else{
                    primitive.style.merge(this.style);
                }

                //use primitive's style
                primitive.style.setupContext(context);

                //stroke it
                context.stroke();

                //change primitive' style back to original one
                primitive.style = oldStyle;

                context.restore();
            }
        }

        context.restore();

    },


    toSVG: function(){

        var result = "\n" + repeat("\t", INDENTATION) + '<path d="';
        var previousPrimitive = null;
        for(var i=0; i<this.primitives.length; i++){

            var primitive = this.primitives[i];

            if(primitive instanceof Point){
                throw 'Path:toSVG()->Point - not implemented';
            }
            if(primitive instanceof Line){
                if(previousPrimitive == null  || previousPrimitive.endPoint.x != primitive.startPoint.x || previousPrimitive.endPoint.y != primitive.startPoint.y){
                    result += ' M' + primitive.startPoint.x + ',' + primitive.startPoint.y;
                }
                result += ' L' + primitive.endPoint.x + ',' + primitive.endPoint.y;
            }
            else if(primitive instanceof Polyline){
                for(var a=0; a<primitive.points.length; a++){
                    result += ' L' + primitive.points[a].x + ',' + primitive.points[a].y;
                }
            }
            else if(primitive instanceof QuadCurve){
                result += ' Q' + primitive.controlPoint.x + ',' + primitive.controlPoint.y + ',' + primitive.endPoint.x + ',' + primitive.endPoint.y ;
            }
            else if(primitive instanceof CubicCurve){
                result += ' C' + primitive.controlPoint1.x + ',' + primitive.controlPoint1.y + ',' + primitive.controlPoint2.x + ',' + primitive.controlPoint2.y + ',' + primitive.endPoint.x + ',' + primitive.endPoint.y;
            }
            else if(primitive instanceof Arc){
                throw 'Path:toSVG()->Arc - not implemented';
            }
            else if(primitive instanceof Polyline){
                //TODO: implement me
                throw 'Path:toSVGPolylineArc - not implemented';
            }
            else{
                throw 'Path:toSVG()->unknown primitive rendering not implemented';
            }

            previousPrimitive = primitive;
        }//end for
        result += '" '; //end of primitive shapes
        //        result += ' fill="none" stroke="#0F0F00" /> '; //end of path
        result += this.style.toSVG(); //end of path
        result += ' />'; //end of path

        return result;
    }

}
// function linePrimitive(primitive){
//     //console.log("called primitive")
//         primitive.id = this.lineprimitive.length;
//         //console.log("primitive",primitive.id)
//         this.lineprimitive.push(primitive);

//         // update bound coordinates for gradient
//         this.style.gradientBounds = this.getBounds(); 
// };  

function Figure(name,isNoID) {
    isNoID = typeof isNoID !== 'undefined' ? isNoID : false;
    if(!isNoID)
    {
      /**Each Figure will have an unique Id on canvas*/
      this.id = STACK.generateId();
    }
    else
    {
      this.id = -1;
    } 
    /**Figure's name*/
    this.name = name;
    
    /**An {Array} of primitives that make the figure*/
    this.primitives = [];
    this.lineprimitive=[];

    /**the Group'id to which this figure belongs to*/
    this.groupId = -1;

    /**An {Array} of {@link BuilderProperty} objects*/
     
    
    /**The {@link Style} use to draw this figure*/
    this.style = new Style();
    this.style.gradientBounds = this.getBounds();

    this.rotationCoords = [];
    
    this.url = '';
    this.objType = '';
    /**Object type used for JSON deserialization*/
    this.oType = 'Figure'; 
    this.visibility = true;
    this.angles = false;
    this.editPoints = false;
    this.tagid=null;
    this.value=null;
    this.componentId=null;
    this.componentLibraryId=null;
    this.component_tag_id=null;
    this.created_at=null;
    this.updated_at=null;
    this.percentage=null;
    this.startdata=null;
    this.xValue = null;
    this.yValue = null;
    this.video_tag=null;
    this.properties=null;
    this.driverData=null;
}

Figure.load = function(o){
    var newFigure = new Figure(); //fake dashed (if we do not use it we got errors - endless loop)

    newFigure.id = o.id;
    newFigure.name = o.name;
    newFigure.tagid=o.tagid
    newFigure.componentId=o.componentId
    newFigure.imageId=null;
    newFigure.url=o.currentImage;
    newFigure.component_tag_id=o.component_tag_id;
    newFigure.created_at=o.created_at;
    newFigure.updated_at=o.updated_at;
    newFigure.componentLibraryId=o.componentLibraryId;
    newFigure.percentage=o.percentage;
    newFigure.startdata=o.startdata;
    newFigure.xValue=o.xValue;
    newFigure.yValue=o.yValue;
    newFigure.video_tag=o.video_tag;
    newFigure.driverData=o.driverData;
    //newFigure
    ////console.log("Name of figure"+o.name);
    for(var i=0; i< o.primitives.length; i++){
        if(o.primitives[i].oType == 'Point'){
            newFigure.addPrimitive(Point.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Line'){
            newFigure.addPrimitive(Line.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Polyline'){
            newFigure.addPrimitive(Polyline.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Polygon'){
        
            newFigure.addPrimitive(Polygon.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'DottedPolygon'){
            newFigure.addPrimitive(DottedPolygon.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'QuadCurve'){
            ////console.log("QuadCurve Loading");
            newFigure.addPrimitive(QuadCurve.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'CubicCurve'){
            newFigure.addPrimitive(CubicCurve.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Arc'){
            newFigure.addPrimitive(Arc.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Ellipse'){
            newFigure.addPrimitive(Ellipse.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'DashedArc'){
            newFigure.addPrimitive(DashedArc.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Text'){
            newFigure.addPrimitive(Text.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Path'){
            ////console.log("Path Loading");
            newFigure.addPrimitive(Path.load(o.primitives[i]))
        }
        else if(o.primitives[i].oType == 'Figure'){
            ////console.log("Figure Loading");
            newFigure.addPrimitive(Figure.load(o.primitives[i])); //kinda recursevly
        }
        else if(o.primitives[i].oType == 'ImageFrame'){
            newFigure.addPrimitive(ImageFrame.load(o.primitives[i])); //kinda recursevly
        }
    }//end for

    newFigure.groupId = o.groupId;
    newFigure.style = Style.load(o.style);
    newFigure.rotationCoords = Point.loadArray(o.rotationCoords);
    newFigure.url = o.url;
    newFigure.objType = o.objType;
    newFigure.visibility = o.visibility;
    newFigure.angles = o.angles;
    newFigure.editPoints = o.editPoints;
    newFigure.properties=o.properties;

    return newFigure ;
}

Figure.loadArray = function(v){
    var newFigures = [];

    for(var i=0; i<v.length; i++){
        newFigures.push(Figure.load(v[i]));
    }

    return newFigures;
}



Figure.prototype = {
    
    constructor: Figure,
    
    getText:function(){
        for(var i=0; i<this.primitives.length; i++){
            if(this.primitives[i] instanceof Text){
                return this.primitives[i];
            }
        }

        return '';
    },

    setText:function(text){
        for(var i=0; i<this.primitives.length; i++){
            if(this.primitives[i] instanceof Text){
                this.primitives[i] = text;
            }
        }
    },

    transform:function(matrix, transformConnector){
        if(this.name!='Pencil')
        {
            if(transformConnector == "undefined" || transformConnector == undefined){
                transformConnector = true;
            }
            //transform all composing primitives
            for(var i = 0; i<this.primitives.length; i++ ){
                if(this.name!="Ruler" && this.primitives[i] instanceof Text && i==0)
                {
                    /*var x = this.primitives[i-1].points[0].x+((this.primitives[i-1].points[1].x - this.primitives[i-1].points[0].x) / 2);
                    var y = this.primitives[i-1].points[0].y + 20;
                    this.primitives[i].vector[0].x = x;
                    this.primitives[i].vector[0].y = y;
                    if(HandleManager.handles.length)
                    {
                        x = HandleManager.handles[7].x;
                        y = HandleManager.handles[7].y;
                    }   
                    this.primitives[i].vector[1].x = x;
                    this.primitives[i].vector[1].y = y;*/

                    
                    this.primitives[i].width = Util.distance(this.primitives[i-1].points[0], this.primitives[i-1].points[1]);
                    this.primitives[i].height = Util.distance(this.primitives[i-1].points[0], this.primitives[i-1].points[3]);
                    this.primitives[i].transform(matrix);
                }
                else if(this.name=="Text"&&i==2)
                {
                  this.primitives[i].transform(matrix,true);
                }
                else  
                    this.primitives[i].transform(matrix);
            }

            //transform the style
            this.style.transform(matrix);

            //some figures don't have rotation coords, i.e. those that aren't "real" figures, such as the highlight rectangle
            if(this.rotationCoords.length!=0){
                this.rotationCoords[0].transform(matrix);
                this.rotationCoords[1].transform(matrix);
            }
            if(this.name=="trend"){
            if(this.xValue!=undefined&&this.yValue!=undefined)
            {   
                var point = new Point(this.xValue,this.yValue);
                point.transform(matrix);
                this.xValue = point.x;
                this.yValue = point.y;
                
                
                //minX, minY, maxX, maxY
            }
        }else if(this.name=="video"){
            if(this.xValue!=undefined&&this.yValue!=undefined&&this.vxValue!=undefined&&this.vyValue!=undefined)
            {   
                var point = new Point(this.xValue,this.yValue);
                point.transform(matrix);
                this.xValue = point.x;
                this.yValue = point.y;
                var point_v=new Point(this.vxValue,this.vyValue);
                ////console.log("this",this.vxValue,this.vyValue)
                point_v.transform(matrix);
                ////console.log("point_v",point_v.x,point_v.y)
                var bounds = this.getBounds();
                this.vxValue=bounds[2]-bounds[0];
                this.vyValue=bounds[3]-bounds[1];
                
                //minX, minY, maxX, maxY
            }

        }
            
        }
        
    },

    getPoints:function(){
        var points = [];
        for (var i=0; i<this.primitives.length; i++){
            points = points.concat(this.primitives[i].getPoints()); //add all primitive's points in a single pass
        }
        return points;
    },

    addPrimitive:function (primitive){
        // add id property to primitive equal its index
        primitive.id = this.primitives.length;

        this.primitives.push(primitive);

        // update bound coordinates for gradient
        this.style.gradientBounds = this.getBounds();
    },

    //no more points to add, so create the handles and selectRect
    finalise:function(){
        var bounds = this.getBounds();

        if(bounds == null){
            throw 'Figure bounds are null !!!';
            return;
        }
        //central point of the figure
        this.rotationCoords[0] = new Point(
            bounds[0] + (bounds[2] - bounds[0]) / 2,
            bounds[1] + (bounds[3] - bounds[1]) / 2
        );

        //the middle of upper edge
        this.rotationCoords[1] = new Point(this.rotationCoords[0].x, bounds[1]);

    },

    clone:function(){
        var ret = new Figure(this.name);
        
        for (var i=0; i<this.primitives.length; i++){
            ret.addPrimitive(this.primitives[i].clone());
        }
        ret.properties = this.properties.slice(0);
        ret.style = this.style.clone();
        ret.rotationCoords[0]=this.rotationCoords[0].clone();
        ret.rotationCoords[1]=this.rotationCoords[1].clone();
        ret.url = this.url;
        
        //get all connection points and add them to the figure
        var cps = LineArrow_MANAGER.linearrowPointGetAllByParent(this.id);
        
        cps.forEach(
            function(connectionPoint){
                LineArrow_MANAGER.linearrowPointCreate(ret.id,connectionPoint.point.clone(), LineArrowPoint.TYPE_FIGURE);
            }
        );
        
        return ret;
    },

    applyAnotherFigureStyle:function(anotherFigure){
        this.style = anotherFigure.style.clone();
        
        var newText = this.getText(); //will contain new text object
        //TODO: From Janis: there is some problem if applying text twice, the getText returns empty string, this means it is not properly cloned
        if(newText instanceof Text){
            var currTextStr = newText.getTextStr(); //remember text str
            var currTextVector = newText.vector; //remember text vector
            
            newText = anotherFigure.getText().clone();
            newText.setTextStr(currTextStr); //restore text str
            newText.vector = currTextVector; //restore text vector
            this.setText(newText);
        }
    },

    contains:function(x,y){
        var points=[];
        for(var i=0; i<this.primitives.length; i++){
            if(this.primitives[i].contains(x,y)){
                return true;
            }
            if(this.primitives[i] instanceof Line && this.primitives[i].near(x,y,10))
              return true;
            points = points.concat(this.primitives[i].getPoints());
            
        }
        return Util.isPointInside(new Point(x,y),points);
    },


    getBounds: function(){
        var points = [];
        for (var i = 0; i < this.primitives.length; i++) {
            var bounds = this.primitives[i].getBounds();
            points.push(new Point(bounds[0], bounds[1]));
            points.push(new Point(bounds[2], bounds[3]));
        }
        return Util.getBounds(points);
    },


    paint:function(context){
        if(!this.visibility)
            return;
        if(this.style){
            this.style.setupContext(context);
        }
        for(var i = 0; i<this.primitives.length; i++ ){
            context.save();
            var primitive  = this.primitives[i];
            

            var oldStyle = null;
            if(primitive.style){ //save primitive's style
                oldStyle = primitive.style.clone();
            }

            if(primitive.style == null){ //if primitive does not have a style use Figure's one
                primitive.style = this.style.clone();
            }
            else{ //if primitive has a style merge it
                primitive.style.merge(this.style);
            }

            if(this.name == "Ruler")
            {
                switch(i)
                {
                    case 0:primitive.style.strokeStyle = "rgb(221, 232, 243)";
                    break;
                }
                
            }
            primitive.paint(context);
            primitive.style = oldStyle;
            context.restore();
            if(this.name=="video")
            {  
                // var canvas = document.getElementById("canvas_main");
                // ////console.log("canvas line1",fig_var.xValue,fig_var.yValue)
                // var ctx = canvas.getContext("2d");
            //     var video = document.getElementById("video1");
            //     video.addEventListener('play', () => {
            //     function step() {
            //         ////console.log("primi",primitive.points[0].x)
            //         ctx.drawImage(video,primitive.points[0].x, primitive.points[0].y,400,200)
            //         requestAnimationFrame(step)
            //       }
            //       requestAnimationFrame(step);
            //       draw();
            // });
            //var video = document.getElementById('video1');
            //video.src="http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv";
//video.controls = true;
            //document.body.appendChild(video);
            var canvas = document.getElementById('canvas_main')
            var ctx_video = canvas.getContext('2d');
            // for(i=0;i<STACK.figures.length;i++){
            //     var video =STACK.figures[i]; 
            //     //console.log("video",video)
            //var obj = STACK.figureGetById(selectedFigureId);
            var figVal = this;
            //fig_dup=this;
            figVal.video_tag = document.getElementById("video_"+figVal.id);
            
            var play=figVal.video_tag;
            
            play.addEventListener('play', () => {
                
                    function step() {
                        ctx_video.drawImage(play,figVal.xValue,figVal.yValue,figVal.vxValue,figVal.vyValue);
                        requestAnimationFrame(step)
                        //video.destroy();
                      }
                      requestAnimationFrame(step);
                      //video.remove();
                     // resolve(video);
                });
            
            //}
        }
            primitive.paint(context);
            primitive.style = oldStyle;
            
            context.restore();
        }
    },

    equals:function(anotherFigure){
        if(!anotherFigure instanceof Figure){
            Log.info("Figure:equals() 0");
            return false;
        }


        if(this.primitives.length == anotherFigure.primitives.length){
            for(var i=0; i<this.primitives.length; i++){
                if(!this.primitives[i].equals(anotherFigure.primitives[i])){
                    Log.info("Figure:equals() 1");
                    return false;
                }
            }
        }
        else{
            Log.info("Figure:equals() 2");
            return false;
        }
        if(this.groupId != anotherFigure.groupId){
            return false;
        }

        //test rotation coords
        if(this.rotationCoords.length == anotherFigure.rotationCoords.length){
            for(var i in this.rotationCoords){
                if(!this.rotationCoords[i].equals(anotherFigure.rotationCoords[i])){
                    return false;
                }
            }
        }
        else{
            return false;
        }

        //test style
        if(!this.style.equals(anotherFigure.style)){
            return false;
        }
        
        //test url
        if(!this.url == anotherFigure.url){
            return false;
        }

        return true;
    },

    near:function(x,y,radius){
        for(var i=0; i<this.primitives.length; i++){
            if(this.primitives[i].near(x,y,radius)){
                return true;
            }
        }
        return false;
    },
    
    toString:function(){
        var result = this.name + ' [id: ' + this.id + '] (';
        for(var i = 0; i<this.primitives.length; i++ ){
            result += this.primitives[i].toString();
        }
        result += ')';
        return result;
    },


    toSVG: function(){
        var tempSVG = '';
        tempSVG += "\n" + repeat("\t", INDENTATION) +  "<!--Figure start-->";
        for(var i = 0; i<this.primitives.length; i++ ){
            var primitive  = this.primitives[i];

            var oldStyle = null;
            if(primitive.style){ //save primitive's style
                oldStyle = primitive.style.clone();
            }

            if(primitive.style == null){ //if primitive does not have a style use Figure's one
                primitive.style = this.style;
            }
            else{ //if primitive has a style merge it
                primitive.style.merge(this.style);
            }

            tempSVG += this.primitives[i].toSVG();
            
            //URL not exported
            throw Exception("Figure->toSVG->URL not exported");

            //restore primitives style
            primitive.style = oldStyle;
        }
        tempSVG += "\n" + repeat("\t", INDENTATION) +  "<!--Figure end-->" + "\n";

        return tempSVG;
    }
}



/**
 * A predefined matrix of a 90 degree clockwise rotation 
 *
 *@see <a href="http://en.wikipedia.org/wiki/Rotation_matrix">http://en.wikipedia.org/wiki/Rotation_matrix</a>
 */ 
var R90 = [
    [Math.cos(0.0872664626),-Math.sin(0.0872664626), 0],
    [Math.sin(0.0872664626),  Math.cos(0.0872664626), 0],
    [0,  0, 1]
    ];
    
/**
 * A predefined matrix of a 90 degree anti-clockwise rotation 
 *
 *@see <a href="http://en.wikipedia.org/wiki/Rotation_matrix">http://en.wikipedia.org/wiki/Rotation_matrix</a>
 */     
var R90A = [
    [Math.cos(0.0872664626), Math.sin(0.0872664626), 0],
    [-Math.sin(0.0872664626),  Math.cos(0.0872664626), 0],
    [0,  0, 1]
    ];

/**
 * The identity matrix
 */      

var IDENTITY=[[1,0,1],[0,1,0],[0,0,1]];


if(typeof(document) == 'undefined'){ //test only from console
    print("\n--==Point==--\n");
    p = new Point(10, 10);
    print(p);
    print("\n");
    p.transform(R90);
    print(p)

    print("\n--==Line==--\n");
    l = new Line(new Point(10, 23), new Point(34, 50));
    print(l);
    print("\n");


    print("\n--==Polyline==--\n");
    polyline = new Polyline();
    for(var i=0;i<5; i++){
        polyline.addPoint(new Point(i, i*i));
    }
    print(polyline);
    print("\n");




    print("\n--==Quad curve==--\n");
    q = new QuadCurve(new Point(75,25), new Point(25,25), new Point(25,62))
    print(q)

    print("\n");
    q.transform(R90);
    print(q)

    print("\n--==Cubic curve==--\n");
    q = new CubicCurve(new Point(75,40), new Point(75,37), new Point(70,25), new Point(50,25))
    print(q)

    print("\n");
    q.transform(R90);
    print(q)

    print("\n--==Figure==--\n");
    f = new Figure();
    f.addPrimitive(p);
    f.addPrimitive(q);
    print(f);

    f.transform(R90);
    print("\n");
    print(f);
    print("\n");
}

function Style(){
    /**Font used*/
    this.font = null;
    
    /**Stroke/pen style. Can be specified as '#FF3010' or 'rgb(200, 0, 0)'*/
    this.strokeStyle = null;
    
    /**Fill style. Can be specified as '#FF3010' or 'rgb(200, 0, 0)'*/
    this.fillStyle = null;
    
    /**Alpha/transparency value*/
    this.globalAlpha = null;
    
    /**Composite value*/
    this.globalCompositeOperation = null;
    
    /**Line width. 
     *@type {Integer}
     **/
    this.lineWidth = null;
    
    this.lineCap = this.STYLE_LINE_CAP_BUTT;

    this.lineJoin = this.STYLE_LINE_JOIN_MITER;
    
    /**Shadow offset x. Not used yet*/
    this.shadowOffsetX = null;
    
    /**Shadow offset y. Not used yet*/
    this.shadowOffsetY = null;
    
    /**Shadow blur. Not used yet*/
    this.shadowBlur = null;
    
    /**Shadow color. Not used yet*/
    this.shadowColor = null;
    
    /**An {Array} of colors used in gradients*/
    this.colorStops = [];
    
    /**An {Array} in form of [x0, y0, x1, y1] with figure bounds used in gradients*/
    this.gradientBounds = [];
    
    this.dashLength = 0;
        
    this.lineStyle = null; //set to null so it can be inherited from parents
    this.image = null;
    
    /**Serialization type*/
    this.oType = "Style";
}

Style.LINE_STYLE_CONTINOUS = 'continuous';
Style.LINE_STYLE_DOTTED = 'dotted';
Style.LINE_STYLE_DASHED = 'dashed';

/**Contains all lines styles*/
Style.LINE_STYLES = {
    'continuous' : {'lineDash' : [], 'lineDashOffset': 0, 'lineCap' : 'round'},
    'dotted' : {'lineDash' : [1,2], 'lineDashOffset': 0, 'lineCap' : 'round'},
    'dashed' : {'lineDash' : [4,4], 'lineDashOffset': 0, 'lineCap' : 'round'}
};

/**Loads a style from a JSONObject
 **/
Style.load = function(o){
    var newStyle = new Style();

    newStyle.strokeStyle = o.strokeStyle;
    newStyle.fillStyle = o.fillStyle;
    newStyle.globalAlpha = o.globalAlpha;
    newStyle.globalCompositeOperation = o.globalCompositeOperation;
    newStyle.lineWidth = o.lineWidth;
    newStyle.lineCap = o.lineCap;
    newStyle.lineJoin = o.lineJoin;
    newStyle.shadowOffsetX = o.shadowOffsetX;
    newStyle.shadowOffsetY = o.shadowOffsetY;
    newStyle.shadowBlur = o.shadowBlur;
    newStyle.shadowColor = o.shadowColor;
    newStyle.gradientBounds = o.gradientBounds;
    newStyle.colorStops = o.colorStops;
    newStyle.dashLength = o.dashLength;
    newStyle.lineStyle = o.lineStyle;
    newStyle.image = o.image;

    return newStyle;
};

Style.prototype={
    /**Round join*/
    STYLE_LINE_JOIN_ROUND: 'round',
    
    /**Bevel join*/
    STYLE_LINE_JOIN_BEVEL: 'bevel',
    
    /**Mitter join*/
    STYLE_LINE_JOIN_MITER: 'miter',
    
    /**Butt cap*/
    STYLE_LINE_CAP_BUTT: 'butt',
    
    /**Round cap*/
    STYLE_LINE_CAP_ROUND: 'round',
    
    /**Square cap*/
    STYLE_LINE_CAP_SQUARE: 'square',
    
    constructor : Style,

    setupContext:function(context){
        for(var propertyName in this){
            if(this[propertyName] != null && propertyName != undefined    
                && propertyName !== "gradientBounds" && propertyName !== "colorStops" 
                && propertyName !== "image"
                    
                //iPad's Safari is very picky about this and for a reason (see #118)
                && propertyName !== "constructor" 
                )
            {
                try{
                    context[propertyName] = this[propertyName];
                } catch(error){
                    alert("Style:setupContext() Error trying to setup context's property: ["  + propertyName + '] details = [' + error + "]\n");
                }
            }//end if
        }//end for

        if( this.gradientBounds.length !=0 && this.fillStyle != null && this.image == null){
            // generate gradient colors here, because fill color is changing in many places
            /*this.generateGradientColors();

            // create linear gradient for current bounds
            var lin = context.createLinearGradient(this.gradientBounds[0], this.gradientBounds[1], this.gradientBounds[2], this.gradientBounds[3]);

            // set gradient colors: currently 2 - for start and end points
            for(var i=0; i<this.colorStops.length; i++){
                lin.addColorStop(i, this.colorStops[i]);
            }*/

            // put gradient as a fill style for context
            context.fillStyle = this.fillStyle;
        }
        //Setup the dashed policy
        if(this.lineStyle != null){
            var lineStyle = Style.LINE_STYLES[this.lineStyle];
            var lineDash = lineStyle['lineDash'];
            
            var scalledLineDash = [];
            
            switch(this.lineStyle){
                case Style.LINE_STYLE_CONTINOUS:
                    //do nothing 
                    scalledLineDash = lineDash;
                    break;
                    
                case Style.LINE_STYLE_DOTTED:
                    //Scale all pieces of a pattern except first dot
                    for(var i=0;i<lineDash.length; i++){                        
                        if(i==0){
                            scalledLineDash.push(lineDash[i]);
                        }
                        else{
                            scalledLineDash.push(lineDash[i] * context.lineWidth);
                        }                        
                    }
                    break;
                    
                case Style.LINE_STYLE_DASHED:
                    //Scale all pieces of a pattern 
                    for(var i=0;i<lineDash.length; i++){
                        scalledLineDash.push(lineDash[i] * context.lineWidth);
                    }
                    break;    
            }
            
            context.setLineDash(scalledLineDash);
            context.lineCap = lineStyle['lineCap'];
            this.lineCap = lineStyle['lineCap'];
        }
        
        if(this.image != null && Browser.msie){
            var ptrn = context.createPattern(this.image,'no-repeat');
        }
    },


    clone: function(){
        var anotherStyle = new Style();
        for(var propertyName in anotherStyle){
            if(propertyName != "colorStops" && propertyName != "gradientBounds"){
                anotherStyle[propertyName] = this[propertyName];
            }
            else{
                // colorStops and gradientBounds are arrays - we use slice
                anotherStyle[propertyName] = this[propertyName].slice();
            }
        }
        return anotherStyle;
    },


    toJSON : function(){
        var aClone = this.clone();
        for(var propertyName in aClone){
            if(aClone[propertyName] == null){
                delete aClone[propertyName];
            }
        }

        return aClone;
    },


    generateGradientColors: function() {
        var rgbObj = Util.hexToRgb(this.fillStyle);

        // generate hsl value from {r,g,b}
        var sourceHsl = Util.rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);

        // take hsl color for upper bound: add saturation step to source color
        var upperHsl = sourceHsl.slice();
        upperHsl[2] = upperHsl[2] + gradientLightStep;
        // if hsl saturation bigger than 1 - set it to 1
        upperHsl[2] = upperHsl[2] > 1 ? 1 : upperHsl[2];

        // take hsl color for lower bound: subtract saturation step from source color
        var lowerHsl = sourceHsl.slice();
        lowerHsl[2] = lowerHsl[2] - gradientLightStep;
        // if hsl saturation less than 0 - set it to 0
        lowerHsl[2] = lowerHsl[2] < 0 ? 0 : lowerHsl[2];

        // Convert bound colors to css-applicable strings
        upperHsl = Util.hslToString(upperHsl);
        lowerHsl = Util.hslToString(lowerHsl);

        // set calculated values as colorStops of Style
        this.colorStops = [upperHsl, lowerHsl];
    },


    getGradient:function(){
        return this.colorStops[0]+"/"+this.colorStops[1];
    },


    setGradient:function(figure, value){
        this.colorStops[0] = value.split("/")[0];
        this.colorStops[1] = value.split("/")[1];
    },

    merge:function(anotherStyle){
        for(var propertyName in anotherStyle){
            if( (this[propertyName] == null || this[propertyName] == undefined) && propertyName != "image"){
                this[propertyName] = anotherStyle[propertyName];
            }
        }
    },


    transform: function(matrix){
        if(this.gradientBounds.length != 0){
            // to transform gradient bounds we join coordinates in points
            var startPoint = new Point(this.gradientBounds[0],this.gradientBounds[1]);
            var endPoint = new Point(this.gradientBounds[2],this.gradientBounds[3]);

            // transform created points due to general transformation
            startPoint.transform(matrix);
            endPoint.transform(matrix);

            // and set transformed coordinates back to gradientBounds
            this.gradientBounds[0] = startPoint.x;
            this.gradientBounds[1] = startPoint.y;
            this.gradientBounds[2] = endPoint.x;
            this.gradientBounds[3] = endPoint.y;
        }
        if(this.image){
            var p1 = new Point(0,0);
            var p2 = new Point(this.image.width, this.image.height);
            p1.transform(matrix);
            p2.transform(matrix);
            this.image.width = p2.x-p1.x;
            this.image.height = p2.y-p1.y;
        }
    },


    /**TODO: implement it*/
    equals:function(anotherStyle){
        if(!anotherStyle instanceof Style){
            return false;
        }
        
        //TODO: test members

        return true;
    },

    toSVG : function(){
        var style = ' style="';

        style += 'stroke:' + ( (this.strokeStyle == null || this.strokeStyle == '') ? 'none' : this.strokeStyle) + ';';
        style += 'fill:' + ( (this.fillStyle == null || this.fillStyle == '') ? 'none' : this.fillStyle) + ';';
        style += 'stroke-width:' + ( (this.lineWidth == null || this.lineWidth == '') ? 'none' : this.lineWidth) + ';';
        style += 'stroke-linecap:' + ( (this.lineCap == null || this.lineCap == '') ? 'inherit' : this.lineCap) + ';';
        style += 'stroke-linejoin:' + ( (this.lineJoin == null || this.lineJoin == '') ? 'inherit' : this.lineJoin) + ';';
        style += '" ';

        return style;
    }

}

function Group(id){
    
    /**Group's id*/
    if(id){
        this.id = id;
    }
    else{
        this.id = STACK.generateId();
    }
    
    
    /**By default all groups are temporary....so it's up to you make them permanent*/
    this.permanent = false;
    
    /**An {Array} of 2 {Point}s that keeps the rotation of the Group*/
    this.rotationCoords = [];
    
    /**Serialization type*/
    this.oType = 'Group';
}

/**Creates a {Group} out of JSON parsed object
 **/
Group.load = function(o){
    var newGroup = new Group(); //empty constructor

    newGroup.id = o.id;
    newGroup.permanent = o.permanent;
    newGroup.rotationCoords = Point.loadArray(o.rotationCoords);

    return newGroup;
}


/**Creates a new {Array} of {Group}s out of JSON parsed object
**/
Group.loadArray = function(v){
    var newGroups = [];

    for(var i=0; i<v.length; i++){
        newGroups.push(Group.load(v[i]));
    }

    return newGroups;
}


Group.prototype = {
    
    constructor : Group,

    /**Group is not painted. It is only a mental group
     * @deprecated
     */
    paint:function(context){
        throw "Group is not painted. It is only an abstract grouping";
    },



    /**See if a group contains a point
     *@param {Number} x - the x coordinate of the point
     *@param {Number} y - the y coordinate of the point
     **/
    contains:function(x,y){
        var figures = STACK.figureGetByGroupId(this.id);
		////console.log("figure",figures)
        for(var i = 0; i < figures.length; i++){
            if(figures[i].contains(x,y) == true){
                return true;
            }
        }
        return false;
    },


    /**See if a point is near a group, within a radius
     *@param {Number} x - the x coordinate of the point
     *@param {Number} y - the y coordinate of the point
     *@param {Number} radius - the radius to search for
     **/
    near:function(x,y,radius){
        var figures = STACK.figureGetByGroupId(this.id);
        for(var i = 0; i < figures.length; i++){
            if(figures[i].near(x,y,radius) == true){
                return true;
            }
        }
        return false;
    },


    /**
     *Get a group bounds
     **/
    getBounds:function(){
        var figures = STACK.figureGetByGroupId(this.id);
        var handlePoints = []; 
        var handlers=HandleManager.handleGetAll();
        for(var iterator=0; iterator<handlers.length; iterator++){
            if(handlers[iterator].type!="r")
                handlePoints.push(new Point(handlers[iterator].x,handlers[iterator].y));
        }
        return Util.getBounds(handlePoints);
    },


    /**
     *Get all points of a Group (collect them from all figures)
     **/
    getPoints:function(){
        var figures = STACK.figureGetByGroupId(this.id);
        var points = [];
        for(var i = 0; i < STACK.figureIds.length; i++){
            var fPoints = STACK.figureGetById(STACK.figureIds[i]).getPoints();
            points = points.concat(fPoints);
        }
        return points;
    },

    /**
     *Transform the group
     *@param {Matrix} matrix - the transformation matrix
     **/
    transform:function(matrix){
        this.rotationCoords[0].transform(matrix);
        this.rotationCoords[1].transform(matrix);
        var figures = STACK.figureGetByGroupId(this.id);
        for(var i = 0; i < figures.length; i++){
            //figures[i].transform(matrix);
        }
        selectionArea.points[0].transform(matrix);
        selectionArea.points[1].transform(matrix);
        selectionArea.points[2].transform(matrix);
        selectionArea.points[3].transform(matrix);
    },
    
    /**Compares to another Group
     *@param {Group} group -  - the other glue
     *@return {Boolean} - true if equals, false otherwise
     **/
    equals:function(group){
        if(!group instanceof Group){
            return false;
        }

        for(var i=0; i<this.rotationCoords; i++){
            if(!this.rotationCoords[i].equals(group.rotationCoords[i])){
                return false;
            }
        }

        return this.permanent == group.permanent;
    },


    /**Clone this group
     *@return {Group} - the clone of current group*/
    clone:function(){
        var group = new Group();
        group.permanent = this.permanent;
        return group;
    },

    /**
     *String representation of a Group
     **/
    toString:function(){
        return "Group id: " + this.id + " permanent: " + this.permanent;
    }

}

/**
 * A singleton object used to log all messages in WHITEBOARD.
 **/
var Log  = {
    /**no debug at all*/
    LOG_LEVEL_NONE  : 0,

    /**show even the debug messages*/
    LOG_LEVEL_DEBUG : 1,

    /**show all up to (and including) info
     *Setting the log level at info level will slow your browser a lot....so use it carefully
     **/
    LOG_LEVEL_INFO : 2,

    /**show only errors*/
    LOG_LEVEL_ERROR : 3,

    /**It will keep the log level (anything above this level will be printed)*/
    level : this.LOG_LEVEL_ERROR,
    
    /**
    * The less important of all messages
    * @param {String} message - the message to be logged
    **/
    debug: function (message){
        if(typeof console !== 'undefined'){
            if(this.level <= this.LOG_LEVEL_DEBUG){
                
                //in FF is debug
                if(typeof console.debug == 'function'){
                    //console.debug(message);
                }
                else{//TODO: in IE is log
//                    console.info(message);
                }
            }
        }
    },


    /**
    * The commonly used log message
    * @param {String} message - the message to be logged
    **/
    info : function (message){
        if(typeof console !== 'undefined'){
            if(this.level <= this.LOG_LEVEL_INFO){
                //console.info(message);
            }
        }
    },

    /**
    * The worse kind of message. Usually a crash
    * @param {String} message - the message to be logged
    **/
    error : function (message){
        if(typeof console !== 'undefined'){
            if(this.level <= this.LOG_LEVEL_ERROR){
                //console.error(message);
            }
        }
    },

    /**
     *Start grouping the log messages
     *@param {String} title - the title of the group
     *@see <a href="http://getfirebug.com/logging">http://getfirebug.com/logging</a>
     **/
    group : function(title){
        if(this.level <= this.LOG_LEVEL_INFO){ //ignore group if level not debug or info
            if(typeof console !== 'undefined'){           
                /**If we do not test for group() function you will get an error in Opera
                 *as Opera has it's own console...which does not have a group() function*/
                if(typeof console.group === 'function'){
                    //console.group(title);
                }
            }
        }
    },

    /**Ends current message grouping*/
    groupEnd : function(){
        if(this.level <= this.LOG_LEVEL_INFO){ //ignore group if level not debug or info
            if(typeof console !== 'undefined'){
                /**If we do not test for groupEnd() function you will get an error in Opera
                 *as Opera has it's own console...which does not have a group() function*/
                if(typeof console.groupEnd === 'function'){
                    //console.groupEnd();
                }
            }
        }
    }

}

/*Set the log level*/
//Log.level = Log.LOG_LEVEL_DEBUG; 
Log.level = Log.LOG_LEVEL_ERROR; 
//Log.level = Log.LOG_LEVEL_ERROR;
//Log.level = Log.LOG_LEVEL_NONE;

/**
 * A matrix math library.
 */

function Matrix(){
}


/**Add two matrixes.
 *It can be used to combine multiple transformations into one.
 **/
Matrix.add = function(m1, m2){
    var mReturn=[];
    if(m1.length==m2.length){
        for(var row=0; row<m1.length; row++){
            mReturn[row]=[];
            for(var column=0; column<m1[row].length; column++){
                mReturn[row][column] = m1[row][column] + m2[row][column];
            }
        }
    }
    return mReturn;
};


/**Clones a matrix. Recursivelly
 **/
Matrix.clone = function(m){
    if(typeof(m) == 'undefined' || m == null){
        return null;
    }
    
    var mReturn=[];
    for(var i=0; i<m.length; i++){
        /*If the element is also an array. As we can not tell if this is an array or object as both array and object return objects
         *we will at least try to see if it's object and if it has some length */
        if(typeof(m) == 'object' && m[i].length){ 
            mReturn.push(Matrix.clone(m[i]));
        }
        else{
            mReturn.push(m[i]);
        }
    }
    return mReturn;
};




/**Substract matrix m2 from m1
 **/
Matrix.subtract = function(m1, m2){
    var mReturn=[];
    if(m1.length == m2.length){
        for(var row=0; row<m1.length; row++){
            mReturn[row]=[];
            for(var column=0; column<m1[row].length; column++){
                mReturn[row][column] = m1[row][column] - m2[row][column];
            }
        }
    }
    return mReturn;
};


/**Check againsts NaN values
 **/
Matrix.isNaN = function(m){
    for(var row=0; row<m.length; row++){
        if(m[row] instanceof Array){
            for(var column=0; column<m[row].length; column++){
                if( isNaN(m[row][column])) {
                    return true;
                }
            }
        }
        else{
            if( isNaN(m[row])) {
                return true;
            }
        }
    }
    return false;
};


/**Multiply matrix m2 with m1
 **/
Matrix.multiply = function(m1, m2){
    var mReturn = [];
    if(m1[0].length == m2.length){//check that width=height
        for(var m1Row=0; m1Row<m1.length; m1Row++){
            mReturn[m1Row] = [];
            for(var m2Column=0; m2Column< m2[0].length; m2Column++){
                mReturn[m1Row][m2Column] = 0
                for(var m2Row=0; m2Row<m2.length; m2Row++){
                    mReturn[m1Row][m2Column] += m1[m1Row][m2Row] * m2[m2Row][m2Column];
                }
            }
        }
    }
    return mReturn;
};


/**Multiply matrix m2 with m1
 **/
Matrix.mergeTransformations = function(){
    var mReturn = [];
    
    if(arguments.length > 0){
        mReturn = Matrix.clone( arguments[arguments.length-1] );
        
        for(var m = arguments.length - 2; m >= 0; m--){
            mReturn = Matrix.multiply(mReturn, arguments[m]);        
        }
    }
    ////console.log("mreturn",mReturn)
    return mReturn;
};

/**
 * Inverts a matrix
 **/
Matrix.invertMatrix = function(m){
    
    };

/**Compares two matrixes
**/
Matrix.equals = function(m1, m2){
    if(m1.length != m2.length){ //nr or rows not equal
        return false;
    }
    else{
        for(var i in m1){
            if(m1[i].length != m2[i].length){ //nr or cols not equal
                return false;
            }
            else{
                for(var j in m1[i]){
                    if(m1[i][j] != m2[i][j]){
                        return false;
                    }
                }
            }
        }
    }

    return true;
}


/**Creates a clockwise rotation matrix around the origin.
 *
 **/
Matrix.rotationMatrix = function(angle){
    var mReturn=[
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle),   0],
    [0,0, 1]];
    return mReturn;
};

    
/**Creates a translation matrix
 **/
Matrix.translationMatrix = function(dx, dy){
    return [
    [1, 0, dx],
    [0, 1, dy],
    [0, 0,  1]
    ];
};
    
/**Creates a scale matrix
 **/
Matrix.scaleMatrix = function(sx, sy){
    if(sy == null) {
        sy = sx;
    }

    
    return [
    [sx,0,0],
    [0,sy,0],
    [0,0,1]
    ];
//we should allow a single parameter too, in which case we will have sx = sy
};


/**A ready to use matrix to make a 90 degree rotation.
 **/
Matrix.R90 = [[0, -1, 0], [0,  1, 0], [0,  0, 1]];

/**The identity matrix*/
Matrix.IDENTITY = [[1,0,0],[0,1,0],[0,0,1]];

/**The move up by 1 unit matrix*/
Matrix.UP = [
    [1, 0, 0],
    [0, 1, -1],
    [0, 0, 1]
    ];
    
/**The move down by 1 unit matrix*/
Matrix.DOWN = [
    [1, 0, 0],
    [0, 1, 1],
    [0, 0, 1]
    ];
    
/**The move left by 1 unit matrix*/
Matrix.LEFT = [
    [1, 0, -1],
    [0, 1, 0],
    [0, 0, 1]
    ];

/**The move right by 1 unit matrix*/
Matrix.RIGHT = [
    [1, 0, 1],
    [0, 1, 0],
    [0, 0, 1]
    ];

    /**
 * A wrapper for canvas element. This should only used to save / store canvas' properties
 */
function CanvasProps(width, height, fillColor, backgroundURL, bgType){
    /**Canvas width*/
    this.width = width;
    /**Canvas height*/
    this.height = height;
    /**Canvas fill color*/
    this.fillColor = fillColor;
    /**Canvas id. Used in main.js:updateShape() to see what object we have*/
    this.id = "canvasProps"; //
    /**Serialization type*/
    this.oType = 'CanvasProps';
    /** Canvas Pencil */
    this.pencil = [];
    /** Canvas Background **/
    this.backgroundURL = backgroundURL;
    /** Canvas Background Type**/
    this.bgType = bgType;
}

/**default height for canvas*/
CanvasProps.DEFAULT_HEIGHT = 1500; 

/**default width for canvas*/
CanvasProps.DEFAULT_WIDTH = 1500;

/**default fill color for canvas*/
CanvasProps.DEFAULT_FILL_COLOR = "#ffffff";

/**
 *We only ever have one instance of this class (like STACK)
 */
CanvasProps.load = function(o){
    var canvasprops = new CanvasProps();

    var tempVal = Number(o.height);
    canvasprops.height = !isNaN(tempVal) ? tempVal : CanvasProps.DEFAULT_HEIGHT;

    tempVal = Number(o.width);
    canvasprops.width = !isNaN(tempVal) ? tempVal : CanvasProps.DEFAULT_WIDTH;

    canvasprops.fillColor = o.fillColor;
    canvasprops.pencil = o.pencil;
    canvasprops.backgroundURL = o.backgroundURL;
    canvasprops.bgType = o.bgType;
    return canvasprops;
}


CanvasProps.prototype = {
    
    constructor : CanvasProps,
    
    /**Just clone the damn thing :)*/
    /*clone : function(){
       return new CanvasProps(this.width, this.height, this.fillColor,this.backgroundURL);
    },*/
    clone : function(o){
        if (null == o) return o;
        var copy = new CanvasProps();
        for (var attr in o) {
            if (o.hasOwnProperty(attr)) copy[attr] = o[attr];
        }
        return copy;
    },
    /**Get width of the canvas*/
    getWidth:function(){
        return this.width;
    },


    /**
     * Set the width of the canvas. Also force a canvas resize
     * @param {Number} width - the new width
     */
    setWidth:function(width){//required for undo
        this.width = width;
        this.sync();
    },


    /**Return the height of the canvas*/
    getHeight:function(){
        return this.height;
    },


    /**
     * Set the height of the canvas. Also force a Canvas resize
     *  @param {Number} height - the new height
     */
    setHeight:function(height){//required for undo
        this.height = height;
        this.sync();
    },


    /**Return the fill color of the canvas*/
    getFillColor:function(){
        return this.fillColor;
    },


    /**
     * Set the fill color of the canvas. Also force a Canvas sync
     *  @param {String} fillColor - the new height
     */
    setFillColor:function(fillColor){//required for undo
        this.fillColor = fillColor;
    },

    sync:function() {
        var canvas = getCanvas();
        
        canvas.height = this.height;
        canvas.width = this.width;
        canvas.fillColor = this.fillColor;

        //whenever we change a detail of the width of the canvas, we need to update the map
        //minimap.initMinimap();
        
        //also the background //TODO: move it someplace else
        //backgroundImage = null;
    },
    /**Returns a representation of the object
     *@return {String}
     **/
    toString: function(){
       return "CanvasProp [width: " + this.width + " height: " + this.height + " fillColor: " + this.fillColor + ' ]';
    }
};

/**
 * An facade to add Commands, undo and redo them.
 * It keeps a STACK of commands and can trigger undo actions in the system.
 */
function History(){
}

/**Object is a figure*/
History.OBJECT_FIGURE = 0; 

/**Object is a linearrow*/
History.OBJECT_CONNECTOR = 1;

/**Object is a connection point*/
History.OBJECT_CONNECTION_POINT = 2;

/**Object is a generic object*/
History.OBJECT_STATIC = 3;

/**Object is a group
 *@deprecated
 **/
History.OBJECT_GROUP = 4;

/**Object is a glue*/
History.OBJECT_GLUE = 5;

/**Where the {Array} or commands is stored*/
History.COMMANDS = [];

/**The current command inde within the vector of undoable objects. At that position there will be a Command*/
History.CURRENT_POINTER = -1;

/**Maximum number of history will be stored*/
History.MAX_POINTER = 5;

History.reset = function(){
  History.COMMANDS = [];

  /**The current command inde within the vector of undoable objects. At that position there will be a Command*/
  History.CURRENT_POINTER = -1;
}
History.load = function(commands,current_pointer){
  History.COMMANDS = commands;
  History.CURRENT_POINTER = current_pointer;
}

/* Add an action to the STACK of undoable actions.
 */
History.addUndo = function(command){
    if(doUndo){
        /**As we are now positioned on CURRENT_POINTER(where current Command is stored) we will
         *delete anything after it, add new Command and increase CURRENT_POINTER
         **/
        
        //remove commands after current command 
        History.COMMANDS.splice(History.CURRENT_POINTER +1, History.COMMANDS.length);

        var b_canvas1 = document.getElementById("canvas_background");
        var b_context1 = b_canvas1.getContext("2d");
        var b_canvas2 = document.getElementById("canvas_main");
        var b_context2 = b_canvas2.getContext("2d");
        var b_canvas3 = document.getElementById("canvas_pencil");
        var b_context3 = b_canvas3.getContext("2d");
        
        /*var buffer = document.createElement("canvas");
        buffer.width = b_canvas2.width;
        buffer.height = b_canvas2.height;
        var buffer_context = buffer.getContext("2d");
        buffer_context.drawImage(im1, 0, 0);
        buffer_context.drawImage(im2, 0, 0);*/
        /*command.pencil_data = b_canvas3.toDataURL("image/png");
        command.main_data = b_canvas2.toDataURL("image/png");
        *///add new command 
        var data = new Object();
        data.whiteboard_id = 1;
        data.session_id = 1;
        data.command_id =  History.COMMANDS.length - 1;
        /*data.main_data = b_canvas2.toDataURL("image/png");
        data.pencil_data = b_canvas3.toDataURL("image/png");
        var val = JSON.stringify(data);
        *//*$.ajax({
          method: "POST",
          url: "http://localhost/VideoServer/upload.php",
          data: { json_data : val}
        })
          .done(function( msg ) {
            //alert( "Data Saved: " + msg );
          });*/
        if(MOUSE_STATE != 'move')
          command.exe = 'true';
        else
          command.exe = 'false';
        if(History.MAX_POINTER==-1)
        {
          History.COMMANDS.push(command);
          //increase the current pointer
          History.CURRENT_POINTER++;
          //////console.log(JSON.stringify(History.COMMANDS));  
        }
        else
        {
          if(History.COMMANDS.length<History.MAX_POINTER)
          {
            History.COMMANDS.push(command);
            //increase the current pointer
            History.CURRENT_POINTER++;
            //////console.log(JSON.stringify(History.COMMANDS));    
          }
          else
          {
            //remove first command and adding new command 
            History.COMMANDS.splice(0, 1);
            History.COMMANDS.push(command);
          }
        }
    }
}
History.getPreviousPencilPointer = function(){
  for(var i=History.CURRENT_POINTER-1;i>=0;i--)
  {
    if(History.COMMANDS[i] instanceof InsertedImageFigureCreateCommand&&History.COMMANDS[i].imgFileName == "Pencil")
      return i;
  }
}
/**Undo current command
 *TODO: nice to compress/merge some actions like many Translate in a row
 **/
History.undo = function(){
    if(History.CURRENT_POINTER >= 0){
      if(History.COMMANDS[History.CURRENT_POINTER].exe === 'true')
      {
          if(History.COMMANDS[History.CURRENT_POINTER] instanceof InsertedImageFigureCreateCommand&&History.COMMANDS[History.CURRENT_POINTER].imgFileName == "Pencil")
          {
            pencil_draw = true;
          }
          Log.info('undo()->Type of action: ' + History.COMMANDS[History.CURRENT_POINTER].oType);
          History.COMMANDS[History.CURRENT_POINTER].undo();
          History.CURRENT_POINTER --;
      }
      else
      {
          if(History.COMMANDS[History.CURRENT_POINTER] instanceof InsertedImageFigureCreateCommand&&History.COMMANDS[History.CURRENT_POINTER].imgFileName == "Pencil")
          {
            pencil_draw = true;
          }
          History.COMMANDS[History.CURRENT_POINTER].undo();
          History.CURRENT_POINTER --;
          History.undo();
      }
    }
}

/**Redo a command
 *TODO: nice to compress/merge some actions like many Translate in a row
 **/
History.redo = function(){
    if(History.CURRENT_POINTER + 1 < History.COMMANDS.length){
      if(History.COMMANDS[History.CURRENT_POINTER+1].exe === 'true')
      {
        Log.info('redo()->Type of action: ' + History.COMMANDS[History.CURRENT_POINTER+1].oType);
        History.COMMANDS[History.CURRENT_POINTER + 1].execute();
        History.CURRENT_POINTER++;
      }
      else
      {
        History.COMMANDS[History.CURRENT_POINTER + 1].execute();
        History.CURRENT_POINTER++;
        History.redo();
      }
    }
}

/**Pack identical commands into a single, equivalend command.
 *It will pack only consecutive and same type commands (until a TurningPointCommand is founded)
 **/
History.pack = function(){
    //TODO: implement
}



/* ImageFrame.js */

/*jslint bitwise:true, plusplus: true */
/*global Base64: false*/
(function (globalObj) {
    'use strict';

    var DEFLATE_METHOD = String.fromCharCode(0x78, 0x01),
        CRC_TABLE = [],
        SIGNATURE = String.fromCharCode(137, 80, 78, 71, 13, 10, 26, 10),
        NO_FILTER = String.fromCharCode(0),

        make_crc_table = function () {
            var n, c, k;

            for (n = 0; n < 256; n++) {
                c = n;
                for (k = 0; k < 8; k++) {
                    if (c & 1) {
                        c = 0xedb88320 ^ (c >>> 1);
                    } else {
                        c = c >>> 1;
                    }
                }
                CRC_TABLE[n] = c;
            }
        },

        inflateStore = function (data) {
            var MAX_STORE_LENGTH = 65535,
                storeBuffer = '',
                i,
                remaining,
                blockType;

            for (i = 0; i < data.length; i += MAX_STORE_LENGTH) {
                remaining = data.length - i;
                blockType = '';

                if (remaining <= MAX_STORE_LENGTH) {
                    blockType = String.fromCharCode(0x01);
                } else {
                    remaining = MAX_STORE_LENGTH;
                    blockType = String.fromCharCode(0x00);
                }
                // little-endian
                storeBuffer += blockType + String.fromCharCode((remaining & 0xFF), (remaining & 0xFF00) >>> 8);
                storeBuffer += String.fromCharCode(((~remaining) & 0xFF), ((~remaining) & 0xFF00) >>> 8);

                storeBuffer += data.substring(i, i + remaining);
            }

            return storeBuffer;
        },

        adler32 = function (data) {
            var MOD_ADLER = 65521,
                a = 1,
                b = 0,
                i;

            for (i = 0; i < data.length; i++) {
                a = (a + data.charCodeAt(i)) % MOD_ADLER;
                b = (b + a) % MOD_ADLER;
            }

            return (b << 16) | a;
        },

        update_crc = function (crc, buf) {
            var c = crc, n, b;

            for (n = 0; n < buf.length; n++) {
                b = buf.charCodeAt(n);
                c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
            }
            return c;
        },

        crc = function crc(buf) {
            return update_crc(0xffffffff, buf) ^ 0xffffffff;
        },

        dwordAsString = function (dword) {
            return String.fromCharCode((dword & 0xFF000000) >>> 24, (dword & 0x00FF0000) >>> 16, (dword & 0x0000FF00) >>> 8, (dword & 0x000000FF));
        },

        createChunk = function (length, type, data) {
            var CRC = crc(type + data);

            return dwordAsString(length) +
                type +
                data +
                dwordAsString(CRC);
        },

        IEND,

        createIHDR = function (width, height) {
            var IHDRdata;

            IHDRdata = dwordAsString(width);
            IHDRdata += dwordAsString(height);

            // bit depth
            IHDRdata += String.fromCharCode(8);
            // color type: 6=truecolor with alpha
            IHDRdata += String.fromCharCode(6);
            // compression method: 0=deflate, only allowed value
            IHDRdata += String.fromCharCode(0);
            // filtering: 0=adaptive, only allowed value
            IHDRdata += String.fromCharCode(0);
            // interlacing: 0=none
            IHDRdata += String.fromCharCode(0);

            return createChunk(13, 'IHDR', IHDRdata);
        },

        png = function (width, height, rgba) {
            var IHDR = createIHDR(width, height),
                IDAT,
                scanlines = '',
                scanline,
                y,
                x,
                compressedScanlines;

            for (y = 0; y < rgba.length; y += width * 4) {
                scanline = NO_FILTER;
                if (Array.isArray(rgba)) {
                    for (x = 0; x < width * 4; x++) {
                        scanline += String.fromCharCode(rgba[y + x] & 0xff);
                    }
                } else {
                    // rgba=string
                    scanline += rgba.substr(y, width * 4);
                }
                scanlines += scanline;
            }

            compressedScanlines = DEFLATE_METHOD + inflateStore(scanlines) + dwordAsString(adler32(scanlines));

            IDAT = createChunk(compressedScanlines.length, 'IDAT', compressedScanlines);

            return SIGNATURE + IHDR + IDAT + IEND;
        };

    make_crc_table();
    IEND = createChunk(0, 'IEND', '');

    globalObj.generatePng = png;
}(this));

/**
 *This class offers support to add images to WHITEBOARD engine
 **/
function ImageFrame(url, x, y, scale, frameWidth, frameHeight, imageData){
    
    /**Keeps track if the image was loaded*/
    this.loaded = false;
            
    this.vector = [new Point(x,y),new Point(x,y-20), new Point(x+20, y)];
    this.constraints = false;
    
    /**The the frame width*/
    this.frameWidth = frameWidth;    
    if(frameWidth){
        this.constraints = true;
    }
    
    /**The the frame height*/
    this.frameHeight = frameHeight;
    if(frameHeight){        
        this.constraints = true;
    }
    else{
        //this.frameHeight = ImageFrame.DEFAULT_HEIGHT;
        //throw "ImageFrame.js->constructor()->frameHeight not set";
    }
    
    /**Trigger or not the scalling of the image, after transformations*/
    this.scale = scale;
    
    /**Tell if we need to keep ratio of the image. Ignored. Set to true by default*/
    this.keepRatio = true;
    
    this.url = url; 
    
    ////console.log(imageData);
    this.image = new Image();    
    ////console.log("a");
    if(imageData!=undefined)
    {
        ////console.log("Before Gallery URL "+imageData);
        this.imageData = encodeImageData(imageData);
        this.setUrl(url,encodeImageData(imageData));
        ////console.log("Before Gallery URL "+imageData);
    }
    /**
     * TODO: remove it
     * */
    this.debug = false; 
    
    /**The style of the Image. Kinda fake/default value*/
    //TODO: do we really need to keep this?
    this.style = new Style();
    //    
    //    //this.url = '';
    /**The type of the object. Used in deserialization*/
    this.oType = 'ImageFrame';
}

ImageFrame.DEFAULT_WIDTH = 10;
ImageFrame.DEFAULT_HEIGHT = 10;




/**Creates a {ImageFrame} out of JSON parsed object
 **/
ImageFrame.load = function(o){
    var newImageFrame = new ImageFrame();
    
    //default: newImageFrame.loaded
    newImageFrame.vector = Point.loadArray(o.vector);
    //not needed: newImage.image 
    newImageFrame.constraints = o.constraints;
    newImageFrame.frameHeight = o.frameHeight;
    newImageFrame.frameWidth = o.frameWidth;    
    newImageFrame.scale = o.scale;
    newImageFrame.keepRatio = o.keepRatio;
    newImageFrame.imageData = o.imageData;
    newImageFrame.setUrl(o.url,o.imageData);
    //not needed: newImage.style    
    newImageFrame.debug = o.debug;
    //not needed: newImage.type
    
    //TODO: not good to load it twice (in constructor and now again)
    
    return newImageFrame;
}


/*  Basic methods we need to implement
 */
ImageFrame.prototype = {
    constructor : ImageFrame,

    toJSON : function() {
        //return JSON.stringify(this, ['loaded', 'oType']);
        //return JSON.stringify(this);
        
        return function (anImageFrame){
            return {
                loaded : anImageFrame.loaded,
                vector : anImageFrame.vector,
                constraints : anImageFrame.constraints,
                frameWidth : anImageFrame.frameWidth,
                frameHeight : anImageFrame.frameHeight,
                scale : anImageFrame.scale,
                keepRatio : anImageFrame.keepRatio,
                url : anImageFrame.url,
                debug : anImageFrame.debug,
                style : anImageFrame.style,
                oType : anImageFrame.oType,
                imageData : anImageFrame.imageData
            }
        }(this);        
    },
    
    
    /**
     *This will load the image asynchronously
     *
     **/
    setUrl : function(url,imageData){
        Log.info("ImageFrame.setUrl() : " + url);
        if(url){ //trigger only if URL is set
            this.url = url;
            this.loaded = false;
            
            //we need to reacreate the Image again as IE9 will mess up the width and heigh of the image
            this.image = new Image();
            
            this.image.onload = function(anImageFrame){
                return function(){
                    anImageFrame.loaded = true;
                    Log.info("ImageFrame.setUrl(): image finally loaded! :)");

                    Log.info('ImageFrame.setUrl(): image width:' + anImageFrame.image.width + ' height:' + anImageFrame.image.height);

                    //in case no frame set use image's dimensions
                    if(anImageFrame.constraints){
                        //nothing, we will keep current width and height
                        Log.info("Constrains present");
                    }
                    else{
                        Log.info("Original image loaded. Image height: " + anImageFrame.image.height + " width: " + anImageFrame.image.width)
                        if(!anImageFrame.constraints){ //if no constraints than load the image naturally
                            anImageFrame.frameHeight = anImageFrame.image.height;
                            anImageFrame.frameWidth = anImageFrame.image.width;
                        }
                    }

                    //force a repain - ouch!
                    Log.info("ImageFrame.setUrl(): force repaint");
                    draw();
                }
            } (this);
            
            //attach an error handler
            this.image.onerror = function(anImageFrame){
                return function (){
                    Log.error("Error with image. URL: " + anImageFrame.url + " loaded: " + anImageFrame.loaded);
                }
            } (this);
            /*var temp = "";
            for (var j = 0; j < imageData.data.length; j++) { //Each byte
                temp += String.fromCharCode(imageData.data[j]);
            }
            var encoded = generatePng(imageData.width, imageData.height, temp);*/
            /*var str = String.fromCharCode.apply(null,imageData.data); // "ÿ8É"
            // to Base64
            var b64 = btoa(str); // "/zjJCA=="
            // to DataURI
            var uri = 'data:image/jpeg;base64,' + b64;
            */
            //trigger loading
            //if(url==="ImageData")
                //this.image.src = "data:image/png;base64," + btoa(encoded);
            if(imageData.startsWith('http'))
                this.image.src = url;
            else
                this.image.src = decodeImageData(imageData);
        }
    },
    
    
    /**We do not have to wait for an image to load to display it's URL
     **/
    getUrl : function(){
        if(this.image.src){
            return this.image.src;  
        }
        else{
            return '';
        }
    },
    
    
    /**Paint the Image into the canvas context
     **/
    paint : function(context){
            
        if(this.loaded){
            if(this.url == "Pencil")
            {
                clearPencilCanvas();
                context = getContextPencil();
                pencil_draw = false;
            }
            context.save();

            //get rotation angle
            var angle = Util.getAngle(this.vector[0],this.vector[1]);

            //make the rotation
            context.translate(this.vector[0].x, this.vector[0].y);
            context.rotate(angle);
            context.translate(-this.vector[0].x, -this.vector[0].y);
            Log.group("A paint");
            Log.info("ImageFrame.paint(): frameWidth: " + this.frameWidth + " frameHeight: " + this.frameHeight);
            Log.info("ImageFrame.paint(): image.width: " + this.image.width + " image.height: " + this.image.height);

            //scale image
            var wRatio = this.frameWidth / this.image.width ;
            var vRatio = this.frameHeight / this.image.height;
            
            //use minimum ratio
            var ratio = Math.min(wRatio, vRatio);
            Log.info("ImageFrame.paint(): wRatio: " + wRatio + " vRatio: " + vRatio + " ratio: " + ratio);

            //find new scalled width and height
            var imgScaledWidth = this.image.width * ratio;
            var imgScaleHeight = this.image.height * ratio;
            Log.info("ImageFrame.paint(): imgScaledWidth: " + imgScaledWidth + " imgScaleHeight: " + imgScaleHeight);
            if(this.style.globalAlpha!=null)
            {
              context.globalAlpha = this.style.globalAlpha;
              context.globalCompositeOperation = this.style.globalCompositeOperation;
            }
            //draw image
            context.drawImage(this.image, 
                this.vector[0].x - imgScaledWidth / 2, 
                this.vector[0].y - imgScaleHeight / 2,
                imgScaledWidth,
                imgScaleHeight);

            Log.groupEnd();
            context.restore();
        }
        else
        {
            context.save();

            //get rotation angle
            var angle = Util.getAngle(this.vector[0],this.vector[1]);

            //make the rotation
            context.translate(this.vector[0].x, this.vector[0].y);
            context.rotate(angle);
            context.translate(-this.vector[0].x, -this.vector[0].y);
            //context.putImageData(this.imageData,selectionArea.points[2].x+10,selectionArea.points[2].y+10);
            context.restore();
        }
    },
    
    
    /**Transform image
     **/
    transform : function(matrix){
        //vector's dimensions before transformation
        var vectorWidth = Math.sqrt( Math.pow(this.vector[0].x - this.vector[1].x, 2) + Math.pow(this.vector[0].y - this.vector[1].y, 2) );
        var vectorHeight = Math.sqrt( Math.pow(this.vector[0].x - this.vector[2].x, 2) + Math.pow(this.vector[0].y - this.vector[2].y, 2) );

        //transform vector
        this.vector[0].transform(matrix);
        this.vector[1].transform(matrix);
        this.vector[2].transform(matrix);

        //if scale is allowed we will do it
        if(this.scale){
            
            //vector's NEW dimensions
            var vectorWidth2 = Math.sqrt( Math.pow(this.vector[0].x - this.vector[1].x, 2) + Math.pow(this.vector[0].y - this.vector[1].y, 2) );
            var vectorHeight2 = Math.sqrt( Math.pow(this.vector[0].x - this.vector[2].x, 2) + Math.pow(this.vector[0].y - this.vector[2].y, 2) );

            //find the grow/shrink ratio
            var vRatio = vectorWidth2 / vectorWidth;
            var hRatio = vectorHeight2 / vectorHeight;

            //update the frameset
            this.frameHeight *= vRatio;
            this.frameWidth *= hRatio;
            
            //now we have constraints
            if(vRatio != 1 || hRatio != 1){
                this.constraints = true;
            }
        }
    },
    
    
    /**
     *Get the angle around the compas between the vector and North direction
     **/
    getAngle: function(){
        return Util.getAngle(this.vector[0], this.vector[1]);
    },
    
    
    /**Returns the bounds the ImageFrame might have if in normal space (not rotated)
     **/
    getNormalBounds:function(){

        var poly = new Polygon();
        
        if(this.frameWidth && this.frameHeight){ //until the image is loaded we do no not have dimensions set
            poly.addPoint(new Point(this.vector[0].x - this.frameWidth/2, this.vector[0].y - this.frameHeight/2));
            poly.addPoint(new Point(this.vector[0].x + this.frameWidth/2, this.vector[0].y - this.frameHeight/2));
            poly.addPoint(new Point(this.vector[0].x + this.frameWidth/2, this.vector[0].y + this.frameHeight/2));
            poly.addPoint(new Point(this.vector[0].x - this.frameWidth/2, this.vector[0].y + this.frameHeight/2));
        }
        else{ //fake/temporary bounds
            poly.addPoint(new Point(this.vector[0].x - ImageFrame.DEFAULT_WIDTH / 2, this.vector[0].y - ImageFrame.DEFAULT_HEIGHT / 2));
            poly.addPoint(new Point(this.vector[0].x + ImageFrame.DEFAULT_WIDTH / 2, this.vector[0].y - ImageFrame.DEFAULT_HEIGHT / 2));
            poly.addPoint(new Point(this.vector[0].x + ImageFrame.DEFAULT_WIDTH / 2, this.vector[0].y + ImageFrame.DEFAULT_HEIGHT / 2));
            poly.addPoint(new Point(this.vector[0].x - ImageFrame.DEFAULT_WIDTH / 2, this.vector[0].y + ImageFrame.DEFAULT_HEIGHT / 2));
        }

        return poly;
    },
    
    
    /**Tests if the Image contains a point defined by x and y
     **/
    contains: function(x,y){
        var contains = false;
        
        if(this.loaded){           
            var angle = this.getAngle();
            
            var nBounds = this.getNormalBounds();
            
            nBounds.transform( Matrix.translationMatrix(-this.vector[0].x, -this.vector[0].y) );
            nBounds.transform(Matrix.rotationMatrix(angle));
            nBounds.transform(Matrix.translationMatrix(this.vector[0].x, this.vector[0].y));

            try{
                contains = nBounds.contains(x,y);
            }catch(ex){
                Log.error("ImageFrame->contains(error): " + ex);
            }
        }
        
        return contains;
    },
    
    
    
    /**
     *Returns the bounds - in transformed space - of the Image
     */
    getBounds : function (){
        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        ////console.log("getbounds",angle)
        var nBounds = this.getNormalBounds(); //as Polygon

        nBounds.transform(Matrix.translationMatrix(-this.vector[0].x, -this.vector[0].y) );
        nBounds.transform(Matrix.rotationMatrix(angle));
        nBounds.transform(Matrix.translationMatrix(this.vector[0].x, this.vector[0].y));

        return nBounds.getBounds();
    },


    /**
     *Fake method as Image does not have the concept of points (yet?!)
     **/
    getPoints : function (){
        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        
        var nBounds = this.getNormalBounds(); //as Polygon

        nBounds.transform(Matrix.translationMatrix(-this.vector[0].x, -this.vector[0].y) );
        nBounds.transform(Matrix.rotationMatrix(angle));
        nBounds.transform(Matrix.translationMatrix(this.vector[0].x, this.vector[0].y));
        
        return nBounds.getPoints();
    },
    
    /**This function returns a deed clone of current {ImageFrame}
     **/
    clone:function(){
        //make a new object
        var cImg = new ImageFrame();
        
        //copy what we can
        cImg.frameHeight = this.frameHeight;
        cImg.frameWidth = this.frameWidth;
        cImg.keepRatio = this.keepRatio;
        cImg.constraints = this.constraints;
        cImg.vector = Point.cloneArray(this.vector) ;
        cImg.setUrl(this.url);
        
        return cImg;
    },
    
    /**
     *Export the image to SVG
     **/
    toSVG : function (){
        var svg = ''; 

        if(this.loaded){
            var angle = this.getAngle() * 180 / Math.PI;
            svg += "\n" + repeat("\t", INDENTATION) + '<g transform="rotate (' + angle + ', ' + this.vector[0].x  + ', ' + this.vector[0].y + ')">';
            INDENTATION++;
            Log.group("A paint");
            Log.info("ImageFrame.toSVG(): frameWidth: " + this.frameWidth + " frameHeight: " + this.frameHeight);
            Log.info("ImageFrame.toSVG(): image.width: " + this.image.width + " image.height: " + this.image.height);

            //scale image
            var wRatio = this.frameWidth / this.image.width ;
            var vRatio = this.frameHeight / this.image.height;
            var ratio = Math.min(wRatio, vRatio);
            Log.info("ImageFrame.toSVG(): wRatio: " + wRatio + " vRatio: " + vRatio + " ratio: " + ratio);

            var imgScaledWidth = this.image.width * ratio;
            var imgScaleHeight = this.image.height * ratio;
            Log.info("ImageFrame.toSVG(): imgScaledWidth: " + imgScaledWidth + " imgScaleHeight: " + imgScaleHeight);

            var imageX = this.vector[0].x - imgScaledWidth / 2;
            var imageY = this.vector[0].y - imgScaleHeight / 2;

//            INDENTATION++;
            svg += "\n" + repeat("\t", INDENTATION) + '<image x="' + imageX + '" y="' + imageY +'" width="' + imgScaledWidth +  '" height="' + imgScaleHeight + '" xlink:href="' + this.getUrl() + '" />';
//            INDENTATION--;
            Log.groupEnd();

//            svg += "\n" + repeat("\t", INDENTATION) +  '</svg>';
            INDENTATION--;
            svg += "\n" + repeat("\t", INDENTATION) +  '</g>';
        }    

        return svg;
    }
    
    
}


/* 
 * "Static" method used for importing images
 * */
ImageFrame.figure_InsertedImage = function(url, x, y,imageData)
{   
    
    var figure_name = "Image";
    if(url == "Pencil")
    {
        figure_name = "Pencil";
    }    
    // create new figure
    var f = new Figure(figure_name);
    f.style.fillStyle = FigureDefaults.fillStyle;
    f.style.strokeStyle = FigureDefaults.strokeStyle;

    // figure's part with image
    var ifig = new ImageFrame(url, x, y, true,false,false,imageData);
    f.addPrimitive(ifig);
    var t2 = new Text(FigureDefaults.textStr, x, y, FigureDefaults.textFont, FigureDefaults.textSize);
    ////console.log("t2",t2)
    t2.style.fillStyle = FigureDefaults.textColor;
    f.addPrimitive(t2)
    ////console.log("ifig",ifig)

    // set callback to get image's natural size and use it for new figure
    ifig.image.addEventListener("load", function (){

        // image size
        var imageWidth = ifig.image.width;
        var imageHeight = ifig.image.height;

        //f.properties.push(new BuilderProperty('URL', 'url', BuilderProperty.TYPE_URL));

        ifig.frameHeight = imageHeight + FigureDefaults.textSize;

        f.finalise();
        draw();
    }, false);

    f.finalise();
    return f;
};

/* Util.js */

var Util = {

    getBounds:function(points){
        if (!points.length)
            return null;
        var minX = points[0].x;
        var maxX = minX;
        var minY = points[0].y;
        var maxY = minY;
        for (var i = 1; i < points.length; i++) {
            minX = Math.min(minX, points[i].x);
            minY = Math.min(minY, points[i].y);
            maxX = Math.max(maxX, points[i].x);
            maxY = Math.max(maxY, points[i].y);
        }
        return [minX, minY, maxX, maxY];
    },


    rgbToHsl: function(r, g, b){
        r /= 255;
        g /= 255;
        b /= 255;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max === min){
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    },


    hexToRgb: function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },


    hslToString: function(hsl){
        return 'hsl(' + hsl[0] * 360 + ', ' + hsl[1] * 100 + '%, ' + hsl[2] * 100 + '%)';
    },


    getUnionBounds: function(shapes){
        //tODo
    },
           
    areBoundsInBounds : function(innerBounds, outerBounds){
        return (outerBounds[0] <= innerBounds[0] && (innerBounds[0] <= outerBounds[2]))
        && (outerBounds[1] <= innerBounds[1] && (innerBounds[1] <= outerBounds[3]))
        && (outerBounds[0] <= innerBounds[2] && (innerBounds[2] <= outerBounds[2]))
        && (outerBounds[1] <= innerBounds[3] && (innerBounds[3] <= outerBounds[3]));
    },
    
    
    boundsToPolygon: function(data){
        var poly = new Polygon();
        poly.addPoint(new Point(data[0], data[1]));
        poly.addPoint(new Point(data[2], data[1]));
        poly.addPoint(new Point(data[2], data[3]));
        poly.addPoint(new Point(data[0], data[3]));
        
        return poly;
    }, 

    capitaliseFirstLetter : function(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    feather: function(rectangle, size){
        return [rectangle[0] + size, rectangle[1] + size , rectangle[2] + size , rectangle[3] + size];
    },

    distance: function(p1, p2){
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    },
    
    
    point_on_segment : function (p1, p2, distance_from_p1){
        var d = Util.distance(p1, p2);
        var Xm = p1.x  + distance_from_p1 / d * (p2.x - p1.x);
        var Ym = p1.y  + distance_from_p1 / d * (p2.y - p1.y);

        return new Point(Xm, Ym);
    },  
    
    decorate : function(ctx, points, pattern){
        
        
        function info(msg){
//          console.info(msg);
        }

        function group(name){
//          console.group(name);
        }

        function groupEnd(){
//          console.groupEnd();
        }
            
        var t0 = (new Date).getMilliseconds();
        
        /**Scale the pattern up/down to fit the lineWidth*/
        var pt = [];
        
        for(var i=0; i<pattern.length; i++){
            pt[i] = pattern[i] * ctx.lineWidth;
        }


        function lineTo(p){
            ctx.lineTo(p.x, p.y);
        }

        function moveTo(p){
            ctx.moveTo(p.x, p.y);
        }

        var current_point = points[0];
        i = 0; //current point/segment
        var pt_i = 0; //index position in pattern
        var pt_left = pt[0]; // spaces or dotts left to paint from current index position in pattern
        
        info("current_point" + current_point);
        
        //position at the begining
        moveTo(current_point);



        while (i < points.length - 1) {
            //inside [Pi, Pi+1] segment
            var segment_path = 0; //how much of current segment was painted

            group("Paint segment " + i);
            info("i = " + i + " current_point = " + current_point + " pt_i = " + pt_i + " pt_left = " + pt_left + " segment_path = " + segment_path );

            if(pt_left < 0){
                break;
            }


            //paint previous/left part of pattern
            if ( pt_left > 0 ){
                group("Paint rest of pattern");
                info("Pattern left,  pt_left : " + pt_left + " pt_i : " + pt_i);

                //are we about to cross to another segment?
                if ( pt_left > Util.distance(current_point, points[i+1]) ) { //we exceed current segment
                    info("We exceed current segment");

                    //paint what is left and move to next segment
                    if ( pt_i % 2 == 0 ) { //dots
                        lineTo(points[i+1])                     
                    }
                    else{ //spaces
                        moveTo(points[i+1])
                    }

                    //store what was left unpainted
                    segment_path += Util.distance(current_point,  points[i+1]);
                    pt_left = pt_left - Util.distance(current_point, points[i+1]);
                    current_point = points[i+1];
                    i++; //move to next segment
                    groupEnd(); //end inner group
                    groupEnd(); //end outer group
                    continue;
                }           
                else{ //still inside segment
                    info("Painting from rest path pt_i = " + pt_i + " current_segment = " + segment_path);
                    var newP = Util.point_on_segment(current_point, points[i+1], pt_left); //translate on current_point with pt_left from Pi to Pi+1
                    info("\t newP = " + newP);
                    if ( pt_i % 2 == 0 ) { //dots
                        lineTo(newP)                    
                    }
                    else{ //spaces
                        moveTo(newP)
                    }

                    segment_path += Util.distance(current_point,  newP);    
                    current_point = newP;
                    pt_left = 0;
                    pt_i = (pt_i + 1) % pt.length;
                }
                groupEnd();
            }

            group('No rest left, normal paint');
            info("We should have (pt_i >= 0) and (pt_left = 0) AND WE HAVE " + "pt_i = " + pt_i + " pt_left = " + pt_left);


            while(segment_path < Util.distance(points[i], points[i+1])){
                info("Distance between " + i + " and " + (i + 1) + " = " + Util.distance(points[i], points[i+1]));


                info("...painting path pt_i = " + pt_i + " dot/space length = " + pt[pt_i] + " current_segment = " + segment_path);
                if(segment_path + pt[pt_i] <= Util.distance(points[i], points[i+1])){ //still inside segment
                    group("Still inside segment");
                    var newP = Util.point_on_segment(current_point, points[i+1], pt[pt_i]); //translate on current segment with pt[pt_i] from Pi to Pi+1
                    info("\t newP = " + newP);
                    if(pt_i % 2 == 0) {
                        lineTo(newP);
                    }
                    else{
                        moveTo(newP);
                    }
                    pt_left = 0;
                    segment_path += pt[pt_i];
                    current_point = newP;
                    pt_i = (pt_i + 1) % pt.length;
                    groupEnd();
                }
                else{ //segment exceeded
                    group("Exceed segment");
                    if(pt_i % 2 == 0) {
                        lineTo(points[i+1]);
                    }
                    else{
                        moveTo(points[i+1]);
                    }
                    pt_left = pt[pt_i] - Util.distance(current_point, points[i+1]);
                    segment_path += Util.distance(current_point,  points[i+1]);
                    current_point = points[i+1];
                    info("...pt_left = " + pt_left + " current_segment = " + segment_path + " current_point = " + current_point);
                    //move to next segment                          
                    groupEnd(); //end inner group                           
                    break;
                }
            }
            groupEnd();
            ++i;
            groupEnd();
        }

        var t1 = (new Date).getMilliseconds();
        console.info("Took " + (t1 - t0) + " ms");
    },
    
    
    round:function(number, decimals){
        return Math.round(number*Math.pow(10,decimals))/Math.pow(10,decimals);
    },


    getLength:function(startPoint,endPoint){
        return Math.sqrt( Math.pow(startPoint.x-endPoint.x,2) + Math.pow(startPoint.y-endPoint.y,2) );
    },
    
    
    getMiddle: function(startPoint, endPoint){
        return new Point( (startPoint.x + endPoint.x)/2, (startPoint.y + endPoint.y)/2);
    },


    getPolylineLength:function(v){
        var l = 0;
        for(var i=0;i<v.length-1; i++){
            l += Util.getLength(v[i], v[i+1]);
        }

        return l;
    },


    lineIntersectsRectangle:function(startPoint, endPoint, bounds){
        //create the initial line/segment
        var l = new Line(startPoint, endPoint);

        //get the 4 lines/segments represented by the bounds
        var lines = [];
        lines.push( new Line( new Point(bounds[0], bounds[1]), new Point(bounds[2], bounds[1])) );
        lines.push( new Line( new Point(bounds[2], bounds[1]), new Point(bounds[2], bounds[3])) );
        lines.push( new Line( new Point(bounds[2], bounds[3]), new Point(bounds[0], bounds[3])) );
        lines.push( new Line( new Point(bounds[0], bounds[3]), new Point(bounds[0], bounds[1])) );

        //check if our line intersects any of the 4 lines
        for(var i=0; i<lines.length; i++){
            if(this.lineIntersectsLine(l, lines[i])){
                return true;
            }
        }
        
        return false;
    },
    
    polylineIntersectsRectangle:function(points, bounds, closedPolyline){
        var lines = [];
        lines.push( new Line( new Point(bounds[0], bounds[1]), new Point(bounds[2], bounds[1])) );
        lines.push( new Line( new Point(bounds[2], bounds[1]), new Point(bounds[2], bounds[3])) );
        lines.push( new Line( new Point(bounds[2], bounds[3]), new Point(bounds[0], bounds[3])) );
        lines.push( new Line( new Point(bounds[0], bounds[3]), new Point(bounds[0], bounds[1])) );

        for(var k=0; k < points.length-1; k++){
            //create a line out of each 2 consecutive points            
            var tempLine = new Line(points[k], points[k+1]);
            
            //see if that line intersect any of the line on bounds border
            for(var i=0; i<lines.length; i++){
                if(this.lineIntersectsLine(tempLine, lines[i])){
                    return true;
                }
            }
        }
        
        //check the closed figure - that is last point connected to the first
        if (closedPolyline){
            //create a line out of each 2 consecutive points            
            var tempLine = new Line(points[points.length-1], points[0]);
            
            //see if that line intersect any of the line on bounds border
            for(var i=0; i<lines.length; i++){
                if(this.lineIntersectsLine(tempLine, lines[i])){
                    return true;
                }
            }            
        }        
        
        return false;
    },


    lineIntersectsLine: function(l1,  l2){
        // check for two vertical lines
        if (l1.startPoint.x == l1.endPoint.x && l2.startPoint.x == l2.endPoint.x) {
            return l1.startPoint.x == l2.startPoint.x ? // if 'infinite 'lines do coincide,
            // then check segment bounds for overlapping
            l1.contains(l2.startPoint.x, l2.startPoint.y) ||
                l1.contains(l2.endPoint.x, l2.endPoint.y) :
                // lines are paralel
            false;
        }
        // if one line is vertical, and another line is not vertical
        else if (l1.startPoint.x == l1.endPoint.x || l2.startPoint.x == l2.endPoint.x) {
            // let assume l2 is vertical, otherwise exchange them
            if (l1.startPoint.x == l1.endPoint.x) {
                var l = l1;
                l1 = l2;
                l2 = l;
            }
            // finding intersection of 'infinite' lines
            // equation of the first line is y = ax + b, second: x = c
            var a = (l1.endPoint.y - l1.startPoint.y) / (l1.endPoint.x - l1.startPoint.x);
            var b = l1.startPoint.y - a * l1.startPoint.x;
            var x0 = l2.startPoint.x;
            var y0 = a * x0 + b;
            return l1.contains(x0, y0) && l2.contains(x0, y0);
        }

        // check normal case - both lines are not vertical
        else {
            //line equation is : y = a*x + b, b = y - a * x
            var a1 = (l1.endPoint.y - l1.startPoint.y) / (l1.endPoint.x - l1.startPoint.x);
            var b1 = l1.startPoint.y - a1 * l1.startPoint.x;

            var a2 = (l2.endPoint.y - l2.startPoint.y) / (l2.endPoint.x - l2.startPoint.x);
            var b2 = l2.startPoint.y - a2 * l2.startPoint.x;

            if(a1 == a2) { //paralel lines
                return b1 == b2 ?
                    // for coincide lines, check for segment bounds overlapping
                l1.contains(l2.startPoint.x, l2.startPoint.y) || l1.contains(l2.endPoint.x, l2.endPoint.y) 
                :
                    // not coincide paralel lines have no chance to intersect
                false;
            } else { //usual case - non paralel, the 'infinite' lines intersects...we only need to know if inside the segment

                x0 = (b2 - b1) / (a1 - a2);
                y0 = a1 * x0 + b1;
                return l1.contains(x0, y0) && l2.contains(x0, y0);
            }
        }
    },
    
    
    deprecated_collinearity: function(p1, p2, p3){
        //Check if 2 points coincide. If they do we automatically have collinearity
        if(p1.x === p2.x  && p1.y === p2.y){
            return true;
        }
        
        if(p1.x === p3.x  && p1.y === p3.y){
            return true;
        }
        
        if(p2.x === p3.x  && p2.y === p3.y){
            return true;
        }
            
        // check for vertical line
        if (p1.x === p2.x) {
            return p3.x === p1.x;
        } else { // usual (not vertical) line can be represented as y = a * x + b
            var a = (p2.y - p1.y) / (p2.x - p1.x);
            var b = p1.y - a * p1.x;
            return p3.y === a * p3.x + b;
        }
    },
    
    
    collinearity: function(p1, p2, p3, precission){
        var determinant = (p1.x * p2.y + p1.y * p3.x + p2.x * p3.y) 
                - (p2.y * p3.x + p1.y * p2.x + p1.x * p3.y);
        
        if(precission){
            return Math.abs(determinant) <= precission;
        }
        else{
            return determinant === 0;
        }
        
        
    },


    getEndPoint:function(startPoint, length, angle){
        // var obj = STACK.figureGetById(selectedFigureId);
        // if(obj.name=="gauge"){
        var endPoint = startPoint.clone();
        endPoint.transform(Matrix.translationMatrix(-startPoint.x, -startPoint.y));
        endPoint.y -= length;
        endPoint.transform(Matrix.rotationMatrix(angle));
        endPoint.transform(Matrix.translationMatrix(startPoint.x, startPoint.y));
        return endPoint;
       //}
    },
    
    
    getAngle:function(centerPoint, outsidePoint, round){
        centerPoint.x = Util.round(centerPoint.x, 5);
        centerPoint.y = Util.round(centerPoint.y, 5);
        outsidePoint.x = Util.round(outsidePoint.x, 5);
        outsidePoint.y = Util.round(outsidePoint.y, 5);
        var angle=Math.atan((outsidePoint.x-centerPoint.x)/(outsidePoint.y-centerPoint.y));
        angle=-angle;

        //endAngle+=90;
        if(outsidePoint.x>=centerPoint.x && outsidePoint.y>=centerPoint.y){
            angle+=Math.PI;
        }
        else if(outsidePoint.x<=centerPoint.x && outsidePoint.y>=centerPoint.y){
            angle+=Math.PI;
        }
        else if(outsidePoint.x<=centerPoint.x && outsidePoint.y<=centerPoint.y){
            angle+=Math.PI*2;
        }
        while(angle>=Math.PI*2){
            angle-=Math.PI*2;
        }
        if(isNaN(angle)){//Nan
            angle=0;//we are at center point;
        }
        if(round){
            angle = Math.round(angle / round) * round
        }
        return angle;
    },


    getAngle3Points:function(startPoint, centerPoint,endPoint, round){
        var a1 = Util.getAngle(centerPoint, startPoint);
        var a2 = Util.getAngle(centerPoint, endPoint);

        var angle = a2 - a1;
        
        if(round){
            angle = Math.round(angle / round) * round
        }
        
        return angle;
    },


    isPointInside:function(point, points){
        if(points.length < 3){
            return false;
        }
        var counter = 0;
        var p1 = points[0];
        //calulates horizontal intersects
        for (var i=1; i<=points.length; i++) {
            var p2 = points[i % points.length];
            if (point.y > Math.min(p1.y,p2.y)) { //our point is between start(Y) and end(Y) points
                if (point.y <= Math.max(p1.y,p2.y)) {
                    if (point.x <= Math.max(p1.x,p2.x)) { //to the left of any point
                        if (p1.y != p2.y) { //no horizontal line
                            var xinters = (point.y-p1.y)*(p2.x-p1.x)/(p2.y-p1.y)+p1.x;//get slope of line and make it start from the same place as p1
                            if (p1.x == p2.x || point.x <= xinters){ //if vertical line or our x is before the end x of the actual line.
                                counter++; //we have an intersection
                            }
                        }
                    }
                }
            }
            p1 = p2;
        }

        if (counter % 2 == 0){
            return false;
        }
        else{
            return true;
        }
    },


    isPointInsideOrOnBorder:function(point, points){
        if(points.length < 3){
            return false;
        }

        // set min & max values to coordinates of first point
        var minX = points[0].x;
        var maxX = points[0].x;
        var minY = points[0].y;
        var maxY = points[0].y;

        // go through points and get min and max x, y values
        for (var i = 1; i < points.length; i++) {
            var p = points[i];

            minX = Math.min(p.x,minX);
            maxX = Math.max(p.x,maxX);
            minY = Math.min(p.y,minY);
            maxY = Math.max(p.y,maxY);
        }

        // check if point is inside and on a border of points or outside
        if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
            return true;
        } else {
            return false;
        }
    },
    

    pointCrossingsForLine: function(px, py, x0, y0, x1, y1)
    {
        if (py <  y0 && py <  y1) return 0;
        if (py >= y0 && py >= y1) return 0;
        if (px >= x0 && px >= x1) return 0;
        // assert(y0 != y1);        
        if(y0 == y1) throw Exception('Asserted: ' + y0 + ' == ' + y1);
        if (px <  x0 && px <  x1) return (y0 < y1) ? 1 : -1;
        var xintercept = x0 + (py - y0) * (x1 - x0) / (y1 - y0);
        if (px >= xintercept) return 0;
        return (y0 < y1) ? 1 : -1;
    },


    pointCrossingsForCubic: function (px, py, x0, y0, xc0, yc0, xc1, yc1, x1, y1, level)
    {
        if (py <  y0 && py <  yc0 && py <  yc1 && py <  y1) return 0;
        if (py >= y0 && py >= yc0 && py >= yc1 && py >= y1) return 0;
        // Note y0 could equal yc0...
        if (px >= x0 && px >= xc0 && px >= xc1 && px >= x1) return 0;
        if (px <  x0 && px <  xc0 && px <  xc1 && px <  x1) {
            if (py >= y0) {
                if (py < y1) return 1;
            } else {
                // py < y0
                if (py >= y1) return -1;
            }
            // py outside of y01 range, and/or y0==yc0
            return 0;
        }
        // double precision only has 52 bits of mantissa (Give up and fall back to line intersection)
        if (level > 52) return pointCrossingsForLine(px, py, x0, y0, x1, y1);
        
        //"split" current cubic into 2 new cubic curves
        var xmid = (xc0 + xc1) / 2;
        var ymid = (yc0 + yc1) / 2;
        xc0 = (x0 + xc0) / 2;
        yc0 = (y0 + yc0) / 2;
        xc1 = (xc1 + x1) / 2;
        yc1 = (yc1 + y1) / 2;
        var xc0m = (xc0 + xmid) / 2;
        var yc0m = (yc0 + ymid) / 2;
        var xmc1 = (xmid + xc1) / 2;
        var ymc1 = (ymid + yc1) / 2;
        xmid = (xc0m + xmc1) / 2;
        ymid = (yc0m + ymc1) / 2;
        if (isNaN(xmid) || isNaN(ymid)) {
            // [xy]mid are NaN if any of [xy]c0m or [xy]mc1 are NaN
            // [xy]c0m or [xy]mc1 are NaN if any of [xy][c][01] are NaN
            // These values are also NaN if opposing infinities are added
            return 0;
        }
        return (Util.pointCrossingsForCubic(px, py,x0, y0, xc0, yc0, xc0m, yc0m, xmid, ymid, level+1) 
                + Util.pointCrossingsForCubic(px, py, xmid, ymid, xmc1, ymc1, xc1, yc1, x1, y1, level+1));
    },


    min:function(v){
        if(v.lenght == 0){
            return NaN;
        }
        else{
            var m = v[0];
            for(var i=0;i<v.length; i++){
                if(m > v[i]){
                    m = v[i];
                }
            }

            return m;
        }
    },


    max:function(v){
        if(v.lenght == 0){
            return NaN;
        }
        else{
            var m = v[0];
            for(var i=0;i<v.length; i++){
                if(m < v[i]){
                    m = v[i];
                }
            }

            return m;
        }
    },
    
    forwardPath : function(v){
        if(v.length <= 2){
            return true;
        }

        for(var i=0; i < v.length-2; i++){
            if(v[i].x == v[i+1].x && v[i+1].x == v[i+2].x){ //on the same vertical
                if(signum(v[i+1].y - v[i].y) != 0){ //test only we have a progressing path
                    if(signum(v[i+1].y - v[i].y) == -1 * signum(v[i+2].y - v[i+1].y)){ //going back (ignore zero)
                        return false;
                    }
                }
            }
            else if(v[i].y == v[i+1].y && v[i+1].y == v[i+2].y){ //on the same horizontal
                if(signum(v[i+1].x - v[i].x) != 0){ //test only we have a progressing path
                    if(signum(v[i+1].x - v[i].x) == -1* signum(v[i+2].x - v[i+1].x)){ //going back (ignore zero)
                        return false;
                    }
                }
            }            
        }

        return true;
    },
    
    orthogonalPath : function(v){
        if(v.length <= 1){ 
            return true;
        }

        for(var i=0; i < v.length-1; i++){
            if(v[i].x != v[i+1].x && v[i].y != v[i+1].y){
                return false;
            }
        }

        return true;
    },
    
    
    collinearReduction : function (v){
        var r = [];
        
        if(v.length < 3){
            return Point.cloneArray(v);
        }
        
        r.push( v[0].clone() );
        for(var i=1; i < v.length-1; i++){
            if( (v[i-1].x == v[i].x && v[i].x == v[i+1].x)  ||  (v[i-1].y == v[i].y && v[i].y == v[i+1].y) )
            {
                continue;
            }
            else{
                r.push( v[i].clone() );
            }
        }
        r.push( v[v.length-1].clone() );
        
        return r;
    },
    
    
    scorePath:function(v){
        if(v.length <= 2){
            return -1;
        }

        var score = 0;
        for(var i=1; i < v.length-1; i++){
            if(v[i-1].x == v[i].x && v[i].x == v[i+1].x){ //on the same vertical
                if(signum(v[i+1].y - v[i].y) == signum(v[i].y - v[i-1].y)){ //same direction
                    score++;
                }
                else{ //going back - no good
                    return -1;
                }
            }
            else if(v[i-1].y == v[i].y && v[i].y == v[i+1].y){ //on the same horizontal
                if(signum(v[i+1].x - v[i].x) == signum(v[i].x - v[i-1].x)){ //same direction
                    score++;
                }
                else{ //going back - no good
                    return -1;
                }
            }
            else{ //not on same vertical nor horizontal
                score--;
            }
        }

        return score;
    },
    
    
    operaReplacer : function (key, val) {
        if (typeof(val) !== 'undefined' && val !== null) {
            // As toFixed(...) method is specific only for Number type we will use it to test if val is actually a Number
            if (val.toFixed) {
                val = val.toFixed(20); //this will ensure that ANY string representation will have a . (dot) and some 0 (zero)s at the end

                // check if val has decimals and it ends with zero(s)
                if (/\.\d*0+$/.test(val)) {
                    // remove last decimal zero(s) from the end of val (and with dot if it is actually)
                    val = val.replace(/(\.)?0+$/, '');
                }
            }
        }
        return val;

    },
    
    loadPrimitive: function (o){
        var result = null;

        if(o.oType == 'Point'){
            result = Point.load(o);
        }
        else if(o.oType == 'Line'){
            result = Line.load(o);
        }
        else if(o.oType == 'Polyline'){
            result = Polyline.load(o);
        }
        else if(o.oType == 'Polygon'){
            result = Polygon.load(o);
        }
        else if(o.oType == 'DottedPolygon'){
            result = DottedPolygon.load(o);
        }
        else if(o.oType == 'QuadCurve'){
            result = QuadCurve.load(o);
        }
        else if(o.oType == 'CubicCurve'){
            result = CubicCurve.load(o);
        }
        else if(o.oType == 'Arc'){
            result = Arc.load(o);
        }
        else if(o.oType == 'Ellipse'){
            result = Ellipse.load(o);
        }
        else if(o.oType == 'DashedArc'){
            result = DashedArc.load(o);
        }
        else if(o.oType == 'Text'){
            result = Text.load(o);
        }
        else if(o.oType == 'Path'){
            result = Path.load(o);
        }
        else if(o.oType == 'Figure'){
            result = Figure.load(o); //kinda recursevly
        }
        else if(o.oType == 'ImageFrame'){
            result = ImageFrame.load(o); //kinda recursevly
        }

        return result;
    },

    getArrow: function(x,y){
      var startPoint = new Point(x,y);
      var line = new Line(startPoint.clone(),Util.getEndPoint(startPoint,LineArrow.ARROW_SIZE, Math.PI/180*LineArrow.ARROW_ANGLE));
      var line1 = new Line(startPoint.clone(),Util.getEndPoint(startPoint,LineArrow.ARROW_SIZE, Math.PI/180*-LineArrow.ARROW_ANGLE));
 
      var path = new Path();

      path.style = this.style;
      line.style = this.style;
      line1.style = this.style;
      
      path.addPrimitive(line);
      path.addPrimitive(line1);
      return path;
    },
    getObjectByXY: function(x, y){
        //find LineArrow at (x,y)
        var cId = LineArrow_MANAGER.linearrowGetByXY(x, y);
        if(cId != -1){ // found a LineArrow
            return {
                id: cId,
                type: 'LineArrow'
            };
        }
        //find Figure at (x,y)
        var fId = STACK.figureGetByXY(x, y);
        if(fId != -1){ // found a Figure
            var gId = STACK.figureGetById(fId).groupId;
                if(gId != -1){ // if the Figure belongs to a Group then return that Group
                    return {
                        id: gId,
                        type: 'Group'
                    }
                }
                else{ // lonely Figure
                    return {
                        id: fId,
                        type: 'Figure'
                    };
                }
        }

        // none of above
        return {
            id: -1,
            type: ''
        };
    }

};

function signum(x){
    if(x > 0)
        return 1;
    else if(x < 0)
        return -1;
    else
        return 0;
}

function isNumeric(input){
    return (input - 0) == input && (input.length > 0 || input != "");
}

function repeat(str, count){
    var res = '';
    for(var i=0;i<count;i++){
        res += str;
    }
    
    return res;
}

function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
}

function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
}

function removeNodeList(list) {
    var i;
    var length = list.length;

    for (i = 0; i < length; i++) {
        removeElement(list[i]);
    }
}


/* Stack.js */
function Stack(){
    /**Keeps all the figures on the canvas*/
    this.figures = []; 
    
    /**Keeps all the groups in the canvas*/
    this.groups = [];
    
    //this.containers = [];
    
    /**Keeps current generated Id. Not for direct access*/
    this.currentId = 0;
    
    /**Keeps a map like (figure Id, figure index). It is similar to an index*/
    this.idToIndex = [];
    
    /**Type used in serialization*/
    this.oType = 'Stack';
}



Stack.load = function(o){
    var newStack = new Stack(); //empty constructor
    

    newStack.figures = Figure.loadArray(o.figures);
    //newStack.containers = Container.loadArray(o.containers);
    newStack.groups = Group.loadArray(o.groups);
    newStack.figureSelectedIndex = o.figureSelectedIndex;
    newStack.currentId = o.currentId;
    newStack.idToIndex = o.idToIndex;
	////console.log("newstack",newStack)
    return newStack;
}


Stack.prototype = {

    constructor : Stack,
    groupCreate:function (figureIds, groupId){

        //we should allow to create more than one temporary group
        for(var i=0; i<this.groups.length; i++){
            if(this.groups[i].permanent == false){
                throw 'Stack::groupCreate()  You can not create new groups while you have temporary groups alive';
            }
        }
        
        //create group
        var g = new Group(groupId);
        var bounds = g.getBounds();
        ////console.log(bounds);
        g.rotationCoords.push(new Point(bounds[0]+(bounds[2]-bounds[0])/2, bounds[1] + (bounds[3] - bounds[1]) / 2));
        g.rotationCoords.push(new Point(bounds[0]+(bounds[2]-bounds[0])/2, bounds[1]));

        //save group to STACK
        this.groups.push(g);

        return g.id;
    },


    groupGetById : function(groupId){
        for(var i=0; i<this.groups.length; i++){
            if(this.groups[i].id == groupId){
                return this.groups[i];
            }
        }
        return null;
    },

    groupDestroy: function(groupId){
        var index = -1;
        
        //search for the group
        for(var i=0; i<this.groups.length; i++ ){
            if(this.groups[i].id == groupId){
                index = i;
                break;
            }
        }

        //remove it
        if(index > -1){
            //remove Group
            this.groups.splice(index, 1);

            //remove the Figures from Group
            var groupFigures = this.figureGetByGroupId(groupId);
            for(var i=0; i<groupFigures.length; i++ ){
                groupFigures[i].groupId = -1;
            }
        } 
    },
    
    /**Removes any temporary group*/
    groupRemoveTemporary : function(){
        throw Exception("Not implemented");
    },
    
    equals: function(anotherStack){
        var msg = '';
        if(!anotherStack instanceof Stack){
            return false;
            msg += 'not same class';
        }

        //test figures
        if(this.figures.length != anotherStack.figures.length){
            msg += 'not same nr of figures';
            return false;
        }
        
        
        for(var i =0; i<this.figures.length; i++){
            if( !this.figures[i].equals(anotherStack.figures[i]) ){
                msg += 'figures not the same';
                return false;                
            }
        }

        
        
        //test groups
        if(this.groups.length != anotherStack.groups.length){
            msg += 'not same nr of groups';
            return false;
        }

        for(var i =0; i<this.groups.length; i++){
            if( !this.groups[i].equals(anotherStack.groups[i]) ){
                msg += 'groups not the same';
                return false;
            }
        }



        //test idToIndex
        for(var i =0; i<this.figures.idToIndex; i++){
            if(this.idToIndex[i] != undefined //if not undefined
                && anotherStack.idToIndex != undefined //if not undefined
                && this.idToIndex[i] != anotherStack.idToIndex[i] )
                {

                msg += 'not same idToIndex';
                return false;
                }
        }

        if(this.currentId != anotherStack.currentId){
            msg += 'not same currentId';
            return false;
        }

        if(msg != ''){
            alert(msg);
        }

        return true;
            
    },

    generateId:function(){
        return this.currentId++;
    },
    
    figureAdd:function(figure){
        this.figures.push(figure);
		////console.log("figureAdd",figure)
        this.idToIndex[figure.id] = this.figures.length-1;
    },
    
    
    figureRemove_deprecated:function(figure){
        var index = -1;
        for(var i=0; i<this.figures.length; i++ ){
            if(this.figures[i] == figure){
                index = i;
                break;
            }
        }
        LineArrow_MANAGER.linearrowPointRemoveAllByParent(figure.id);
        if(index > -1){
            this.figures.splice(index, 1);
            for(var i=index; i<this.figures.length; i++){
                this.idToIndex[this.figures[i].id]=i;
            }
        }
        if(index<this.figureSelectedIndex && index!=-1){
            this.figureSelectedIndex--;
        }
    },
            
    figureRemoveById :function(figId){
        var index = -1;
        for(var i=0; i<this.figures.length; i++ ){
            if(this.figures[i].id == figId){
                index = i;
                break;
            }
        }

        if(index > -1){
            //remove figure
            this.figures.splice(index, 1);

            //reindex
            this.reindex();
        }                
    },

    figureGetAsFirstFigureForConnector: function(connectorId){
        Log.group("Stack:figureGetAsFirstFigureForConnector");
        
        /*Algorithm
         *LineArrow -> first LineArrow's LineArrowPoint-> Glue -> Figure's LineArrowPoint -> Figure
         **/
        var figure = null;
        
        //var linearrow = LineArrow_MANAGER.linearrowGetById(connectorId);        
        Log.debug("LineArrow id = " + connectorId);
        
        var startConnectionPoint = LineArrow_MANAGER.linearrowPointGetFirstForConnector(connectorId);
        Log.debug("LineArrowPoint id = " + startConnectionPoint.id);
        
        var startGlue = LineArrow_MANAGER.glueGetBySecondConnectionPointId(startConnectionPoint.id)[0];
        if(startGlue){
            Log.debug("Glue id1 = (" + startGlue.id1 + ", " + startGlue.id2 + ')');

            var figureConnectionPoint = LineArrow_MANAGER.linearrowPointGetById(startGlue.id1);
            Log.debug("Figure's LineArrowPoint id = " + figureConnectionPoint.id);

            figure = this.figureGetById(figureConnectionPoint.parentId);
        }
        else{
            Log.debug("no glue");
        }
                                
        Log.groupEnd();
        
        return figure;
    },
    
    
    /**
     *Returns second figure glued to a linearrow
     *@param {Number} connectorId - the id of the linearrow
     *@return {Figure} - the figure connected, or null if none 
     **/
    figureGetAsSecondFigureForConnector: function(connectorId){
        Log.group("Stack:figureGetAsSecondFigureForConnector");
        
        /*Algorithm
         *LineArrow -> first LineArrow's LineArrowPoint-> Glue -> Figure's LineArrowPoint -> Figure
         **/
        var figure = null;
        
        //var linearrow = LineArrow_MANAGER.linearrowGetById(connectorId);        
        Log.debug("LineArrow id = " + connectorId);
        
        var endConnectionPoint = LineArrow_MANAGER.linearrowPointGetSecondForConnector(connectorId);
        Log.debug("LineArrowPoint id = " + endConnectionPoint.id);
        
        var startGlue = LineArrow_MANAGER.glueGetBySecondConnectionPointId(endConnectionPoint.id)[0];
        if(startGlue){
            Log.debug("Glue id1 = (" + startGlue.id1 + ", " + startGlue.id2 + ')');

            var figureConnectionPoint = LineArrow_MANAGER.linearrowPointGetById(startGlue.id1);
            Log.debug("Figure's LineArrowPoint id = " + figureConnectionPoint.id);

            figure = this.figureGetById(figureConnectionPoint.parentId);
        }
        else{
            Log.debug("no glue");
        }
                                
        Log.groupEnd();
        
        return figure;
    },
    reindex : function(){
        for(var i=0; i<this.figures.length; i++){
            this.idToIndex[this.figures[i].id] = i;
        }
    },

    reset:function(){
        this.figures = [];
        this.figureSelectedIndex = -1;
        this.currentId = 0;
    },

    getIndex:function(figure){
        for(var i=0; i<this.figures.length; i++){
            if(this.figures[i]==figure){
                return i;
            }
        }
        return -1;
    },



    figureGetByGroupId:function(groupId){
        var groupFigures = [];
        for(var i=0; i<this.figures.length; i++){
            if(this.figures[i].groupId == groupId){
                groupFigures.push(this.figures[i]);
            }
        }
        
        return groupFigures;
    },


    figureGetIdsByGroupId:function(groupId){
        var groupFiguresIds = [];
        for(var i=0; i<this.figures.length; i++){
            if(this.figures[i].groupId == groupId){
                groupFiguresIds.push(this.figures[i].id);
            }
        }

        return groupFiguresIds;
    },

    figureGetById:function(id){
        for(var i=0; i<this.figures.length; i++){
            if(this.figures[i].id == id){
                return this.figures[i];
            }
        }
        return null;
    },
    
    
    figureGetByXY:function(x,y){
        var id = -1;
        for(var i= this.figures.length-1; i>=0; i--){
            if(this.figures[i].visibility && this.figures[i].contains(x, y)&&this.figures[i].name!="Pencil"){
                id = this.figures[i].id;
                break;
            } //end if
        }//end for
        return id;
    },
    
    textGetByFigureXY:function(fId, x, y){
        var figureLength = this.figures.length;
        for(var i = figureLength - 1; i >= 0; i--){
            var figure = this.figures[i];
            if(figure.id === fId){
                var primitiveLength = figure.primitives.length;
                for (var j = primitiveLength - 1; j >= 0; j--) { //top to bottom
                    var primitive = figure.primitives[j];
                    if( (primitive.oType === "Text") && primitive.contains(x, y) ){
                        return primitive.id;
                    }
                }
            } //end if
        }//end for
        return -1;
    },
    groupGetByXY:function(x,y){
        var id = -1;
        for(var i= this.figures.length-1; i>=0; i--){
            if(this.figures[i].contains(x, y)){
                id = this.figures[i].id;
                break;
            } //end if
        }//end for
        return id;
    },
    
    figuresGetByXY:function(x,y){
        var ids = [];
        
        for(var i= this.figures.length-1; i>=0; i--){
            if(this.figures[i].contains(x, y)){
                ids.push(this.figures[i].id);
            } 
        }
        
        return ids;
    },


    setPosition_deprecated:function(figure, position){
        var figureIndex=-1;
        for (var i=0; i<this.figures.length; i++){
            if(this.figures[i]==figure){
                figureIndex=i;
            }
        }
        if(figureIndex!=-1 && position>=0 && position<this.figures.length){
            var tempFigure=this.figures.splice(figureIndex,1); //the figure to move
            this.figures.splice(position,0,tempFigure[0]);
            var added=false
            for(var i=0; i<this.figures.length; i++){
                this.idToIndex[this.figures[i].id] = i;
            }
            this.figureSelectedIndex=position;
        }
    },
    
    swapToPosition:function(figureId, newPosition){
        var oldPosition = this.idToIndex[figureId];
        
        if(oldPosition != -1 /**oldPosition valid*/
            && newPosition >= 0 && newPosition < this.figures.length /**newPosition in vector bounds*/){
            
            //update idToIndex index
            this.idToIndex[figureId] = newPosition;
            this.idToIndex[this.figures[newPosition].id] = oldPosition;
            
            //switch figures
            var temp = this.figures[oldPosition];
            this.figures[oldPosition] = this.figures[newPosition];
            this.figures[newPosition] = temp;
        }
    },

    
    setPosition:function(figureId, newPosition){
        //are we moving forward or back?
        var oldPosition = this.idToIndex[figureId];
        var temp = this.figures[oldPosition];
        var direction = -1;//move to back
        if(oldPosition < newPosition){//move to front
            direction = 1;
        }
        Log.info(direction);
        //while i between oldposition and new position, move 1 in given direction
        for(var i = oldPosition; i != newPosition; i+=direction){
            this.figures[i] = this.figures[i + direction];//set the figure
            this.idToIndex[this.figures[i].id] = i;//change the index
        }
        this.figures[newPosition] = temp; //replace the temp
        this.idToIndex[this.figures[newPosition].id] = newPosition;
    },
    
    
    figureIsOver:function(x, y){
        var found = false;
        for(var i=0; i< this.figures.length; i++){
            var figure = this.figures[i];
            if(figure.contains(x, y)&&figure.name!="Pencil"){
                found = true;
                break;
            }
        }
        return found;
    },
        
        
    containerIsOver:function(x, y){
        var found = false;
        for(var i=0; i< this.containers.length; i++){
            var container = this.containers[i];
            if(container.contains(x, y)){
                found = true;
                break;
            }
        }
        return found;
    },
        
        
    containerIsOnEdge:function(x, y){
        var found = false;
        for(var i=0; i< this.containers.length; i++){
            var container = this.containers[i];
            if(container.onEdge(x, y)){
                found = true;
                break;
            }
        }
        return found;
    },

    getWorkAreaBounds:function() {
        var minX;
        var maxX;
        var minY;
        var maxY;
        var unset = true;   // defines if there were no object - no bounds set
        var compareAndSet = function (bounds){
            // if minX is unset or bigger than given
            if (typeof(minX) === 'undefined' || minX > bounds[0]) {
                minX = bounds[0];
            }
            // if minY is unset or bigger than given
            if (typeof(minY) === 'undefined' || minY > bounds[1]) {
                minY = bounds[1];
            }
            // if maxX is unset or bigger than given
            if (typeof(maxX) === 'undefined' || bounds[2] > maxX) {
                maxX = bounds[2];
            }
            // if maxY is unset or bigger than given
            if (typeof(maxY) === 'undefined' || bounds[3] > maxY) {
                maxY = bounds[3];
            }

            // if once function were ran - one object setted it's bounds
            unset = false;
        };

        var i;
        // get bounds of containers
        var containerLength = this.containers.length;
        for (i = 0; i < containerLength; i++) {
            compareAndSet(this.containers[i].getBounds());
        }

        // get bounds of figures
        var figureLength = this.figures.length;
        for (i = 0; i < figureLength; i++) {
            compareAndSet(this.figures[i].getBounds());
        }

        // get bounds of linearrows
        var connectorLength = LineArrow_MANAGER.linearrows.length;
        for (i = 0; i < connectorLength; i++) {
            compareAndSet(LineArrow_MANAGER.linearrows[i].getBounds());
        }

        // bounds were setted/changed?
        if (unset) {
            // return full canvas size
            return [0, 0, canvasProps.getWidth(), canvasProps.getHeight()];
        } else {
            // return setted new bounds
            return [minX, minY, maxX, maxY];
        }
    },


    transform:function(matrix) {
        var i;
        var containerLength = this.containers.length;
        for (i = 0; i < containerLength; i++) {
            this.containers[i].transform(matrix);
        }

        // translate Figures
        var figureLength = this.figures.length;
        for (i = 0; i < figureLength; i++) {
            // Does Figure is placed outside of container?
            if (CONTAINER_MANAGER.getContainerForFigure(this.figures[i].id) === -1) {
                this.figures[i].transform(matrix);
            }
            // otherwise it is already transformed
        }
    },

    clone : function(o){
        if (null == o) return o;
        var copy = new Stack();
        for (var attr in o) {
            if (o.hasOwnProperty(attr)) copy[attr] = o[attr];
        }
        return copy;
    },

    paint:function(context, ignoreSelection){
        ////console.log("pencil_draw "+ pencil_draw);
        var HandleSelect = false;
        for (var i=0; i<this.figures.length; i++) {
            if(!this.figures[i].visibility)
                continue;
            if(!context.save){
                alert("save() no present")
            }
            context.save();
            if(this.figures[i].name == "pencil" && pencil_draw)
            {
                this.figures[i].paint(getContextApp());
                ////console.log("Figure is Painted");
            }
            else if(this.figures[i].name == "Pentagon")
            {
                this.figures[i].paint(context);
                if(this.figures[i].angles)
                {
                    var corners = this.figures[i].primitives[0].points;
                    // draw the angle symbols on corners
                    for (var j = 0; j < corners.length - 2; j++) {
                        drawAngleSymbol(context, corners[j], corners[j + 1], corners[j + 2]);
                    }
                    // draw the last 2 angle symbols
                    var n = corners.length;
                    drawAngleSymbol(context, corners[n - 2], corners[n - 1], corners[0]);
                    drawAngleSymbol(context, corners[n - 1], corners[0], corners[1]);
                }
            }

            else if(this.figures[i].name == "Angle")
            {
                this.figures[i].paint(context);
                var corners = this.figures[i].primitives[0].points;
                if(this.figures[i].angles)
                {
                    /*// draw the angle symbols on corners
                    for (var j = 0; j < corners.length - 2; j++) {
                        drawAngleSymbol(context, corners[j], corners[j + 1], corners[j + 2]);
                    }*/
                    // draw the last 2 angle symbols
                    var n = corners.length;
                    //drawAngleSymbol(context, corners[n - 2], corners[n - 1], corners[0]);
                    drawAngleSymbol(context, corners[0], corners[1], corners[2],true);
                }
                this.figures[i].style.fillStyle = "rgba(0,0,0,0)";
                var path = Util.getArrow(corners[0].x,corners[0].y);
                path.style = this.figures[i].style.clone();
                path.primitives[0].style = this.figures[i].style.clone();
                path.primitives[1].style = this.figures[i].style.clone();
                
                //arrow1.paint(context);
                var transX = corners[0].x;
                var transY = corners[0].y;

                var lineAngle = Util.getAngle(corners[0], corners[1], 0);
                path.transform(Matrix.translationMatrix(-transX, -transY));
                path.transform(Matrix.rotationMatrix(lineAngle));
                path.transform(Matrix.translationMatrix(transX,transY));

                context.save();
                //context.lineJoin = "miter";
                context.lineJoin = "round";
                context.lineCap = "round";
                path.paint(context);
                context.restore();

                path = Util.getArrow(corners[2].x,corners[2].y);
                path.style = this.figures[i].style.clone();
                path.primitives[0].style = this.figures[i].style.clone();
                path.primitives[1].style = this.figures[i].style.clone();
                
                //arrow1.paint(context);
                var transX = corners[2].x;
                var transY = corners[2].y;

                var lineAngle = Util.getAngle(corners[2], corners[1], 0);
                path.transform(Matrix.translationMatrix(-transX, -transY));
                path.transform(Matrix.rotationMatrix(lineAngle));
                path.transform(Matrix.translationMatrix(transX,transY));

                context.save();
                //context.lineJoin = "miter";
                context.lineJoin = "round";
                context.lineCap = "round";
                path.paint(context);
                context.restore();
            }            
            else if(this.figures[i].name == "Text")
            {
                
                this.figures[i].paint(context);
                /*Draw the arraw line if present*/
                if(this.figures[i].primitives[1].arrow)
                {
                    var objText = this.figures[i].primitives[1];
                    if(this.figures[i].id==selectedFigureId &&  state == STATE_FIGURE_SELECTED){ //FIGURE
                        var f = this.figureGetById(selectedFigureId);
                        HandleManager.shapeSet(f);
                        if(!ignoreSelection){
                            HandleManager.paint(context);
                        }
                        var shortHandle = HandleManager.getShortHandle(new Point(objText.endPoint.x, objText.endPoint.y))
                        objText.startPoint.x = shortHandle.x;
                        objText.startPoint.y = shortHandle.y;
                        HandleSelect = true;
                    }
                    context.beginPath();
                    context.moveTo(objText.startPoint.x, objText.startPoint.y );
                   
                    context.lineTo(objText.endPoint.x, objText.endPoint.y);
                    context.strokeStyle=this.figures[i].primitives[1].arrowColor;
                    context.stroke();
                    context.closePath();
                    //To draw Triangle
                    var startPoint = objText.endPoint;
                    var point2 = Util.getEndPoint(startPoint,12, Math.PI/180*15);
                    var point3 = Util.getEndPoint(startPoint, 12, - Math.PI/180*15);
                    
                    var tri = new Polygon();
                    tri.addPoint(startPoint);
                    tri.addPoint(point2);
                    tri.addPoint(point3);
                    
                    tri.style = this.figures[i].style.clone();
                         tri.style.fillStyle = this.figures[i].primitives[1].arrowColor;
                    
                    var transX = objText.endPoint.x;
                    var transY = objText.endPoint.y;

                    var lineAngle = Util.getAngle(objText.endPoint ,objText.startPoint, 0);
                    tri.transform(Matrix.translationMatrix(-transX, -transY));
                    tri.transform(Matrix.rotationMatrix(lineAngle));
                    tri.transform(Matrix.translationMatrix(transX, transY));

                    context.save();

                    //context.lineJoin = "miter";
                    context.lineJoin = "round";
                    context.lineCap = "round";
                    tri.paint(context);
                    ////console.log(tri);
                    context.restore();
                }
                
            }    
            else if(this.figures[i].name != "Pencil"){
                ////console.log("this.fig",this.figures[i])
                this.figures[i].paint(context);
                }
            else if(this.figures[i].name == "Pencil")
            {
                ////console.log(this.figures[i]);
                ////console.log("Figure is not painted");
            }
            context.restore();
        }//end for
        
        //paint handlers for selected shape
        if(state == STATE_FIGURE_SELECTED && !HandleSelect){ //FIGURE
			
            var f = this.figureGetById(selectedFigureId);
            HandleManager.shapeSet(f);
            if(!ignoreSelection){
                HandleManager.paint(context);
				
				context.save()
				
            }
        }
        else if(state == STATE_GROUP_SELECTED){ //GROUP 
            var g = this.groupGetById(selectedGroupId);
            ////console.log(g);
            HandleManager.shapeSet(g);
            if(!ignoreSelection){
                HandleManager.paint(context);
            }
        }
        else if(state == STATE_SELECTING_MULTIPLE){ //SELECTION
            if(SHIFT_PRESSED){
                if (selectedFigureId != -1){
                    var f = this.figureGetById(selectedFigureId);
                    HandleManager.paint(context);
                }
                if (selectedGroupId != -1){
                    var g = this.groupGetById(selectedGroupId);
                    HandleManager.paint(context);
                }
            }
            selectionArea.paint(context);
        }
        //paint linearrow(s)
        LineArrow_MANAGER.linearrowPaint(context, selectedLineArrowId);

        if(Curtain.visibility)
        {
          Curtain.HandleManager.shapeSet(Curtain.figure);
          Curtain.paint(getContextApp());
          Curtain.HandleManager.paint(getContextApp());
        }
        
        if(state_apps.length)
        {
          for(var inc= 0 ;inc<state_apps.length;inc++)
          {
            
            if(state_apps[inc] == STATE_RULER_APP)
            {
                Ruler.HandleManager.shapeSet(Ruler.figure);
                Ruler.paint(context);
                Ruler.HandleManager.paint(context);
            }
            else if(state_apps[inc] == STATE_PROTRACTOR_APP)
            {
                Protractor.HandleManager.shapeSet(Protractor.figure);
                Protractor.paint(context);
                Protractor.HandleManager.paint(context);
            }
            else if(state_apps[inc] == STATE_COMPASS_APP)
            {
                Compass.HandleManager.shapeSet(Compass.figure);
                Compass.paint(context);
                Compass.HandleManager.paint(context);
            }
          }
        }
        
        
        
    },

    toSVG : function(){
        var svg = '';
        for (var i=0; i<this.figures.length; i++) {
            svg += this.figures[i].toSVG();
        }
        return svg;
    }
}


/* resizer.js */

/**
 *Handles are created on-the-fly for a figure. They are completelly managed by the HandleManager
 **/
function Handle(type,handleManager){
    /**Type of Handle*/
    this.type = type;

    /**The center of the circle (x coordinates)*/
    this.x = 0;
    
    /**The center of the circle (y coordinates)*/
    this.y = 0;

    this.HandleManager = typeof handleManager !== 'undefined' ? handleManager : 'default';
    
    /**Used by LineArrow handles, to not display redundant handles (i.e. when they are on the same line)*/
    this.visible = true;
}

Handle.types = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'r' ]; //DO NOT CHANGE THE ORDER OF THESE VALUES

/**It's a (static) vector of linearrow types*/
Handle.linearrowTypes = ['ns', 'ew'];

Handle.load = function(o){
    var newHandle = new Handle(o.type);
    newHandle.x = o.x;
    newHandle.y = o.y;
    newHandle.visible = o.visible;
    newHandle.HandleManager = o.HandleManager;
    return newHandle;
}

Handle.loadArray = function(v){
    var newHandles = [];
    for(var i=0; i< v.length; i++){
        newHandles.push(Handle.load(v[i]));
    }
    return newHandles;
}

/**Default handle radius*/
Handle.RADIUS = 10;

Handle.prototype = {
    
    constructor : Handle,
    
    equals : function(anotherHandle){
        if(!anotherHandle instanceof Handle){
            return false;
        }

        return this.type == anotherHandle.type
        && this.x == anotherHandle.x
        && this.y == anotherHandle.y
        && this.visible == anotherHandle.visible;
    },


    actionFigure : function(lastMove, newX, newY){
		
        var m = this.actionShape(lastMove, newX, newY);
        if(m[0] == 'rotate'){
            var cmdRotate = new FigureRotateCommand(HandleManager.shape.id, m[1], m[2]);
			
            cmdRotate.execute();
            History.addUndo(cmdRotate);
        } else if(m[0] == 'scale'){
            var cmdScale = new FigureScaleCommand(HandleManager.shape.id, m[1], m[2]);
			
            cmdScale.execute();
            History.addUndo(cmdScale);                
        }
    },
            
            
    actionContainer : function(lastMove, newX, newY){
        var m = this.actionShape(lastMove, newX, newY);
        if(m[0] == 'rotate'){
            //simply ingnore rotate
            throw "Handles.js -> actionContainer -> rotate should be disabled for Container"
        } else if(m[0] == 'scale'){
            var cmdScale = new ContainerScaleCommand(HandleManager.shape.id, m[1], m[2]);
            cmdScale.execute();
            History.addUndo(cmdScale);                
        }
    },


    actionGroup : function(lastMove, newX, newY){
        var m = this.actionShape(lastMove, newX, newY);
        if(m[0] == 'rotate'){
            var cmdRotate = new GroupRotateCommand(HandleManager.shape.id, m[1], m[2]);
            cmdRotate.execute();
            History.addUndo(cmdRotate);
        } else if(m[0] == 'scale'){
            var cmdScale = new GroupScaleCommand(HandleManager.shape.id, m[1], m[2]);
            cmdScale.execute();
            History.addUndo(cmdScale);                
        }
    },


    /**Handle actions for Figure
     *
     **/
    actionShape: function(lastMove, newX, newY){
		
        var matrixes = [];
        
        var figBounds = HandleManager.shape.getBounds();
        if(this.HandleManager != "default")
        {
          if(this.type.startsWith("Ruler_"))
            figBounds = Ruler.HandleManager.shape.getBounds();
          else if(this.type.startsWith("Protractor_"))
            figBounds = Protractor.HandleManager.shape.getBounds();
          else if(this.type.startsWith("Compass_"))
            figBounds = Compass.HandleManager.shape.getBounds();
          else if(this.HandleManager == "Curtain")
            figBounds = Curtain.HandleManager.shape.getBounds();
        }
        var transX = 0; //the amount of translation on Ox
        var transY = 0; //the amount of translation on Oy
        var scaleX = 1; //the scale percentage on Ox
        var scaleY = 1; //the scale percentage on Oy
        var arc = false;
        ////console.log("Type of conee"+this.type);
        //see if we have a resize and prepare the figure by moving it back to Origin and "unrotate" it
        if(this.type == 'r' || this.type == 'rp'){
            //rotationCoords[0] is always the center of the shape, we clone it as when we do -rotationCoords[0].x, it is set to 0.
            var center = HandleManager.shape.rotationCoords[0].clone();
            var endAngle = Util.getAngle(HandleManager.shape.rotationCoords[0],new Point(newX,newY));
            var startAngle = Util.getAngle(HandleManager.shape.rotationCoords[0],HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                    
            var inverseTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(-rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            
            matrixes = ['rotate', equivTransfMatrix, inverseTransfMatrix];
        }
        else if(this.type == 'A')
        {
            HandleManager.shape.primitives[1].arrow = true;
            var shortHandle = HandleManager.getShortHandle(new Point(newX, newY))
            HandleManager.shape.primitives[1].startPoint = new Point(shortHandle.x, shortHandle.y);
            HandleManager.shape.primitives[1].endPoint = new Point(newX, newY);
            this.x = newX;
            this.y = newY;
        }
        else if(this.type === parseInt(this.type, 10) && HandleManager.shape.name=="Line")
        {
            ////console.log("HandleManager");
            //central point of the figure
            HandleManager.shape.rotationCoords[0] = new Point(
                figBounds[0] + (figBounds[2] - figBounds[0]) / 2,
                figBounds[1] + (figBounds[3] - figBounds[1]) / 2
            );

            //the middle of upper edge
            HandleManager.shape.rotationCoords[1] = new Point(HandleManager.shape.rotationCoords[0].x, figBounds[1]);
            
            ////console.log(selectedFigureId);
            if(this.type==0)
            {
                HandleManager.shape.primitives[0].startPoint.x = newX;
                HandleManager.shape.primitives[0].startPoint.y = newY;
            }
            else
            {
                HandleManager.shape.primitives[0].endPoint.x = newX;
                HandleManager.shape.primitives[0].endPoint.y = newY;
            }
            
        }
        else if(this.type === parseInt(this.type, 10))
        {
            ////console.log("HandleManager");
            //central point of the figure
            HandleManager.shape.rotationCoords[0] = new Point(
                figBounds[0] + (figBounds[2] - figBounds[0]) / 2,
                figBounds[1] + (figBounds[3] - figBounds[1]) / 2
            );

            //the middle of upper edge
            HandleManager.shape.rotationCoords[1] = new Point(HandleManager.shape.rotationCoords[0].x, figBounds[1]);
            
            ////console.log(selectedFigureId);
            HandleManager.shape.primitives[0].points[this.type].x = newX;
            HandleManager.shape.primitives[0].points[this.type].y = newY;
        }
        else if(this.type == "Compass_rotatePoint")
        {
          var previousPoint = new Point(Compass.radiusPoint.x,Compass.radiusPoint.y);
            
            var center = new Point(Compass.x,Compass.y);
            var endAngle = Util.getAngle(center,new Point(newX,newY));
            var startAngle = Util.getAngle(center,new Point(this.x,this.y));//new Point(lastMove[0],lastMove[1])
            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            Compass.radiusPoint.transform(equivTransfMatrix);
            Compass.Pencil.transform(equivTransfMatrix);
            
             var startAngle = (180/Math.PI)*Util.getAngle(center,previousPoint);
              var endAngle = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);
              var rotAngle = endAngle - startAngle;
              if(rotAngle>0)
                Compass.direction = "clockwise"+endAngle;
              else if(rotAngle<0)
                Compass.direction = "anti-clockwise";
              if(Compass.direction == "clockwise")
              {
                Compass.direction = "anti-clockwise";
                exe =true;
                ////console.log("success"+Compass.direction);
              }  
              if(0.5>=endAngle>=359.5 && Compass.direction == "clockwise")
             {}
              else if(0.5>=endAngle>=359.5 && Compass.direction == "anti-clockwise")
            {}
     
        }
        else if(this.type == "Compass_drawPoint")
        {
            var previousPoint = new Point(Compass.radiusPoint.x,Compass.radiusPoint.y);
            var center = new Point(Compass.x,Compass.y);
            var endAngle = Util.getAngle(center,new Point(newX,newY));
            var startAngle = Util.getAngle(center,new Point(this.x,this.y));//new Point(lastMove[0],lastMove[1])
            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            Compass.radiusPoint.transform(equivTransfMatrix);
            Compass.Pencil.transform(equivTransfMatrix);
            if(Compass.drawPoint)
            {
              var startAngle = (180/Math.PI)*Util.getAngle(center,previousPoint);
              var endAngle = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);
              var rotAngle = endAngle - startAngle;
              if(rotAngle>0)
                Compass.direction = "clockwise";
              else if(rotAngle<0)
                Compass.direction = "anti-clockwise";
              //&& ((1>endAngle&&endAngle>=0)&&(360>=startAngle&&startAngle>359))
              if(!Compass.clockWiseCross && Compass.direction == "anti-clockwise" && rotAngle<-300 )
              {
                Compass.clockWiseCross = true;
                if(Compass.changePoint === null)
                  Compass.changePoint = "endPoint";
              } 
              else if(!Compass.anti_clockWiseCross && Compass.direction == "clockwise"&& rotAngle > 300)
              {//&& ((1>startAngle&&startAngle>=0)&&(360>=endAngle&&endAngle>359.5))
                Compass.anti_clockWiseCross = true;
                if(Compass.changePoint === null)
                  Compass.changePoint = "startPoint";
              }

              if(Compass.startPoint==null)
                Compass.startPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);
              else if(Compass.endPoint==null)
                Compass.endPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);
              else 
              {
                /*//console.log(endAngle);
                if(((0.1>=endAngle&&endAngle>=0)||(360>=endAngle&&endAngle>=359.9)) && Compass.direction == "clockwise")
                {  
                  //console.log("clockif"+Compass.radiusPoint);
                  Compass.endPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint)-90;
                }
                else if(((0.1>=endAngle&&endAngle>=0)||(360>=endAngle&&endAngle>=359.9)) && Compass.direction == "anti-clockwise")
                { 
                  //console.log("anticlockif"+Compass.radiusPoint);
                 Compass.startPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint)-90;
                }else*/ 

                if(Compass.clockWiseCross && Compass.direction == "anti-clockwise" && (endAngle) <= Compass.endPoint)
                {  
                  /*if(Compass.changePoint== "startPoint")
                    Compass.startPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);*/
                  if(Compass.changePoint== "endPoint" && rotAngle<-300)
                  {
                    Compass.endPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);
                    Compass.changePoint= "executed";
                  }
                }
                else if(Compass.anti_clockWiseCross && Compass.direction == "clockwise" && (endAngle >= Compass.startPoint))
                {  
                  if(Compass.changePoint== "startPoint" && rotAngle>300)
                  {
                    Compass.startPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);
                    Compass.changePoint= "executed";
                  }/*if(Compass.changePoint== "endPoint")
                    Compass.endPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);*/
                  //Compass.anti_clockWiseCross = false;
                }
                else if(Compass.direction == "clockwise" && (endAngle)>=Compass.endPoint)
                {
                  Compass.endPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);
                }
                else if(Compass.direction == "anti-clockwise" && (endAngle<=Compass.startPoint))
                {  
                  Compass.startPoint = (180/Math.PI)*Util.getAngle(center,Compass.radiusPoint);
                }
              } 
            }
        }
        else if(this.type == "Compass_resizePoint")
        {
            var center = new Point(Compass.x,Compass.y);
            var endAngle = Util.getAngle(new Point(newX,newY),center);
            var p = Util.getEndPoint(new Point(newX,newY),35,endAngle);

            if(board.height/2>Util.getLength(p,center))
            {
              Compass.radiusChange = true;
              Compass.radiusPoint = p;
              Compass.radius = Util.getLength(Compass.radiusPoint,center);
              Compass.set();
            }
        }
        else if(this.type == "AnglePoint1" || this.type == "AnglePoint2")
        {
            var i = 0;
            if(this.type == "AnglePoint2")
              i=2;
            var center = new Point(HandleManager.shape.primitives[0].points[1].x,HandleManager.shape.primitives[0].points[1].y);
            var endAngle = Util.getAngle(center,new Point(newX,newY));
            var startAngle = Util.getAngle(center,new Point(HandleManager.shape.primitives[0].points[i].x,HandleManager.shape.primitives[0].points[i].y));//new Point(lastMove[0],lastMove[1])
            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            HandleManager.shape.primitives[0].points[i].transform(equivTransfMatrix);
        }
        else if(this.type == "Protractor_startPoint")
        {
            var center = new Point(Protractor.x,Protractor.y);
            var endAngle = Util.getAngle(center,new Point(newX,newY));
            var startAngle = Util.getAngle(center,Protractor.startPoint);//new Point(lastMove[0],lastMove[1])
            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            var inverseTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(-rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            Protractor.startPoint.transform(equivTransfMatrix);
            var anglerad = Util.getAngle3Points(Protractor.startPoint,center,new Point(Protractor.topX,Protractor.topY));
            var angle = anglerad * (180/Math.PI);
            if(angle<0)
              angle = -1*angle;
            if(angle>90&&angle<270)
            {
              Protractor.startPoint.transform(inverseTransfMatrix);
            }
        }
        else if(this.type == "Protractor_endPoint")
        {
            var center = new Point(Protractor.x,Protractor.y);
            var endAngle = Util.getAngle(center,new Point(newX,newY));

            var startAngle = Util.getAngle(center,Protractor.endPoint);
            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            var inverseTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(-rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            Protractor.endPoint.transform(equivTransfMatrix);
            var anglerad = Util.getAngle3Points(Protractor.endPoint,center,new Point(Protractor.topX,Protractor.topY));
            var angle = anglerad * (180/Math.PI);
            if(angle<0)
              angle = -1*angle;
            if(angle>90&&angle<270)
            {
              Protractor.endPoint.transform(inverseTransfMatrix);
            }
        }
        else if(this.type == "Protractor_rotate")
        {
            var center = new Point(Protractor.x,Protractor.y);
            var endAngle = Util.getAngle(center,new Point(newX,newY));

            var startAngle = Util.getAngle(center,new Point(lastMove[0],lastMove[1]));
            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            Protractor.HandleManager.shape.transform(equivTransfMatrix);
            Protractor.startPoint.transform(equivTransfMatrix);
            Protractor.endPoint.transform(equivTransfMatrix);
            //var center = HandleManager.shape.primitives[0].points[0];
            //var endAngle = Util.getAngle(HandleManager.shape.primitives[0].points[1],new Point(newX,newY));
            Protractor.rotationAngle = Util.getAngle(center,new Point(Protractor.topX,Protractor.topY));//new Point(lastMove[0],lastMove[1])
        }
        else if(this.type == "Protractor_reset")
        {

        }
        else if(this.type.startsWith('Ruler'))
        {
            if(this.type == "Ruler_close")
            {
                state = STATE_NONE;
                draw();
            }
            else if(this.type == "Ruler_scale")
            {
                ////console.log("Inside Ruler Scale");
                var angle = Util.getAngle(Ruler.HandleManager.shape.rotationCoords[0], Ruler.HandleManager.shape.rotationCoords[1]);

                //save initial figure's center
                var oldCenter = Ruler.HandleManager.shape.rotationCoords[0].clone();

                

                //move the new [x,y] to the "un-rotated" and "un-translated" space
                var p = new Point(newX,newY);
                p.transform(Matrix.translationMatrix(-oldCenter.x,-oldCenter.y));
                p.transform(Matrix.rotationMatrix(-angle));
                p.transform(Matrix.translationMatrix(oldCenter.x,oldCenter.y));
                newX = p.x;
                newY = p.y;

                var handlerPoint=new Point(this.x,this.y)
				////console.log("circle transform")
				
				
				//Handler's center point (used to draw it's circle)
                //rotate that as well.
                handlerPoint.transform(Matrix.translationMatrix(-oldCenter.x,-oldCenter.y));
                handlerPoint.transform(Matrix.rotationMatrix(-angle));
                handlerPoint.transform(Matrix.translationMatrix(oldCenter.x,oldCenter.y));
                
                
                transX = figBounds[0];
                    if(newX > figBounds[0]+5){
                        scaleX = (newX-figBounds[0])/(handlerPoint.x-figBounds[0]);
                    }
                
                /*By default the NW, NE, SW and SE are scalling keeping the ratio
                 *but you can use SHIFT to cause a free (no keep ratio) change
                 *So, if no SHIFT pressed we force a "keep ration" resize
                 **/
                if(!SHIFT_PRESSED && transX != 0 && transY != 0){//keep ratios, only affects ne/nw resize

                    //if we are scaling along the x axis (West or East resize), with an arc(behaves like corner) then scale relative to x movement
                    //TODO: what's the reason for this?
                    if(this.getCursor()=="w-resize" || this.getCursor()=="e-resize"){
                        scaleY = scaleX;
                    }
                    else { //for everything else, scale based on y
                        scaleX = scaleY;
                    }
                }

                
                //move the figure to origine and "unrotate" it
                var matrixToOrigin = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-oldCenter.x,-oldCenter.y),
                    Matrix.rotationMatrix(-angle),
                    Matrix.translationMatrix(oldCenter.x,oldCenter.y)
                    );
                    
                //scale matrix
                var scaleMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-transX, -transY),
                    Matrix.scaleMatrix(scaleX, scaleY),
                    Matrix.translationMatrix(transX, transY)
                    );
                    
                var unscaleMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-transX, -transY),
                    Matrix.scaleMatrix(1/scaleX, 1/scaleY),
                    Matrix.translationMatrix(transX, transY)
                    );
                            
                //move and rotate the figure back to its original coordinates
                var matrixBackFromOrigin = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-oldCenter.x,-oldCenter.y),
                    Matrix.rotationMatrix(angle),
                    Matrix.translationMatrix(oldCenter.x,oldCenter.y)
                    );
                   
                var directMatrix = Matrix.mergeTransformations(matrixToOrigin, scaleMatrix, matrixBackFromOrigin);
                var reverseMatrix = Matrix.mergeTransformations(matrixToOrigin, unscaleMatrix, matrixBackFromOrigin);
                 
                Ruler.HandleManager.shape.transform(directMatrix);
                Ruler.width = Util.getLength(Ruler.HandleManager.shape.primitives[0].points[0], Ruler.HandleManager.shape.primitives[0].points[1]);
                if(Ruler.width<200)
                    Ruler.width = 200;
                Ruler.set();

                //matrixes = ['scale', directMatrix, reverseMatrix];
            }
            else if(this.type == "Ruler_rotate")
            {
                //rotationCoords[0] is always the center of the shape, we clone it as when we do -rotationCoords[0].x, it is set to 0.
                //var center = HandleManager.shape.rotationCoords[0].clone();
                var center = Ruler.HandleManager.shape.primitives[0].points[0];
                var endAngle = Util.getAngle(Ruler.HandleManager.shape.primitives[0].points[3],new Point(newX,newY));
                var startAngle = Util.getAngle(center,Ruler.HandleManager.shape.primitives[0].points[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                        
                Ruler.HandleManager.shape.transform(equivTransfMatrix);
                Ruler.seekerStarting.transform(equivTransfMatrix);
                Ruler.seeker1Point.transform(equivTransfMatrix);
                Ruler.seeker2Point.transform(equivTransfMatrix);
                
                Ruler.rotationAngle = endAngle;
                Ruler.set();
                //matrixes = ['rotate', equivTransfMatrix, inverseTransfMatrix];
            }
            else if(this.type == "Ruler_cm_inch")
            {
                if(Ruler.cm_inch == "cm_top")
                {
                    Ruler.cm_inch = "inch_top";
                    Ruler.CM_IN_TEXT = "in";
                }
                else
                {
                  Ruler.cm_inch = "cm_top";
                  Ruler.CM_IN_TEXT = "cm";
                }    
            }
            else if(this.type == "Ruler_draw")
            {
                Ruler.draw = true;
                ////console.log(Ruler.draw + " Ruler_draw");
            }
            else if(this.type == "Ruler_top" || this.type== "Ruler_bottom")
            {
                if(Ruler.draw)
                {
                    if(Ruler.startPoint != null)
                    {
                        Ruler.endPoint = new Point(newX,newY);
                    }
                    else
                    {
                        Ruler.startPoint = new Point(newX,newY);
                    }
                }
            }
            else if(this.type == "Ruler_seeker1")
            {
              Ruler.setSeekerStarting(lastMove[0],lastMove[1],Ruler.seeker1);
              var len = Util.getLength(Ruler.tempSeekerStarting,new Point(newX,newY));
              if(len>Ruler.seeker2-5)
                len = Ruler.seeker2-5;     
              if(len<Ruler.width-32)
                Ruler.seeker1 = len;    
              Ruler.set();
            }
            else if(this.type == "Ruler_seeker2")
            {
              Ruler.setSeekerStarting(lastMove[0],lastMove[1],Ruler.seeker2);
              var len = Util.getLength(Ruler.tempSeekerStarting,new Point(newX,newY));   
              if(len<Ruler.seeker1+5)
                len = Ruler.seeker1+5;  
              if(len<Ruler.width-32)
                Ruler.seeker2 = len;    
              Ruler.set();
            }
        }
        else if(this.HandleManager == "Curtain")
        {
            var angle = Util.getAngle(Curtain.HandleManager.shape.rotationCoords[0], Curtain.HandleManager.shape.rotationCoords[1]);

            //save initial figure's center
            var oldCenter = Curtain.HandleManager.shape.rotationCoords[0].clone();

            

            //move the new [x,y] to the "un-rotated" and "un-translated" space
            var p = new Point(newX,newY);
            p.transform(Matrix.translationMatrix(-oldCenter.x,-oldCenter.y));
            p.transform(Matrix.rotationMatrix(-angle));
            p.transform(Matrix.translationMatrix(oldCenter.x,oldCenter.y));
            newX = p.x;
            newY = p.y;

            var handlerPoint=new Point(this.x,this.y) //Handler's center point (used to draw it's circle)
            //rotate that as well.
            handlerPoint.transform(Matrix.translationMatrix(-oldCenter.x,-oldCenter.y));
            handlerPoint.transform(Matrix.rotationMatrix(-angle));
            handlerPoint.transform(Matrix.translationMatrix(oldCenter.x,oldCenter.y));
            
            
            
            switch(this.type){
                case 'Curtain_n':
                    /*move the xOy coodinates at the bottom of the figure and then scale*/
                    transY = figBounds[3];
                    if(newY < figBounds[3]-5){ //North must not get too close to South
                        scaleY = (figBounds[3]-newY)/(figBounds[3] - handlerPoint.y);
                    }
                    break;

                case 'Curtain_s':
                    /*move the xOy coodinates at the top of the figure (superfluous as we are there already) and then scale*/
                    transY = figBounds[1];
                    if(newY > figBounds[1]+5){ //South must not get too close to North
                        scaleY = (newY-figBounds[1])/(handlerPoint.y-figBounds[1]);
                    }
                    break;

                case 'Curtain_w':
                    /*move the xOy coordinates at the right of the figure and then scale*/
                    transX = figBounds[2];
                    if(newX < figBounds[2]-5){ //West(newX) must not get too close to East(figBounds[2])
                        scaleX = (figBounds[2]-newX)/(figBounds[2]-handlerPoint.x);
                    }
                    break;

                case 'Curtain_e':
                    /*move the xOy coodinates at the left of the figure (superfluous as we are there already) and then scale*/
                    transX = figBounds[0];
                    if(newX > figBounds[0]+5){
                        scaleX = (newX-figBounds[0])/(handlerPoint.x-figBounds[0]);
                    }
                    break;

            }//end switch
            
            
            
            
            
            /*By default the NW, NE, SW and SE are scalling keeping the ratio
             *but you can use SHIFT to cause a free (no keep ratio) change
             *So, if no SHIFT pressed we force a "keep ration" resize
             **/
            if(!SHIFT_PRESSED && transX != 0 && transY != 0){//keep ratios, only affects ne/nw resize

                //if we are scaling along the x axis (West or East resize), with an arc(behaves like corner) then scale relative to x movement
                //TODO: what's the reason for this?
                if(this.getCursor()=="w-resize" || this.getCursor()=="e-resize"){
                    scaleY = scaleX;
                }
                else { //for everything else, scale based on y
                    scaleX = scaleY;
                }
            }

            
            //move the figure to origine and "unrotate" it
            var matrixToOrigin = Matrix.mergeTransformations(
                Matrix.translationMatrix(-oldCenter.x,-oldCenter.y),
                Matrix.rotationMatrix(-angle),
                Matrix.translationMatrix(oldCenter.x,oldCenter.y)
                );
                
            //scale matrix
            var scaleMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-transX, -transY),
                Matrix.scaleMatrix(scaleX, scaleY),
                Matrix.translationMatrix(transX, transY)
                );
                
            var unscaleMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-transX, -transY),
                Matrix.scaleMatrix(1/scaleX, 1/scaleY),
                Matrix.translationMatrix(transX, transY)
                );
                        
            //move and rotate the figure back to its original coordinates
            var matrixBackFromOrigin = Matrix.mergeTransformations(
                Matrix.translationMatrix(-oldCenter.x,-oldCenter.y),
                Matrix.rotationMatrix(angle),
                Matrix.translationMatrix(oldCenter.x,oldCenter.y)
                );
               
            var directMatrix = Matrix.mergeTransformations(matrixToOrigin, scaleMatrix, matrixBackFromOrigin);
            var reverseMatrix = Matrix.mergeTransformations(matrixToOrigin, unscaleMatrix, matrixBackFromOrigin);
            
            var canvas = getCanvas();
            Curtain.figure.transform(directMatrix);
            var width = Util.getLength(Curtain.figure.primitives[0].points[0], Curtain.figure.primitives[0].points[1]);
            var height = Util.getLength(Curtain.figure.primitives[0].points[0], Curtain.figure.primitives[0].points[3]);
            if((width>canvas.width||height>canvas.height)||(width<60||height<60))
            {
              Curtain.figure.transform(reverseMatrix);
            }
            
        }
        else{ 
            var angle = Util.getAngle(HandleManager.shape.rotationCoords[0], HandleManager.shape.rotationCoords[1]);

            //save initial figure's center
            var oldCenter = HandleManager.shape.rotationCoords[0].clone();

            

            //move the new [x,y] to the "un-rotated" and "un-translated" space
            var p = new Point(newX,newY);
            p.transform(Matrix.translationMatrix(-oldCenter.x,-oldCenter.y));
            p.transform(Matrix.rotationMatrix(-angle));
            p.transform(Matrix.translationMatrix(oldCenter.x,oldCenter.y));
            newX = p.x;
            newY = p.y;

            var handlerPoint=new Point(this.x,this.y) //Handler's center point (used to draw it's circle)
            //rotate that as well.
            handlerPoint.transform(Matrix.translationMatrix(-oldCenter.x,-oldCenter.y));
            handlerPoint.transform(Matrix.rotationMatrix(-angle));
            handlerPoint.transform(Matrix.translationMatrix(oldCenter.x,oldCenter.y));
            
            
            
            switch(this.type){
                case 'n':
                    /*move the xOy coodinates at the bottom of the figure and then scale*/
                    transY = figBounds[3];
                    if(newY < figBounds[3]-5){ //North must not get too close to South
                        scaleY = (figBounds[3]-newY)/(figBounds[3] - handlerPoint.y);
                    }
                    break;

                case 's':
                    /*move the xOy coodinates at the top of the figure (superfluous as we are there already) and then scale*/
                    transY = figBounds[1];
                    if(newY > figBounds[1]+5){ //South must not get too close to North
                        scaleY = (newY-figBounds[1])/(handlerPoint.y-figBounds[1]);
                    }
                    break;

                case 'w':
                    /*move the xOy coordinates at the right of the figure and then scale*/
                    transX = figBounds[2];
                    if(newX < figBounds[2]-5){ //West(newX) must not get too close to East(figBounds[2])
                        scaleX = (figBounds[2]-newX)/(figBounds[2]-handlerPoint.x);
                    }
                    break;

                case 'e':
                    /*move the xOy coodinates at the left of the figure (superfluous as we are there already) and then scale*/
                    transX = figBounds[0];
                    if(newX > figBounds[0]+5){
                        scaleX = (newX-figBounds[0])/(handlerPoint.x-figBounds[0]);
                    }
                    break;

                case 'nw':
                    /*You can think as a combined North and West action*/
                    transX = figBounds[2];
                    transY = figBounds[3];
                    if(newX<figBounds[2]-5 && newY<figBounds[3]-5){
                        scaleY = (figBounds[3]-newY) /(figBounds[3]-handlerPoint.y);
                        scaleX = (figBounds[2]-newX) / (figBounds[2]-handlerPoint.x);
                    }
                    break;

                case 'ne':
                    transX = figBounds[0]
                    transY = figBounds[3];
                    if(newX>figBounds[0]+5 && newY<figBounds[3]-5){
                        scaleX = (newX-figBounds[0])/(handlerPoint.x-figBounds[0]);
                        scaleY = (figBounds[3]-newY)/(figBounds[3]-handlerPoint.y);
                    }
                    break;

                case 'sw':
                    transX = figBounds[2]
                    transY = figBounds[1];
                    if(newX<figBounds[2]-5 && newY>figBounds[1]+5){
                        scaleX = (figBounds[2]-newX)/((figBounds[2]-handlerPoint.x));
                        scaleY = (newY-figBounds[1])/(handlerPoint.y-figBounds[1]);
                    }
                    break;

                case 'se':
                    transX = figBounds[0];
                    transY = figBounds[1];
                    if(newX>figBounds[0]+5 && newY>figBounds[1]+5){
                        scaleY= (newY-figBounds[1]) / (handlerPoint.y-figBounds[1]);
                        scaleX= (newX-figBounds[0]) / (handlerPoint.x-figBounds[0]);
                    }
                    break;
            }//end switch
            
            
            
            
            
            /*By default the NW, NE, SW and SE are scalling keeping the ratio
             *but you can use SHIFT to cause a free (no keep ratio) change
             *So, if no SHIFT pressed we force a "keep ration" resize
             **/
            if(!SHIFT_PRESSED && transX != 0 && transY != 0){//keep ratios, only affects ne/nw resize

                //if we are scaling along the x axis (West or East resize), with an arc(behaves like corner) then scale relative to x movement
                //TODO: what's the reason for this?
                if(this.getCursor()=="w-resize" || this.getCursor()=="e-resize"){
                    scaleY = scaleX;
                }
                else { //for everything else, scale based on y
                    scaleX = scaleY;
                }
            }

            
            //move the figure to origine and "unrotate" it
            var matrixToOrigin = Matrix.mergeTransformations(
                Matrix.translationMatrix(-oldCenter.x,-oldCenter.y),
                Matrix.rotationMatrix(-angle),
                Matrix.translationMatrix(oldCenter.x,oldCenter.y)
                );
                
            //scale matrix
            var scaleMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-transX, -transY),
                Matrix.scaleMatrix(scaleX, scaleY),
                Matrix.translationMatrix(transX, transY)
                );
                
            var unscaleMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-transX, -transY),
                Matrix.scaleMatrix(1/scaleX, 1/scaleY),
                Matrix.translationMatrix(transX, transY)
                );
                        
            //move and rotate the figure back to its original coordinates
            var matrixBackFromOrigin = Matrix.mergeTransformations(
                Matrix.translationMatrix(-oldCenter.x,-oldCenter.y),
                Matrix.rotationMatrix(angle),
                Matrix.translationMatrix(oldCenter.x,oldCenter.y)
                );
               
            var directMatrix = Matrix.mergeTransformations(matrixToOrigin, scaleMatrix, matrixBackFromOrigin);
            var reverseMatrix = Matrix.mergeTransformations(matrixToOrigin, unscaleMatrix, matrixBackFromOrigin);
             
             
            matrixes = ['scale', directMatrix, reverseMatrix];
             
            
        } //end else
        
        return matrixes;
    },

    /**
     *Handle actions for LineArrow
     **/
    actionConnector: function(lastMove, newX, newY){
        switch(this.type){
            case 'v':
                var index;
                //find the two turning points this handle is in between
                for(var i = 1; i < HandleManager.shape.turningPoints.length-1; i++){
                    if(HandleManager.shape.turningPoints[i-1].y == HandleManager.shape.turningPoints[i].y
                        && HandleManager.shape.turningPoints[i].y == this.y
                        && Math.min(HandleManager.shape.turningPoints[i].x, HandleManager.shape.turningPoints[i-1].x) <= this.x
                        && Math.max(HandleManager.shape.turningPoints[i].x, HandleManager.shape.turningPoints[i-1].x) >= this.x)
                        {
                        index = i;
                    }
                }
                var deltaY = newY - lastMove[1];    //Take changes on Oy
                var translationMatrix = Matrix.translationMatrix(0, deltaY);    //Generate translation matrix

                /*TODO: make changes to WHITEBOARD.debugSolutions here
                 * because, otherwise, those changes are not reflected in debug painting of LineArrow
                 */
                //Pick turning points neighbours and translate them
                HandleManager.shape.turningPoints[index-1].transform(translationMatrix);
                HandleManager.shape.turningPoints[index].transform(translationMatrix);

                break;

            case 'h':
                var index;
                //find the two turning points this handle is in between
                for(var i = 1; i < HandleManager.shape.turningPoints.length-1; i++){
                    if(HandleManager.shape.turningPoints[i-1].x == HandleManager.shape.turningPoints[i].x
                        && HandleManager.shape.turningPoints[i].x == this.x
                        && Math.min(HandleManager.shape.turningPoints[i].y, HandleManager.shape.turningPoints[i-1].y) <= this.y
                        && Math.max(HandleManager.shape.turningPoints[i].y, HandleManager.shape.turningPoints[i-1].y) >= this.y)
                        {
                        index = i;
                    }
                }
                var deltaX = newX-lastMove[0];    //Take changes on Ox
                var translationMatrix = Matrix.translationMatrix(deltaX, 0);    //Generate translation matrix

                /*TODO: make changes to WHITEBOARD.debugSolution here
                 * because, otherwise, those changes are not reflected in debug painting of LineArrow
                 */
                //Pick turning points neighbours and translate them
                HandleManager.shape.turningPoints[index-1].transform(translationMatrix);
                HandleManager.shape.turningPoints[index].transform(translationMatrix);

                break;
        }
        HandleManager.shape.updateMiddleText();
    },

    /**Handle an action. Simply dispatch to the correct handler
     **/
    action: function(lastMove, newX, newY){
        if(lastMove == null || lastMove.length != 2){
            throw 'Handle:action() Last move is wrong';
        }
        if(HandleManager.shape instanceof Figure){
            this.actionFigure(lastMove, newX, newY);
        }
        else if(HandleManager.shape instanceof Group){
            this.actionGroup(lastMove, newX, newY);
        }
    },


    /**This is the method you have to call to paint a handler
     **/
    paint : function(context){
        context.save();
        if(this.type=='A' && HandleManager.shape.primitives[1].arrow == false)
        {
            var rectWidth = 0;
            var rectHeight = 10;
            var rectX = this.x-10;
            var rectY = this.y-10;
            var cornerRadius = 1;
            
            context.save();
               var startAngle = Util.getAngle(HandleManager.shape.rotationCoords[0],HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
            context.drawImage(WHITEBOARD.arrowImage,rectX,rectY);
                context.rotate(startAngle);
            
           /* equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );*/
            context.restore();
            return;
        }
        else if(this.type == 'r'){
            context.drawImage(WHITEBOARD.rotateImage,this.x-10,this.y-10);
            var line = new Line(new Point(this.x,this.y), new Point(HandleManager.handles[1].x,HandleManager.handles[1].y));
            line.style.dashLength = 3;
            line.style.strokeStyle = "rgb(0,0,0)";
            line.style.lineWidth = defaultThinLineWidth;
            line.paint(context);
        }
        else if(this.type == 'rp')
        {
            context.drawImage(WHITEBOARD.rotateImage,this.x-10,this.y-10);
        }
        else if(this.type == "Ruler_close")
        {
            //context.beginPath();
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x - segment, x4 = x + segment;
            var y1  = y , y2 = y, y3 = y + segment*2 , y4 = y + segment*2;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";
            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;
            var equivTransfMatrix = null;
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+10,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                        
                r.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            var text = new OrdinaryText('X', this.x, this.y+10, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255,255,255)";
            r.paint(context);
            line.paint(context);
            if(Ruler.rotationAngle!=null)
            {
                text.transform(equivTransfMatrix);
            }
            text.paint(context);
            
            /*context.arc(this.x, this.y, Handle.RADIUS, 0, Math.PI*2, false);
            context.fillStyle = "rgb(255,255,255)";
            context.closePath();
            context.fill();
*/        }
        else if(this.type=="Ruler_scale")
        {
            var segmentX = 10;
            var segmentY = 30
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segmentX, x2 = x + segmentX, x3 = x - segmentX, x4 = x + segmentX;
            var y1  = y - segmentY, y2 = y - segmentY, y3 = y + segmentY, y4 = y + segmentY;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style = new Style();
            r.style.fillStyle = "rgb(42, 43, 45)";
            r.style.strokeStyle = "rgb(42, 43, 45)";

            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;

            var equivTransfMatrix = null;
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+10,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                        
                r.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            
            r.paint(context);
            line.paint(context);
            var text = new OrdinaryText('↔', this.x, this.y, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255,255,255)";
            if(Ruler.rotationAngle!=null)
            {
                text.transform(equivTransfMatrix);
            }
            text.paint(context);
        }
        else if(this.type=="Ruler_rotate")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x - segment, x4 = x + segment;
            var y1  = y - segment*2, y2 = y - segment*2, y3 = y, y4 = y;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";
            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;
            var equivTransfMatrix = null;
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+20,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                        
                r.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            r.paint(context);
            line.paint(context);
            var text = new OrdinaryText('ѻ', this.x, this.y-10, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255,255,255)";
            if(Ruler.rotationAngle!=null)
            {
                text.transform(equivTransfMatrix);
            }
            text.paint(context);
            
        }
        else if(this.type=="Ruler_top")
        {
            var segment = Ruler.width/2;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment-10, x3 = x - segment, x4 = x + segment-10;
            var y1  = y - 8, y2 = y - 8, y3 = y, y4 = y;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            r.paint(context);
        }
        else if(this.type=="Ruler_bottom")
        {
            var segment = Ruler.width/2;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment-10, x3 = x - segment, x4 = x + segment-10;
            var y1  = y + 8, y2 = y + 8, y3 = y, y4 = y;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            /*r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";*/
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+10,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                        
                r.transform(equivTransfMatrix);
            }
            r.paint(context);
        }
        else if(this.type=="Ruler_draw")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x - segment, x4 = x + segment;
            var y1  = y - segment*2, y2 = y - segment*2, y3 = y, y4 = y;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            if(Ruler.draw)
            {
              r.style.fillStyle = "rgba(26, 106, 177,0.5)";
              r.style.strokeStyle = "rgba(26, 106, 177,0.5)";
            }
            else
            {
              r.style.fillStyle = "rgb(97, 107, 109)";
              r.style.strokeStyle = "rgb(97, 107, 109)";
            }

            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;

            var equivTransfMatrix = null;
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+20,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                        
                r.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            r.paint(context);
            line.paint(context);
            var text = new OrdinaryText('/', this.x, this.y-10, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255,255,255)";
            if(Ruler.rotationAngle!=null)
            {
                text.transform(equivTransfMatrix);
            }
            text.paint(context);
        }
        else if(this.type=="Ruler_reset")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y+5;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x - segment, x4 = x + segment;
            var y1  = y, y2 = y, y3 = y + segment*2, y4 = y3;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";
            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;

            var equivTransfMatrix = null;
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+20,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                        
                r.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            r.paint(context);
            line.paint(context);
            var text = new OrdinaryText('∟', x , this.y+15, 12, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255,255,255)";
            if(Ruler.rotationAngle!=null)
            {
                text.transform(equivTransfMatrix);
            }
            text.paint(context);
        }
        else if(this.type=="Ruler_cm_inch")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x , x2 = x + segment*2, x3 = x, x4 = x + segment *2;
            var y1  = y - segment, y2 = y - segment, y3 = y + segment, y4 = y + segment;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";
            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;

            var equivTransfMatrix = null;
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+20,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                        
                r.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            r.paint(context);
            line.paint(context);
            var text = new OrdinaryText(Ruler.CM_IN_TEXT, this.x+10, this.y, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255,255,255)";
            if(Ruler.rotationAngle!=null)
            {
                text.transform(equivTransfMatrix);
            }
            text.paint(context);
        }
        else if(this.type=="Ruler_seeker1"||this.type=="Ruler_seeker2")
        {
            var segmentX = 5;
            var segmentY = Ruler.height/2;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segmentX, x2 = x + segmentX, x3 = x - segmentX, x4 = x + segmentX;
            var y1  = y - segmentY, y2 = y - segmentY, y3 = y + segmentY, y4 = y + segmentY;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style = new Style();
            r.style.fillStyle = "rgba(26, 106, 177,0.5)";
            r.style.strokeStyle = "rgba(26, 106, 177,0.5)";
            var line = new Line(new Point(x,y1),new Point(x,y3));
            line.style.lineWidth = 1;
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgba(0, 0, 0,1)";
            var triangle = new Polygon();
            triangle.addPoint(new Point(x, y-7));
            triangle.addPoint(new Point(x, y+7));
            if(this.type=="Ruler_seeker1")
              triangle.addPoint(new Point(x-7, y));
            else
              triangle.addPoint(new Point(x+7, y));
            triangle.style = new Style();
            triangle.style.fillStyle = "rgba(0, 0, 0,1)";
            triangle.style.strokeStyle = "rgba(26, 106, 177,0)";
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+10,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                r.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
                triangle.transform(equivTransfMatrix);
            }
            r.paint(context);
            line.paint(context);
            triangle.paint(context);
        }
        else if(this.type=="Protractor_rotate")
        {
           //Do Nothing on paint
           Protractor.topX = this.x;
           Protractor.topY = this.y;
        }
        else if(this.type=="Protractor_createAngle")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x + segment, x2 = x + segment*8, x3 = x + segment, x4 = x + segment*8;
            var y1  = y - segment*3 - 5, y2 = y1, y3 = y, y4 = y;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";

            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;

            var equivTransfMatrix = null;
            var text = new OrdinaryText('Create Angle', x1+35, y1+18, FigureDefaults.textFont, 10, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255, 255, 225)";
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
                text.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            r.paint(context);
            text.paint(context);
            line.paint(context);
        }
        else if(this.type=="Protractor_close")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment*4, x2 = x1 + segment*2, x3 = x1, x4 = x2;
            var y1  = y - segment*3 , y2 = y1, y3 = y-10, y4 = y3;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";
            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;

            var equivTransfMatrix = null;
            var text = new OrdinaryText('X', x1+10, y1+10, FigureDefaults.textFont, 10, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255, 255, 225)";
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
                text.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            r.paint(context);
            text.paint(context);
            line.paint(context);
        }
        else if(this.type=="Protractor_reset")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment*7, x2 = x1 + segment*2, x3 = x1, x4 = x2;
            var y1  = y - segment*3 , y2 = y1, y3 = y-10, y4 = y3;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";
            var start = new Point(x4,y4);
            var end = new Point(x3,y3);
            var line = new Line(start,end);
            line.style.fillStyle = "rgb(0, 0, 0)";
            line.style.strokeStyle = "rgb(0, 0, 0)";
            line.style.lineWidth = 2;

            var equivTransfMatrix = null;
            var text = new OrdinaryText('∟', x1+10, y1+10, FigureDefaults.textFont, 10, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255, 255, 225)";
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
                text.transform(equivTransfMatrix);
                line.transform(equivTransfMatrix);
            }
            r.paint(context);
            text.paint(context);
            line.paint(context);            
        }
        else if(this.type=="Protractor_angleDisplay")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x + segment, x2 = x + segment*14 - 10, x3 = x + segment, x4 = x + segment*14- 10;
            var y1  = y - segment*3 - 3, y2 = y1, y3 = y-5, y4 = y-5;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";
            var anglerad = Util.getAngle3Points(Protractor.startPoint,new Point(Protractor.x,Protractor.y),Protractor.endPoint);
            var angle = anglerad * (180/Math.PI);
            if(angle<0)
              angle = -1*angle;
            if(angle>90)
              angle = 360-angle;
            if(angle<0)
              angle = -1*angle;
            angle = Math.round10(angle,-1);
            if(angle%1<0.25)
              angle = Math.floor(angle);
            else if(angle%1<0.75)
              angle = Math.floor(angle)+0.5;
            else
              angle = Math.ceil(angle);
            if(angle==270)
              angle =90;
            var equivTransfMatrix = null;
            var text = new OrdinaryText(angle.toFixed(1)+"° ", x1+25, y1+14, FigureDefaults.textFont, 10, false, Text.ALIGN_CENTER, 16,12);
            text.style.fillStyle = "rgb(255, 255, 225)";
            var text2 = new OrdinaryText((angle*(Math.PI/180)).toFixed(2)+" rad", x1+70, y1+14, FigureDefaults.textFont, 10, false, Text.ALIGN_CENTER, 16,12);
            text2.style.fillStyle = "rgb(255, 255, 225)";
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
                text.transform(equivTransfMatrix);
                text2.transform(equivTransfMatrix);
            }
            r.paint(context);
            text.paint(context);
            text2.paint(context);
        }
        else if(this.type=="Protractor_angleUpArrow")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x + segment*11, x2 = x1 + 10, x3 = x1, x4 = x2;
            var y1  = y - segment*3, y2 = y1, y3 = y-segment*2, y4 = y3;
            r.addPoint(new Point(x1+((x2-x1)/2), y1));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(0, 0, 0)";
            r.style.strokeStyle = "rgb(0, 0, 0)";
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
            }
            r.paint(context);
        }
        else if(this.type=="Protractor_angleDownArrow")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x + segment*11, x2 = x1 + 10, x3 = x1, x4 = x2;
            var y1  = y - 17.5, y2 = y1, y3 = y-7.5, y4 = y3;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x3+((x4-x3)/2), y3));
            
            r.style =new Style();
            r.style.fillStyle = "rgb(0, 0, 0)";
            r.style.strokeStyle = "rgb(0, 0, 0)";
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
            }
            r.paint(context);
        }
        else if(this.type == "Protractor_startPoint" || this.type == "Protractor_endPoint")
        {
          var color = "rgb(26, 106, 177)";
          var point = Protractor.startPoint;
          if(this.type == "Protractor_endPoint")
          { 
            color = "rgb(250, 110, 129)";
            point = Protractor.endPoint;
          }//fill the handler
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, Handle.RADIUS, 0, Math.PI*2, false);
            context.fillStyle = color;
            context.globalAlpha = "1";
            context.closePath();
            context.fill();
            
            //stroke the handler
            context.beginPath();
            context.arc(this.x, this.y, Handle.RADIUS, 0, Math.PI*2, false);
            context.strokeStyle = color;
            context.lineWidth = '1';
            context.closePath();
            context.stroke();
            context.restore();

            //fill the handler
            context.save();
            context.beginPath();
            context.moveTo(Protractor.x,Protractor.y);
            context.lineTo(point.x,point.y);
            context.lineWidth = 2;
            context.strokeStyle = color;
            context.stroke();
            context.closePath();
            context.restore();
        }
        else if(this.type == "Compass_changeColor")
        {
            /*var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = Compass.Pencil.primitives[0];
            r.style.fillStyle = "#929292";
            r.paint(context);*/
            //Do nothing
        }
        else if(this.HandleManager == "Compass" && this.type.startsWith("Compass_color_"))
        {
          if(Compass.changeColor)
          {
            var color = "";
            switch(this.type)
            {
              case "Compass_color_blackPoint": color = "#000";break;
              case "Compass_color_redPoint": color = "rgb(255, 0, 0)";break;
              case "Compass_color_greenPoint": color = "rgb(51, 102, 0)";break;
              case "Compass_color_bluePoint": color = "rgb(51, 51, 153)";break;
            }

            //fill the handler
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, 7, 0, Math.PI*2, false);
            context.fillStyle = color;
            context.closePath();
            context.fill();
            
            //stroke the handler
            context.beginPath();
            context.arc(this.x, this.y, 7, 0, Math.PI*2, false);
            context.strokeStyle = "rgb(255, 227, 119)";
            context.lineWidth = '1';
            context.closePath();
            context.stroke();
            context.restore();
          }
        }
        else if(this.HandleManager=="Curtain")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x1, x4 = x2;
            var y1  = y - segment, y2 = y1, y3 = y+segment, y4 = y3;
            var txt = "▲";
            var txtX = x;
            var txtY = y + segment;
            if(this.type=="Curtain_e")
              txt = "►";
            else if(this.type == "Curtain_s")
              txt = "▼";
            else if(this.type == "Curtain_w")
              txt = "◄";
            else if(this.type=="Curtain_close")
              txt = "x";
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            r.style =new Style();
            r.style.fillStyle = "rgb(97, 107, 109)";
            r.style.strokeStyle = "rgb(97, 107, 109)";
            var text = new OrdinaryText(txt, this.x, this.y, FigureDefaults.textFont, 10, false, Text.ALIGN_CENTER, 16,14);
            text.style.fillStyle = "rgb(255, 255, 255)";
            
            r.paint(context);
            text.paint(context);
            
        }
        else
        {
            var color = "#929292";
            if(this.HandleManager == "Compass")
              color = "rgb(97, 107, 109)";
            //fill the handler
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, Handle.RADIUS, 0, Math.PI*2, false);
            context.fillStyle = color;
            context.globalAlpha = "0.3";
            context.closePath();
            context.fill();
            
            //stroke the handler
            context.beginPath();
            context.arc(this.x, this.y, Handle.RADIUS, 0, Math.PI*2, false);
            context.strokeStyle = "#000";
            context.lineWidth = '1';
            context.closePath();
            context.stroke();
            context.restore();
        }
        
        if(this.type=="Ruler_top" || this.type == "Ruler_bottom")
        {
            if(Ruler.draw && Ruler.startPoint!=null && Ruler.endPoint!=null)
            {
                var endLength = Util.getLength(Ruler.startPoint,Ruler.endPoint);
                if(endLength>Ruler.width-10)
                    endLength = Ruler.width;
                var endPoint =  new Point(Ruler.startPoint.x+endLength,Ruler.startPoint.y);
                
                var line = new Polygon();
                line.addPoint(Ruler.startPoint);
                line.addPoint(endPoint);
                line.style =new Style();
                line.style.fillStyle = "rgb(0, 0, 0)";
                line.style.strokeStyle = "rgb(0, 0, 0)";
                var boundsPoly = new Polygon();
                boundsPoly.addPoint(new Point(Ruler.startPoint.x, Ruler.startPoint.y-10));
                boundsPoly.addPoint(new Point(endPoint.x, endPoint.y-10));
                boundsPoly.addPoint(new Point(endPoint.x, endPoint.y+10));
                boundsPoly.addPoint(new Point(Ruler.startPoint.x, Ruler.startPoint.y+10));
                Ruler.centerPoint = new Point(Ruler.startPoint.x+endLength/2,Ruler.startPoint.y);
                
                if(Ruler.rotationAngle !=null)
                {
                    var center = Ruler.startPoint;
                    var nextPoint = new Point(Ruler.startPoint.x+10,Ruler.startPoint.y);
                    var endAngle = Ruler.rotationAngle;
                    var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                    var rotAngle = endAngle - startAngle;
                    var Transform =  Matrix.mergeTransformations(
                        Matrix.translationMatrix(-center.x, -center.y), 
                        Matrix.rotationMatrix(rotAngle), 
                        Matrix.translationMatrix(center.x,center.y)
                        );
                    line.transform(Transform);
                    boundsPoly.transform(Transform);
                    Ruler.centerPoint.transform(Transform);
                }
                    //line.transform(this.getRotationMatrix());
                line.paint(context);
                Ruler.actualStartPoint = line.points[0];
                Ruler.actualEndPoint = line.points[1];
                Ruler.lineBounds = boundsPoly;
                
            }
        }
        
        
        
        context.restore();
    },

    /** get the rotation matrix of handle**/
    getRotationMatrix:function(){
        var center = new Point(this.x, this.y);
        var nextPoint = new Point(this.x+10,this.y);
        var endAngle = Ruler.rotationAngle;
        var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
        var rotAngle = endAngle - startAngle;
        return Matrix.mergeTransformations(
            Matrix.translationMatrix(-center.x, -center.y), 
            Matrix.rotationMatrix(rotAngle), 
            Matrix.translationMatrix(center.x,center.y)
            );
    },
    /**See if the handle contains a point
     **/
    contains:function(tx,ty){
        var p=new Point(this.x,this.y);
        if(this.HandleManager == "Curtain")
        {
          var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x1, x4 = x2;
            var y1  = y - segment, y2 = y1, y3 = y+segment, y4 = y3;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Ruler_close")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x - segment, x4 = x + segment;
            var y1  = y , y2 = y, y3 = y + segment*2 , y4 = y + segment*2;
           
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Ruler_scale")
        {
            var segmentX = 10;
            var segmentY = 30
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segmentX, x2 = x + segmentX, x3 = x - segmentX, x4 = x + segmentX;
            var y1  = y - segmentY, y2 = y - segmentY, y3 = y + segmentY, y4 = y + segmentY;
        
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type == "Ruler_rotate")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x - segment, x4 = x + segment;
            var y1  = y - segment*2, y2 = y - segment*2, y3 = y, y4 = y;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Ruler_top")
        {
            var segment = Ruler.width/2;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1 = x - segment, x2 = x + segment-10, x3 = x - segment, x4 = x + segment-10;
            var y1 = y - 8, y2 = y - 8, y3 = y, y4 = y;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Ruler_bottom")
        {
            var segment = Ruler.width/2;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment-10, x3 = x - segment, x4 = x + segment-10;
            var y1  = y + 8, y2 = y + 8, y3 = y, y4 = y;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type == "Ruler_draw")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x - segment, x4 = x + segment;
            var y1  = y - segment*2, y2 = y - segment*2, y3 = y, y4 = y;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type == "Ruler_reset")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y+5;
            var r = new Polygon();
            var x1  = x - segment, x2 = x + segment, x3 = x - segment, x4 = x + segment;
            var y1  = y , y2 = y , y3 = y + segment*2, y4 = y3;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type == "Ruler_cm_inch")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x , x2 = x + segment*2, x3 = x, x4 = x + segment *2;
            var y1  = y - segment, y2 = y - segment, y3 = y + segment, y4 = y + segment;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                r.transform(this.getRotationMatrix());
            }
            
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Ruler_seeker1"||this.type=="Ruler_seeker2")
        {
            var segmentX = 5;
            var segmentY = Ruler.height/2;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segmentX, x2 = x + segmentX, x3 = x - segmentX, x4 = x + segmentX;
            var y1  = y - segmentY, y2 = y - segmentY, y3 = y + segmentY, y4 = y + segmentY;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Ruler.rotationAngle!=null)
            {
                var center = new Point(this.x, this.y);
                var nextPoint = new Point(this.x+10,this.y);
                var endAngle = Ruler.rotationAngle;
                var startAngle = Util.getAngle(center,nextPoint);//new Point(lastMove[0],lastMove[1])
                var rotAngle = endAngle - startAngle;
                equivTransfMatrix = Matrix.mergeTransformations(
                    Matrix.translationMatrix(-center.x, -center.y), 
                    Matrix.rotationMatrix(rotAngle), 
                    Matrix.translationMatrix(center.x,center.y)
                    );
                r.transform(equivTransfMatrix);
            }
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type == "A")
        {
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x -10 , x2 = x + 10, x3 = x-10, x4 = x +10;
            var y1  = y - 10, y2 = y - 10, y3 = y + 10, y4 = y + 10;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Protractor_close")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment*4, x2 = x1 + segment*2, x3 = x1, x4 = x2;
            var y1  = y - segment*3 , y2 = y1, y3 = y-10, y4 = y3;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
            }
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Protractor_reset")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segment*7, x2 = x1 + segment*2, x3 = x1, x4 = x2;
            var y1  = y - segment*3 , y2 = y1, y3 = y-10, y4 = y3;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
            }
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Protractor_createAngle")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x + segment, x2 = x + segment*8, x3 = x + segment, x4 = x + segment*8;
            var y1  = y - segment*3 - 5, y2 = y1, y3 = y, y4 = y;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
            }
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Protractor_rotate")
        {
          var segmentX = 30;
            var segmentY = 10
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x - segmentX, x2 = x + segmentX, x3 = x - segmentX, x4 = x + segmentX;
            var y1  = y - segmentY, y2 = y - segmentY, y3 = y + segmentY, y4 = y + segmentY;
            
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
            }
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Protractor_angleUpArrow")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x + segment*11, x2 = x1 + 10, x3 = x1, x4 = x2;
            var y1  = y - segment*3, y2 = y1, y3 = y-segment*2, y4 = y3;
            if(this.type=="Protractor_angleDownArrow")
            {
              x1  = x + segment*11, x2 = x1 + 10, x3 = x1, x4 = x2;
              y1  = y - 17.5, y2 = y1, y3 = y-7.5, y4 = y3;
            }
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
            }
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Protractor_angleDownArrow")
        {
            var segment = 10;
            var x = this.x;
            var y = this.y;
            var r = new Polygon();
            var x1  = x + segment*11, x2 = x1 + 10, x3 = x1, x4 = x2;
            var y1  = y - 17.5, y2 = y1, y3 = y-7.5, y4 = y3;
            r.addPoint(new Point(x1, y1));
            r.addPoint(new Point(x2, y2));
            r.addPoint(new Point(x4, y4));
            r.addPoint(new Point(x3, y3));
            if(Protractor.rotationAngle!=null)
            {
                var center = new Point(this.x,this.y);
                var startAngle = Util.getAngle(Protractor.HandleManager.shape.rotationCoords[0],Protractor.HandleManager.shape.rotationCoords[1]);//new Point(lastMove[0],lastMove[1])
                var rotAngle =  startAngle;
                var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
                r.transform(equivTransfMatrix);
            }
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, r.points);
            return bo;
        }
        else if(this.type=="Compass_changeColor")
        {
            var p1= new Point(tx,ty);
            var bo = Util.isPointInside(p1, Compass.Pencil.primitives[0].points);
            return bo;
        }
        else if(this.HandleManager=="Compass"&&this.type.startsWith("Compass_color_"))
        {
            if(Compass.changeColor)
              return p.near(tx,ty, 7);
            else 
              return false;
        }
        else
        {
            return p.near(tx,ty, Handle.RADIUS);
        }   
    },

    
    /**
     *Get a handle bounds
     **/
    getBounds : function(){
        return [this.x - Handle.RADIUS, this.y - Handle.RADIUS, this.x + Handle.RADIUS,this.y + Handle.RADIUS];
    },


    /** 
     *Transform the Handle through a matrix
     **/
    transform: function(matrix){
        if(this.type == 'A' && HandleManager.shape.primitives[1].arrow)
        {
            //Do Nothing
        }
        else if(this.type=='Protractor_startPoint'||this.type == 'Protractor_endPoint'||this.type=='Ruler_seeker1'||this.type=='Ruler_seeker2'||this.HandleManager == "Compass")
        {
           //Do Nothing
        }
        else
        {
            var p=new Point(this.x,this.y)
            p.transform(matrix);
            this.x=p.x;
            this.y=p.y;
        }
        
    },
    

    /**Get the specific cursor for this handle. Cursor is ONLY a visual clue for
     *  the user to know how to move his mouse.
     **/
    
    getCursor:function(){
        if(HandleManager.shape instanceof Figure ){
            if(this.visible == false){
                return "";
            }
            if(this.type == 'r' || this.type == 'rp'){
                return 'move';
            }
            if(this.HandleManager!="default")
              return 'pointer';
            var figureBounds = HandleManager.shape.getBounds(); //get figure's bounds
            var figureCenter = new Point(figureBounds[0] + ((figureBounds[2]-figureBounds[0])/2),
                (figureBounds[1] + ((figureBounds[3] - figureBounds[1])/2)) ); //get figure's center

            //find north
            var closestToNorthIndex = -1; //keeps the index of closest handle to North
            var minAngleToNorth = 2 * Math.PI; //keeps the smallest (angular) distante to North
            var myIndex = -1;

            for(var i=0; i<HandleManager.handles.length-1; i++){
                var handleCenter = new Point(HandleManager.handles[i].x, HandleManager.handles[i].y);
                var angle = Util.getAngle(figureCenter,handleCenter); //get the angle between those 2 points 0=n

                if(angle <= Math.PI){ //quadrant I or II
                    if(angle < minAngleToNorth){
                        minAngleToNorth = angle;
                        closestToNorthIndex = i;
                    }
                }
                else{ //quadrant III or IV
                    if(2 * Math.PI - angle < minAngleToNorth){
                        minAngleToNorth = 2 * Math.PI - angle
                        closestToNorthIndex = i;
                    }
                }
            }

            //alert("closest to North is : " + closestToNorthIndex);
            for(var k=0; k<8; k++){ //there will always be 8 resize handlers
                //we do not use modulo 9 as we want to ignore the "rotate" handle
                if(HandleManager.handles[(closestToNorthIndex + k) % 8] == this){
                    return Handle.types[k]+"-resize";
                }
            }
            //end if Figure
        }  else if(HandleManager.shape instanceof Group){
            if(this.visible == false){
                return "";
            }
            // only rotate handle enabled for a group
            if(this.type == 'r' || this.type == 'rp'){
                return 'move';
            }

            //end if Group
        }

        return "";
    }
}


/**HandleManager will act like a Singleton (even not defined as one)
 * You will attach a Figure to it and he will be in charge with the figure manipulation
 **/
function HandleManager(){
}

/**The shape (figure or linearrow) that the HandleManager will manage*/
HandleManager.shape = null;

/**An {Array} with current handles*/
HandleManager.handles = [];

/**Selection rectangle (the rectangle upon the Handles will stay in case of a Figure/Group)*/
HandleManager.selectRect = null;

/**Currently selected handle*/
HandleManager.handleSelectedIndex = -1;

/**Distance from shape where to draw the handles*/
HandleManager.handleOffset = 0;//JS: I want handles to be on figure corners, because then we can correctly see figure with no stroke (was 10)

/**Get selected handle or null if no handler selected*/
HandleManager.handleGetSelected = function(){
    if(HandleManager.handleSelectedIndex!=-1){
      return HandleManager.handles[HandleManager.handleSelectedIndex];
    }
    return null;
}

/**Use this method to set a new shape (Figure or Connetor)  to this manager.
 * Every time a new figure is set, old handles will dissapear (got erased by new figure's handles)
 **/
HandleManager.shapeSet = function(shape){

    HandleManager.shape = shape;

    //1. clear old/previous handles
    HandleManager.handles = [];

    if(shape instanceof Figure || shape instanceof Group){
        //find Figure's angle
        var angle = Util.getAngle(HandleManager.shape.rotationCoords[0], HandleManager.shape.rotationCoords[1]);

        //rotate it back to "normal" space (from current space)
        HandleManager.shape.transform(Matrix.rotationMatrix(-angle), false);
        HandleManager.selectRect = new Polygon();

        //construct bounds of the Figure in "normal" space
        var bounds = HandleManager.shape.getBounds();
        HandleManager.selectRect.points = [];
        if(shape instanceof Group)
        {
            var p1 = selectionArea.points[0];
            var p2 = selectionArea.points[1];
            var p3 = selectionArea.points[2];
            var p4 = selectionArea.points[3];
            HandleManager.selectRect.addPoint(p1); //top left
            HandleManager.selectRect.addPoint(p2); //top right
            HandleManager.selectRect.addPoint(p3); //bottom right
            HandleManager.selectRect.addPoint(p4); //bottom left
        }
        else
        {   
            
            HandleManager.selectRect.addPoint(new Point(bounds[0] - HandleManager.handleOffset, bounds[1] - HandleManager.handleOffset)); //top left
            HandleManager.selectRect.addPoint(new Point(bounds[2]+ HandleManager.handleOffset, bounds[1] - HandleManager.handleOffset)); //top right
            HandleManager.selectRect.addPoint(new Point(bounds[2] + HandleManager.handleOffset, bounds[3] + HandleManager.handleOffset)); //bottom right
            HandleManager.selectRect.addPoint(new Point(bounds[0] - HandleManager.handleOffset, bounds[3] + HandleManager.handleOffset)); //bottom left
        }

        ////console.log("Shape in Shapeset");
        ////console.log(shape);
        if(shape.name == "Pentagon" && shape.editPoints)
        {
            //HandleManager.selectRect.points = [];
            //now paint handles
            for(var i=0; i<shape.primitives[0].points.length; i++){
                var handle = new Handle(i); //NW
                handle.x = shape.primitives[0].points[i].x;
                handle.y = shape.primitives[0].points[i].y;
                HandleManager.handles.push(handle);
            }
            handle = new Handle("rp"); //Rotation
            handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
            //JS: because handleOffset is 0, we still need to see rotation handle
            if (HandleManager.handleOffset!=0){
                handle.y = bounds[1] - HandleManager.handleOffset * 1.5;
            }else{
                handle.y = bounds[1] - 30;
            }
            handle.visible =false;
            if(!(shape instanceof Group))
            {
                HandleManager.handles.push(handle);
            }
            /*//central point of the figure
            shape.rotationCoords[0] = new Point(
                bounds[0] + (bounds[2] - bounds[0]) / 2,
                bounds[1] + (bounds[3] - bounds[1]) / 2
            );*/
        }
        else if(shape.name == "Line")
        {
            //HandleManager.selectRect.points = [];
            //now paint handles
            var handle = new Handle(0); //NW
                handle.x = shape.primitives[0].startPoint.x;
                handle.y = shape.primitives[0].startPoint.y;
                HandleManager.handles.push(handle);
   
            var handle = new Handle(1); //NW
                handle.x = shape.primitives[0].endPoint.x;
                handle.y = shape.primitives[0].endPoint.y;
                HandleManager.handles.push(handle);
   
        }
        else if(shape.name == "Angle")
        {
            //HandleManager.selectRect.points = [];
            //now paint handles
            var handle = new Handle("AnglePoint1"); //NW
                handle.x = shape.primitives[0].points[0].x;
                handle.y = shape.primitives[0].points[0].y;
                HandleManager.handles.push(handle);
   
            var handle = new Handle("AnglePoint2"); //NW
                handle.x = shape.primitives[0].points[2].x;
                handle.y = shape.primitives[0].points[2].y;
                HandleManager.handles.push(handle);
   
        }
        else
        {
            bounds = HandleManager.selectRect.getBounds();
            
            //update current handles
            var handle = new Handle("nw"); //NW
            handle.x = bounds[0];
            handle.y = bounds[1];
            HandleManager.handles.push(handle);

            handle = new Handle("n"); //N
            handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
            handle.y = bounds[1];
            HandleManager.handles.push(handle);

            handle = new Handle("ne"); //NE
            handle.x = bounds[2];
            handle.y = bounds[1];
            HandleManager.handles.push(handle);

            handle = new Handle("e"); //E
            handle.x = bounds[2];
            handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
            HandleManager.handles.push(handle);

            handle = new Handle("se"); //SE
            handle.x = bounds[2];
            handle.y = bounds[3];
            HandleManager.handles.push(handle);

            handle = new Handle("s"); //S
            handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
            handle.y = bounds[3];
            HandleManager.handles.push(handle);

            handle = new Handle("sw"); //SW
            handle.x = bounds[0];
            handle.y = bounds[3];
            HandleManager.handles.push(handle);

            handle = new Handle("w"); //W
            handle.x = bounds[0];
            handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
            HandleManager.handles.push(handle);

            handle = new Handle("r"); //Rotation
            handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
            //JS: because handleOffset is 0, we still need to see rotation handle
            if (HandleManager.handleOffset!=0){
                handle.y = bounds[1] - HandleManager.handleOffset * 1.5;
            }else{
                handle.y = bounds[1] - 30;
            }
            if(!(shape instanceof Group))
            {
                HandleManager.handles.push(handle);
            }
            if(shape.name == "Text")
            if(!HandleManager.shape.primitives[1].arrow)
            {
                handle = new Handle("A"); //Rotation
                handle.x = bounds[2];
                //JS: because handleOffset is 0, we still need to see rotation handle
                if (HandleManager.handleOffset!=0){
                    handle.y = bounds[1] - HandleManager.handleOffset * 2.5;
                }else{
                    handle.y = bounds[1] - 45;
                }
                HandleManager.handles.push(handle);
            }
            else
            {
                handle = new Handle("A"); //Rotation
                handle.x = HandleManager.shape.primitives[1].endPoint.x;
                handle.y = HandleManager.shape.primitives[1].endPoint.y;
                HandleManager.handles.push(handle);
            }
        }

            

            HandleManager.selectRect.transform(Matrix.rotationMatrix(angle));

            //rotate figure from "normal" space to current space
            HandleManager.shape.transform(Matrix.rotationMatrix(angle),false);
            if(shape instanceof Figure){
                if(shape.primitives[0] instanceof Text && shape.primitives.length == 1){
                    for(var i = 0; i < HandleManager.handles.length-1; i++){
                        HandleManager.handles[i].visible = false;
                    }
                }
            }
            //now transform the handles from "normal" space too
            for(var i=0; i<HandleManager.handles.length; i++){
                if(this.type!='A'&&this.type!='Protractor_startPoint'&&this.type!='Protractor_endPoint')
                    HandleManager.handles[i].transform(Matrix.rotationMatrix(angle));
            }
        
    }
}

/**Returns all handles for a shape (figure or linearrow).
 **/
HandleManager.handleGetAll = function(){
    return HandleManager.handles;
}

/**Returns the handle from a certain coordinates
 ***/
HandleManager.handleGet = function(x,y){
    for(var i=0; i<HandleManager.handles.length; i++){
        if(HandleManager.handles[i].contains(x,y)){
            return HandleManager.handles[i];
        }
    }
    return null;
}

/**
 *Select the handle from a certain coordinates
 **/
HandleManager.handleSelectXY = function(x,y){
    HandleManager.handleSelectedIndex=-1;
    for (var i=0; i<HandleManager.handles.length; i++){
        if(HandleManager.handles[i].contains(x,y)){
            HandleManager.handleSelectedIndex = i;
        }
    }
}

/**
 *Clear HandleManager.
 **/
HandleManager.clear = function(){
    HandleManager.handleSelectedIndex = -1;
    HandleManager.shape = null;
    HandleManager.handles = [];
}

/**Paint the Handles, actually the HandleManager will delegate each paint to
 **/
HandleManager.paint = function(context){
    var handles = HandleManager.handleGetAll(); //calling this sets the coordinates

    //paint first the selection rectangle
    context.save();

    //paint selection rectangle (if present - only for Figure and Group)
    if(HandleManager.selectRect != null && HandleManager.shape!=null && HandleManager.shape.name !="Angle" && HandleManager.shape.name !="Ruler" && HandleManager.shape.name !="Protractor" && HandleManager.shape.name !="Compass" && HandleManager.shape.name !="Line"){
        //alert("Handle manager paint!");
        HandleManager.selectRect.style.strokeStyle = "grey";
        HandleManager.selectRect.style.lineWidth = defaultThinLineWidth;
        HandleManager.selectRect.paint(context);
    }

    //now paint handles
    for(var i=0; i<handles.length; i++){
        if(handles[i].visible == true){
            handles[i].paint(context);
        }
    }
    context.restore()
}
/*To get the short distance from handles */
HandleManager.getShortHandle = function(point){
    var handles = HandleManager.handleGetAll(); //calling this sets the coordinates
    if(Util.getLength(handles[3],point)<=Util.getLength(handles[7],point))
        return handles[3];
    else
        return handles[7];
}
/**HandleManager will act like a Singleton (even not defined as one)
 * You will attach a Figure to it and he will be in charge with the figure manipulation
 **/
function AppHandleManager(){
  /**The shape (figure or linearrow) that the HandleManager will manage*/
  this.shape = null;

  /**An {Array} with current handles*/
  this.handles = [];

  /**Selection rectangle (the rectangle upon the Handles will stay in case of a Figure/Group)*/
  this.selectRect = null;

  /**Currently selected handle*/
  this.handleSelectedIndex = -1;

  /**Distance from shape where to draw the handles*/
  this.handleOffset = 0;//JS: I want handles to be on figure corners, because then we can correctly see figure with no stroke (was 10)
}

AppHandleManager.prototype = {
    
    constructor : AppHandleManager,

    /**Get selected handle or null if no handler selected*/
    handleGetSelected : function(){
      if(this.handleSelectedIndex!=-1){
          return this.handles[this.handleSelectedIndex];
      }
      return null;
    },
    /**Use this method to set a new shape (Figure or Connetor)  to this manager.
     * Every time a new figure is set, old handles will dissapear (got erased by new figure's handles)
     **/
    shapeSet : function(shape){
      
        this.shape = shape;

        //1. clear old/previous handles
        this.handles = [];

        if(shape instanceof Figure || shape instanceof Group){
            //find Figure's angle
            var angle = Util.getAngle(this.shape.rotationCoords[0], this.shape.rotationCoords[1]);
            
            var handle = null;
            //rotate it back to "normal" space (from current space)
            this.shape.transform(Matrix.rotationMatrix(-angle), false);
            this.selectRect = new Polygon();

            //construct bounds of the Figure in "normal" space
            var bounds = this.shape.getBounds();
            ////console.log("bounds",bounds)
            this.selectRect.points = [];
            if(shape instanceof Group)
            {
                var p1 = selectionArea.points[0];
                var p2 = selectionArea.points[1];
                var p3 = selectionArea.points[2];
                var p4 = selectionArea.points[3];
                this.selectRect.addPoint(p1); //top left
                this.selectRect.addPoint(p2); //top right
                this.selectRect.addPoint(p3); //bottom right
                this.selectRect.addPoint(p4); //bottom left
            }
            else
            {
                this.selectRect.addPoint(new Point(bounds[0] - this.handleOffset, bounds[1] - this.handleOffset)); //top left
                this.selectRect.addPoint(new Point(bounds[2]+ this.handleOffset, bounds[1] - this.handleOffset)); //top right
                this.selectRect.addPoint(new Point(bounds[2] + this.handleOffset, bounds[3] + this.handleOffset)); //bottom right
                this.selectRect.addPoint(new Point(bounds[0] - this.handleOffset, bounds[3] + this.handleOffset)); //bottom left
            }

            if(shape.name == "Curtain")
            {
              var type = "Curtain";
              handle = new Handle("Curtain_n"); //N
              handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
              handle.y = bounds[1]+10;
              handle.HandleManager = type;
              this.handles.push(handle);

              handle = new Handle("Curtain_e"); //E
              handle.x = bounds[2]-10;
              handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
              handle.HandleManager = type;
              this.handles.push(handle);

              handle = new Handle("Curtain_s"); //S
              handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
              handle.y = bounds[3]-10;
              handle.HandleManager = type;
              this.handles.push(handle);

              handle = new Handle("Curtain_w"); //W
              handle.x = bounds[0]+10;
              handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
              handle.HandleManager = type;
              this.handles.push(handle);

              handle = new Handle("Curtain_close"); //S
              handle.x = bounds[2]-10;
              handle.y = bounds[1]+10;
              handle.HandleManager = type;
              this.handles.push(handle);
            }
            else if(shape.name == "Compass")
            {
                var type = "Compass";
                bounds = this.selectRect.getBounds();
                handle = new Handle("Compass_rotatePoint"); //To rotate the Pencil
                handle.x = Compass.RotatePoint.primitives[0].x;
                handle.y = Compass.RotatePoint.primitives[0].y;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Compass_drawPoint"); //To draw the line
                handle.x = Compass.DrawPoint.primitives[0].x;
                handle.y = Compass.DrawPoint.primitives[0].y;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Compass_resizePoint"); //To resize the Compass radius
                handle.x = Compass.ResizePoint.primitives[0].x;
                handle.y = Compass.ResizePoint.primitives[0].y;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Compass_closePoint"); //To close the Compass
                handle.x = Compass.ClosePoint.primitives[0].x;
                handle.y = Compass.ClosePoint.primitives[0].y;
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Compass_changeColor"); //To change the color of pencil
                handle.x = Compass.ClosePoint.primitives[0].x;
                handle.y = Compass.ClosePoint.primitives[0].x;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Compass_color_blackPoint"); //To change the color of pencil
                handle.x = Compass.BlackPoint.primitives[0].x;
                handle.y = Compass.BlackPoint.primitives[0].y;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Compass_color_redPoint"); //To change the color of pencil
                handle.x = Compass.RedPoint.primitives[0].x;
                handle.y = Compass.RedPoint.primitives[0].y;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Compass_color_greenPoint"); //To change the color of pencil
                handle.x = Compass.GreenPoint.primitives[0].x;
                handle.y = Compass.GreenPoint.primitives[0].y;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Compass_color_bluePoint"); //To change the color of pencil
                handle.x = Compass.BluePoint.primitives[0].x;
                handle.y = Compass.BluePoint.primitives[0].y;
                handle.HandleManager = type;
                this.handles.push(handle);

            }
            else if(shape.name == "Protractor")
            {
                var type = "Protractor";
                bounds = this.selectRect.getBounds();
                handle = new Handle("Protractor_startPoint"); //To close the ruler
                handle.x = Protractor.startPoint.x;
                handle.y = Protractor.startPoint.y;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Protractor_endPoint"); //To close the ruler
                handle.x = Protractor.endPoint.x;
                handle.y = Protractor.endPoint.y;
                handle.HandleManager = type;
                this.handles.push(handle);
                handle = new Handle("Protractor_rotate"); //Rotation
                handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
                //JS: because handleOffset is 0, we still need to see rotation handle
                handle.y = bounds[1]+10;
                handle.HandleManager = type;
                this.handles.push(handle);
                Protractor.topX = handle.x;
                Protractor.topY = handle.y;
                
                handle = new Handle("Protractor_createAngle"); //To rotate the ruler
                handle.x = bounds[2];
                handle.y = bounds[3];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Protractor_close"); //To rotate the ruler
                handle.x = bounds[2];
                handle.y = bounds[3];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Protractor_reset"); //To rotate the ruler
                handle.x = bounds[2];
                handle.y = bounds[3];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Protractor_angleDisplay"); //To rotate the ruler
                handle.x = bounds[0];
                handle.y = bounds[3];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Protractor_angleDownArrow"); //To rotate the ruler
                handle.x = bounds[0];
                handle.y = bounds[3];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Protractor_angleUpArrow"); //To rotate the ruler
                handle.x = bounds[0];
                handle.y = bounds[3];
                handle.HandleManager = type;
                this.handles.push(handle);
            }
            else if(shape.name == "Ruler")
            {
                var type = "Ruler";
                bounds = this.selectRect.getBounds();
                
                //update current handles
                
                handle = new Handle("Ruler_close"); //To close the ruler
                handle.x = bounds[2];
                handle.y = bounds[1];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_scale"); //To scale the ruler
                handle.x = bounds[2];
                handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_draw"); //to draw the line
                handle.x = bounds[2]-22;
                handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_reset"); //to draw the line
                handle.x = bounds[2]-22;
                handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_rotate"); //To rotate the ruler
                handle.x = bounds[2];
                handle.y = bounds[3];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_cm_inch"); //To swap the measurement units
                handle.x = bounds[0]+5;
                handle.y = bounds[1]+(bounds[3]-bounds[1])/2;
                //Ruler.seekerStarting = new Point(handle.x,handle.y);
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_top"); //canvas space to draw the line on top
                handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
                handle.y = bounds[1];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_bottom"); //canvas space to draw the line on bottom
                handle.x = bounds[0]+(bounds[2]-bounds[0])/2;
                handle.y = bounds[3];
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_seeker1"); //W
                handle.x = Ruler.seeker1Point.x;
                handle.y = Ruler.seeker1Point.y;
                handle.HandleManager = type;
                this.handles.push(handle);

                handle = new Handle("Ruler_seeker2"); //W
                handle.x = Ruler.seeker2Point.x;
                handle.y = Ruler.seeker2Point.y;
                handle.HandleManager = type;
                this.handles.push(handle);
            }
            
            this.selectRect.transform(Matrix.rotationMatrix(angle));

            //rotate figure from "normal" space to current space
            this.shape.transform(Matrix.rotationMatrix(angle),false);
            if(shape instanceof Figure){
                if(shape.primitives[0] instanceof Text && shape.primitives.length == 1){
                    for(var i = 0; i < this.handles.length-1; i++){
                        this.handles[i].visible = false;
                    }
                }
            }
            //now transform the handles from "normal" space too
            for(var i=0; i<this.handles.length; i++){
                if(this.type!='A'&&this.type!='Protractor_startPoint'&&this.type!='Protractor_endPoint')
                    this.handles[i].transform(Matrix.rotationMatrix(angle));
            }
            
        }
    },

    /**Returns all handles for a shape (figure or linearrow).
     **/
    handleGetAll : function(){
        return this.handles;
    },

    /**Returns the handle from a certain coordinates
     ***/
    handleGet : function(x,y){
        for(var i=0; i<this.handles.length; i++){
            if(this.handles[i].contains(x,y)){
                return this.handles[i];
            }
        }
        return null;
    },

    /**
     *Select the handle from a certain coordinates
     **/
    handleSelectXY : function(x,y){
        this.handleSelectedIndex=-1;
        for (var i=0; i<this.handles.length; i++){
            if(this.handles[i].contains(x,y)){
                this.handleSelectedIndex = i;
            }
        }
    },

    /**
     *Clear this.
     **/
    clear : function(){
        this.handleSelectedIndex = -1;
        this.shape = null;
        this.handles = [];
    },

    /**Paint the Handles, actually the this will delegate each paint to
     **/
    paint : function(context){
        var handles = this.handleGetAll(); //calling this sets the coordinates

        //paint first the selection rectangle
        context.save();

        //paint selection rectangle (if present - only for Figure and Group)
        if(this.selectRect != null && this.shape.name !="Angle" && this.shape.name !="Ruler" && this.shape.name !="Protractor" && this.shape.name !="Compass" && this.shape.name !="Line"){
            //alert("Handle manager paint!");
            this.selectRect.style.strokeStyle = "grey";
            this.selectRect.style.lineWidth = defaultThinLineWidth;
            this.selectRect.paint(context);
        }

        //now paint handles
        for(var i=0; i<handles.length; i++){
            if(handles[i].visible == true){
                handles[i].paint(context);
            }
        }
        context.restore()
    },
    /*To get the short distance from handles */
    getShortHandle : function(point){
        var handles = this.handleGetAll(); //calling this sets the coordinates
        if(Util.getLength(handles[3],point)<=Util.getLength(handles[7],point))
            return handles[3];
        else
            return handles[7];
    }

};





/* Apps */
/** Curtain Tool */
function Curtain(){

}

Curtain.figure = null;
Curtain.x = null;
Curtain.y = null;
Curtain.firstExecute = true;
Curtain.visibility = false;
Curtain.HandleManager = new AppHandleManager();

Curtain.set = function(){
  
  var main_canvas = getCanvas();
  if(Curtain.firstExecute)
  {
    Curtain.x = main_canvas.width/2;
    Curtain.y = main_canvas.height/2;
    Curtain.firstExecute = false;
  }

  var x1 = 0,x2 = main_canvas.width;
  var y1 = 0,y2 = main_canvas.height;

  var f = new Figure("Curtain",true);
  var r = new Polygon();
  r.addPoint(new Point(x1,y1));
  r.addPoint(new Point(x2,y1));
  r.addPoint(new Point(x2,y2));
  r.addPoint(new Point(x1,y2));
  r.style = new Style();
  r.style.fillStyle = "rgba(0,0,0,0.9)";
  f.addPrimitive(r);

  /*Finalizing the Curtain Figure*/
  f.finalise();
  
  Curtain.figure = f;

}

Curtain.paint = function(context){
  context.save();
  Curtain.figure.paint(context);
  context.restore();
}

Curtain.close = function(){
  Curtain.visibility = false;
  Curtain.firstExecute = true;
  Curtain.set();
}
Curtain.onMouseDown = function(x,y){
    var exeFlag = false;
    if(Curtain.HandleManager.handleGet(x, y) != null)
    { 
      Curtain.HandleManager.handleSelectXY(x, y);
      if(Curtain.HandleManager.handles[Curtain.HandleManager.handleSelectedIndex].type == "Curtain_close")
      {
        Curtain.close();
      }  
      return true;
    }
  return false;      
}

Curtain.onMouseUp = function(x,y)
{
    Curtain.HandleManager.handleSelectedIndex = -1; //reset only the handler....the Figure is still selected
    return false;
}

Curtain.onMouseMove = function(x,y,touchState){
      var canvas = getCanvas();
      var canvas_temp = getCanvasTemp();
      var ctx_temp = canvas_temp.getContext('2d');
      var ctx_pencil = getCanvasPencil().getContext('2d');
      if(mousePressed||touchState){ // mouse is (at least was) pressed
          if(lastMove != null){ //we are in dragging mode
              var handle = Curtain.HandleManager.handleGetSelected();
              if(handle != null){ //We are over a Handle of selected Figure               
                  canvas.style.cursor = handle.getCursor();
                  canvas_pencil.style.cursor = handle.getCursor();
                  if(handle.type=="Ruler_top")
                  {

                  }
                  handle.action(lastMove,x,y);
                  redraw = true;
                  return true;
                  Log.info('onMouseMove() - STATE_FIGURE_SELECTED + drag - mouse cursor = ' + canvas.style.cursor);
              }
          }
      }
      else{ //no mouse press (only change cursor)
          var handle = Curtain.HandleManager.handleGet(x,y); //TODO: we should be able to replace it with .getSelectedHandle()
          if(handle != null){ //We are over a Handle of selected Figure               
              canvas.style.cursor = handle.getCursor();
              canvas_pencil.style.cursor = handle.getCursor();
              return true;
              Log.info('onMouseMove() - STATE_FIGURE_SELECTED + over a Handler = change cursor to: ' + canvas.style.cursor);
          }
          else{
             
                  canvas.style.cursor = 'default';  
                  canvas_pencil.style.cursor = 'default';                         
                  Log.info("onMouseMove() + STATE_FIGURE_SELECTED + over nothin = change cursor to default");
              
          }
      }
    return false;
}

/* Ruler.js */
function Ruler(){

}

Ruler.figure = null;
Ruler.width = 300;
Ruler.height = 100;
Ruler.firstExecute = true;
Ruler.x = null;
Ruler.y = null;
Ruler.rotationAngle = null;
Ruler.transformPoint = null;
Ruler.draw = false;
Ruler.cm_inch = "cm_top";
Ruler.startPoint = null;
Ruler.endPoint = null;
Ruler.actualStartPoint = null;
Ruler.actualEndPoint = null;
Ruler.lineBounds = null;
Ruler.centerPoint = null;
Ruler.angle = 0;
Ruler.distance_cm = 0;
Ruler.distance_in = 0;
Ruler.seeker1 = 30;
Ruler.seeker1Point = null;
Ruler.seeker2Point = null;
Ruler.seeker2 = 70;
Ruler.seekerStarting = null;
Ruler.tempSeekerStarting = null;
Ruler.drag = false;
Ruler.HandleManager = new AppHandleManager();
Ruler.CM_IN_TEXT = "cm";
Ruler.set = function(){
    var main_canvas = getCanvas();
    var x =  Ruler.x;
    var y =  Ruler.y;
    if(Ruler.firstExecute)
    {
        var x =  main_canvas.width/2 - 150;
        var y =  main_canvas.height/2 - 25;
        Ruler.x = x;
        Ruler.y = y;
        Ruler.width = 300;
        Ruler.seekerStarting = new Point(x,y+Ruler.height/2);
        Ruler.rotationAngle = null;
        Ruler.transformPoint = null;
        Ruler.draw = false;
        Ruler.cm_inch = "cm_top";
        Ruler.startPoint = null;
        Ruler.endPoint = null;
        Ruler.actualStartPoint = null;
        Ruler.actualEndPoint = null;
        Ruler.lineBounds = null;
        Ruler.centerPoint = null;
        Ruler.angle = 0;
        Ruler.distance_cm = 0;
        Ruler.distance_in = 0;
        Ruler.seeker1 = 30;
        Ruler.seeker1Point = null;
        Ruler.seeker2Point = null;
        Ruler.seeker2 = 70;
        Ruler.tempSeekerStarting = null;
        Ruler.drag = false;
    }

    var f = new Figure("Ruler",true);
    f.style.fillStyle = "rgb(221, 232, 243)";
    f.style.strokeStyle = "none";
    
    f.style.lineWidth = 0;
    
    var r = new Polygon();
    r.addPoint(new Point(x, y));
    r.addPoint(new Point(x + Ruler.width, y));
    r.addPoint(new Point(x + Ruler.width, y + Ruler.height));
    r.addPoint(new Point(x, y + Ruler.height));

    f.addPrimitive(r);
    var r = new Polygon();
    r.addPoint(new Point(x, y));
    r.addPoint(new Point(x-5, y));
    r.addPoint(new Point(x-5, y + Ruler.height));
    r.addPoint(new Point(x, y + Ruler.height));
    r.style.fillStyle = "rgb(42, 43, 45)";
    r.style.strokeStyle = "rgb(42, 43, 45)";
    //f.addPrimitive(r);
    var tempX = x;
    var tempY = y;
    var distance = 0;
    if(Ruler.cm_inch == "cm_top")
    {
        for(var i = 1; i<Ruler.width/2; i++)
        {
            tempX = x + (i*4);
            tempY = y;
            var start = new Point(tempX,tempY);
            var end = new Point(tempX,tempY+5);
            if(i%10==0)
            {
                end = new Point(tempX,tempY+10);
                var text = new OrdinaryText((i/10).toString(), tempX, tempY+20, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER);
                text.style.fillStyle = FigureDefaults.textColor;
                f.addPrimitive(text);
            }
            else if(i%5 == 0){
            end = new Point(tempX,tempY+7.5);
            var line = new Line(start,end);
            f.addPrimitive(line);
        }  
    }
        var textX = x;
        var textY = y+25;
       
        for(var i = 1; i<Ruler.width/6.35; i++)
        {
            tempX = x + (i*6.35);
            tempY = y+100;
            var start = new Point(tempX,tempY);
            var end = new Point(tempX,tempY-4);
            if(i%16==0)
            {
                end = new Point(tempX,tempY-10);
                var text = new OrdinaryText((i/16).toString(), tempX, tempY-30, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
                text.style.fillStyle = FigureDefaults.textColor;
                f.addPrimitive(text);
            }
            else if(i%8 == 0)
                end = new Point(tempX,tempY-8.5);
            
            else if(i%2 == 0)
                end = new Point(tempX,tempY-6);
            var line = new Line(start,end);
            f.addPrimitive(line);
        }

    }
    else
    {
        for(var i = 1; i<Ruler.width/4; i++)
        {
            tempX = x + (i*4);
            tempY = y+100;
            var start = new Point(tempX,tempY);
            var end = new Point(tempX,tempY-5);
            if(i%10==0)
            {
                end = new Point(tempX,tempY-10);
                var text = new OrdinaryText((i/10).toString(), tempX, tempY-30, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
                text.style.fillStyle = FigureDefaults.textColor;
                f.addPrimitive(text);
            }
            else if(i%5 == 0)
                end = new Point(tempX,tempY-7.5);
            var line = new Line(start,end);
            f.addPrimitive(line);
        }  

        var textX = x;
        var textY = y+25;
       
        for(var i = 1; i<Ruler.width/6.35; i++)
        {
            tempX = x + (i*6.35);
            tempY = y;
            var start = new Point(tempX,tempY);
            var end = new Point(tempX,tempY+4);
            if(i%16==0)
            {
                end = new Point(tempX,tempY+10);
                var text = new OrdinaryText((i/16).toString(), tempX, tempY+20, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
                text.style.fillStyle = FigureDefaults.textColor;
                f.addPrimitive(text);
            }
            else if(i%8 == 0)
                end = new Point(tempX,tempY+8.5);
            
            else if(i%2 == 0)
                end = new Point(tempX,tempY+6);
            var line = new Line(start,end);
            f.addPrimitive(line);
        }

    }
    if(Ruler.figure != null)
    {
        var angle = Math.round(Util.getAngle(Ruler.figure.primitives[0].points[0],Ruler.figure.primitives[0].points[1])*180/Math.PI);
        if(angle>270)
            Ruler.angle = angle - 450;
        else
            Ruler.angle = angle - 90;
    }
    if(Ruler.seeker2>Ruler.width)
    {
      Ruler.seeker2 = Ruler.width-30;
    }

    Ruler.distance_cm = (((Ruler.seeker2-Ruler.seeker1)/40)).toFixed(2); 


    var text = new OrdinaryText(Ruler.angle+"° ",x + (Ruler.width/2)-65, y + Ruler.height/2, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
    text.style.fillStyle = FigureDefaults.textColor;
    f.addPrimitive(text);
    var text = new OrdinaryText(Ruler.distance_cm+' cm', x + (Ruler.width/2)-20, y + Ruler.height/2, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
    text.style.fillStyle = FigureDefaults.textColor;
    f.addPrimitive(text);
    var text = new OrdinaryText((Ruler.distance_cm*0.39370).toFixed(2) + " in", x + (Ruler.width/2)+50, y + Ruler.height/2, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
    text.style.fillStyle = FigureDefaults.textColor;
    f.addPrimitive(text);
    
    f.finalise();

    Ruler.figure = f;
    
    if(!Ruler.firstExecute&&Ruler.rotationAngle!=null)
    {
       Ruler.figure.transform(Ruler.getRotationMatrix());
    }
    var angle = Util.getAngle(Ruler.figure.primitives[0].points[0],Ruler.figure.primitives[0].points[1]);
    Ruler.seeker1Point = Util.getEndPoint(Ruler.seekerStarting,Ruler.seeker1,angle);   
    Ruler.seeker2Point = Util.getEndPoint(Ruler.seekerStarting,Ruler.seeker2,angle); 
    if(Ruler.firstExecute)
    {
      Ruler.firstExecute = false;   
      Ruler.HandleManager.shapeSet(Ruler.figure);
    }
}
Ruler.setSeekerStarting =function(x,y,distance){
    var center = Ruler.figure.primitives[0].points[0];
    var startAngle = Util.getAngle(Ruler.figure.primitives[0].points[1],center);//new Point(lastMove[0],lastMove[1])
    Ruler.tempSeekerStarting = Util.getEndPoint(new Point(x,y),distance,startAngle);
}
Ruler.getRotationMatrix = function(){
    var center = Ruler.figure.primitives[0].points[0];
    var endAngle = Ruler.rotationAngle;
    var startAngle = Util.getAngle(center,Ruler.figure.primitives[0].points[1]);//new Point(lastMove[0],lastMove[1])
    var rotAngle = endAngle - startAngle;
    return  Matrix.mergeTransformations(
        Matrix.translationMatrix(-center.x, -center.y), 
        Matrix.rotationMatrix(rotAngle), 
        Matrix.translationMatrix(center.x,center.y)
        );
}
Ruler.resetAngle = function()
{
    var center = Ruler.figure.primitives[0].points[0];
    var rotAngle = (Math.PI/2)-Util.getAngle(center,Ruler.figure.primitives[0].points[1]);
    var equivTransfMatrix = Matrix.mergeTransformations(
        Matrix.translationMatrix(-center.x, -center.y), 
        Matrix.rotationMatrix(rotAngle), 
        Matrix.translationMatrix(center.x,center.y)
        );
    Ruler.HandleManager.shape.transform(equivTransfMatrix);
    Ruler.rotationAngle = Util.getAngle(center,Ruler.figure.primitives[0].points[1]);
    Ruler.seekerStarting.transform(equivTransfMatrix);
    Ruler.seeker1Point.transform(equivTransfMatrix);
    Ruler.seeker2Point.transform(equivTransfMatrix);
}
Ruler.paint = function(context){
    //paint first the selection rectangle
    context.save();
    Ruler.figure.paint(context);
    context.restore();
}
Ruler.close = function(){
  var index = state_apps.indexOf(STATE_RULER_APP);
  if (index > -1) 
    state_apps.splice(index, 1);
  Ruler.firstExecute = true;
  Ruler.set();
}
Ruler.onMouseDown = function(x,y){
    var exeFlag = false;
    if(Ruler.HandleManager.handleGet(x, y) != null)
    { 
      Ruler.drag = false;
      Ruler.HandleManager.handleSelectXY(x, y);
      if(Ruler.HandleManager.handles[Ruler.HandleManager.handleSelectedIndex].type == "Ruler_close")
      {
        Ruler.close();
      }  
      else if(Ruler.HandleManager.handles[Ruler.HandleManager.handleSelectedIndex].type == "Ruler_reset")
      {
        Ruler.resetAngle();
      }  
      else if(Ruler.HandleManager.handles[Ruler.HandleManager.handleSelectedIndex].type == "Ruler_draw")
      {
        Ruler.draw = true;
      }  
      else if(Ruler.HandleManager.handles[Ruler.HandleManager.handleSelectedIndex].type == "Ruler_cm_inch")
      {
          if(Ruler.cm_inch == "cm_top")
          {
            Ruler.cm_inch = "inch_top";
            Ruler.CM_IN_TEXT = "in";
          } 
          else
          {
            Ruler.cm_inch = "cm_top";
            Ruler.CM_IN_TEXT = "cm";
          }    
          Ruler.set();
      }
      else if(Ruler.HandleManager.handles[Ruler.HandleManager.handleSelectedIndex].type == "Ruler_seeker1"||Ruler.HandleManager.handles[Ruler.HandleManager.handleSelectedIndex].type == "Ruler_seeker2")
      {
        Ruler.setSeekerStarting(x,y);
      }
      return true;
    }
    else if(Util.isPointInside(new Point(x,y),Ruler.HandleManager.shape.primitives[0].points))
    {
      ////console.log("Clcik");
      Ruler.drag = true;
      ////console.log(Ruler.drag);
      return true;
    }
  return false;      
}

Ruler.onMouseUp = function(x,y)
{
      Ruler.HandleManager.handleSelectedIndex = -1; //reset only the handler....the Figure is still selected
      Ruler.drag = false;
      if(Ruler.draw && Ruler.actualStartPoint != null)
      {
          var cmdCreateFig = new FigureCreateCommand(window['figure_RulerLine'], Ruler.centerPoint.x, Ruler.centerPoint.y);
          cmdCreateFig.execute();
          History.addUndo(cmdCreateFig);
          ////console.log(Ruler.startPoint +" "+ Ruler.endPoint);
          ////console.log(Ruler.actualStartPoint +" "+ Ruler.actualEndPoint);
          Ruler.draw = false;
          Ruler.startPoint = null;
          Ruler.endPoint = null;
          Ruler.actualStartPoint = null;
          Ruler.actualEndPoint = null;
          setUpEditPanel(null);
          selectedFigureId = -1;
          state = STATE_NONE;
          return true;
      }
    return false;
}

Ruler.onMouseMove = function(x,y,touchState){
      var canvas = getCanvas();
      var canvas_temp = getCanvasTemp();
      var ctx_temp = canvas_temp.getContext('2d');
      var ctx_pencil = getCanvasPencil().getContext('2d');
      if(mousePressed||touchState){ // mouse is (at least was) pressed
          if(lastMove != null){ //we are in dragging mode
              var handle = Ruler.HandleManager.handleGetSelected();
              if(handle != null){ //We are over a Handle of selected Figure               
                  canvas.style.cursor = handle.getCursor();
                  canvas_pencil.style.cursor = handle.getCursor();
                  if(handle.type=="Ruler_top")
                  {

                  }
                  handle.action(lastMove,x,y);
                  redraw = true;
                  return true;
                  Log.info('onMouseMove() - STATE_FIGURE_SELECTED + drag - mouse cursor = ' + canvas.style.cursor);
              }
              else{ /*no handle is selected*/
                ////console.log("Draag "+Ruler.drag);
                  if(Ruler.drag)
                  {

                      canvas.style.cursor = 'move';
                      canvas_pencil.style.cursor = 'move';
                      var translateMatrix = generateMoveMatrix(Ruler.figure, x, y);
                      Ruler.figure.transform(translateMatrix);
                      Ruler.seekerStarting.transform(translateMatrix);
                      Ruler.seeker1Point.transform(translateMatrix);
                      Ruler.seeker2Point.transform(translateMatrix);
          
                      Ruler.x = Ruler.figure.primitives[0].points[0].x;
                      Ruler.y = Ruler.figure.primitives[0].points[0].y;
                      redraw = true;
                      return true;
                  }
              }
          }
      }
      else{ //no mouse press (only change cursor)
          var handle = Ruler.HandleManager.handleGet(x,y); //TODO: we should be able to replace it with .getSelectedHandle()
          var handlePoints = []; 
          var handlers = Ruler.HandleManager.handleGetAll();
          for(var iterator=0; iterator<handlers.length; iterator++){
              if(handlers[iterator].type!="r")
                  handlePoints.push(new Point(handlers[iterator].x,handlers[iterator].y));
          }
          
          
          if(handle != null){ //We are over a Handle of selected Figure               
              canvas.style.cursor = handle.getCursor();
              canvas_pencil.style.cursor = handle.getCursor();
              return true;
              Log.info('onMouseMove() - STATE_FIGURE_SELECTED + over a Handler = change cursor to: ' + canvas.style.cursor);
          }
          else if(Util.isPointInside(new Point(x,y),Ruler.HandleManager.shape.primitives[0].points))
          {
              canvas.style.cursor = 'move';
              canvas_pencil.style.cursor = 'move';
              return true;
          }
          else{
             
                  canvas.style.cursor = 'default';  
                  canvas_pencil.style.cursor = 'default';                         
                  Log.info("onMouseMove() + STATE_FIGURE_SELECTED + over nothin = change cursor to default");
              
          }
      }
    return false;
}

function figure_Gauge(x,y){
    // x=200;
    // y=300;
    var center = new Point(x,y);
    var startAngle = 270;
    var endAngle =  90;
    var outerText = 0;
    var innerText = 0;
    var f = new Figure("gauge");
    f.style.fillStyle = "rgba(255, 255, 255,0)";
    f.style.strokeStyle = "none";
    f.style.strokeStyle = "#a5aaae";
    f.style.lineWidth = 10;
    
    var c = new Arc(x, y, 170, 180, 360, false, 0);
    
    f.addPrimitive(c);
    var c = new Arc(x, y, 150, 180, 360, false, 0);
    f.addPrimitive(c);
    var c = new Arc(x, y, 70, 180, 360, false, 0);
    c.style.fillStyle = "rgb(128,128,128)";
    f.addPrimitive(c);
    
    for(var i = 1; i<20; i++)
    {
        //Draw the first Lines
    
        var start = Util.getEndPoint(center,150,(Math.PI/180)*startAngle);
        
        var end = Util.getEndPoint(start,10,(Math.PI/180)*endAngle);
        
        var line = new Line(start,end);
        f.addPrimitive(line);
        //Draw second lines
        
        var start = Util.getEndPoint(center,150+10,(Math.PI/180)*startAngle);
        var end = Util.getEndPoint(start,10,(Math.PI/180)*endAngle);
        
        var line = new Line(start,end);
        f.addPrimitive(line);
        //f.addPrimitive(center);
        //range number
        var outerTextPoint = Util.getEndPoint(start,25,(Math.PI/180)*endAngle);
        var text = new OrdinaryText(outerText.toString(), outerTextPoint.x, outerTextPoint.y, FigureDefaults.textFont, 12, false, Text.ALIGN_CENTER, 16,12);
        text.style.fillStyle = FigureDefaults.textColor;
        var rotAngle = (Math.PI/180)*(endAngle+180);
        var rotMat =   Matrix.mergeTransformations(
        Matrix.translationMatrix(-outerTextPoint.x, -outerTextPoint.y), 
        Matrix.rotationMatrix(rotAngle), 
        Matrix.translationMatrix(outerTextPoint.x,outerTextPoint.y)
        );
        text.transform(rotMat);
        f.addPrimitive(text);
        //Increments points for protractor 
        if(i>10)
        {
            
          startAngle+=10-360;
          
          endAngle+=10-360;
          
        }
        else
        {
          startAngle+=10;
          endAngle+=10;
        }
        outerText+=10;
        innerText+=10;
    }
    start_point =new Point(x,y);
    
    end_point = new Point(x,y);
    var line6 = new Line(start_point,end_point);
    f.startdata=start_point;
    //f.style.fillStyle="rgb(219,112,147)";
    line6.style.strokeStyle="rgb(219,112,147)";
    // f.addPoint(center);
    f.addPrimitive(line6);
    center.style.fillStyle="rgb(255,59,60)";
    f.addPrimitive(center);
    var c = new Arc(x, y, 20, 360, 180, false, 0);
    c.style.strokeStyle="rgb(219,112,147)";
    c.style.fillStyle="rgb(219,112,147)";
    f.addPrimitive(c);
    startAngle=270;
    endAngle=90;
    var outerText = 180;
    var innerText = 0;
    for(var i = 1; i<=36; i++)
    {
        //Draw the first Lines
        
        var start = Util.getEndPoint(center,150,(Math.PI/180)*startAngle);
        
        var end = Util.getEndPoint(start,10,(Math.PI/180)*endAngle);
        
        var line = new Line(start,end);
        f.addPrimitive(line);
        //Draw second lines
        var start = Util.getEndPoint(center,100,(Math.PI/180)*startAngle);
        var end = Util.getEndPoint(start,0,(Math.PI/180)*endAngle);
        
        var line = new Line(start,end);
        //f.addPrimitive(line);
        //Increments points for protractor 
        if(i>10)
        {
           
          startAngle+=5-360;
          
          endAngle+=5-360;
          
        }
        else
        {
          startAngle+=5;
          endAngle+=5;
        }
        outerText-=5;
        innerText+=5;
    }
    
    f.finalise();
    return f;
}

function Protractor()
{

}

Protractor.x = null;
Protractor.y = null;
Protractor.firstExecute = true;
Protractor.figure = null;
Protractor.startPoint = null;
Protractor.endPoint = null;
Protractor.rotationAngle = null;

Protractor.topX = null;
Protractor.topY = null;
Protractor.drag = false;
Protractor.selectedHandle = null;


Protractor.set = function()
{   
    
    var main_canvas = getCanvas();
    var x =  Protractor.x;
    var y =  Protractor.y;
    
    var radius1 = 178;
    var radius2 = 148;
    var radius3 = 104;
    var radius4 = 88;
    var radius5 = 44;

    if(Protractor.firstExecute)
    {
        Protractor.HandleManager = new AppHandleManager();
        
        var x =  main_canvas.width/2;
        var y =  main_canvas.height/2;
   
        Protractor.x = x;
        Protractor.y = y;
   
        Protractor.startPoint = null;
        Protractor.endPoint = null;
        Protractor.rotationAngle = null;

        Protractor.topX = null;
        Protractor.topY = null;
        Protractor.drag = false;
        Protractor.selectedHandle = null;
    }

    var f = new Figure("Protractor",true);
    f.style.fillStyle = "rgba(255, 255, 255,0)";
    f.style.strokeStyle = "none";
    f.style.strokeStyle = "#a5aaae";
    f.style.lineWidth = 5;
    //Draw the Bottom Rectangle
    var r = new Polygon();
    r.addPoint(new Point(x - (radius1), y + 40));
    r.addPoint(new Point(x + (radius1), y + 40));
    r.addPoint(new Point(x + (radius1), y + 50));
    r.addPoint(new Point(x - (radius1), y + 50));
    r.style.fillStyle = "rgba(42, 43, 45,1)";
    f.addPrimitive(r);
  
    var ifig = new ImageFrame("Protractor", x, y-91, true,false,false,WHITEBOARD.protractor_arrow_src);
    f.addPrimitive(ifig);
   
    var ifig1 = new ImageFrame("Protractor", x, y-91, true,false,false,WHITEBOARD.protractor_src);
    ifig1.style.globalCompositeOperation = "source-over";
    ifig1.style.globalAlpha = 0.3;
    f.addPrimitive(ifig1);
  
    var ifig2 = new ImageFrame("Protractor", x, y+30, true,false,false,WHITEBOARD.protractor_move_src);
    ifig2.style.globalCompositeOperation = "source-over";
    ifig2.style.globalAlpha = 0.5;
    f.addPrimitive(ifig2);
    
    var c = new Arc(Protractor.x, Protractor.y, radius1, 180, 360, false, 0);
    c.style.fillStyle = "rgba(252,239,197,0)";
    f.addPrimitive(c);
    
    var c = new Arc(Protractor.x, Protractor.y, radius2, 180, 360, false, 0);
    f.addPrimitive(c);
 
    var c = new Arc(Protractor.x, Protractor.y, radius3, 180, 360, false, 0);
    f.addPrimitive(c);
    
    var c = new Arc(Protractor.x, Protractor.y, radius4, 180, 360, false, 0);
    f.addPrimitive(c);
   
    var c = new Arc(Protractor.x, Protractor.y, radius5, 180, 360, false, 0);
    c.style.fillStyle = "rgba(252,239,197,0)";
    f.addPrimitive(c);
    
    var perimeter = Math.PI*178;
    var tempX = x-178;
    var tempY = y;
    var centerX = x;
    var centerY = tempY;
    var center = new Point(x,y);
    var startAngle = 270;
    var endAngle =  90;
    var outerText = 180;
    var innerText = 0;
    for(var i = 1; i<=19; i++)
    {
        //Draw the first Lines
        var start = Util.getEndPoint(center,radius1,(Math.PI/180)*startAngle);
   
        var end = Util.getEndPoint(start,15,(Math.PI/180)*endAngle);
      
        var line = new Line(start,end);
        f.addPrimitive(line);
       
        //Draw the Outer Degrees
        var outerTextPoint = Util.getEndPoint(start,25,(Math.PI/180)*endAngle);
        var text = new OrdinaryText(outerText.toString(), outerTextPoint.x, outerTextPoint.y, FigureDefaults.textFont, 12, false, Text.ALIGN_CENTER, 16,12);
        text.style.fillStyle = FigureDefaults.textColor;
        var rotAngle = (Math.PI/180)*(endAngle+180);
        var rotMat =   Matrix.mergeTransformations(
        Matrix.translationMatrix(-outerTextPoint.x, -outerTextPoint.y), 
        Matrix.rotationMatrix(rotAngle), 
        Matrix.translationMatrix(outerTextPoint.x,outerTextPoint.y)
        );
        text.transform(rotMat);
        f.addPrimitive(text);

        //Draw the second Lines
        var start = Util.getEndPoint(center,radius2+10,(Math.PI/180)*startAngle);
        var end = Util.getEndPoint(start,10,(Math.PI/180)*endAngle);
 
        var line = new Line(start,end);
        f.addPrimitive(line);

        //Draw the third Lines
        var start = Util.getEndPoint(center,radius3,(Math.PI/180)*startAngle);
        var end = Util.getEndPoint(start,16,(Math.PI/180)*endAngle);
        var line2 = new Line(start,end);
        f.addPrimitive(line2);

        if(i!=19)
        {
          //Draw the first small Lines
          var start = Util.getEndPoint(center,radius1,(Math.PI/180)*(startAngle+5));
          var end = Util.getEndPoint(start,5,(Math.PI/180)*(endAngle+5));
          var line1 = new Line(start,end);
          f.addPrimitive(line1);
          //Draw the third small Lines
          var start = Util.getEndPoint(center,radius4+6,(Math.PI/180)*(startAngle+5));
          var end = Util.getEndPoint(start,6,(Math.PI/180)*(endAngle+5));
          var line3 = new Line(start,end);
          f.addPrimitive(line3);
        }

        if(i%2)
        {
          //Draw the Outer Degrees
          var innerTextPoint = Util.getEndPoint(center,115,(Math.PI/180)*startAngle);
          var text1 = new OrdinaryText(innerText.toString(), innerTextPoint.x, innerTextPoint.y, FigureDefaults.textFont, 12, false, Text.ALIGN_CENTER, 16,12);
          text1.style.fillStyle = FigureDefaults.textColor;
          var rotAngle = (Math.PI/180)*(startAngle);
          var rotMat =   Matrix.mergeTransformations(
          Matrix.translationMatrix(-innerTextPoint.x, -innerTextPoint.y), 
          Matrix.rotationMatrix(rotAngle), 
          Matrix.translationMatrix(innerTextPoint.x,innerTextPoint.y)
          );
          text1.transform(rotMat);
          f.addPrimitive(text1);
        }
        
        //Increments
        if(i>10)
        {
          startAngle+=10-360;
          endAngle+=10-360;
        }
        else
        {
          startAngle+=10;
          endAngle+=10;
        }
        outerText-=10;
        innerText+=10;
    }  
    // //Draw the fourth vertical Line
    var start = Util.getEndPoint(center,radius5,(Math.PI/180)*(0));
    var end = Util.getEndPoint(start,radius5,(Math.PI/180)*(180));
    var line4 = new Line(start,end);
    f.addPrimitive(line4);

    //Draw the fourth vertical Line
    var start = Util.getEndPoint(center,radius2,(Math.PI/180)*(0));
    var end = Util.getEndPoint(start,radius5,(Math.PI/180)*(180));
    var line5 = new Line(start,end);
    f.addPrimitive(line5);

    //Draw the fivth horizontal Line
    var start = Util.getEndPoint(center,radius3,(Math.PI/180)*(270));
    var end = Util.getEndPoint(start,radius3*2,(Math.PI/180)*(90));
    var line6 = new Line(start,end);
    f.addPrimitive(line6);

    //Small lines connecting arc and rectangle
    var start = Util.getEndPoint(center,radius1,(Math.PI/180)*(270));
    var end = new Point(r.points[0].x,r.points[0].y);
    var line7 = new Line(start,end);
    f.addPrimitive(line7);

    var start = Util.getEndPoint(center,radius1,(Math.PI/180)*(90));
    var end = new Point(r.points[1].x,r.points[1].y);
    var line8 = new Line(start,end);
    f.addPrimitive(line8);

    var start = Util.getEndPoint(center,radius2,(Math.PI/180)*(270));
    var end = new Point(r.points[0].x+44,r.points[0].y);
    var line9 = new Line(start,end);
    f.addPrimitive(line9);

    var start = Util.getEndPoint(center,radius2,(Math.PI/180)*(90));
    var end = new Point(r.points[1].x-44,r.points[1].y);
    var line10 = new Line(start,end);
    f.addPrimitive(line10);

    f.finalise();
    Protractor.figure = f;
    
    if(Protractor.firstExecute)
    {
      Protractor.startPoint = Util.getEndPoint(center,radius1+20,(Math.PI/180)*(90));
      Protractor.endPoint = Util.getEndPoint(center,radius1+20,(Math.PI/180)*(90));
      ////console.log(Protractor.HandleManager);
      //Protractor.HandleManager.shapeSet(Protractor.figure);
      Protractor.firstExecute = false;   
    }
 }

Protractor.resetAngle = function()
{
    var center = new Point(Protractor.x,Protractor.y);
    var rotAngle = (Math.PI/2)-Util.getAngle(Protractor.figure.primitives[0].points[0],Protractor.figure.primitives[0].points[1]);
    var equivTransfMatrix = Matrix.mergeTransformations(
        Matrix.translationMatrix(-center.x, -center.y), 
        Matrix.rotationMatrix(rotAngle), 
        Matrix.translationMatrix(center.x,center.y)
        );
    Protractor.figure.transform(equivTransfMatrix);
    Protractor.startPoint.transform(equivTransfMatrix);
    Protractor.endPoint.transform(equivTransfMatrix);
    Protractor.rotationAngle = Util.getAngle(center,new Point(Protractor.topX,Protractor.topY));
}

Protractor.changeAngle = function(direction){
   
       if(Protractor.selectedHandle == "Protractor_startPoint")
        {   
            
            var center = new Point(Protractor.x,Protractor.y);
            var startAngle = Util.getAngle(center,Protractor.startPoint);//new Point(lastMove[0],lastMove[1])
            var endAngle = startAngle + Math.PI/180;
            if(direction == "UP")
           
              endAngle = startAngle - Math.PI/180;

            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            var inverseTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(-rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            Protractor.startPoint.transform(equivTransfMatrix);
            var anglerad = Util.getAngle3Points(Protractor.startPoint,center,new Point(Protractor.topX,Protractor.topY));
            var angle = anglerad * (180/Math.PI);
            if(angle<0)
              angle = -1*angle;
            if(angle>90&&angle<270)
            {
              Protractor.startPoint.transform(inverseTransfMatrix);
            }
        }
        else if(Protractor.selectedHandle == "Protractor_endPoint")
        {   
            var center = new Point(Protractor.x,Protractor.y);
            var startAngle = Util.getAngle(center,Protractor.endPoint);
            var endAngle = startAngle + Math.PI/180;
            if(direction == "UP")
              endAngle = startAngle - Math.PI/180;
            var rotAngle = endAngle - startAngle;
            var equivTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            var inverseTransfMatrix = Matrix.mergeTransformations(
                Matrix.translationMatrix(-center.x, -center.y), 
                Matrix.rotationMatrix(-rotAngle), 
                Matrix.translationMatrix(center.x,center.y)
                );
            Protractor.endPoint.transform(equivTransfMatrix);
            var anglerad = Util.getAngle3Points(Protractor.endPoint,center,new Point(Protractor.topX,Protractor.topY));
            var angle = anglerad * (180/Math.PI);
            if(angle<0)
              angle = -1*angle;
            if(angle>90&&angle<270)
            {
              Protractor.endPoint.transform(inverseTransfMatrix);
            }
        }
}

Protractor.paint = function(context){
    
    
    context.save();
    Protractor.figure.paint(context);

    context.restore();
}

Protractor.close = function(){
   
  var index = state_apps.indexOf(STATE_PROTRACTOR_APP);
  if(index > -1) 
    state_apps.splice(index, 1);
  Protractor.firstExecute = true;
  Protractor.figure = null;
  Protractor.HandleManager = null;
}

Protractor.onMouseDown = function(x,y){
      if(Protractor.HandleManager.handleGet(x, y) != null)
      {
        Protractor.HandleManager.handleSelectXY(x, y);
        if(Protractor.HandleManager.handles[Protractor.HandleManager.handleSelectedIndex].type == "Protractor_createAngle")
        {
          var cmdCreateFig = new FigureCreateCommand(window['figure_ProtractorAngle'], Protractor.x, Protractor.y);
          cmdCreateFig.execute();
          History.addUndo(cmdCreateFig);
          setUpEditPanel(null);
          selectedFigureId = -1;
          state = STATE_NONE;
        }
        else if(Protractor.HandleManager.handles[Protractor.HandleManager.handleSelectedIndex].type == "Protractor_close")
        {
          Protractor.close();
        }
        else if(Protractor.HandleManager.handles[Protractor.HandleManager.handleSelectedIndex].type == "Protractor_reset")
          Protractor.resetAngle();
        else if(Protractor.HandleManager.handles[Protractor.HandleManager.handleSelectedIndex].type == "Protractor_angleUpArrow"&&Protractor.selectedHandle)
          Protractor.changeAngle("UP");
        else if(Protractor.HandleManager.handles[Protractor.HandleManager.handleSelectedIndex].type == "Protractor_angleDownArrow"&&Protractor.selectedHandle)
          Protractor.changeAngle("DOWN");
        else if(Protractor.HandleManager.handles[Protractor.HandleManager.handleSelectedIndex].type == "Protractor_startPoint")
          Protractor.selectedHandle = "Protractor_startPoint";
        else if(Protractor.HandleManager.handles[Protractor.HandleManager.handleSelectedIndex].type == "Protractor_endPoint")
          Protractor.selectedHandle = "Protractor_endPoint";
        
        return true;
      }
      if(Util.isPointInside(new Point(x,y),Protractor.HandleManager.shape.primitives[0].points)||Protractor.HandleManager.shape.primitives[4].contains(x,y))
      {
        Protractor.drag = true;
        return true;
      }
    return false;
}

Protractor.onMouseUp = function(x,y){

    Protractor.HandleManager.handleSelectedIndex = -1; //reset only the handler....the Figure is still selected
    Protractor.drag = false;
    return false;
}

Protractor.onMouseMove = function(x,y,touchState){
    
    var canvas = getCanvas();
    var canvas_temp = getCanvasTemp();
    var ctx_temp = canvas_temp.getContext('2d');
    var ctx_pencil = getCanvasPencil().getContext('2d');
    if(mousePressed||touchState){ // mouse is (at least was) pressed
        if(lastMove != null){ //we are in dragging mode
            var handle = Protractor.HandleManager.handleGetSelected();
            if(handle != null){ //We are over a Handle of selected Figure               
                canvas.style.cursor = handle.getCursor();
                canvas_pencil.style.cursor = handle.getCursor();
                handle.action(lastMove,x,y);
                return true;
                Log.info('onMouseMove() - STATE_FIGURE_SELECTED + drag - mouse cursor = ' + canvas.style.cursor);
            }
            else{ /*no handle is selected*/
                if(Protractor.drag)
                {
                    canvas.style.cursor = 'move';
                    canvas_pencil.style.cursor = 'move';
                
                    var translateMatrix = generateMoveMatrix(Protractor.figure, x, y);
                    Protractor.figure.transform(translateMatrix);
                    var tempPoint = new Point(Protractor.x,Protractor.y);
                    tempPoint.transform(translateMatrix)
                    Protractor.x = tempPoint.x;
                    Protractor.y = tempPoint.y;
                    Protractor.startPoint.transform(translateMatrix);
                    Protractor.endPoint.transform(translateMatrix);
                    return true;
                } 
            }
        }
    }
    else{ //no mouse press (only change cursor)
        var handle = Protractor.HandleManager.handleGet(x,y); //TODO: we should be able to replace it with .getSelectedHandle()
        var handlePoints = []; 
        var handlers=Protractor.HandleManager.handleGetAll();
        for(var iterator=0; iterator<handlers.length; iterator++){
            if(handlers[iterator].type!="r")
                handlePoints.push(new Point(handlers[iterator].x,handlers[iterator].y));
        }
        
        
        if(handle != null){ //We are over a Handle of selected Figure               
            canvas.style.cursor = handle.getCursor();
            canvas_pencil.style.cursor = handle.getCursor();
            return true;
        }
        else if(Util.isPointInside(new Point(x,y),Protractor.HandleManager.shape.primitives[0].points))
        {
            canvas.style.cursor = 'move';
            canvas_pencil.style.cursor = 'move';
            return true;
        }
        else{
           
                canvas.style.cursor = 'default';  
                canvas_pencil.style.cursor = 'default';                         
                Log.info("onMouseMove() + STATE_FIGURE_SELECTED + over nothin = change cursor to default");
        }
    }
    return false;
}

function Compass()
{
    
}
Compass.x = null;
Compass.y = null;
Compass.firstExecute = true;
Compass.figure = null;
Compass.radiusPoint = null;
Compass.radius = 100;
Compass.radiusChange = false;
Compass.rotationAngle = null;
Compass.drawPoint = false;
Compass.startAngle = null;
Compass.endAngle = null;
Compass.direction = "clockwise";
Compass.clockWiseCross = false;
Compass.anti_clockWiseCross = false;
Compass.topX = null;
Compass.topY = null;
Compass.drag = false;
Compass.selectedHandle = null;
Compass.penColor = 0;
Compass.color = [["rgb(0, 0, 0)","rgb(46, 41, 39)","rgb(84, 77, 71)"],["rgb(174, 0, 0)","rgb(255, 0, 0)","rgb(255, 94, 94)"],
                ["rgb(27, 55, 0)","rgb(51, 102, 0)","rgb(82, 164, 0)"],["rgb(27, 27, 82)","rgb(51, 51, 153)","rgb(99, 99, 203)"]];
Compass.changePoint = null;
Compass.RotatePoint = null;
Compass.ResizePoint = null;
Compass.ClosePoint = null;
Compass.RedPoint = null;
Compass.BlackPoint = null;
Compass.BluePoint = null;
Compass.GreenPoint = null;
Compass.DrawPoint = null;
Compass.Pencil = null;
Compass.changeColor = false;
Compass.HandleManager = new AppHandleManager();

Compass.set = function(){
    var main_canvas = getCanvas();
    var x =  Compass.x;
    var y =  Compass.y;

    if(Compass.firstExecute)
    {
        var x =  main_canvas.width/2;
        var y =  main_canvas.height/2;
        Compass.x = x;
        Compass.y = y;
        Compass.radiusPoint = Util.getEndPoint(new Point(Compass.x,Compass.y),100,90*(Math.PI/180));
        Compass.radius = 100;
        Compass.radiusChange = false;
        Compass.rotationAngle = null;
        Compass.drawPoint = false;
        Compass.startAngle = null;
        Compass.endAngle = null;
        Compass.direction = "clockwise";
        Compass.clockWiseCross = false;
        Compass.anti_clockWiseCross = false;
        Compass.topX = null;
        Compass.topY = null;
        Compass.drag = false;
        Compass.selectedHandle = null;
        Compass.penColor = 0;
        Compass.changePoint = null;
        Compass.RotatePoint = null;
        Compass.ResizePoint = null;
        Compass.ClosePoint = null;
        Compass.RedPoint = null;
        Compass.BlackPoint = null;
        Compass.BluePoint = null;
        Compass.GreenPoint = null;
        Compass.DrawPoint = null;
        Compass.Pencil = null;
        Compass.changeColor = false;
    }
    var f = new Figure("Compass",true);
    f.style.fillStyle = "rgba(255, 255, 255,0)";
    f.style.strokeStyle = "none";
    f.style.strokeStyle = "#aeb571";
    f.style.lineWidth = 2;

    var r = new Polygon();
    r.addPoint(new Point(x - 25, y + 10));
    r.addPoint(new Point(x , y + 10));
    r.addPoint(new Point(x , y + 40));
    r.addPoint(new Point(x - 25, y + 40));
    r.style.fillStyle = "rgba(228, 214, 109,0)";
    r.style.strokeStyle = "rgba(228, 214, 109,0)";
    f.addPrimitive(r);

    var ifig = new ImageFrame("CompassMove", x-12, y+23, true,false,false,WHITEBOARD.protractor_move_src);
    ifig.style.globalCompositeOperation = "source-over";
    ifig.style.globalAlpha = 0.5;
    f.addPrimitive(ifig);

    var c = new Arc(Compass.x, Compass.y, 2.5, 0, 360, false, 0);
    c.style.fillStyle = "rgba(0,0,0,1)";
    c.style.strokeStyle = "rgba(0,0,0,0)";
    f.addPrimitive(c);
    
    var c = new Arc(Compass.x, Compass.y, 7, 0, 360, false, 0);
    c.style.fillStyle = "rgba(0,0,0,0)";
    c.style.strokeStyle = "rgba(0,0,0,1)";
    c.style.lineWidth = 1;
    f.addPrimitive(c);
    
    var c = new Arc(Compass.x, Compass.y, Compass.radius, 0, 360, false, 0);
    c.style.strokeStyle = "rgba(0, 0, 0,0.3)";
    c.style.lineWidth =1;
    f.addPrimitive(c);
    
    //Drawing Pen Image in Canvas
    var pencil = new Figure("Pencil_ICON",true);
    var trianglePoint = new Point(Compass.radiusPoint.x, Compass.radiusPoint.y);
    var trianglePoint1 = new Point(Compass.radiusPoint.x-8, Compass.radiusPoint.y - 15);
    var trianglePoint2 = new Point(Compass.radiusPoint.x+8, Compass.radiusPoint.y - 15);
    var r = new Polygon();
    r.addPoint(new Point(trianglePoint1.x, trianglePoint1.y));
    r.addPoint(new Point(trianglePoint1.x, trianglePoint1.y - 50));
    r.addPoint(new Point(trianglePoint2.x, trianglePoint2.y - 50));
    r.addPoint(new Point(trianglePoint2.x, trianglePoint2.y ));
    r.style.fillStyle = Compass.color[Compass.penColor][0];
    r.style.strokeStyle = Compass.color[Compass.penColor][0];
    pencil.addPrimitive(r);
    var r = new Polygon();
    r.addPoint(trianglePoint);
    r.addPoint(trianglePoint1);
    r.addPoint(trianglePoint2);
    r.style.fillStyle = Compass.color[Compass.penColor][0];
    r.style.strokeStyle = "rgba(228, 214, 109,0)";
    pencil.addPrimitive(r);
    var c1 = new QuadCurve(new Point(trianglePoint1.x-1, trianglePoint1.y ),
        new Point(trianglePoint1.x + 8, trianglePoint1.y+20),
        new Point(trianglePoint2.x+1, trianglePoint2.y ))
    c1.style.fillStyle = "rgb(255, 204, 153)";
    c1.style.strokeStyle = "rgba(255, 204, 153,0)";
    c1.style.lineWidth = 0;
    pencil.addPrimitive(c1);

    
    var hShrinker = 10;
    var vShrinker = 6;
    var c1 = new QuadCurve(new Point(trianglePoint1.x, trianglePoint1.y ),
        new Point(trianglePoint1.x + 8, trianglePoint1.y+8),
        new Point(trianglePoint2.x, trianglePoint2.y ))
    c1.style.fillStyle = Compass.color[Compass.penColor][1];
    c1.style.strokeStyle = Compass.color[Compass.penColor][0];
    c1.style.lineWidth = 2;
    pencil.addPrimitive(c1);

    var r = new Polygon();
    r.addPoint(new Point(trianglePoint1.x+3, trianglePoint1.y));
    r.addPoint(new Point(trianglePoint1.x+3, trianglePoint1.y - 50));
    r.addPoint(new Point(trianglePoint2.x, trianglePoint2.y - 50));
    r.addPoint(new Point(trianglePoint2.x, trianglePoint2.y));
    r.style.fillStyle = Compass.color[Compass.penColor][1];
    r.style.strokeStyle = Compass.color[Compass.penColor][1];
    pencil.addPrimitive(r);

    var r = new Polygon();
    r.addPoint(new Point(trianglePoint2.x-3, trianglePoint1.y));
    r.addPoint(new Point(trianglePoint2.x-3, trianglePoint1.y - 50));
    r.addPoint(new Point(trianglePoint2.x-1, trianglePoint2.y - 50));
    r.addPoint(new Point(trianglePoint2.x-1, trianglePoint2.y));
    r.style.fillStyle = Compass.color[Compass.penColor][2];
    r.style.strokeStyle = "rgba(0,0,0,0)";
    pencil.addPrimitive(r);


    //Pencil top yellow Rectangle
    var r = new Polygon();
    r.addPoint(new Point(trianglePoint1.x, trianglePoint1.y - 50));
    r.addPoint(new Point(trianglePoint1.x, trianglePoint1.y - 60));
    r.addPoint(new Point(trianglePoint2.x, trianglePoint2.y - 60));
    r.addPoint(new Point(trianglePoint2.x, trianglePoint2.y - 50));
    r.style.lineWidth =1;
    r.style.fillStyle = "rgb(255, 195, 46)";
    r.style.strokeStyle = "rgb(153, 95, 56)";
    pencil.addPrimitive(r);
    
    //Yellow rectangle curve
    var c1 = new QuadCurve(new Point(trianglePoint1.x, trianglePoint1.y - 51),
        new Point(trianglePoint1.x + 8, trianglePoint1.y+5 - 51),
        new Point(trianglePoint2.x, trianglePoint2.y - 51 ))
    c1.style.fillStyle = "rgb(255, 195, 46)";
    c1.style.strokeStyle = "rgba(255, 195, 46,0)";
    c1.style.lineWidth = 0;
    pencil.addPrimitive(c1);

    //Top grey Border
    var c = new Ellipse(new Point(trianglePoint1.x + 8, trianglePoint1.y - 63), 8 , 4);
    c.style.fillStyle = "rgb(255, 153, 153)";
    c.style.strokeStyle = "rgb(166, 163, 172)";
    c.style.lineWidth =1;
    pencil.addPrimitive(c);

    //Pink Color Rectangle
    var r = new Polygon();
    r.addPoint(new Point(trianglePoint1.x, trianglePoint1.y - 55));
    r.addPoint(new Point(trianglePoint1.x, trianglePoint1.y - 65));
    r.addPoint(new Point(trianglePoint2.x, trianglePoint2.y - 65));
    r.addPoint(new Point(trianglePoint2.x, trianglePoint2.y - 55));
    r.style.lineWidth =1;
    r.style.fillStyle = "rgb(255, 132, 132)";
    r.style.strokeStyle = "rgb(166, 163, 172)";
    pencil.addPrimitive(r);

    //Pink Color Curve
    var c1 = new QuadCurve(new Point(trianglePoint1.x, trianglePoint1.y - 56),
        new Point(trianglePoint1.x + 8, trianglePoint1.y+5 - 56),
        new Point(trianglePoint2.x, trianglePoint2.y - 56 ))
    c1.style.fillStyle = "rgb(255, 132, 132)";
    c1.style.strokeStyle = "rgba(255, 132, 132,0)";
    c1.style.lineWidth = 0;
    pencil.addPrimitive(c1);

    //Pink Color Ellipse on top
    var c = new Ellipse(new Point(trianglePoint1.x + 8, trianglePoint1.y - 63), 8 , 4);
    c.style.fillStyle = "rgb(255, 153, 153)";
    c.style.strokeStyle = "rgba(255, 153, 153,0)";
    pencil.addPrimitive(c);

    pencil.finalise();

    //Creating the Rotate Point
    var drawPoint = new Figure('drawPoint',true);
    var p = new Point(Compass.radiusPoint.x+25,Compass.radiusPoint.y-20);
    p.style.fillStyle = "rgba(0,0,0,0)";
    p.style.strokeStyle = "rgba(0,0,0,0)";
    drawPoint.addPrimitive(p);
    var text1 = new OrdinaryText('/', Compass.radiusPoint.x+25,Compass.radiusPoint.y-20, FigureDefaults.textFont, 12, false, Text.ALIGN_CENTER, 16,12);
    text1.style.fillStyle = FigureDefaults.textColor;
          
    //Creating the Rotate Point
    var rotatePoint = new Figure('rotatePoint',true);
    var p = new Point(Compass.radiusPoint.x+25,Compass.radiusPoint.y-45);
    p.style.fillStyle = "rgba(0,0,0,0)";
    p.style.strokeStyle = "rgba(0,0,0,0)";
    rotatePoint.addPrimitive(p);
    var text2 = new OrdinaryText('ѻ', Compass.radiusPoint.x+25,Compass.radiusPoint.y-45, FigureDefaults.textFont, 12, false, Text.ALIGN_CENTER, 16,12);
    text2.style.fillStyle = FigureDefaults.textColor;

    //Creating the Rotate Point
    var resizePoint = new Figure('resizePoint',true);
    var p = new Point(Compass.radiusPoint.x+25,Compass.radiusPoint.y-70);
    p.style.fillStyle = "rgba(0,0,0,0)";
    p.style.strokeStyle = "rgba(0,0,0,0)";
    resizePoint.addPrimitive(p);
    var text3 = new OrdinaryText('↔', Compass.radiusPoint.x+25,Compass.radiusPoint.y-70, FigureDefaults.textFont, 12, false, Text.ALIGN_CENTER, 16,12);
    text3.style.fillStyle = FigureDefaults.textColor;

    //Creating the Rotate Point
    var closePoint = new Figure('closePoint',true);
    var p = new Point(Compass.radiusPoint.x,Compass.radiusPoint.y-100);
    p.style.fillStyle = "rgba(0,0,0,0)";
    p.style.strokeStyle = "rgba(0,0,0,0)";
    closePoint.addPrimitive(p);
    var text4 = new OrdinaryText('x', Compass.radiusPoint.x,Compass.radiusPoint.y-100, FigureDefaults.textFont, 12, false, Text.ALIGN_CENTER, 16,12);
    text4.style.fillStyle = FigureDefaults.textColor;

    //Creating the Color Selectors Point
    var colorBlackPoint = new Figure('colorBlackPoint',true);
    var p = new Point(Compass.radiusPoint.x-25,Compass.radiusPoint.y-30);
    p.style.fillStyle = "rgba(0,0,0,0)";
    p.style.strokeStyle = "rgba(0,0,0,0)";
    colorBlackPoint.addPrimitive(p);
    var colorRedPoint = new Figure('colorRedPoint',true);
    var p = new Point(Compass.radiusPoint.x-45,Compass.radiusPoint.y-31);
    p.style.fillStyle = "rgba(0,0,0,0)";
    p.style.strokeStyle = "rgba(0,0,0,0)";
    colorRedPoint.addPrimitive(p);
    var colorGreenPoint = new Figure('colorGreenPoint',true);
    var p = new Point(Compass.radiusPoint.x-65,Compass.radiusPoint.y-32);
    p.style.fillStyle = "rgba(0,0,0,0)";
    p.style.strokeStyle = "rgba(0,0,0,0)";
    colorGreenPoint.addPrimitive(p);
    var colorBluePoint = new Figure('colorBluePoint',true);
    var p = new Point(Compass.radiusPoint.x-85,Compass.radiusPoint.y-33);
    p.style.fillStyle = "rgba(0,0,0,0)";
    p.style.strokeStyle = "rgba(0,0,0,0)";
    colorBluePoint.addPrimitive(p);

    var rotAngle = Util.getAngle(new Point(Compass.x,Compass.y),Compass.radiusPoint)-80*(Math.PI/180);
    var center = Compass.radiusPoint;
    var equivTransfMatrix = Matrix.mergeTransformations(
        Matrix.translationMatrix(-center.x, -center.y), 
        Matrix.rotationMatrix(rotAngle), 
        Matrix.translationMatrix(center.x,center.y)
        );
    
    //Adding the RotatePoint to Pencil
    pencil.addPrimitive(drawPoint);
    pencil.addPrimitive(rotatePoint);
    pencil.addPrimitive(resizePoint);
    pencil.addPrimitive(closePoint);
    pencil.addPrimitive(colorBlackPoint);
    pencil.addPrimitive(colorRedPoint);
    pencil.addPrimitive(colorGreenPoint);
    pencil.addPrimitive(colorBluePoint);
    pencil.addPrimitive(text1);
    pencil.addPrimitive(text2);
    pencil.addPrimitive(text3);
    pencil.addPrimitive(text4);
    pencil.transform(equivTransfMatrix);
    
    
    //Adding Pencil to Main Compass
    f.addPrimitive(pencil);

    //Finalizing the Compass
    f.finalise();
    
    Compass.figure= f;
    Compass.Pencil = pencil;
    Compass.RotatePoint = rotatePoint;
    Compass.DrawPoint = drawPoint;
    Compass.ResizePoint = resizePoint;
    Compass.ClosePoint = closePoint;
    Compass.RedPoint = colorRedPoint;
    Compass.BlackPoint = colorBlackPoint;
    Compass.BluePoint = colorBluePoint;
    Compass.GreenPoint = colorGreenPoint;
    if(Compass.firstExecute)
    {
      Compass.HandleManager.shapeSet(Compass.figure);
      Compass.firstExecute = false;
    }
    

}
Compass.paint = function(context){
    context.save();
    //Line to represent from center
    var l = new Line(new Point(Compass.x,Compass.y),Compass.radiusPoint);
    l.style.strokeStyle = "rgb(198, 198, 198)";
    l.paint(context);

    Compass.figure.paint(context);
    if(Compass.startPoint != null &Compass.endPoint!=null)
    {
      var endPoint  = Compass.endPoint-90;
      if(Compass.changePoint !== null)
      {
        if(endPoint>Compass.startPoint-90)
          endPoint = Compass.startPoint-90+360;
        else
          endPoint = endPoint + 360;
      }  
      var c = new Arc(Compass.x, Compass.y, Compass.radius, Compass.startPoint-90, endPoint, false, 0);
      c.style.strokeStyle = Compass.color[Compass.penColor][1];
      c.style.lineWidth = 2;
      c.paint(context);
    }

    Compass.Pencil.paint(context);
    if(Compass.radiusChange)
    {
      var length = (Util.getLength(new Point(Compass.x,Compass.y),Compass.radiusPoint)/40).toFixed(2);
      var text = new OrdinaryText('r = '+length+" cm", Compass.x-20,Compass.y+30, FigureDefaults.textFont, 12, false, Text.ALIGN_CENTER, 16,12);
      text.style.fillStyle = FigureDefaults.textColor;
      text.paint(context);
    }
    context.restore();
}

Compass.close = function(){
  var index = state_apps.indexOf(STATE_COMPASS_APP);
  if (index > -1) 
    state_apps.splice(index, 1);
  Compass.firstExecute = true;
  Compass.set();
}

Compass.onMouseDown = function(x,y){

  if(Compass.HandleManager.handleGet(x, y) != null)
  {
    Compass.HandleManager.handleSelectXY(x, y);
    if(Compass.HandleManager.handles[Compass.HandleManager.handleSelectedIndex].type == "Compass_drawPoint")
      Compass.drawPoint = true;
    else if(Compass.HandleManager.handles[Compass.HandleManager.handleSelectedIndex].type == "Compass_changeColor")
      Compass.changeColor = true;
    else if(Compass.HandleManager.handles[Compass.HandleManager.handleSelectedIndex].type == "Compass_color_blackPoint")
    {  
      Compass.penColor = 0;
      Compass.changeColor = false;
      Compass.set();
    }
    else if(Compass.HandleManager.handles[Compass.HandleManager.handleSelectedIndex].type == "Compass_color_redPoint")
    {  
      Compass.penColor = 1;
      Compass.changeColor = false;
      Compass.set();
    }
    else if(Compass.HandleManager.handles[Compass.HandleManager.handleSelectedIndex].type == "Compass_color_greenPoint")
    {  
      Compass.penColor = 2;
      Compass.changeColor = false;
      Compass.set();
    }
    else if(Compass.HandleManager.handles[Compass.HandleManager.handleSelectedIndex].type == "Compass_color_bluePoint")
    {  
      Compass.penColor = 3;
      Compass.changeColor = false;
      Compass.set();
    }
    else if(Compass.HandleManager.handles[Compass.HandleManager.handleSelectedIndex].type == "Compass_closePoint")
    {
      Compass.close();
    } 
    return true;
  }
  if(Util.isPointInside(new Point(x,y),Compass.HandleManager.shape.primitives[0].points)||Compass.HandleManager.shape.primitives[3].contains(x,y))
  {
    Compass.drag = true;
    return true;
  }
  return false;
}

Compass.onMouseUp = function(x,y){

  if(Compass.HandleManager.handles.length&&Compass.HandleManager.handleSelectedIndex!=-1&&Compass.HandleManager.handles[Compass.HandleManager.handleSelectedIndex].type == "Compass_drawPoint")
  {
    if(Compass.drawPoint)
    {
      var cmdCreateFig = new FigureCreateCommand(window['figure_compassArc'], Compass.x, Compass.y);
      cmdCreateFig.execute();
      History.addUndo(cmdCreateFig);
      Compass.drawPoint = false;
      Compass.startPoint = null;
      Compass.endPoint = null;
      Compass.changePoint = null;
      Compass.clockWiseCross = false;
      Compass.anti_clockWiseCross = false;
      setUpEditPanel(null);
      selectedFigureId = -1;
      state = STATE_NONE;
      Compass.HandleManager.handleSelectedIndex = -1; //reset only the handler....the Figure is still selected
      Compass.drag = false;
      return true;
    }
  }  
  Compass.HandleManager.handleSelectedIndex = -1; //reset only the handler....the Figure is still selected
  Compass.drag = false;
  Compass.radiusChange = false;
  return false;
}

Compass.onMouseMove = function(x,y,touchState){
    var canvas = getCanvas();
    var canvas_temp = getCanvasTemp();
    var ctx_temp = canvas_temp.getContext('2d');
    var ctx_pencil = getCanvasPencil().getContext('2d');
    if(mousePressed||touchState){ // mouse is (at least was) pressed
          if(lastMove != null){ //we are in dragging mode
              var handle = Compass.HandleManager.handleGetSelected();
              if(handle != null){ //We are over a Handle of selected Figure               
                  canvas.style.cursor = handle.getCursor();
                  canvas_pencil.style.cursor = handle.getCursor();
                  
                  handle.action(lastMove,x,y);
                  return true;
              }
              else{ /*no handle is selected*/
                  if(Compass.drag)
                  {
                      canvas.style.cursor = 'move';
                      canvas_pencil.style.cursor = 'move';
                  
                      var translateMatrix = generateMoveMatrix(Protractor.figure, x, y);
                      Compass.figure.transform(translateMatrix);
                      var tempPoint = new Point(Compass.x,Compass.y);
                      tempPoint.transform(translateMatrix)
                      Compass.x = tempPoint.x;
                      Compass.y = tempPoint.y;
                      Compass.radiusPoint.transform(translateMatrix);
                      return true;
                  } 
              }
          }
      }
      else{ //no mouse press (only change cursor)
          var handle = Compass.HandleManager.handleGet(x,y); //TODO: we should be able to replace it with .getSelectedHandle()
          var handlePoints = []; 
          var handlers=Compass.HandleManager.handleGetAll();
          for(var iterator=0; iterator<handlers.length; iterator++){
              if(handlers[iterator].type!="r")
                  handlePoints.push(new Point(handlers[iterator].x,handlers[iterator].y));
          }
          
          
          if(handle != null){ //We are over a Handle of selected Figure               
              canvas.style.cursor = handle.getCursor();
              canvas_pencil.style.cursor = handle.getCursor();
              return true;
          }
          else if(Util.isPointInside(new Point(x,y),Compass.HandleManager.shape.primitives[0].points))
          {
              canvas.style.cursor = 'move';
              canvas_pencil.style.cursor = 'move';
              return true;
          }
          else{
              canvas.style.cursor = 'default';  
              canvas_pencil.style.cursor = 'default';                         
              Log.info("onMouseMove() + STATE_FIGURE_SELECTED + over nothin = change cursor to default");
          }
      }
  return false;
}
/* OrdinaryText.js */
function OrdinaryText(string, x, y, font, size, outsideCanvas, align){
    /**OrdinaryText used to display*/
    this.str = string;

    /**Font used to draw text*/
    this.font = font;
    
    /**Size of the text*/
    this.size = size; //TODO:Builder set this as String which is bad habit

    /**Line spacing. It should be a percent of the font size so it will grow with the font*/    
    this.lineSpacing = 0; 
    
    /**Horizontal alignment of the text, can be: left, center, right*/
    this.align = align || OrdinaryText.ALIGN_CENTER;

    /**Sets if text is underlined*/
    this.underlined = false;
   
    this.vector = [new Point(x,y),new Point(x,y-20)];

    /**Style of the text*/
    this.style = new Style();

    if(!outsideCanvas){
        this.bounds = this.getNormalBounds();
    }
        
    /*JSON object type used for JSON deserialization*/
    this.oType = 'OrdinaryText'; 
}



OrdinaryText.load = function(o){
    //TODO: update
    var newOrdinaryText = new OrdinaryText(o.str, o.x, o.y, o.font, o.size, false, o.align); //fake OrdinaryText (if we do not use it we got errors - endless loop)
    newOrdinaryText.underlined = o.underlined;
    newOrdinaryText.vector = Point.loadArray(o.vector);
    newOrdinaryText.style = Style.load(o.style);

    return newOrdinaryText;
}

/**Left alignment*/
OrdinaryText.ALIGN_LEFT = "left";

/**Center alignment*/
OrdinaryText.ALIGN_CENTER = "center";

/**Right alignment*/
OrdinaryText.ALIGN_RIGHT = "right";

/**An {Array} with horizontal alignments*/
OrdinaryText.ALIGNMENTS = [{
    Value: OrdinaryText.ALIGN_LEFT,
    OrdinaryText:'Left'
},{
    Value: OrdinaryText.ALIGN_CENTER,
    OrdinaryText:'Center'
},{
    Value: OrdinaryText.ALIGN_RIGHT,
    OrdinaryText:'Right'
}];



/**An {Array} of fonts*/
OrdinaryText.FONTS = [{
    Value: "arial",
    OrdinaryText: "Arial"
},{
    Value: "arial narrow",
    OrdinaryText: "Arial Narrow"
},{
    Value: "courier new",
    OrdinaryText: "Courier New"
},{
    Value: "tahoma",
    OrdinaryText: "Tahoma"
}];

/**space between 2 caracters*/
OrdinaryText.SPACE_BETWEEN_CHARACTERS = 2;

/**The default size of the created font*/
OrdinaryText.DEFAULT_SIZE = 10;

/**Proportion between size of text and thickness of underline*/
OrdinaryText.UNDERLINE_THICKNESS_DIVIDER = 16;


OrdinaryText.prototype = {
    
    constructor : OrdinaryText,
    
    getOrdinaryTextSize:function(){
        return this.size;
    },

    //we need to transform the connectionpoints when we change the size of the text
    //only used by the builder, for text figures (not figures with text)
    setOrdinaryTextSize:function(size){
        var oldBounds = this.getNormalBounds().getBounds();
        var oldSize = this.size;
        this.size = size;
        var newBounds = this.getNormalBounds().getBounds();
//        this._updateConnectionPoints(oldBounds, newBounds);
    },

    getOrdinaryTextStr:function(){
        return this.str;
    },

    setOrdinaryTextStr:function(str){
        var oldBounds = this.getNormalBounds().getBounds();
        this.str = str;
        var newBounds = this.getNormalBounds().getBounds();
//        this._updateConnectionPoints(oldBounds, newBounds);

    },


    _getContext:function(){
        //WE SHOULD NOT KEEP ANY REFERENCE TO A CONTEXT - serialization pain
        return document.getElementById("canvas_main").getContext("2d");
    },


 
    transform:function(matrix){
        this.vector[0].transform(matrix);
        this.vector[1].transform(matrix);        
    },


 
    getAngle: function(){
        return Util.getAngle(this.vector[0], this.vector[1]);
    },


    getNormalWidth:function(){
        var linesOrdinaryText = this.str.split("\n");
        var linesWidth = [];
        var maxWidth = 24;


        return maxWidth;
    },

    getNormalHeight:function(){
        var lines = this.str.split("\n");
        var nrLines = lines.length;
        var totalHeight = 0;

        if (nrLines > 0){
            totalHeight = nrLines * this.size  //height added by lines of text
            + (nrLines - 1) * this.lineSpacing; //height added by inter line spaces
        }

        return totalHeight;
    },


   
    paint:function(context){

        context.save();

        var lines = this.str.split("\n");

      this.lineSpacing = 1 / 4 * this.size;

        var offsetX = 0;
        if(this.align == OrdinaryText.ALIGN_LEFT){
            offsetX = -this.getNormalWidth()/2;
        }
        else if(this.align == OrdinaryText.ALIGN_RIGHT){
            offsetX = this.getNormalWidth()/2;
        }
        
        //Y - offset
        var offsetY = 0.5 * this.size;


        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        //alert("Angle is + " + angle + ' point 0: ' + this.vector[0] + ' point 1: ' + this.vector[1]);


        
        context.translate(this.vector[0].x,this.vector[0].y);
        context.rotate(angle);
        context.translate(-this.vector[0].x, -this.vector[0].y);

        //paint lines

        context.fillStyle = this.style.fillStyle;
        context.font = this.size + "px " + this.font;
        context.textAlign = this.align;
        context.textBaseline = "middle";

//        if (this.valign == OrdinaryText.VALIGN_MIDDLE) {
//            context.textBaseline = "middle";
//        }

        for(var i=0; i<lines.length; i++){
//            Log.info("Line: " + lines[i] + " this.vector[0].x=" + this.vector[0].x + " offsetX=" + offsetX + " this.vector[0].y=" + this.vector[0].y + " offsetY=" + offsetY 
//            + " this.getNormalHeight()=" + this.getNormalHeight() + " this.size=" + this.size + " this.lineSpacing=" + this.lineSpacing);

            // x and y starting coordinates of text lines
            var lineStartX = this.vector[0].x + offsetX;
            var lineStartY = (this.vector[0].y - this.getNormalHeight() / 2 + i * this.size + i * this.lineSpacing) + offsetY;

            context.fillText(
                lines[i],
                lineStartX,
                lineStartY
            );

            if (this.underlined) {
                this.paintUnderline(
                    context,
                    lines[i],
                    lineStartX,
                    lineStartY
                );
            }
            
        }


        context.restore();

    },


    
    paintUnderline:function(context, text, x, y){
        // text width
        var width = context.measureOrdinaryText(text).width;

        // if text align differs from "left" - add offset to X axis
        // fillOrdinaryText method of canvas context make this automatically
        switch(this.align){
            case "center":
                x -= (width/2);
                break;
            case "right":
                x -= width;
                break;
        }

        // add offset to Y axis equal to half of text size
        y += this.size / 2;

        context.save();

        context.beginPath();
        context.strokeStyle = this.style.fillStyle; // color the same as text
        context.lineWidth = this.size / OrdinaryText.UNDERLINE_THICKNESS_DIVIDER;   // thickness taken in proportion of text size
        context.moveTo(x,y);
        context.lineTo(x + width, y);
        context.stroke();

        context.restore();
    },


    
    getBounds:function(){
        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        var nBounds = this.getNormalBounds();
        
        nBounds.transform(Matrix.translationMatrix(-this.vector[0].x,-this.vector[0].y) );
        nBounds.transform(Matrix.rotationMatrix(angle));
        nBounds.transform(Matrix.translationMatrix(this.vector[0].x,this.vector[0].y));

        return nBounds.getBounds();
    },


    
    getNormalBounds:function(){
        var lines = this.str.split("\n");

        var poly = new Polygon();
        poly.addPoint(new Point(this.vector[0].x - this.getNormalWidth()/2 ,this.vector[0].y - this.getNormalHeight()/2));
        poly.addPoint(new Point(this.vector[0].x + this.getNormalWidth()/2 ,this.vector[0].y - this.getNormalHeight()/2));
        poly.addPoint(new Point(this.vector[0].x + this.getNormalWidth()/2 ,this.vector[0].y + this.getNormalHeight()/2));
        poly.addPoint(new Point(this.vector[0].x - this.getNormalWidth()/2 ,this.vector[0].y + this.getNormalHeight()/2));

        return poly;
    },


    getPoints:function(){
        return [];
    },


    contains: function(x,y){
        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        var nBounds = this.getNormalBounds();
        nBounds.transform( Matrix.translationMatrix(-this.vector[0].x,-this.vector[0].y) );
        nBounds.transform(Matrix.rotationMatrix(angle));
        nBounds.transform(Matrix.translationMatrix(this.vector[0].x,this.vector[0].y));

        // check if (x,y) is inside or on a borders of nBounds
        return nBounds.contains(x,y,true);
    },


    near:function(x, y, radius){
        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        var nBounds = this.getNormalBounds();
        nBounds.transform( Matrix.translationMatrix(-this.vector[0].x,-this.vector[0].y) );
        nBounds.transform(Matrix.rotationMatrix(angle));
        nBounds.transform(Matrix.translationMatrix(this.vector[0].x,this.vector[0].y));

        return nBounds.near(x,y, radius);
    },


    equals:function(anotherOrdinaryText){
        if(!anotherOrdinaryText instanceof OrdinaryText){
            return false;
        }

        if(
            this.str != anotherOrdinaryText.str
            || this.font != anotherOrdinaryText.font
            || this.size != anotherOrdinaryText.size
            || this.lineSpacing != anotherOrdinaryText.lineSpacing
            || this.size != anotherOrdinaryText.size){
            return false;
        }


        for(var i=0; i<this.vector.length; i++){
            if(!this.vector[i].equals(anotherOrdinaryText.vector[i])){
                return false;
            }
        }

        if(!this.style.equals(anotherOrdinaryText.style)){
            return false;
        }

        //TODO: compare styles too this.style = new Style();
        return true;
    },


    /**Creates a clone of current text*/
    clone: function(){
        var cOrdinaryText = new OrdinaryText(this.str, this.x, this.y, this.font, this.size, this.outsideCanvas);
        cOrdinaryText.align = this.align;
    
//        cOrdinaryText.valign = this.valign;
        cOrdinaryText.vector = Point.cloneArray(this.vector);
        cOrdinaryText.style = this.style.clone();

        if(!cOrdinaryText.outsideCanvas){
            cOrdinaryText.bounds = this.bounds.clone(); //It's a Polygon (so we can clone it)
        }

        return cOrdinaryText;
        
       
    },


    toString:function(){
        return 'OrdinaryText: ' + this.str + ' x:' + this.vector[0].x +  ' y:' + this.vector[0].y;
    },

    
    escapeString:function(s){
        var result = new String(s);
        
        var map = [];
        map.push(['<','&lt;']);

        for(var i = 0; i<map.length; i++){
            result = result.replace(map[i][0], map[i][1]);
        }

        return result;
    },

    
    toSVG: function(){
        /*Example:
          <text x="200" y="150" fill="blue" style="stroke:none; fill:#000000;text-anchor: middle"  transform="rotate(30 200,150)">
              You are not a banana.
          </text>
        */

        var angle = this.getAngle() * 180 / Math.PI;
        var height = this.getNormalHeight();

        //X - offset
        var offsetX = 0;
        var alignment = 'middle';
        if(this.align == OrdinaryText.ALIGN_LEFT){
            offsetX = -this.getNormalWidth()/2;
            alignment = 'start';
        }
        else if(this.align == OrdinaryText.ALIGN_RIGHT){
            offsetX = this.getNormalWidth()/2;
            alignment = 'end';
        }

        //svg alignment
//        if(this.align)

        //general text tag
        var result = "\n" + repeat("\t", INDENTATION) + '<text y="' + (this.vector[0].y - height/2) + '" ';
        result += ' transform="rotate(' + angle + ' ' + this.vector[0].x + ' ,' + this.vector[0].y + ')" ';
        result += ' font-family="' + this.font + '" ';
        result += ' font-size="' + this.size + '" ';

        /**
         *We will extract only the fill properties from Style, also we will not use
         *Note: The outline color of the font. By default text only has fill color, not stroke.
         *Adding stroke will make the font appear bold.*/
        if(this.style.fillStyle != null){
//            result += ' stroke=" ' + this.style.fillStyle + '" ';
            result += ' fill=" ' + this.style.fillStyle + '" ';
        }
        result += ' text-anchor="' + alignment + '" ';
        result +=  '>';

        INDENTATION++;

        //any line of text (tspan tags)
        var lines = this.str.split("\n");
        for(var i=0; i< lines.length; i++){
            var dy = parseFloat(this.size);
            if(i > 0){
                dy += parseFloat(this.lineSpacing);
            }
            
            //alert('Size: ' + this.size + ' ' + (typeof this.size) + ' lineSpacing:' + this.lineSpacing + ' dy: ' + dy);
            result += "\n" + repeat("\t", INDENTATION) + '<tspan x="' + (this.vector[0].x + offsetX) + '" dy="' + dy  + '">' + this.escapeString(lines[i]) + '</tspan>'
        } //end for
        
        INDENTATION--;
        
        //result += this.str;
        result += "\n" + repeat("\t", INDENTATION) + '</text>';

        if(this.debug){
            result += "\n" + repeat("\t", INDENTATION) + '<circle cx="' + this.vector[0].x + '" cy="' + this.vector[0].y + '" r="3" style="stroke: #FF0000; fill: yellow;" '
            + ' transform="rotate(' + angle + ' ' + this.vector[0].x + ' ,' + this.vector[0].y + ')" '
            + '/>';
        
            result += "\n" + repeat("\t", INDENTATION) + '<circle cx="' + this.vector[0].x + '" cy="' + (this.vector[0].y - height/2) + '" r="3" style="stroke: #FF0000; fill: green;" '
            + ' transform="rotate(' + angle + ' ' + this.vector[0].x + ' ,' + this.vector[0].y + ')" '
            + ' />';
        }
        
        return result;
       
    }

}

/* Text.js*/
function Text(string, x, y, font, size, outsideCanvas, align){
    
    // //console.log("width",width)
    /**Text used to display*/
    this.str = string;

    /**Font used to draw text*/
    this.font = font;
    
    /**Size of the text*/
    this.size = size; //TODO:Builder set this as String which is bad habit
    // this.width = width;
    // this.height = height;

    /**Line spacing. It should be a percent of the font size so it will grow with the font*/    
    this.lineSpacing = 1 / 4 * size; 
    
    /**Horizontal alignment of the text, can be: left, center, right*/
    this.align = align || Text.ALIGN_CENTER;

    /**Sets if text is underlined*/
    this.underlined = false;
    this.bold = false;
    this.italic = false;
    this.arrowColor = "#000";

    /**Vertical alignment of the text - for now always middle*/
//    this.valign = Text.VALIGN_MIDDLE;

    /**We will keep the initial point (as base line) and another point just above it - similar to a vector.
     *So when the text is transformed we will only transform the vector and get the new angle (if needed)
     *from it*/
    this.vector = [new Point(x,y),new Point(x,y-20)];

    /**Style of the text*/
    this.style = new Style();

    if(!outsideCanvas){
        this.bounds = this.getNormalBounds();
        ////console.log("this.bounds",this.bounds)
    }
        
    /*JSON object type used for JSON deserialization*/
    this.oType = 'Text'; 

    /*Field to check the arrow enabled or not */
    this.arrow = false;

    /* Arrow Start and end point */
    this.startPoint = null;
    this.endPoint = null;

}


/**Creates a new {Text} out of JSON parsed object
 **/
Text.load = function(o){
    
    //TODO: update
    var newText = new Text(o.str, o.x, o.y, o.font, o.size, false, o.align, o.width , o.height); //fake Text (if we do not use it we got errors - endless loop)
    //align loaded by contructor
    newText.underlined = o.underlined;
    newText.vector = Point.loadArray(o.vector);
    newText.style = Style.load(o.style);
    newText.arrow = o.arrow;
    newText.bold = o.bold;
    newText.italic = o.italic;
    newText.arrowColor = o.arrowColor;
    if(o.startPoint!=null&&o.endPoint!=null)
    {
        newText.startPoint = new Point(o.startPoint.x,o.startPoint.y);
        newText.endPoint = new Point(o.endPoint.x,o.endPoint.y);
    }

    return newText;
}

/**Left alignment*/
Text.ALIGN_LEFT = "left";

/**Center alignment*/
Text.ALIGN_CENTER = "center";

/**Right alignment*/
Text.ALIGN_RIGHT = "right";

/**An {Array} with horizontal alignments*/
Text.ALIGNMENTS = [{
    Value: Text.ALIGN_LEFT,
    Text:'Left'
},{
    Value: Text.ALIGN_CENTER,
    Text:'Center'
},{
    Value: Text.ALIGN_RIGHT,
    Text:'Right'
}];


/**An {Array} of fonts*/
Text.FONTS = [{
    Value: "arial",
    Text: "Arial"
},{
    Value: "arial narrow",
    Text: "Arial Narrow"
},{
    Value: "courier new",
    Text: "Courier New"
},{
    Value: "tahoma",
    Text: "Tahoma"
}];

/**space between 2 caracters*/
Text.SPACE_BETWEEN_CHARACTERS = 2;

/**The default size of the created font*/
Text.DEFAULT_SIZE = 16;

/**Proportion between size of text and thickness of underline*/
Text.UNDERLINE_THICKNESS_DIVIDER = 16;


Text.prototype = {
    
    constructor : Text,
    
    getTextSize:function(){
        
        return this.size;
    },

    //we need to transform the connectionpoints when we change the size of the text
    //only used by the builder, for text figures (not figures with text)
    setTextSize:function(size){
        
        var oldBounds = this.getNormalBounds().getBounds();
        var oldSize = this.size;
        this.size = size;
        var newBounds = this.getNormalBounds().getBounds();
//        this._updateConnectionPoints(oldBounds, newBounds);
    },

    getTextStr:function(){
        
        return this.str;
    },

    setTextStr:function(str){
        
        var oldBounds = this.getNormalBounds().getBounds();
        this.str = str;
        var newBounds = this.getNormalBounds().getBounds();
//        this._updateConnectionPoints(oldBounds, newBounds);

    },

    /**
     *Get a refence to a context (main, in our case)
     **/
    _getContext:function(){
        
        //WE SHOULD NOT KEEP ANY REFERENCE TO A CONTEXT - serialization pain
        return document.getElementById("canvas_main").getContext("2d");
    },


    /**Transform the Text
     **/
    transform:function(matrix){
        
        this.vector[0].transform(matrix);
        this.vector[1].transform(matrix);        
    },


    /**
     *Get the angle around the compas between the vector and North direction
     **/
    getAngle: function(){
        return Util.getAngle(this.vector[0], this.vector[1]);
    },


    /**Returns the width of the text in normal space (no rotation)
     **/
    getNormalWidth:function(){
        
        var linesText = this.str.split("\n");
        var linesWidth = [];
        var maxWidth = 0;

        //store lines width
        this._getContext().save();
        this._getContext().font = this.size + "px " + this.font;
        for(var i in linesText){
            var metrics = this._getContext().measureText(linesText[i]);
            linesWidth[i] = metrics.width;
        }
        this._getContext().restore();


        //find maximum width
        for(i=0; i<linesWidth.length; i++){
            if(maxWidth < linesWidth[i]){
                maxWidth = linesWidth[i];
            }
        }
        /*if(selectedFigureId !=-1)
            return STACK.figures[selectedFigureId].primitives[0].getBounds();
        */
        //return this.width;
        return maxWidth;
    },


    /**Approximates the height of the text in normal space (no rotation)
     **/
    getNormalHeight:function(){
        
        var lines = this.str.split("\n");
        var nrLines = lines.length;
        var totalHeight = 0;

        if (nrLines > 0){
            totalHeight = nrLines * this.size  //height added by lines of text
            + (nrLines - 1) * this.lineSpacing; //height added by inter line spaces
        }
        //return this.height;
        return totalHeight;
    },
    


    /**Paints the text
     **/
    paint:function(context){
        
        context.save();

        var lines = this.str.split("\n");

//        var noLinesTxt = 0;
//        var txtSizeHeight = this.size;

        // update lineSpacing because it could be changed
        // in dynamic way and we do not watch it
        // TODO: reorganize by deleting lineSpacing at all or by adding get/set methods
        this.lineSpacing = 1 / 4 * this.size;

//        var txtSpaceLines = this.lineSpacing;

//        var txtOffsetY = txtSizeHeight + txtSpaceLines;

        //X - offset
        var offsetX = 0;
        if(this.align == Text.ALIGN_LEFT){
            offsetX = -this.getNormalWidth()/2;
        }
        else if(this.align == Text.ALIGN_RIGHT){
            offsetX = this.getNormalWidth()/2;
        }
        
        //Y - offset
        var offsetY = 0.5 * this.size;

//        switch(this.valign) {
//            case Text.VALIGN_TOP:
//                offsetY = -this.getNormalHeight();
//                break;
//
//            case Text.VALIGN_BOTTOM:
//                offsetY = this.getNormalHeight();
//                break;
//
//            case Text.VALIGN_MIDDLE:
//                offsetY = 0.5 * this.size;
//                break;
//        }

        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        //alert("Angle is + " + angle + ' point 0: ' + this.vector[0] + ' point 1: ' + this.vector[1]);


        //visual debug :D
        
        context.translate(this.vector[0].x,this.vector[0].y);
        context.rotate(angle);
        context.translate(-this.vector[0].x, -this.vector[0].y);

        //paint lines

        context.fillStyle = this.style.fillStyle;
        context.font = this.size + "px " + this.font;
        if(this.bold && this.italic)
            context.font = "bold italic "+this.size + "px " + this.font;
        else if(this.bold)
            context.font = "bold "+this.size + "px " + this.font;
        else if(this.italic)
            context.font = "italic "+this.size + "px " + this.font;
        
        context.textAlign = this.align;
        context.textBaseline = "middle";

//        if (this.valign == Text.VALIGN_MIDDLE) {
//            context.textBaseline = "middle";
//        }
        //var lineHeight = 0;
        for(var i=0; i<lines.length; i++){
           Log.info("Line: " + lines[i] + " this.vector[0].x=" + this.vector[0].x + " offsetX=" + offsetX + " this.vector[0].y=" + this.vector[0].y + " offsetY=" + offsetY 
           + " this.getNormalHeight()=" + this.getNormalHeight() + " this.size=" + this.size + " this.lineSpacing=" + this.lineSpacing);

            // x and y starting coordinates of text lines
            var lineStartX = this.vector[0].x + offsetX;
            var lineStartY = (this.vector[0].y - this.getNormalHeight() / 2 + i * this.size + i * this.lineSpacing) + offsetY;
            //var lineStartY = (this.vector[0].y + i * this.size + i * this.lineSpacing) + offsetY;
            context.fillText(
                lines[i],
                lineStartX,
                lineStartY
            );
            //lineHeight = this.wrapText(context,lines[i],lineStartX,lineStartY,this.width,this.size+this.lineSpacing,lineHeight);
            
            if (this.underlined) {
                this.paintUnderline(
                    context,
                    lines[i],
                    lineStartX,
                    lineStartY
                );
            }
            // if(!this.checkHeight(lineHeight))
            //     break;
            //context.fillText(lines[i], this.vector[0].x, txtOffsetY * noLinesTxt);
            //context.fillText(linesText[i], -this.vector[0].x, txtOffsetY * noLinesTxt);
//            noLinesTxt = noLinesTxt + 1;
        }

        context.restore();

    },

    wrapText:function(context, text, x, y, maxWidth, startY,lineHeight) {
 
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            //To check word is too long
            var testWord = words[n];
            var metricsWord = context.measureText(testWord);
            var testWidthWord = metricsWord.width;
            if(testWidthWord > maxWidth)
            {
                //var a = 'aaaabbbbccccee';
                var b = words[n].match(/(.{1,4})/g);
                var line1 = '';
                for(var m=0; m < b.length; m++)
                {
                    var testLine1 = line1 + b[m];
                    var metrics1 = context.measureText(testLine1);
                    var testWidth1 = metrics1.width;
                    if (testWidth1 > maxWidth && m > 0) {
                        context.fillText(line1, x, y);
                        lineHeight+=1;
                        line1 = b[m];
                        y += startY;   
                    }
                    else {
                        line1 = testLine1;
                    }
                    if(!this.checkHeight(lineHeight))
                        return lineHeight;
                }
            }
            else
            {
                context.fillText(line, x, y);
                lineHeight+=1;
                line = words[n] + ' ';
                y += startY;      
            }    
          }
          else {
            var testWord = words[n];
            var metricsWord = context.measureText(testWord);
            var testWidthWord = metricsWord.width;
            if(testWidthWord > maxWidth)
            {
                //var a = 'aaaabbbbccccee';
                var b = words[n].match(/(.{1,4})/g);
                var line1 = '';
                for(var m=0; m < b.length; m++)
                {
                    var testLine1 = line1 + b[m];
                    var metrics1 = context.measureText(testLine1);
                    var testWidth1 = metrics1.width;
                    if (testWidth1 > maxWidth && m > 0) {
                        context.fillText(line1, x, y);
                        lineHeight+=1;
                        line1 = b[m];
                        y += startY;   
                    }
                    else {
                        line1 = testLine1;
                    }
                    if(!this.checkHeight(lineHeight))
                        return lineHeight;
                }
            }
            else
            {
                line = testLine;
            }
          }
          if(!this.checkHeight(lineHeight))
            return lineHeight;
        }
        if(!this.checkHeight(lineHeight))
            return lineHeight;
        context.fillText(line, x, y);
        lineHeight+=1;
        return lineHeight;
      },
    checkHeight:function(nrLines){
        ////console.log("checkheight")
        var totalHeight = 0;
        nrLines += 1;
        if (nrLines > 0){
            totalHeight = nrLines * this.size  //height added by lines of text
            + (nrLines - 1) * this.lineSpacing; //height added by inter line spaces
        }
        ////console.log(totalHeight+"   "+this.height);
        if(totalHeight>this.height)
            return false;
        return true;
    },
    /**Paints underline for the text.
     **/
    paintUnderline:function(context, text, x, y){
        // text width
        var width = context.measureText(text).width;

        // if text align differs from "left" - add offset to X axis
        // fillText method of canvas context make this automatically
        switch(this.align){
            case "center":
                x -= (width/2);
                break;
            case "right":
                x -= width;
                break;
        }

        // add offset to Y axis equal to half of text size
        y += this.size / 2;

        context.save();

        context.beginPath();
        context.strokeStyle = this.style.fillStyle; // color the same as text
        context.lineWidth = this.size / Text.UNDERLINE_THICKNESS_DIVIDER;   // thickness taken in proportion of text size
        context.moveTo(x,y);
        context.lineTo(x + width, y);
        context.stroke();

        context.restore();
    },


    /**Text should not add it's bounds to any figure...so the figure should
     *ignore any bounds reported by text
     *@return {Array<Number>} - returns [minX, minY, maxX, maxY] - bounds, where
     *  all points are in the bounds.
     **/
    getBounds:function(){
        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        var nBounds = this.getNormalBounds();
        /*if(this.align == Text.ALIGN_LEFT){
            nBounds.transform(Matrix.translationMatrix(this.getNormalWidth()/2,0));
        }
        if(this.align == Text.ALIGN_RIGHT){
            nBounds.transform(Matrix.translationMatrix(-this.getNormalWidth()/2,0));
        }*/
        nBounds.transform(Matrix.translationMatrix(-this.vector[0].x,-this.vector[0].y) );
        nBounds.transform(Matrix.rotationMatrix(angle));
        nBounds.transform(Matrix.translationMatrix(this.vector[0].x,this.vector[0].y));
        ////console.log(selectedFigureId+"sdfasdfasdfsafdsadfasfas");
        // if(shape != null)
        // {
        //     return shape.primitives[0].getBounds();
        // }
        // else    
            return nBounds.getBounds();
    },


    /**Returns the bounds the text might have if in normal space (not rotated)
     *We will keep it as a Polygon
     *@return {Polygon} - a 4 points Polygon
     **/
    getNormalBounds:function(){
        var lines = this.str.split("\n");

        var poly = new Polygon();
        poly.addPoint(new Point(this.vector[0].x - this.getNormalWidth()/2 ,this.vector[0].y - this.getNormalHeight()/2));
        poly.addPoint(new Point(this.vector[0].x + this.getNormalWidth()/2 ,this.vector[0].y - this.getNormalHeight()/2));
        poly.addPoint(new Point(this.vector[0].x + this.getNormalWidth()/2 ,this.vector[0].y + this.getNormalHeight()/2));
        poly.addPoint(new Point(this.vector[0].x - this.getNormalWidth()/2 ,this.vector[0].y + this.getNormalHeight()/2));
        ////console.log("poly",poly,this.getNormalWidth(),this.vector,this.vector[0].x,this.vector[0].y , this.getNormalHeight())
        return poly;
    },


    getPoints:function(){
        return [];
    },


    contains: function(x,y){
        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        var nBounds = this.getNormalBounds();
        nBounds.transform( Matrix.translationMatrix(-this.vector[0].x,-this.vector[0].y) );
        nBounds.transform(Matrix.rotationMatrix(angle));
        nBounds.transform(Matrix.translationMatrix(this.vector[0].x,this.vector[0].y));

        // check if (x,y) is inside or on a borders of nBounds
        return nBounds.contains(x,y,true);
    },


    near:function(x, y, radius){
        var angle = Util.getAngle(this.vector[0],this.vector[1]);
        var nBounds = this.getNormalBounds();
        nBounds.transform( Matrix.translationMatrix(-this.vector[0].x,-this.vector[0].y) );
        nBounds.transform(Matrix.rotationMatrix(angle));
        nBounds.transform(Matrix.translationMatrix(this.vector[0].x,this.vector[0].y));

        return nBounds.near(x,y, radius);
    },


    equals:function(anotherText){
        if(!anotherText instanceof Text){
            return false;
        }

        if(
            this.str != anotherText.str
            || this.font != anotherText.font
            || this.size != anotherText.size
            || this.lineSpacing != anotherText.lineSpacing
            || this.size != anotherText.size){
            return false;
        }


        for(var i=0; i<this.vector.length; i++){
            if(!this.vector[i].equals(anotherText.vector[i])){
                return false;
            }
        }

        if(!this.style.equals(anotherText.style)){
            return false;
        }

        //TODO: compare styles too this.style = new Style();
        return true;
    },


    /**Creates a clone of current text*/
    clone: function(){
        var cText = new Text(this.str, this.x, this.y, this.font, this.size, this.outsideCanvas);
        cText.align = this.align;
    
//        cText.valign = this.valign;
        cText.vector = Point.cloneArray(this.vector);
        cText.style = this.style.clone();

        if(!cText.outsideCanvas){
            cText.bounds = this.bounds.clone(); //It's a Polygon (so we can clone it)
        }

        return cText;
        
        /*
        var newText = {};
        for (i in this) {
            if (i == 'vector'){
                newText[i] = Point.cloneArray(this[i]);
                continue;
            }
            if (this[i] && typeof this[i] == "object") {
                newText[i] = this[i].clone();
            } else newText[i] = this[i]
        } return newText;
        */
    },


    toString:function(){
        return 'Text: ' + this.str + ' x:' + this.vector[0].x +  ' y:' + this.vector[0].y;
    },

    /**There are characters that must be escaped when exported to SVG
     **/
    escapeString:function(s){
        var result = new String(s);
        
        var map = [];
        map.push(['<','&lt;']);

        for(var i = 0; i<map.length; i++){
            result = result.replace(map[i][0], map[i][1]);
        }

        return result;
    },

    toSVG: function(){
        /*Example:
          <text x="200" y="150" fill="blue" style="stroke:none; fill:#000000;text-anchor: middle"  transform="rotate(30 200,150)">
              You are not a banana.
          </text>
        */

        var angle = this.getAngle() * 180 / Math.PI;
        var height = this.getNormalHeight();

        //X - offset
        var offsetX = 0;
        var alignment = 'middle';
        if(this.align == Text.ALIGN_LEFT){
            offsetX = -this.getNormalWidth()/2;
            alignment = 'start';
        }
        else if(this.align == Text.ALIGN_RIGHT){
            offsetX = this.getNormalWidth()/2;
            alignment = 'end';
        }

        //svg alignment
//        if(this.align)

        //general text tag
        var result = "\n" + repeat("\t", INDENTATION) + '<text y="' + (this.vector[0].y - height/2) + '" ';
        result += ' transform="rotate(' + angle + ' ' + this.vector[0].x + ' ,' + this.vector[0].y + ')" ';
        result += ' font-family="' + this.font + '" ';
        result += ' font-size="' + this.size + '" ';

        /**
         *We will extract only the fill properties from Style, also we will not use
         *Note: The outline color of the font. By default text only has fill color, not stroke.
         *Adding stroke will make the font appear bold.*/
        if(this.style.fillStyle != null){
//            result += ' stroke=" ' + this.style.fillStyle + '" ';
            result += ' fill=" ' + this.style.fillStyle + '" ';
        }
        result += ' text-anchor="' + alignment + '" ';
        result +=  '>';

        INDENTATION++;

        //any line of text (tspan tags)
        var lines = this.str.split("\n");
        for(var i=0; i< lines.length; i++){
            var dy = parseFloat(this.size);
            if(i > 0){
                dy += parseFloat(this.lineSpacing);
            }
            
            //alert('Size: ' + this.size + ' ' + (typeof this.size) + ' lineSpacing:' + this.lineSpacing + ' dy: ' + dy);
            result += "\n" + repeat("\t", INDENTATION) + '<tspan x="' + (this.vector[0].x + offsetX) + '" dy="' + dy  + '">' + this.escapeString(lines[i]) + '</tspan>'
        } //end for
        
        INDENTATION--;
        
        //result += this.str;
        result += "\n" + repeat("\t", INDENTATION) + '</text>';

        if(this.debug){
            result += "\n" + repeat("\t", INDENTATION) + '<circle cx="' + this.vector[0].x + '" cy="' + this.vector[0].y + '" r="3" style="stroke: #FF0000; fill: yellow;" '
            + ' transform="rotate(' + angle + ' ' + this.vector[0].x + ' ,' + this.vector[0].y + ')" '
            + '/>';
        
            result += "\n" + repeat("\t", INDENTATION) + '<circle cx="' + this.vector[0].x + '" cy="' + (this.vector[0].y - height/2) + '" r="3" style="stroke: #FF0000; fill: green;" '
            + ' transform="rotate(' + angle + ' ' + this.vector[0].x + ' ,' + this.vector[0].y + ')" '
            + ' />';
        }
        
        return result;
       
    }

}



/* main.js */


/**Activate or deactivate the undo feature
 ***/
var doUndo = true; 

/**Usually an instance of a Command (see /lib/commands/*.js)*/
var currentMoveUndo = null; 

/**The width of grid cell. 
 **/
var GRIDWIDTH = 30; 

/**The distance (from a snap line) that will trigger a snap*/
var SNAP_DISTANCE = 5;

/**The half of light distance between upper and lower border for gradient filling*/
var gradientLightStep = 0.06;


var fillColor=null;
var strokeColor='#000000';
var lineWidth = 2;
var currentText=null;


/**Default top&bottom padding of Text editor's textarea*/
var defaultEditorPadding = 1;

/**Default border width of Text editor's textarea*/
var defaultEditorBorderWidth = 1;

var scrollBarWidth = 19;

var FIGURE_ESCAPE_DISTANCE = 30; /**the distance by which the linearrows will escape Figure's bounds*/

/**the distance by which the linearrows will be able to connect with Figure*/
var FIGURE_CLOUD_DISTANCE = 4;

var createFigureFunction = null;

/**A variable that tells us if CTRL is pressed*/
var CNTRL_PRESSED = false;

/**A variable that tells us if SHIFT is pressed*/
var SHIFT_PRESSED = false;

var figureSets = [];

/**Used to generate nice formatted SVG files */
var INDENTATION = 0;

/**
 */
function stopselection(ev){
    
    if(ev.target.className == "Text"){
        return true;
    }
    return false;
}

var STACK  = new Stack();


/**keeps track if the MLB is pressed*/    
var mousePressed = false; 

/**the default application state*/
var STATE_NONE = 'none'; 

/**we have figure to be created**/
var STATE_FIGURE_CREATE = 'figure_create'; 

/**we selected a figure (for further editing for example)*/
var STATE_FIGURE_SELECTED = 'figure_selected'; 

/**we are dragging the mouse over a group of figures.*/
var STATE_SELECTING_MULTIPLE = 'selecting_multiple';

/**we are dragging the mouse over a group of figures.*/
var STATE_COPY_PASTE = 'copy_paste';

/**we are dragging the mouse over a group of figures.*/
var STATE_FREE_COPY_PASTE = 'free_copy_paste';

/**we are dragging the mouse over a group of figures.*/
var STATE_FREE_SELECT = 'free_select';

/**we are dragging the mouse over a group of figures.*/
var STATE_PENCIL_SELECT = 'pencil_select';

/**we are dragging the mouse over a group of figures.*/
var STATE_PENCIL_MOVE = 'pencil_move';

/**we have a group selected (either temporary or permanent)*/
var STATE_GROUP_SELECTED = 'group_selected';

/**we have a group selected (either temporary or permanent)*/
var STATE_MARKER_SELECT = 'marker_select';

/**we have a group selected (either temporary or permanent)*/
var STATE_MARKER_MOVE = 'marker_move';

/**we have a text editing*/
//var STATE_TEXT_EDITING = STATE_FIGURE_SELECTED;
var STATE_TEXT_EDITING = 'text_editing';

/** We have multiple Apps */
var STATE_APP = 'app';

/**we have a ruler deign*/
var STATE_RULER_APP = 'ruler_app';

/**we have a ruler deign*/
var STATE_RULER_draw = 'ruler_draw';

/**we have a ruler deign*/
var STATE_PROTRACTOR_APP = 'protractor_app';

/**we have a ruler deign*/
var STATE_COMPASS_APP = 'compass_app';

/**we are selecting the start of a linearrow*/
var STATE_CONNECTOR_PICK_FIRST = 'connector_pick_first'; 

/**we are selecting the end of a linearrow*/
var STATE_CONNECTOR_PICK_SECOND = 'connector_pick_second'; 

/**we selected a linearrow (for further editing for example)*/
var STATE_CONNECTOR_SELECTED = 'connector_selected';

/**move a connection point of a linearrow*/
var STATE_CONNECTOR_MOVE_POINT = 'connector_move_point';

/**Keeps current state*/
var state = STATE_NONE;

/** Keeps the state for the apps */
var state_apps = [];

/**The (current) selection area*/
var selectionArea = new Polygon(); 
selectionArea.points.push(new Point(0,0));
selectionArea.points.push(new Point(0,0));
selectionArea.points.push(new Point(0,0));
selectionArea.points.push(new Point(0,0));
selectionArea.style.strokeStyle = 'grey';
selectionArea.style.gradientBounds = [];
selectionArea.style.lineWidth = '1';

/**Toggle grid visible or not*/
var gridVisible = false;

/**Makes figure snap to grid*/
var snapTo = true;

/**Keeps last coodinates while dragging*/
var lastClick = [];

/**Default line width*/
var defaultLineWidth = 2;

/**Default handle line width*/
var defaultThinLineWidth = 1;

/**Current instance of TextEditorPopup*/
var currentTextEditor = null;

/**Current selected figure id ( -1 if none selected)*/
var selectedFigureId = -1;

/**Currently selected figure thumbnail (for D&D)*/
var selectedFigureThumb = null

/**Current selected group (-1 if none selected)*/
var selectedGroupId = -1;

/**Set on true while we drag*/
var dragging = false;

/**Currently inserted image filename*/
var insertedImageFileName = null;

/**Holds a wrapper around canvas object*/
var canvasProps = null;

/**Currently holds two elements the type: figure|group and the id*/
var clipboardBuffer = [];



/** Currently holds the imagedata of the pencil */
var pencil_data;

/**Return current canvas.
 **/
function getCanvas(){
    var canvas = document.getElementById("canvas_main");
    return canvas;
}

function getCanvasPencil(){
    var canvas = document.getElementById("canvas_pencil");
    return canvas;
}
function getCanvasApp(){
    var canvas = document.getElementById("canvas_app");
    var ctx=canvas.getContext("2d");
    return canvas;
}
function getCanvasTemp(){
    var canvas = document.getElementById("canvas_temp");
    return canvas;
}
function getWorkAreaContainer(){
    /**Id of work area HTML element, which includes canvas*/
    var workAreaContainer = document.getElementById("canvas_main");
    ////console.log("workareacontainer",workAreaContainer)
    return workAreaContainer;
}
/**Return the 2D context of current canvas
 **/
function getContext(){
    var canvas = getCanvas();
    if(canvas.getContext){
        return canvas.getContext("2d");
    }
    else{
        alert('You need a HTML5 web browser. Any Safari,Firefox, Chrome or Explorer supports this.');
    }
}

/**Return the 2D context of pencil canvas
 **/
function getContextPencil(){
    var canvas = getCanvasPencil();
    if(canvas.getContext){
        return canvas.getContext("2d");
    }
    else{
        alert('You need a HTML5 web browser. Any Safari,Firefox, Chrome or Explorer supports this.');
    }
}

/**Return the 2D context of pencil canvas
 **/
function getContextApp(){
    var canvas = getCanvasApp();
    if(canvas.getContext){
        return canvas.getContext("2d");
    }
    else{
        alert('You need a HTML5 web browser. Any Safari,Firefox, Chrome or Explorer supports this.');
    }
}
/**Keeps current figure set id*/
var currentSetId = 'basic';
function clearPencil(){
    $("#pencil_tools").hide();
    var canvas_top = getCanvasTemp();
    var ctx_top = canvas_top.getContext('2d');
    ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
    canvas_top.style.display = 'none';
}
function clearPencilCanvas(){
    erasor_state = false;
    var canvas_top = getCanvasPencil();
    var ctx_top = canvas_top.getContext('2d');
    ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
    ctx_top.strokeStyle = "#000";
    ctx_top.lineWidth = lineWidth;
    ctx_top.fillStyle = "#000";
    ctx_top.globalCompositeOperation = 'source-over';
}
/**
 * Reveals the figure set named by 'name' and hide previously displayed set
 **/
function setFigureSet(id){
    Log.info("main.js id = " + id);
    
    //alert(name);
    var div = document.getElementById(id);
    if(div != null){
        if(currentSetId != null){
            Log.info("main.js currentSetId = " + currentSetId);
            var currentFigureSet = document.getElementById(currentSetId);
            currentFigureSet.style.display = 'none';
        }
        div.style.display = 'block';
        currentSetId = id;
    }
}

var currentDiagramId = null;

function save(){
	////console.log("called save")
  
    /*selectedFigureId = -1;
    state = STATE_NONE;*/
    //draw();
    var canvas = getCanvas();
    if(canvas == null) {
      return;
    }
    var canvas_context = canvas.getContext('2d');
    ////console.log("saving"+canvasProps.backgroundURL);
    
    //var canvas_dummy = document.getElementById('canvas_dummy');
    var canvas_dummy = document.createElement('canvas');
	////console.log("canvas_dummy",canvas_dummy)
    canvas_dummy.width = 250;
    canvas_dummy.height = 125;
    var ctx_temp = canvas_dummy.getContext('2d');
    ctx_temp.clearRect(0, 0, canvas_dummy.width, canvas_dummy.height);
	////console.log("width",canvas_dummy.width)
    ctx_temp.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,canvas_dummy.width, canvas_dummy.height);
    ctx_temp.drawImage(getCanvasPencil(),0,0,getCanvasPencil().width,getCanvasPencil().height,0,0,canvas_dummy.width, canvas_dummy.height);
    var diagram = {  "i" : currentDiagramId , "c": canvasProps.clone(canvasProps),"l":LineArrow_MANAGER.clone(LineArrow_MANAGER), "s":STACK.clone(STACK), "h":History.COMMANDS,"h_c":History.CURRENT_POINTER};
    //var diagram = {  "i" : currentDiagramId , "c": canvasProps.clone(canvasProps),"l":LineArrow_MANAGER.clone(LineArrow_MANAGER), "s":STACK.clone(STACK), "p":encodeImageData(canvas_dummy.toDataURL()),"h":[]/*History.COMMANDS*/,"h_c":[]/*History.CURRENT_POINTER*/};
    ////console.log(diagram);
    var index = getDiagramIndex();
    if(index == -1){
        canvas_diagram.push(diagram);
    }
    else{
        canvas_diagram[index] = diagram;
    }
    for(var i = 0;i < canvas_diagram.length;i++)
    {
        var tmp = canvasProps.clone(canvasProps);
        canvas_diagram[i].c.pencil = tmp.pencil;
    }
    //console.log('Save Diagram Data');

}

function getDiagramIndex()
{
    var index = -1;
    for(var i = 0;i < canvas_diagram.length;i++)
    {
        //var obj  = eval('(' + canvas_diagram[i] + ')'); 
        var obj = canvas_diagram[i];
        if(parseInt(obj.i) == parseInt(currentDiagramId))
        {
            //alert("Index is Present");
            return i;
        }
    }
    return index;
}

function load(diagramId,bgURL, bgType){
    reset(getCanvas());
    STACK.reset();
    History.reset();
    LineArrow_MANAGER.reset();
    clearPencil();
    clearPencilCanvas();
    currentDiagramId = diagramId;
    var index = getDiagramIndex();
    
    if(index != -1)
    {
        try{
        //var obj  = eval('(' + canvas_diagram[diagramId - 1] + ')');
        var obj = canvas_diagram[diagramId - 1];
        ////console.log("Stack");
        ////console.log(obj.s);
        pencil_draw = true;
        canvasProps = CanvasProps.load(obj.c);
        canvasProps.sync();
        STACK = Stack.load(obj.s);
        LineArrow_MANAGER = LineArrowManager.load(obj.l);
        currentDiagramId = diagramId;
        ////console.log("Loadded");
        History.load(obj.h,obj.h_c);
        clearPencilCanvas();
        
        } catch(error) {
            alert("main.js:load() Exception: " + error);
        }    
    }
    if(bgURL)
    {
      if(bgURL=='none')
      {
        canvasProps.backgroundURL = '';
        canvasProps.bgType = '';
      }
      else
      {
        canvasProps.backgroundURL = bgURL;
        canvasProps.bgType = bgType;
      }
        
    }
       
    addBackground(bgType);
    draw();
    action('pencil');
    //$(".pencil-tool").siblings('.black-flyout').slideToggle();
}

function getPreviewCanvas(index){
    var canvas_dummy = document.getElementById('canvas_dummy');
    var ctx_temp = canvas_dummy.getContext('2d');
    ctx_temp.clearRect(0, 0, canvas_dummy.width, canvas_dummy.height);
    var obj = canvas_diagram[index];
    ////console.log("preview_ Canvas "+index);
    ////console.log(obj);
    //ctx_temp.putImageData(obj.p,0,0);
    ////console.log('ImageData');
    ////console.log(obj.p);
    var canvas_preview = document.getElementById('preview_'+(index+1));
    var ctx_preview = canvas_preview.getContext('2d');
    /*if(obj.c.backgroundURL!=undefined&&obj.c.backgroundURL.trim()&&obj.c.backgroundURL!=null)
    {
        var img = new Image();
        img.src = obj.c.backgroundURL;
        img.onload = function(){
            ctx_preview.drawImage(img,0,0,canvas_dummy.width,canvas_dummy.height,0,0,
                            250, 125);
            ctx_preview.drawImage(canvas_dummy,0,0,canvas_dummy.width,canvas_dummy.height,0,0,
                            250, 125);       
    
        }
    }
    else
    {*/
        var img = new Image();
        img.src = decodeImageData(obj.p);
        img.onload = function(){
            ctx_preview.drawImage(img,0,0,250,125,0,0,
                            250, 125);
        }
        /*ctx_preview.drawImage(canvas_dummy,0,0,canvas_dummy.width,canvas_dummy.height,0,0,
                            250, 125);*/
       /* ctx_preview.drawImage(getCanvasPencil(),0,0,getCanvasPencil().width,getCanvasPencil().height,0,0,
                            250, 125);*/
   // }
}

/**Setup the editor panel for a special shape. 
 **/
function setUpEditPanel(shape){
        
    if(shape == null){
    //do nothing
        document.getElementById('shape-tools').innerHTML = ''; 
        document.getElementById('shape-tools').style.display = "none";

        ////console.log("null");
    }
    else{
        //alert(shape.oType);
        switch(shape.oType){
            
            case 'Figure':
            case 'LineArrow':
                ////console.log("Shape");
                //alert(shape.name);
                if(shape.name !="Pencil")
                {
                    var globalAlpha = 100;
                    var linWidth = 2;
                    var textSize = 12;
                    var textAlign = "center";
                    var textUnderlined = "";
                    var textBold = "";
                    var textItalic = "";
                    var textFontColor = "";
                    var arrowcolor = "";
                    if(shape.style.globalAlpha)
                        globalAlpha = Math.round(shape.style.globalAlpha*100);
                    if(shape.style.lineWidth != 2)
                        linWidth = shape.style.lineWidth;
                    if(shape.style.lineWidth == 2.005)
                        linWidth = 2;
                    if(shape.name == "Text" )
                    {
                        //if(shape.primitives[1].align != "center")
                            textAlign = shape.primitives[1].align;
                        if(shape.primitives[1].underlined)
                            textUnderlined = "selected";
                        if(shape.primitives[1].bold)
                            textBold = "selected";
                        if(shape.primitives[1].italic)
                            textItalic = "selected";
                            textSize = shape.primitives[1].size;
                    }

                    
                    var fillStyleHTML     = '<li><select class="" id="tagdetail"></select><div id="dialog-modal"></div></li>';
                    var fillStyleImageHTML = '<li><select class="" id="tagImagedetail"></select></li>';
                    var strokeStyleHTML   = '<li><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-sarycolor" id="mydata" ></span><i class="color-more"></i></a> <div class="color-levelsinline black-flyout"> <ul class="color-levels strokecolor clearfix"> <li><span class="color black"></span></li> <li><span class="color red"></span></li> <li><span class="color yellow"></span></li> <li><span class="color green"></span></li> <li><span class="color white"></span></li> <li><span class="color blue"></span></li> <li><span class="color pink"></span></li> <li><span class="color orange"></span></li> </ul> </div> </li>';
                    var strokewidthHTML   = '<li><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-stroke"></span></a> <div class="inline-oplevels-default black-flyout"> <ul class="inline-oplevels strokewidth clearfix"> <li><a href="javascript:void(0);"><span class="inline-opup"></span></a></li> <li><a href="javascript:void(0);" class="strokeWidthVal">'+linWidth+'</a></li> <li><a href="javascript:void(0);"><span class="inline-opdown"></span></a></li> </ul> </div> </li> ';
                    var fillOpacityHTML   = '<li><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-opacity"></span></a> <div class="inline-oplevels-default black-flyout"> <ul class="inline-oplevels fillopacity clearfix"> <li><a href="javascript:void(0);"><span class="inline-opup"></span></a></li> <li><a href="javascript:void(0);" class="fillOpacityVal">'+globalAlpha+'</a></li> <li><a href="javascript:void(0);"><span class="inline-opdown"></span></a></li> </ul> </div> </li> ';
                    
                    var shapeEditHTMLContent = fillStyleHTML;
                    var obj = STACK.figureGetById(selectedFigureId);
                    var created_date=obj.created_at;
                    var bottomId= document.getElementById("create_side").innerHTML="Created at"+" "+new Date(created_date);
                    // if(update!=null)
                    // {
                    //     update=document.getElementById("update_side").innerHTML="Updated at"+" "+new Date(component_tag.data.updated_at)
                    // }
                    if(shape.name == "Line")
                    shapeEditHTMLContent = strokewidthHTML;
                    var shapeMainHTML = '<ul class="image-mainoptions"> <div id=""><span title="Edit"></span></div><li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del" title="Delete"></span></a></li>  <li><a href="javascript:void(0);"><span class="inline-brush" title="Select tag"></span></a></li> </ul> ';
                    var shapeEditHTML = '<ul  class="image-editoptions">'+shapeEditHTMLContent+'</ul> </li>';
                    var shape_tools = '<div class="image-inlineoptions"> <ul class="clearfix"> <li>'+shapeMainHTML+'</li><li class="shapeEditHTML">'+shapeEditHTML+'</li></ul> </div>';
                    document.getElementById('shape-tools').innerHTML = shape_tools; 
                    /* if(shape.name == "Arc")
                      shapeEditHTMLContent = strokeStyleHTML+strokewidthHTML;  */
                    
                    var shapeMainHTML = '<ul class="image-mainoptions"> <a href="javascript:editText(\''+shape.id+'\');"><span title="Edit"></span></a><li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del" title="Delete"></span></a></li><li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del" title="Delete"></span></a></li><li><a href="javascript:void(0);"><span class="inline-brush" title="Select tag"></span></a></li> </ul> ';
                    if(shape.name == "Text")
                    {
                        var text_fontSizeHTML = '<li><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-text textSizeVal">'+textSize+'</span></a> <div class="inline-oplevels-default black-flyout"> <ul class="inline-oplevels textSize clearfix"> <li><a href="javascript:void(0);"><span class="inline-opup"></span></a></li> <li><a href="javascript:void(0);" class="textSizeVal">'+textSize+'</a></li> <li><a href="javascript:void(0);"><span class="inline-opdown"></span></a></li> </ul> </div> </li> ';
                        var text_fontBoldHTML = '<li class="textBoldVal '+textBold+'"><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-bold">B</span></a> </li> ';
                        var text_fontiHTML    = '<li class="textItalicVal '+textItalic+'"><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-italic"><i>i</i></span></a> </li> ';
                        var text_fontlineHTML = '<li class="textUnderlinedVal '+textUnderlined+'"><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-underlined">Ṳ</span></a> </li> ';
                        var text_fontAligHTML = '<li><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-align textAlignVal '+textAlign+'" id="textAlign"></span></a> <div class="inline-oplevels-default black-flyout"> <ul class="inline-oplevels textAlign clearfix"> <li><a href="javascript:void(0);"><span class="inline-align left"></span></a></li> <li><a href="javascript:void(0);"><span class="inline-align center"></span></a></li> <li><a href="javascript:void(0);"><span class="inline-align right"></span></a></li> </ul> </div> </li> ';
                        var text_colorHTML    = '<li><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-primarycolor" style="background:'+shape.primitives[1].style.fillStyle+';"></span><i class="color-more"></i></a> <div class="color-levelsinline black-flyout"> <ul class="color-levels fontcolor clearfix"> <li><span class="color black"></span></li> <li><span class="color red"></span></li> <li><span class="color yellow"></span></li> <li><span class="color green"></span></li> <li><span class="color white"></span></li> <li><span class="color blue"></span></li> <li><span class="color pink"></span></li> <li><span class="color orange"></span></li> </ul> </div> </li>';
                        //var text_arrowHTML    = '<li><a href="javascript:void(0);" class="flyout-link inlineimg-option"><span class="inline-secondarycolor" style="background:'+shape.primitives[1].arrowColor+';"></span><i class="color-more"></i></a> <div class="color-levelsinline black-flyout"> <ul class="color-levels arrowcolor clearfix"> <li><span class="color black"></span></li> <li><span class="color red"></span></li> <li><span class="color yellow"></span></li> <li><span class="color green"></span></li> <li><span class="color white"></span></li> <li><span class="color blue"></span></li> <li><span class="color pink"></span></li> <li><span class="color orange"></span></li> </ul> </div> </li>';
                    
                        if(shape.primitives[1].arrow)
                            shapeEditHTMLContent = text_fontSizeHTML+text_fontBoldHTML+text_fontiHTML+text_fontlineHTML+text_fontAligHTML+text_arrowHTML;
                        else
                            shapeEditHTMLContent = text_fontSizeHTML+text_fontBoldHTML+text_fontiHTML+text_fontlineHTML+text_fontAligHTML+text_colorHTML;
                        shapeMainHTML = '<ul class="image-mainoptions"> <li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del"></span></a></li><li><a href="javascript:editText(\''+shape.id+'\');"><span class="inline-editText"></span></a></li> <li><a href="javascript:toggleFigure(\''+shape.id+'\');"><span class="inline-view"></span></a></li><li><a href="javascript:void(0);"><span class="inline-brush"></span></a></li> </ul> ';
                        
                    }
                    if(shape.name=="slider"){
                    
                        var shapeMainHTML = '<ul class="image-mainoptions"> <div id="component_model"><span title="Edit"></span></div><li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del" title="Delete"></span></a></li>  <li><a href="javascript:void(0);"><span class="inline-brush" title="Select tag"></span></a></li> </ul> ';
                        var shapeEditHTML = '<ul  class="image-editoptions">'+shapeEditHTMLContent+'</ul> </li>';
                        var shape_tools = '<div class="image-inlineoptions"> <ul class="clearfix"> <li>'+shapeMainHTML+'</li><li class="shapeEditHTML">'+shapeEditHTML+'</li></ul> </div>';
                        document.getElementById('shape-tools').innerHTML = shape_tools;
                    }
                    if(shape.name=="gauge"){
                        var shapeMainHTML = '<ul class="image-mainoptions"> <div id="component_model"><span title="Edit"></span></div><li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del" title="Delete"></span></a></li><li><a href="javascript:void(0);"><span class="inline-brush" title="Select tag"></span></a></li> </ul> ';
                        var shapeEditHTML = '<ul  class="image-editoptions">'+shapeEditHTMLContent+'</ul> </li>';
                        var shape_tools = '<div class="image-inlineoptions"> <ul class="clearfix"> <li>'+shapeMainHTML+'</li><li class="shapeEditHTML">'+shapeEditHTML+'</li></ul> </div>';
                        document.getElementById('shape-tools').innerHTML = shape_tools;

                    }
                    if(shape.name=="trend"){

                        var shapeMainHTML = '<ul class="image-mainoptions"> <div id="component_model"><span title="Edit"></span></div><li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del" title="Delete"></span></a></li>  <li><a href="javascript:void(0);"><span class="inline-brush" title="Select tag"></span></a></li> </ul> ';
                        var shapeEditHTML = '<ul  class="image-editoptions">'+shapeEditHTMLContent+'</ul> </li>';
                        var shape_tools = '<div class="image-inlineoptions"> <ul class="clearfix"> <li>'+shapeMainHTML+'</li><li class="shapeEditHTML">'+shapeEditHTML+'</li></ul> </div>';
                        document.getElementById('shape-tools').innerHTML = shape_tools;

                    }
                    
                    if(shape.name == "Image")
                    {   
                        var obj = STACK.figureGetById(selectedFigureId);
                        var created_date=obj.created_at;
                        document.getElementById("create_side").innerHTML="Created at"+""+created_date;
                        // if(update!=null)
                        // {
                        // update=document.getElementById("update_side").innerHTML="Updated at"+" "+new Date(component_tag.data.updated_at)
                        // }
                        shapeMainHTML = '<ul class="image-mainoptions"> <a href="javascript:editText(\''+shape.id+'\');"><span class="inline-editText" title="Edit"></span></a><li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del" title="Delete"></span></a></li>  <li><a href="javascript:void(0);"><span class="inline-brush" title="Select tag"></span></a></li> </ul> ';
                        shapeEditHTMLContent = fillStyleHTML;
                    }
                    if(shape.name =="Pentagon")
                    {
                        shapeMainHTML = '<ul class="image-mainoptions"> <li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del"></span></a></li><li><a href="javascript:toggleEditPoints(\''+shape.id+'\');"><span class="inline-editpoints"></span></a></li> <li><a href="javascript:toggleFigure(\''+shape.id+'\');"><span class="inline-view"></span></a></li> <li><a href="javascript:toggleAngle(\''+shape.id+'\');"><span class="inline-angle"></span></a></li> <li><a href="javascript:void(0);"><span class="inline-brush"></span></a></li> </ul> ';
                    }
                    /* if(shape.name =="Angle")
                    {
                        shapeMainHTML = '<ul class="image-mainoptions"> <li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del"></span></a></li><li><a href="javascript:toggleFigure(\''+shape.id+'\');"><span class="inline-view"></span></a></li><li><a href="javascript:toggleAngle(\''+shape.id+'\');"><span class="inline-angle"></span></a></li> <li><a href="javascript:void(0);"><span class="inline-brush"></span></a></li> </ul> ';
                        shapeEditHTMLContent = strokeStyleHTML+strokewidthHTML+fillOpacityHTML;  
                    } */

                    /* if(shape instanceof LineArrow)
                    {
                        shapeMainHTML = '<ul class="image-mainoptions"> <li><a href="javascript:deleteFigure(\''+shape.id+'\');"><span class="inline-del"></span></a></li> <li><a href="javascript:toggleFigure(\''+shape.id+'\');"><span class="inline-view"></span></a></li> <li><a href="javascript:void(0);"><span class="inline-brush"></span></a></li> </ul> ';
                        shapeEditHTMLContent = strokeStyleHTML+strokewidthHTML;
                        //alert("asdf");
                    } */
                //    var shapeEditHTML = '<ul  class="image-editoptions">'+shapeEditHTMLContent+'</ul> </li>';
                //     var shape_tools = '<div class="image-inlineoptions"> <ul class="clearfix"> <li>'+shapeMainHTML+'</li><li class="shapeEditHTML">'+shapeEditHTML+'</li></ul> </div>';
                //     document.getElementById('shape-tools').innerHTML = shape_tools;
            
                    window.setTimeout(function(){
                        var x = 0;
                        var y = 0;
                        var shapeBounds = shape.getBounds();
                        var canvas_sizeCheck = getCanvas();
                        if(50>shapeBounds[0])
                          x = shapeBounds[2];  
                        else
                          x = shapeBounds[0];
                        if(canvas_sizeCheck.height-50<shapeBounds[3])
                          y = shapeBounds[1] - 100; 
                        else
                          y = shapeBounds[3]; 
                        document.getElementById('shape-tools').style.left = (x+80) + "px";
                        document.getElementById('shape-tools').style.top = (y+40) + "px";
                        document.getElementById('shape-tools').style.display = "block";
                        //alert("displayed");
                    },100);
                }
                break;
            default: //both Figure and LineArrow
                //alert("displayed1");
                document.getElementById('shape-tools').style.display = "none";
        }
    }
}

function setUpCropButton() {
    window.setTimeout(function(){
        var handlePoints = []; 
        var handlers=HandleManager.handleGetAll();
        var x = 0;
        var y = 0;
        var shapeBounds = HandleManager.shape.getBounds();
                        x = shapeBounds[2];
                        y = shapeBounds[3]; 
        ////console.log(HandleManager.shape);
        document.getElementById('crop-button').style.left = (x+80) + "px";
        document.getElementById('crop-button').style.top = (y+40) + "px";
        document.getElementById('crop-button').style.display = "block";
    },100);
}

function cropandPasteCanvas() {
    var selectedGroup = STACK.groupGetById(selectedGroupId);
    var points = selectionArea.points;
    selectionArea.points = [];
    HandleManager.clear();
    state = STATE_NONE;
    if(!selectedGroup.permanent)
    {
        STACK.groupDestroy(selectedGroupId);
    }
    selectedGroupId = -1;
    draw();
    var ctx = getContext();
    var pencil_ctx = getContextPencil();
    var imgData1=ctx.getImageData(points[0].x,points[0].y,Util.getLength(points[0],points[1]),Util.getLength(points[0],points[3]));
    var imgData2=pencil_ctx.getImageData(points[0].x,points[0].y,Util.getLength(points[0],points[1]),Util.getLength(points[0],points[3]));
    
    var tmp_canvas = document.createElement('canvas');
    var tmp_ctx = tmp_canvas.getContext('2d');
    tmp_canvas.id = 'tmp_canvas';
    tmp_canvas.width = Util.getLength(points[0],points[1]);
    tmp_canvas.height = Util.getLength(points[0],points[3]);
    document.getElementById('editor').appendChild(tmp_canvas);
    
    tmp_ctx.putImageData(imgData1, 0, 0);
    var img = imageDataToimage(imgData2);
    img.onload = function(anImageFrame){
        tmp_ctx.drawImage(img, 0, 0);
        var imgData = tmp_ctx.getImageData(0,0,tmp_canvas.width,tmp_canvas.height);
            var temp_screen = document.createElement("canvas");
            temp_screen.width = tmp_canvas.width;
            temp_screen.height = tmp_canvas.height;
            var temp_screen_ctx = temp_screen.getContext('2d');
            temp_screen_ctx.putImageData(imgData,0,0);
            var imgDataURL = temp_screen.toDataURL();
        var placeX = points[0].x+(points[1].x - points[0].x)/2;
        var placeY = points[0].y+(points[3].y - points[0].y)/2;
        //creates a container
        var cmdFigureCreate = new InsertedImageFigureCreateCommand("ImageData", placeX,placeY,imgDataURL);
        cmdFigureCreate.execute();
        History.addUndo(cmdFigureCreate);
        hidecrop();
        document.getElementById('editor').removeChild(tmp_canvas);
    };
}

function imageDataToimage(imageData){
    var temp = "";
    var img = new Image();
    for (var j = 0; j < imageData.data.length; j++) { //Each byte
        temp += String.fromCharCode(imageData.data[j]);
    }
    var encoded = generatePng(imageData.width, imageData.height, temp);
    img.src = "data:image/png;base64," + btoa(encoded);
    return img;
}

function hidecrop(){
    document.getElementById('crop-button').style.left = "0px";
    document.getElementById('crop-button').style.top = "0px";
    document.getElementById('crop-button').style.display = "none";
}
/**
 * This instance is responsible for creating and updating Text Editor Popup.
 */
function TextEditorPopup(editor, tools, shape, textPrimitiveId){
    ////console.log("3rdtexteditorpopup")
    this.editor = editor;
    this.tools = tools;
    this.shape = shape;
    this.textPrimitiveId = textPrimitiveId;
    ////console.log("bound",this.textPrimitiveId)

    /*We need to construct the full path to the properties of Text*/
    // beginning of property string of BuilderProperty for primitive
    var propertyPrefix;

    if (this.shapeIsAConnector()) {
        // in case of linearrow with primitive = middleText
        propertyPrefix = "middleText.";
    } else {
        // in case of figure with primitive.id = textPrimitiveId
        propertyPrefix = "primitives." + this.textPrimitiveId + ".";
    }

    // value of BuiderProperty::property
    this.stringPropertyName = propertyPrefix + TextEditorPopup.STRING_PROPERTY_ENDING;
    this.sizePropertyName = propertyPrefix + TextEditorPopup.SIZE_PROPERTY_ENDING;
    this.fontPropertyName = propertyPrefix + TextEditorPopup.FONT_PROPERTY_ENDING;
    this.alignPropertyName = propertyPrefix + TextEditorPopup.ALIGN_PROPERTY_ENDING;
    this.colorPropertyName = propertyPrefix + TextEditorPopup.COLOR_PROPERTY_ENDING;
    this.underlinedPropertyName = propertyPrefix + TextEditorPopup.UNDERLINED_PROPERTY_ENDING;
}

TextEditorPopup.prototype = {
    
    constructor : TextEditorPopup,
  
    shapeIsAConnector : function (){
        return this.shape.oType === "LineArrow";
    },
            
      
    init : function (){
      ////console.log("4thsinit")
      this.editor.className = 'active';
      this.tools.className = 'active';
      var shapeId = shape.id;
      var property = "primitives.1.str";
      var textarea = this.editor.getElementsByTagName('textarea')[0];
    //   var text1=textarea.offsetWidth;
    //   var text2=textarea.offsetHeight;
    //   //console.log("textarea",text1)
    //   //console.log("textarea",text2)
      textarea.value = this.shape.primitives[1].str;
      textarea.onchange = function(shapeId,property){
          return function(){
              // update shape but without adding {Command} to the {History}
              ////console.log("aaass",this.value);
              updateShape(shapeId, property, this.value, true);
          };
      }(shapeId, property);
      textarea.onblur = function(shapeId, property, previousValue){
          return function(){
              // create {Command} where previous value is
              // the initialization value of textarea
			  ////console.log("ass",this.value);
              updateShape(shapeId, property, this.value, false, previousValue);
              ////console.log("textarea.value",previousValue)
          };
      }(shapeId, property, textarea.value);
      textarea.onmouseout = textarea.onchange;
      textarea.onkeyup = textarea.onchange;
      this.placeAndAutoSize();
       
       // select all text inside textarea (like in Visio)
       setSelectionRange(textarea, 0, textarea.value.length);
   },
           
           
    setProperty : function (property, value) {
        var textarea = this.editor.getElementsByTagName('textarea')[0];
        switch(property) {

            case this.sizePropertyName:
                // set new property value to editor's textarea
                textarea.style.fontSize = value + 'px';

                // set new property value to editor's tool
                document.getElementById(property).value = value;
                break;

            case this.fontPropertyName:
                // set new property value to editor's textarea
                textarea.style.fontFamily = value;

                // set new property value to editor's tool
                document.getElementById(property).value = value.toLowerCase();
                break;

            case this.alignPropertyName:
                // set new property value to editor's textarea
                textarea.style.textAlign = value;

                // IE doesn't apply text-align property correctly to all lines of the textarea on a fly
                // that is why we just copy it's text and paste it back to refresh text rendering
                if (Browser.msie) {
                    textarea.value = textarea.value;
                }

                // set new property value to editor's tool
                document.getElementById(property).value = value;
                break;

            case this.underlinedPropertyName:
                // set new property value to editor's textarea
                textarea.style.textDecoration = value == true ? 'underline' : '';

                // set new property value to editor's tool
                document.getElementById(property).setAttribute(BuilderProperty.BUTTON_CHECKED_ATTRIBUTE, value);
                break;

            case this.colorPropertyName:
                // set new property value to editor's textarea
                textarea.style['color'] = value;

                // set new property value to editor's tool (colorPicker)
               /* var colorPicker = this.tools.getElementsByClassName('color_picker')[0];
                colorPicker.style['background-color'] = value; //change the color to the proper one
                colorPicker.previousSibling.value = value; //set the value to the "hidden" text field*/
                break;
        }

        this.placeAndAutoSize();
    },
            

    placeAndAutoSize : function () {
        var textarea = this.editor.getElementsByTagName('textarea')[0];

        // set edit dialog position to top left (first) bound point of Text primitive
        var textBounds;

        if (this.shapeIsAConnector()) {
            // in case of connector primitive is a middleText property
            textBounds = this.shape.middleText.getBounds();
        } else {
            // in case of connector primitive is a primitives[this.textPrimitiveId] property
            textBounds = this.shape.primitives[this.textPrimitiveId].getBounds();
        }

        // change coordinates of editing Text primitive to include padding and border of Text Editor
        var leftCoord = textBounds[0] - defaultEditorBorderWidth - defaultEditorPadding;
        var topCoord = textBounds[1] - defaultEditorBorderWidth - defaultEditorPadding;
        
        var textareaWidth = textBounds[2] - textBounds[0];
        var textareaHeight = textBounds[3] - textBounds[1];

        // Firefox includes border & padding as part of width and height,
        // so width and height should additionally include border and padding twice
        // (similar to "feather" option in Fireworks)
        if (Browser.mozilla) {
            textareaHeight += (defaultEditorPadding) * 2;
            topCoord -= (defaultEditorPadding);
            textareaWidth += (defaultEditorPadding) * 2;
            leftCoord -= (defaultEditorPadding);
        }

        // some of IE magic:
        // enough to add half of font-size to textarea's width to prevent auto-breaking to next line
        // which is wrong in our case
        // (similar to "feather" option in Fireworks)
        if (Browser.msie) {
            var fontSize = parseInt(textarea.style['font-size'], 10);
            textareaWidth += fontSize / 2;
            leftCoord -= fontSize / 4;
        }

        this.editor.style.left = leftCoord + "px";
        this.editor.style.top = topCoord + "px";


        // visibility: 'hidden' allows us to get proper size but 
        // without getting strange visual artefacts (tiggered by settings positions & other)
        this.tools.style.visibility = 'hidden';
        
        // We set it to the left upper corner to get it's objective size
        this.tools.style.left = '0px';
        this.tools.style.top = '0px';

        // Get toolbox height and width. Notice that clientHeight differs from offsetHeight.
        //@see https://developer.mozilla.org/en/docs/DOM/element.offsetHeight
        //@see http://stackoverflow.com/questions/4106538/difference-between-offsetheight-and-clientheight
        var toolboxHeight = this.tools.offsetHeight;
        var toolboxWidth = this.tools.offsetWidth;

        // define toolbox left position
        var toolboxLeft = leftCoord;
        
        // get width of work area (#container <div> from editor)
        var workAreaWidth = getWorkAreaContainer().offsetWidth;

        // If it's not enough place for toolbox at the page right side
        if (toolboxLeft + toolboxWidth >= workAreaWidth - scrollBarWidth) {
            // then shift toolbox to left before it can be placed
            toolboxLeft = workAreaWidth - toolboxWidth - scrollBarWidth;
        }

        // define toolbox top position
        var toolboxTop = topCoord - toolboxHeight;
        // If it's not enough place for toolbox at the page top
        if (toolboxTop <= 0) {
            // then place toolbox below textarea
            toolboxTop = topCoord + toolboxHeight + defaultEditorBorderWidth + defaultEditorPadding;
        }

        this.tools.style.left = toolboxLeft + "px";
        this.tools.style.top = toolboxTop + "px";
        
        // return normal visibility to toolbox
        this.tools.style.visibility = 'visible';

        textarea.style.width = textareaWidth + "px";
        textarea.style.height = textareaHeight + "px";
    },
     
    destroy : function (){
        
        this.editor.className = '';
        this.editor.style.cssText = '';
        //this.editor.innerHTML = '';

        this.tools.className = '';
        this.tools.style.cssText = '';
        //this.tools.innerHTML = '';
        WHITEBOARD.textEditor = false;
    },
    
    
    mouseClickedInside : function (e) {
        
       var target = e.target;

       // check if user fired mouse down on the part of editor, it's tools or active color picker
       // actually active color picker in that moment can be only for Text edit
       var inside = target.id === this.editor.id
           || target.parentNode.id === this.editor.id
           || target.parentNode.parentNode.id === this.editor.id

           || target.id === this.tools.id
           || target.parentNode.id === this.tools.id
           || target.parentNode.parentNode.id === this.tools.id

           || target.className === 'color_picker'

           || target.id === 'color_selector'
           || target.parentNode.id === 'color_selector'
           || target.parentNode.parentNode.id === 'color_selector';
   
       return inside;
   },

    refersTo : function (shape, textPrimitiveId) {
        
        var result = this.shape.equals(shape);

        // in case of linearrow textPrimitiveId will be underfined
        if (textPrimitiveId != null) {
            result &= this.textPrimitiveId === textPrimitiveId;
        }
        return result;
    },

    blurTextArea : function () {
       
        var textarea = this.editor.getElementsByTagName('textarea')[0];
        textarea.onblur();
    }
   
};

function setUpTextEditorPopup(shape, textPrimitiveId) {
    WHITEBOARD.textEditor = true;
    // get elements of Text Editor and it's tools
    var textEditor = document.getElementById('text-editor'); //a <div> inside editor page
    var textEditorTools = document.getElementById('text-editor-tools'); //a <div> inside editor page
    textEditorTools.onblur = function() {
        editor.value = textEditorTools.innerHTML;
 
        
    }
    var texteditWidth=textEditor.offsetWidth;
    var texteditHeight=textEditor.offsetHeight;
    
    var canvas = getCanvas();
    
    // set current Text editor to use it further in code
    currentTextEditor = new TextEditorPopup(textEditor, textEditorTools, shape, textPrimitiveId);
    //currentTextEditor = Builder.constructTextPropertiesPanel(textEditor, textEditorTools, shape, textPrimitiveId);
    currentTextEditor.init();
    // window.setTimeout(function(){
    //     //console.log("entered")
    //   $('#text-editor textarea').focus();
    // },300);
    // if($('#text-editor textarea').val()=="Text")
    // {
    //   $('#text-editor textarea').val('');
    // } 

    // // $("#onScreenKeyBoard").show();

    // $("#text-editor textarea").show();

    // var temp;
    // temp = $('#text-editor textarea').val();
    // $('#text-editor textarea').val('');
    // $('#text-editor textarea').focus();
    // $('#text-editor textarea').val(temp);
      
    // var leftCSS = $("#text-editor").offset().left;
    // var topCSS = $("#text-editor").offset().top+$("#text-editor").outerHeight();
    // if($("#text-editor").offset().top>(canvas.height/2+60))
    //   topCSS = $("#text-editor").offset().top-200;
    // $('#onScreenKeyBoard').css({left:leftCSS, 
                // top:topCSS});
    //return currentTextEditor;
};


/**Setup the creation function (that -later, upon calling - will create the actual {Figure}
 **/
function createFigure(fFunction, thumbURL){
    //Log.info('createFigure (' + fFunction + ',' + thumbURL + ')');

    createFigureFunction = fFunction;
	////console.log("figure",createFigureFunction)
    
    selectedFigureThumb = thumbURL;
    

    selectedFigureId = -1
    
    if (state == STATE_TEXT_EDITING) {
        currentTextEditor.destroy();
        currentTextEditor = null;
    }

    state = STATE_FIGURE_CREATE;
    draw();

}


function resetToNoneState() {

    $(".black-flyout").slideUp();
    $(".flyout-link").find('span').removeClass('active-wicon');
    $(".flyout-link").removeClass('inlineimg-option1');
    $(".flyout-link").parent('li').removeClass('active');
    $('.action-icons-whiteboard li').removeClass('selected');
        
    if (state == STATE_TEXT_EDITING) {
        currentTextEditor.destroy();
        currentTextEditor = null;
        $("#onScreenKeyBoard").hide();
    }
    
    Ruler.close();
    Protractor.close();
    Compass.close();

    // deselect everything
    selectedFigureId = -1;
    
    // if group selected
    if (state == STATE_GROUP_SELECTED) {
        var selectedGroup = STACK.groupGetById(selectedGroupId);

        // if group is temporary then destroy it
        if(!selectedGroup.permanent){
            STACK.groupDestroy(selectedGroupId);
        }

        //deselect current group
        selectedGroupId = -1;
    }
    $("#layers_tools").hide();
    state = STATE_NONE;
}

// Id of the DOM object for errors of image upload
var uploadImageErrorDivId = 'upload-image-error';




function onMouseDown(ev){
    hidecrop();

    // store clicked figure or linearrow
    shape = null;
    // store id value (from Stack) of clicked text primitive
    var textPrimitiveId = -1;
    var coords = getCanvasXY(ev);
    if(state == STATE_FREE_COPY_PASTE || state == STATE_FREE_SELECT || state == STATE_PENCIL_SELECT || state == STATE_PENCIL_MOVE)
    {
        coords = getCanvasXY(ev,'temp');
    }
    lastcursor = coords;
    var HTMLCanvas = getCanvas();
    var x = coords[0];
    var y = coords[1];
    lastClick = [x,y];
    mousePressed = true;
    ////console.log("before switch"+state);
    $("#onScreenKeyBoard").hide();
    var exeFlag = true;
    if(Curtain.visibility)
    {
      if(Curtain.onMouseDown(x,y))
        exeFlag = false;
    }
    if(exeFlag)
    for(var inc= state_apps.length-1 ;inc>=0;inc--)
    {
      if(state_apps[inc] == STATE_RULER_APP)
      {
        if(Ruler.onMouseDown(x,y))
          exeFlag = false;
      }
      else if(state_apps[inc] == STATE_PROTRACTOR_APP)
      {
        if(Protractor.onMouseDown(x,y))
          exeFlag = false;
      }
      else if(state_apps[inc] == STATE_COMPASS_APP)
      {
        if(Compass.onMouseDown(x,y))
          exeFlag = false;
      }
      if(!exeFlag)
        break;
    }

    if(exeFlag)
    switch(state){
        case STATE_TEXT_EDITING:

            if (currentTextEditor.mouseClickedInside(ev)) {
                break;
            } else {
                // IE and Firefox doesn't trigger blur event when mouse clicked canvas
                // that is why we trigger this event manually
                if (Browser.msie || Browser.mozilla) {
                    currentTextEditor.blurTextArea();
                }

                currentTextEditor.destroy();
                currentTextEditor = null;

                state = STATE_NONE;
            }

        case STATE_NONE:
            snapMonitor = [0,0];
            var selectedObject = Util.getObjectByXY(x,y); // get object under cursor
            switch(selectedObject.type) {
                case 'LineArrow':
                    selectedLineArrowId = selectedObject.id;
                    state = STATE_CONNECTOR_SELECTED;
                    setUpEditPanel(LineArrow_MANAGER.linearrowGetById(selectedLineArrowId));
                    MOUSE_STATE = 'down';
                    Log.info('onMouseDown() + STATE_NONE  - change to STATE_CONNECTOR_SELECTED');
                    redraw = true;
                    break;
                case 'Group':
                    selectedGroupId = selectedObject.id;
                    state = STATE_GROUP_SELECTED;
                    setUpEditPanel(null);
                    Log.info('onMouseDown() + STATE_NONE + group selected  =>  change to STATE_GROUP_SELECTED');
                    break;
                case 'Figure':
               
                    selectedFigureId = selectedObject.id;
                    state = STATE_FIGURE_SELECTED;
                    MOUSE_STATE = 'down';
                    setUpEditPanel(STACK.figureGetById(selectedFigureId));
                    Log.info('onMouseDown() + STATE_NONE + lonely figure => change to STATE_FIGURE_SELECTED');
                    redraw = true;
                    break;
                default:
                    //DO NOTHING
                    break;
            }
            break;
        
        case STATE_FIGURE_CREATE:
        //    throw "canvas> onMouseDown> STATE_FIGURE_CREATE> : this should not happen";  
            break;

        case STATE_FIGURE_SELECTED:
            snapMonitor = [0,0];
            if(HandleManager.handleGet(x, y) != null){ //Clicked a handler (of a Figure or LineArrow)
                Log.info("onMouseDown() + STATE_FIGURE_SELECTED - handle selected");       
                /*Nothing important (??) should happen here. We just clicked the handler of the figure*/
                HandleManager.handleSelectXY(x, y);
            }
            else{ //We did not clicked a handler
                var handlePoints = []; 
                var handlers=HandleManager.handleGetAll();
                for(var iterator=0; iterator<handlers.length; iterator++){
                    if(handlers[iterator].type!="r")
                        handlePoints.push(new Point(handlers[iterator].x,handlers[iterator].y));
                }
                
                    var selectedObject = Util.getObjectByXY(x,y); // get object under cursor
                    ////console.log("asd");
                    ////console.log(selectedObject);
                    var fig = STACK.figureGetById(selectedObject.id);
                    ////console.log(fig);
                    if(fig&&fig.name=="Text"&&Util.isPointInside(new Point(x,y),fig.primitives[0].points))
                      editText(selectedObject.id);
                
                if(!Util.isPointInside(new Point(x,y),handlePoints))
                {
                    var selectedObject = Util.getObjectByXY(x,y); // get object under cursor
                    switch(selectedObject.type) {
                        case 'Group':
                            if (SHIFT_PRESSED){
                                var figuresToAdd = [];
                                /* TODO: for what reason we have this condition in STATE_FIGURE_SELECTED?
                                 * Seems like escaping of bigger problem */
                                if (selectedFigureId != -1){ //add already selected figure
                                    figuresToAdd.push(selectedFigureId);
                                }

                                var groupFigures = STACK.figureGetByGroupId(selectedObject.id);
                                for(var i=0; i<groupFigures.length; i++ ){
                                    figuresToAdd.push(groupFigures[i].id);
                                }

                                // create group for current figure joined with clicked group
                                selectedGroupId = STACK.groupCreate(figuresToAdd);
                                Log.info('onMouseDown() + STATE_FIGURE_SELECTED + SHIFT + another group => STATE_GROUP_SELECTED');
                            }else{
                                selectedGroupId = selectedObject.id;
                                Log.info('onMouseDown() + STATE_FIGURE_SELECTED + group figure => change to STATE_GROUP_SELECTED');
                            }

                            selectedFigureId = -1;
                            state = STATE_GROUP_SELECTED;
                            setUpEditPanel(null);
                            redraw = true;
                            break;
                        case 'Figure': //lonely figure
                            if (SHIFT_PRESSED){
                                var figuresToAdd = [];
                                /* TODO: for what reason we have this condition in STATE_FIGURE_SELECTED?
                                 * Seems like escaping of bigger problem */
                                if (selectedFigureId != -1){ //add already selected figure
                                    figuresToAdd.push(selectedFigureId);
                                }

                                figuresToAdd.push(selectedObject.id); //add ONLY clicked selected figure

                                selectedFigureId = -1;
                                // we have two figures, create a group
                                selectedGroupId = STACK.groupCreate(figuresToAdd);
                                state = STATE_GROUP_SELECTED;
                                setUpEditPanel(null);
                                Log.info('onMouseDown() + STATE_FIGURE_SELECTED + SHIFT  + min. 2 figures => STATE_GROUP_SELECTED');
                            }else{
                                selectedFigureId = selectedObject.id;
                                HandleManager.clear();
                                setUpEditPanel(STACK.figureGetById(selectedFigureId));
                                Log.info('onMouseDown() + STATE_FIGURE_SELECTED + single figure => change to STATE_FIGURE_SELECTED (different figure)');
                            }
                            redraw = true;
                            break;
                        default:    //mouse down on empty space
                            if (!SHIFT_PRESSED){ //if Shift isn`t pressed
                                selectedFigureId = -1;
                                state = STATE_NONE;
                                setUpEditPanel(canvasProps);
                                Log.info('onMouseDown() + STATE_FIGURE_SELECTED  - change to STATE_NONE');
                            }
                            redraw = true;
                            break;
                    }
                }
            }                
            
            break;

        case STATE_GROUP_SELECTED:
            //if selected group is temporary and we pressed outside of it's border we will destroy it
            var selectedGroup = STACK.groupGetById(selectedGroupId);
            ////console.log("Prakash hadle Group click"); 
            if( HandleManager.handleGet(x,y) != null){ //handle ?
                HandleManager.handleSelectXY(x, y);
                redraw = true;
                Log.info('onMouseDown() + STATE_GROUP_SELECTED  + handle selected => STATE_GROUP_SELECTED');              
                //console.log("Prakash hadle click");  
            }
            else {
                // get object under cursor
                var handlePoints = []; 
                var handlers=HandleManager.handleGetAll();
                for(var iterator=0; iterator<handlers.length; iterator++){
                    if(handlers[iterator].type!="r")
                        handlePoints.push(new Point(handlers[iterator].x,handlers[iterator].y));
                }
                if(!Util.isPointInside(new Point(x,y),handlePoints)) // To check the cursor is inside the handle
                var selectedObject = Util.getObjectByXY(x,y);
                {
                    switch(selectedObject.type) {
                        case 'Group':
                            if(selectedObject.id != selectedGroupId){
                                if (SHIFT_PRESSED){
                                    var figuresToAdd = [];

                                    //add figures from current group
                                    var groupFigures = STACK.figureGetByGroupId(selectedGroupId);
                                    for(var i=0; i<groupFigures.length; i++ ){
                                        figuresToAdd.push(groupFigures[i].id);
                                    }

                                    //add figures from clicked group
                                    groupFigures = STACK.figureGetByGroupId(selectedObject.id);
                                    for(var i=0; i<groupFigures.length; i++ ){
                                        figuresToAdd.push(groupFigures[i].id);
                                    }

                                    //destroy current group (if temporary)
                                    if(!selectedGroup.permanent){
                                        STACK.groupDestroy(selectedGroupId);
                                    }

                                    selectedGroupId = STACK.groupCreate(figuresToAdd);
                                }else{
                                    //destroy current group (if temporary)
                                    if(!selectedGroup.permanent){
                                        STACK.groupDestroy(selectedGroupId);
                                    }

                                    selectedGroupId = selectedObject.id;
                                }

                                redraw = true;
                                Log.info('onMouseDown() + STATE_GROUP_SELECTED  + (different) group figure => STATE_GROUP_SELECTED');
                            }
                            else{ //figure from same group
                                //do nothing
                                ////console.log("Same Group");
                            }
                            break;
                        case 'Figure': //lonely figure
                            ////console.log("Iniside figure if");
                            if (SHIFT_PRESSED){
                                var figuresToAdd = [];
                                var groupFigures = STACK.figureGetByGroupId(selectedGroupId);
                                for(var i=0; i<groupFigures.length; i++ ){
                                    figuresToAdd.push(groupFigures[i].id);
                                }
                                figuresToAdd.push(selectedObject.id);

                                //destroy current group (if temporary)
                                if(!selectedGroup.permanent){
                                    STACK.groupDestroy(selectedGroupId);
                                }

                                selectedGroupId = STACK.groupCreate(figuresToAdd);

                                Log.info('onMouseDown() + STATE_GROUP_SELECTED + SHIFT  + add lonely figure to other');
                            }else{
                                //destroy current group (if temporary)
                                if(!selectedGroup.permanent){
                                    STACK.groupDestroy(selectedGroupId);
                                }

                                //deselect current group
                                selectedGroupId = -1;

                                state = STATE_FIGURE_SELECTED;
                                selectedFigureId = selectedObject.id;
                                Log.info('onMouseDown() + STATE_GROUP_SELECTED  + lonely figure => STATE_FIGURE_SELECTED');

                                setUpEditPanel(STACK.figureGetById(selectedFigureId));
                                redraw = true;
                            }
                            break;
                        default:    //mouse down on empty space
                            if (!SHIFT_PRESSED){ //if Shift isn`t pressed
                                if(!selectedGroup.permanent){
                                    STACK.groupDestroy(selectedGroupId);
                                }

                                selectedGroupId = -1;
                                state = STATE_COPY_PASTE;
                                HTMLCanvas.style.cursor = "crosshair";
                                canvas_pencil.style.cursor = 'crosshair'
                                setUpEditPanel(canvasProps);
                                redraw = true;
                                Log.info('onMouseDown() + STATE_GROUP_SELECTED  + mouse on empty => STATE_NONE');
                            }
                            break;
                    }
                }
            }
            
            break;
        case STATE_CONNECTOR_PICK_FIRST:
            //moved so it can be called from undo action
            connectorPickFirst(x,y,ev);
            break;

        case STATE_CONNECTOR_PICK_SECOND:
            state  = STATE_NONE;
            break;


        case STATE_CONNECTOR_SELECTED:
            var cps = LineArrow_MANAGER.linearrowPointGetAllByParent(selectedLineArrowId);
            var start = cps[0];
            var end = cps[1];
            var figureConnectionPointId;

            //did we click any of the connection points?
            if(start.point.near(x, y, 10)){
                Log.info("Picked the start point");
                selectedLineArrowPointId = start.id;
                state = STATE_CONNECTOR_MOVE_POINT;
                HTMLCanvas.style.cursor = 'default';
                canvas_app.style.cursor = 'default';
                //this acts like clone of the linearrow
                var undoCmd = new LineArrowAlterCommand(selectedLineArrowId); 
                History.addUndo(undoCmd);

                // check if current cloud for connection point
                figureConnectionPointId = LineArrow_MANAGER.linearrowPointGetByXYRadius(x,y, FIGURE_CLOUD_DISTANCE, LineArrowPoint.TYPE_FIGURE, end);
                if (figureConnectionPointId !== -1) {
                    currentCloud = [selectedLineArrowPointId, figureConnectionPointId];
                }
            }
            else if(end.point.near(x, y, 10)){
                Log.info("Picked the end point");
                selectedLineArrowPointId = end.id;
                state = STATE_CONNECTOR_MOVE_POINT;
                HTMLCanvas.style.cursor = 'default';
                
                //this acts like clone of the linearrow
                var undoCmd = new LineArrowAlterCommand(selectedLineArrowId); 
                History.addUndo(undoCmd);

                // check if current cloud for connection point
                figureConnectionPointId = LineArrow_MANAGER.linearrowPointGetByXYRadius(x,y, FIGURE_CLOUD_DISTANCE, LineArrowPoint.TYPE_FIGURE, start);
                if (figureConnectionPointId !== -1) {
                    currentCloud = [selectedLineArrowPointId, figureConnectionPointId];
                }
            }
            else{ //no connection point selected
                
                //see if handler selected
                if(HandleManager.handleGet(x,y) != null){
                    Log.info("onMouseDown() + STATE_CONNECTOR_SELECTED - handle selected");
                    HandleManager.handleSelectXY(x,y);
                    
                    //TODO: just copy/paste code ....this acts like clone of the linearrow
                    var undoCmd = new LineArrowAlterCommand(selectedLineArrowId); 
                    History.addUndo(undoCmd);
                }
                else{
                    // get object under cursor
                    var selectedObject = Util.getObjectByXY(x,y);
                    switch(selectedObject.type) {
                        case 'LineArrow':
                            if (selectedObject.id != selectedLineArrowId) { // select another LineArrow
                                selectedLineArrowId = selectedObject.id;
                                setUpEditPanel(LineArrow_MANAGER.linearrowGetById(selectedLineArrowId));
                                redraw = true;
                            }
                            break;
                        case 'Group':
                            selectedLineArrowId = -1;
                            selectedGroupId = selectedObject.id; // set Group as active element
                            state = STATE_GROUP_SELECTED;
                            setUpEditPanel(null);
                            redraw = true;
                            break;
                        case 'Figure':
                            selectedLineArrowId = -1;
                            selectedFigureId = selectedObject.id; // set Figure as active element
                            state = STATE_FIGURE_SELECTED;
                            setUpEditPanel(STACK.figureGetById(selectedFigureId));
                            redraw = true;
                            break;
                        default:    // nothing else selected
                            selectedLineArrowId = -1;
                            state = STATE_NONE;
                            setUpEditPanel(canvasProps); // set canvas as active element
                            redraw = true;
                            break;
                    }
                }                                                    
            }                        
            break; //end case STATE_CONNECTOR_SELECTED 
        case STATE_PENCIL_SELECT:
            if(mousePressed||touchState){
                //ctx_temp.clearRect(0, 0, 1300, 650);
                ppts = [];
                mouse_point.x = last_mouse.x = x; 
                mouse_point.y = last_mouse.y = y;
                ppts.push({x: mouse_point.x, y: mouse_point.y});
                //ctx_pencil.beginPath();
                //ctx_pencil.moveTo(x, y);
                state = STATE_PENCIL_MOVE;
            }
            break;
        default:
            //alert("onMouseDown() - switch default - state is " + state);
    }
    ////console.log(state);
    draw();

    return false;
}

var mouse_point = {x: 0, y: 0};
var last_mouse = {x: 0, y: 0};
// Pencil Points
var ppts = [];

function onMouseUp(ev,touchState){
	//console.log("14 mouseup called")
    Log.info("main.js>onMouseUp()");
    
    var coords = getCanvasXY(ev);
    if(state == STATE_FREE_COPY_PASTE || state == STATE_FREE_SELECT || state == STATE_PENCIL_SELECT || state == STATE_PENCIL_MOVE)
    {
        coords = getCanvasXY(ev,'temp');
    }
    if(typeof(touchState) != 'undefined' && touchState == "TouchUp")
    {
        coords = lastcursor;
        //alert("asdf");
    } 
    var x = coords[0];
    var y = coords[1];
    var ctx = getContext();
    lastClick = [];
    mousePressed = true;
    //Checking for the App Handlers
    var exeFlag = true;
    if(Curtain.visibility)
    {
      if(Curtain.onMouseUp(x,y))
        exeFlag = false;
    }
    if(exeFlag)
    
    for(var inc= state_apps.length-1 ;inc>=0;inc--)
    {
      if(state_apps[inc] == STATE_RULER_APP)
      {
        if(Ruler.onMouseUp(x,y))
          exeFlag = false;
      }
      else if(state_apps[inc] == STATE_PROTRACTOR_APP)
      {
        if(Protractor.onMouseUp(x,y))
          exeFlag = false;
      }
      else if(state_apps[inc] == STATE_COMPASS_APP)
      {
        if(Compass.onMouseUp(x,y))
          exeFlag = false;
      }
      if(!exeFlag)
        break;
    }

    exeFlag = true;
    if(exeFlag)
    switch(state){

        case STATE_NONE:
            
            if(HandleManager.handleGetSelected()){
                HandleManager.clear();
            }
            hidecrop();
            canvas_app.style.cursor = 'default';
            break;
        
        // treated on the dragging figure
        case STATE_FIGURE_CREATE:
            Log.info("onMouseUp() + STATE_FIGURE_CREATE");
            
            snapMonitor = [0,0];
            
            //treat new figure
            //do we need to create a figure on the canvas?
            if(createFigureFunction){
                
                
                Log.info("onMouseUp() + STATE_FIGURE_CREATE--> new state STATE_FIGURE_SELECTED");
                
                var cmdCreateFig = new FigureCreateCommand(createFigureFunction, x, y);
                
                
                cmdCreateFig.execute();
                History.addUndo(cmdCreateFig);
                
                HTMLCanvas.style.cursor = 'default';
                canvas_pencil.style.cursor = 'default';
                createFigureFunction = null;

                mousePressed = false;
                redraw = true;
            }
            else{
                Log.info("onMouseUp() + STATE_FIGURE_CREATE--> but no 'createFigureFunction'");
            }
            break;
        
       
        case STATE_FIGURE_SELECTED:
             setUpEditPanel(STACK.figureGetById(selectedFigureId));
            MOUSE_STATE = null; 
            mousePressed = false;
            HandleManager.handleSelectedIndex = -1; //reset only the handler....the Figure is still selected
                       
            break;
        case STATE_GROUP_SELECTED:
            Log.info('onMouseUp() + STATE_GROUP_SELECTED ...');
            
            mousePressed = false;
            HandleManager.handleSelectedIndex = -1; //reset only the handler....the Group is still selected
            setUpCropButton();
            break;

        case STATE_SELECTING_MULTIPLE:
            /*Description
             *From figures select only those that do not belong to any group
             **/
            Log.info('onMouseUp() + STATE_SELECTING_MULTIPLE => STATE_NONE');
            Log.info('onMouseUp() selection area: ' + selectionArea);
            
            state = STATE_COPY_PASTE;
            
            var figuresToAdd = [];
            
            
                selectedGroupId = STACK.groupCreate(figuresToAdd);
                state = STATE_GROUP_SELECTED;
                setUpEditPanel(null); //because of shift in this case we also need to reset the edit panel
                setUpCropButton();
            break;

        case STATE_FREE_SELECT:
            state = STATE_FREE_COPY_PASTE;
            ////console.log(ppts);
            var bounds = Util.getBounds(ppts);
            var p1 = new Point(bounds[0],bounds[1]);
            var p2 = new Point(bounds[2],bounds[1]);
            var p3 = new Point(bounds[0],bounds[3]);
            var width = Util.getLength(p1,p2);
            var height = Util.getLength(p1,p3);
            var canvas_dummy = document.getElementById('canvas_dummy');
            var ctx_temp = canvas_dummy.getContext('2d');
            ctx_temp.clearRect(0, 0, canvas_dummy.width, canvas_dummy.height);
            ctx_temp.beginPath();
            ctx_temp.strokeStyle = "white";
            for (var i = 0; i < ppts.length - 1; i=i+2) {
                ctx_temp.quadraticCurveTo(ppts[i].x,ppts[i].y,ppts[i+1].x,ppts[i+1].y);
            }
            ctx_temp.closePath();
            //Cloning from main canvas
            var pattern = ctx_temp.createPattern(getCanvas(), "repeat");
            ctx_temp.fillStyle = pattern;
            ctx_temp.fill();
            //Cloning from pencil canvas
            var pattern = ctx_temp.createPattern(getCanvasPencil(), "repeat");
            ctx_temp.fillStyle = pattern;
            ctx_temp.fill();
            var imgData=ctx_temp.getImageData(p1.x,p1.y,width,height);
            var temp_screen = document.createElement("canvas");
            temp_screen.width = width;
            temp_screen.height = height;
            var temp_screen_ctx = temp_screen.getContext('2d');
            temp_screen_ctx.putImageData(imgData,0,0);
            var imgDataURL = temp_screen.toDataURL();
             //creates a container
            var cmdFigureCreate = new InsertedImageFigureCreateCommand("ImageData", p1.x+(width/2),p1.y+(height/2),imgDataURL);
            cmdFigureCreate.execute();
            History.addUndo(cmdFigureCreate);
            state = STATE_NONE; 
            var canvas_top = getCanvasTemp();
            canvas_top.style.display="none";
            var ctx_top = canvas_top.getContext('2d');
            ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
            break;    
        /* Added to Reset the Pencil Select on Mouse up in document- By Prakash 31-10-2017*/
        case STATE_PENCIL_MOVE:      
            pecilDrawFinished();
            break;
        case STATE_MARKER_MOVE:
            markerDrawFinished();
            break; 
        /* End of Reset */  
        case STATE_CONNECTOR_PICK_SECOND:

            //store undo command
            var cmdCreateCon = new LineArrowCreateCommand(selectedLineArrowId);
            History.addUndo(cmdCreateCon);
            
            //reset all {LineArrowPoint}s' color
            LineArrow_MANAGER.linearrowPointsResetColor();

            //reset current connection cloud
            currentCloud = [];

            //select the current linearrow
            state = STATE_CONNECTOR_SELECTED;
            var con = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId);
            setUpEditPanel(con);
            redraw = true;
            break;

        

        case STATE_CONNECTOR_MOVE_POINT:
            LineArrow_MANAGER.linearrowPointsResetColor();

            //reset current connection cloud
            currentCloud = [];
            var con = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId);
            History.COMMANDS[History.COMMANDS.length-1].newturningPoints = Point.cloneArray(con.turningPoints);
            History.COMMANDS[History.COMMANDS.length-1].newconnectionPoints = LineArrowPoint.cloneArray(LineArrow_MANAGER.connectionPoints);            
    
            state = STATE_CONNECTOR_SELECTED; //back to selected linearrow
            selectedLineArrowPointId = -1; //but deselect the connection point
            redraw = true;
            break;
            
            
        case STATE_CONNECTOR_SELECTED:
            if(currentMoveUndo){
                var turns = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId).turningPoints;
                var newTurns = [turns.length];
                for(var i = 0; i < turns.length; i ++){
                    newTurns[i] = turns[i].clone();
                }
                currentMoveUndo.currentValue = newTurns;
                History.addUndo(currentMoveUndo);
                state = STATE_NONE;
                selectedLineArrowId = -1;
                HandleManager.clear(); //clear current selection
            }
            break; 
    }
    currentMoveUndo = null;
    mousePressed = false;
    draw();
}
/*Added to Reset the Pencil Select on Mouse up in document- By Prakash 31-10-2017*/
function pecilDrawFinished(){
  var canvas = getCanvas();
  var canvas_temp = getCanvasPencil();
  var ctx_temp = canvas_temp.getContext('2d');
  var ctx = canvas.getContext('2d'); 
  ////console.log("Erso"+erasor_state);
  if(!erasor_state)
  {
      onPaint(getCanvasPencil(),false);
  }
  else
  {
      ////console.log("Not Painted");
  }   
  
  ////console.log("Started");
  //var imgData=ctx_temp.getImageData(0,0,canvas_temp.width,canvas_temp.height);
  var imgData = canvas_temp.toDataURL();
  if(typeof canvasProps.pencil[current_tab-1] === 'undefined' || canvasProps.pencil[current_tab-1]===-1 || canvasProps.pencil[current_tab-1] === null)
  {
        //creates a container
      var cmdFigureCreate = new InsertedImageFigureCreateCommand("Pencil", canvas_temp.width/2,canvas_temp.height/2,imgData);
      cmdFigureCreate.execute();
      History.addUndo(cmdFigureCreate);
      //ctx_temp.clearRect(0, 0, 1300, 650);
  }
  else
  {
      var fig = STACK.figureGetById(canvasProps.pencil[current_tab-1]);
      ////console.log("Fig",fig);
      if(fig.name=="Pencil")
      {
        fig.primitives[0].imageData = encodeImageData(imgData);
        fig.primitives[0].setUrl(fig.primitives[0].url,fig.primitives[0].imageData);
        var cmdFigureCreate = new InsertedImageFigureCreateCommand("Pencil", canvas_temp.width/2,canvas_temp.height/2,imgData);
        cmdFigureCreate.figureId = fig.id;
        Timer.stop();
        cmdFigureCreate.timeGap = Timer.time();
        Timer.start();
        cmdFigureCreate.firstDraw = false;
        History.addUndo(cmdFigureCreate);
      }
      else
      {
        var cmdFigureCreate = new InsertedImageFigureCreateCommand("Pencil", canvas_temp.width/2,canvas_temp.height/2,imgData);
        cmdFigureCreate.execute();
        History.addUndo(cmdFigureCreate);
      }
      /*////console.log("Dadsf");
      ////console.log(imgData);*/
  }
  
    /* var pencilDraw = new PencilDrawCommand(window['figure_Pencil'],ppts);
      pencilDraw.execute();*/
      //History.addUndo(pencilDraw);
      ////console.log("FInished");
      //HTMLCanvas.style.cursor = 'default';

      createFigureFunction = null;

      mousePressed = false;
      redraw = true;
      ppts = [];  

    //pencil_data = ctx_temp.getImageData(0,0,canvas_temp.width,canvas_temp.height);
    //ctx.putImageData(canvas_temp,0,0);
    state = STATE_PENCIL_SELECT;
}
/*Added For Reset the Pencil Select on Mouse up in document- By Prakash 31-10-2017*/
function markerDrawFinished(){
  ////console.log(ppts);
  var bounds = Util.getBounds(ppts);
  ////console.log("Bounds");
  ////console.log(bounds);
  var outerSide = 10;
  var p1 = new Point(bounds[0]-outerSide,bounds[1]-outerSide);
  var p2 = new Point(bounds[2]+outerSide,bounds[1]-outerSide);
  var p3 = new Point(bounds[0]-outerSide,bounds[3]+outerSide);
  var width = Util.getLength(p1,p2);
  var height = Util.getLength(p1,p3);
  var canvas_temp = getCanvasTemp();
  var ctx_temp = canvas_temp.getContext('2d');
  var imgData=ctx_temp.getImageData(p1.x,p1.y,width,height);
  var temp_screen = document.createElement("canvas");
  temp_screen.width = width;
  temp_screen.height = height;
  var temp_screen_ctx = temp_screen.getContext('2d');
  temp_screen_ctx.putImageData(imgData,0,0);
  var imgDataURL = temp_screen.toDataURL();
  //To calculate the center point
  var centerX = (p2.x-p1.x)/2+p1.x;
  var centerY = (p3.y-p1.y)/2+p1.y;
  ////console.log(centerX+" Center "+centerY);
  //creates a container
  var cmdFigureCreate = new InsertedImageFigureCreateCommand("ImageData", centerX,centerY,imgDataURL);
  cmdFigureCreate.execute();
  History.addUndo(cmdFigureCreate);
  state = STATE_MARKER_SELECT;
      canvas_temp.style.display = 'block';
      canvas_temp.style.cursor = 'crosshair'; 
  var canvas_top = getCanvasTemp();
  //canvas_top.style.display="none";
  var ctx_top = canvas_top.getContext('2d');
  ctx_top.clearRect(0, 0, canvas_top.width, canvas_top.height);
  currentMoveUndo = null;
  mousePressed = false;
}
function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255];
    }
    throw new Error('Bad Hex');
}
/**Remembers last move. Initially it's null but once set it's a [x,y] array*/
var onPaint = function(canvas_temp,clear) {
                ////console.log("ce"+clear);
                var tmp_ctx  = canvas_temp.getContext('2d');
                if(erasor_state)
                {
                    tmp_ctx = getContextPencil();
                    tmp_ctx.globalCompositeOperation = 'destination-out';
                    tmp_ctx.fillStyle = 'rgba(0,0,0,1)';
                    tmp_ctx.strokeStyle = 'rgba(0,0,0,1)';
                    tmp_ctx.lineWidth = 10;
                }
                else 
                {
                    tmp_ctx.strokeStyle = strokeColor;
                    tmp_ctx.lineWidth = lineWidth
                    tmp_ctx.fillStyle = strokeColor;
                    tmp_ctx.globalCompositeOperation = 'source-over';
                    if(state == STATE_MARKER_MOVE)
                    {
                        var rgb = hexToRgbA(strokeColor);
                        tmp_ctx.strokeStyle = 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.5)';
                        tmp_ctx.fillStyle = 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',0.5)';
                        //tmp_ctx.lineWidth = 15;
                        tmp_ctx.globalCompositeOperation = 'destination-atop';
                    }
                }   
                if (ppts.length < 3) {
                    var b = ppts[0];
                    tmp_ctx.beginPath();
                    //ctx.moveTo(b.x, b.y);
                    //ctx.lineTo(b.x+50, b.y+50);
                    tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
                    tmp_ctx.fill();
                    tmp_ctx.closePath();
                    
                    return;
                }
                if(clear&&!erasor_state)
                    tmp_ctx.clearRect(0, 0, canvas_temp.width, canvas_temp.height);
                else
                {
                    var tp = getCanvasTemp().getContext('2d');
                    tp.clearRect(0, 0, canvas_temp.width, canvas_temp.height);
                }    
                tmp_ctx.beginPath();
                tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
                
                for (var i = 1; i < ppts.length - 2; i++) {
                    var c = (ppts[i].x + ppts[i + 1].x) / 2;
                    var d = (ppts[i].y + ppts[i + 1].y) / 2;
                    
                    tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
                }
                
                // For the last 2 points
                tmp_ctx.quadraticCurveTo(
                    ppts[i].x,
                    ppts[i].y,
                    ppts[i + 1].x,
                    ppts[i + 1].y
                );
                tmp_ctx.stroke();
                tmp_ctx.save();
            };
var linePaint = function(canvas_temp) {
        var tmp_ctx  = canvas_temp.getContext('2d');


};
/**Treats the mouse move event
 *@param {Event} ev - the event generated when key is up
 **/
function onMouseMove(ev,touchState){
    touchState = typeof touchState !== 'undefined' ? touchState : false;
    var redraw = false;
    var coords = getCanvasXY(ev);
    if(state == STATE_FREE_COPY_PASTE || state == STATE_FREE_SELECT || state == STATE_PENCIL_SELECT || state == STATE_PENCIL_MOVE)
    {
        coords = getCanvasXY(ev,'temp');
    }
    lastcursor = coords;
    if(coords == null){
        Log.error("main.js onMouseMove() null coordinates");
        return;
    }
    
    var x = coords[0];
    var y = coords[1];
    
    var canvas = getCanvas();
    var canvas_temp = getCanvasTemp();
    var ctx_temp = canvas_temp.getContext('2d');
    var ctx_pencil = getCanvasPencil().getContext('2d');
    Log.debug("onMouseMoveCanvas: test if over a figure: " + x + "," + y);
    //////console.log("Before switch in mouse move"+state);
    if(mousePressed)
    {
        //setUpEditPanel(null);
    }

    //Handlers Checking for the Apps
    var exeFlag = true;
    if(Curtain.visibility)
    {
      if(Curtain.onMouseMove(x,y,touchState))
        exeFlag = false;
    }

    if(exeFlag)
    for(var inc= state_apps.length-1 ;inc>=0;inc--)
    {
      if(state_apps[inc] == STATE_RULER_APP)
      {
        if(Ruler.onMouseMove(x,y,touchState))
          exeFlag = false;
      }
      else if(state_apps[inc] == STATE_PROTRACTOR_APP)
      {
        if(Protractor.onMouseMove(x,y,touchState))
          exeFlag = false;
      }
      else if(state_apps[inc] == STATE_COMPASS_APP)
      {
        if(Compass.onMouseMove(x,y,touchState))
          exeFlag = false;
      }
      if(!exeFlag)
        break;
    }

    if(exeFlag)
    switch(state){

        case STATE_NONE:
            if(!mousePressed||touchState){
                if(STACK.figureIsOver(x,y)){ //over a figure
                    canvas.style.cursor = 'move';
                    canvas_pencil.style.cursor = 'move';
                    ////console.log('ig');
                    Log.debug('onMouseMove() - STATE_NONE - mouse cursor = move (over figure)');
                }
                else if(LineArrow_MANAGER.linearrowGetByXY(x, y) != -1){ //over a Line
                    canvas.style.cursor = 'move';
                    canvas_pencil.style.cursor = 'move';
                    Log.debug('onMouseMove() - STATE_NONE - mouse cursor = move (over connector)');
                }

                else{ //default cursor
                    canvas.style.cursor = 'default';
                    canvas_pencil.style.cursor = 'default';
                    Log.debug('onMouseMove() - STATE_NONE - mouse cursor = default');
                }
            }                                    
            
            break;
        
        case STATE_COPY_PASTE:
            if(mousePressed||touchState){
                state = STATE_SELECTING_MULTIPLE;
                selectionArea.points[0] = new Point(x,y);
                selectionArea.points[1] = new Point(x,y);
                selectionArea.points[2] = new Point(x,y);
                selectionArea.points[3] = new Point(x,y);//the selectionArea has no size until we start dragging the mouse
                Log.debug('onMouseMove() - STATE_NONE + mousePressed = STATE_SELECTING_MULTIPLE');
            }
            break;
        
        case STATE_SELECTING_MULTIPLE:
            selectionArea.points[1].x = x; //top right
            selectionArea.points[2].x = x; //bottom right
            selectionArea.points[2].y = y;
            selectionArea.points[3].y = y;//bottom left
            redraw = true;
            break;
        
        case STATE_FREE_COPY_PASTE:
            if(mousePressed||touchState){
                ppts = [];
                mouse_point.x = last_mouse.x = x; 
                mouse_point.y = last_mouse.y = y;
                ppts.push({x: mouse_point.x, y: mouse_point.y});
                ctx_temp.beginPath();
                ctx_temp.strokeStyle = 'rgba(0,0,0,1)';
                ctx_temp.moveTo(x, y);
                state = STATE_FREE_SELECT;
            }
            break;

        case STATE_FREE_SELECT:
            if(mousePressed||touchState){
                ctx_temp.quadraticCurveTo(last_mouse.x,last_mouse.y,x,y);
                last_mouse.x = x;
                last_mouse.y = y;
                ppts.push({x: last_mouse.x, y: last_mouse.y});
                ctx_temp.stroke();
            }
            break;

        case STATE_PENCIL_SELECT:
            if(mousePressed||touchState){
                //ctx_temp.clearRect(0, 0, 1300, 650);
                ppts = [];
                mouse_point.x = last_mouse.x = x; 
                mouse_point.y = last_mouse.y = y;
                ppts.push({x: mouse_point.x, y: mouse_point.y});
                //ctx_pencil.beginPath();
                //ctx_pencil.moveTo(x, y);
                state = STATE_PENCIL_MOVE;
            }
            break;

        case STATE_PENCIL_MOVE:
            ////console.log(state);
            if(mousePressed||touchState){
                //ctx_pencil.beginPath();
                //var c = (last_mouse.x+x)/2;
                //var d = (last_mouse.y+y)/2;
                //ctx_pencil.quadraticCurveTo(last_mouse.x,last_mouse.y,c,d);
                //ctx_pencil.lineWidth = lineWidth;
                last_mouse.x = x;
                last_mouse.y = y;
                //ctx_pencil.strokeStyle = strokeColor;
                ppts.push({x: last_mouse.x, y: last_mouse.y});
                onPaint(getCanvasTemp(),true);
                //ctx_temp.strokeStyle = "red";
                //ctx_pencil.stroke();
            }
            break;
        
        case STATE_MARKER_SELECT:
            if(mousePressed||touchState){
                erasor_state = false;
                ppts = [];
                mouse_point.x = last_mouse.x = x; 
                mouse_point.y = last_mouse.y = y;
                ppts.push({x: mouse_point.x, y: mouse_point.y});
                state = STATE_MARKER_MOVE;
                /*strokeColor = "#ccc";
                lineWidth = 10;*/
            }
            break;

        case STATE_MARKER_MOVE:
            ////console.log(state);
            if(mousePressed||touchState){
                last_mouse.x = x;
                last_mouse.y = y;
                ppts.push({x: last_mouse.x, y: last_mouse.y});
                onPaint(getCanvasTemp(),true);
            }
            break;
        
        case STATE_FIGURE_CREATE:
            if(createFigureFunction){ //creating a new figure
                canvas.style.cursor = 'crosshair';
                canvas_pencil.style.cursor = 'crosshair';
            }
            break;

        case STATE_FIGURE_SELECTED:
            
            if(mousePressed||touchState){ // mouse is (at least was) pressed
                if(lastMove != null){ //we are in dragging mode
                    var handle = HandleManager.handleGetSelected();
                    if(handle != null){ //We are over a Handle of selected Figure               
                        canvas.style.cursor = handle.getCursor();
                        canvas_pencil.style.cursor = handle.getCursor();
                        handle.action(lastMove,x,y);
                        MOUSE_STATE = 'move';
                        redraw = true;
                        Log.info('onMouseMove() - STATE_FIGURE_SELECTED + drag - mouse cursor = ' + canvas.style.cursor);
                    }
                    else{ /*no handle is selected*/
                        if (!SHIFT_PRESSED){//just translate the figure                            
                            canvas.style.cursor = 'move';
                            canvas_pencil.style.cursor = 'move';
                            var translateMatrix = generateMoveMatrix(STACK.figureGetById(selectedFigureId), x, y);
                            Log.info("onMouseMove() + STATE_FIGURE_SELECTED : translation matrix" + translateMatrix);
                            var cmdTranslateFigure = new FigureTranslateCommand(selectedFigureId, translateMatrix);
                            History.addUndo(cmdTranslateFigure);
                            cmdTranslateFigure.execute();
                            MOUSE_STATE = 'move';
                            redraw = true;
                            Log.info("onMouseMove() + STATE_FIGURE_SELECTED + drag - move selected figure");
                        }else{ //we are entering a figures selection sesssion
                            state = STATE_SELECTING_MULTIPLE;
                            selectionArea.points[0] = new Point(x,y);
                            selectionArea.points[1] = new Point(x,y);
                            selectionArea.points[2] = new Point(x,y);
                            selectionArea.points[3] = new Point(x,y);//the selectionArea has no size until we start dragging the mouse
                            redraw = true;
                            Log.info('onMouseMove() - STATE_GROUP_SELECTED + mousePressed + SHIFT => STATE_SELECTING_MULTIPLE');
                        }
                    }
                }
            }
            else{ //no mouse press (only change cursor)
                var handle = HandleManager.handleGet(x,y); //TODO: we should be able to replace it with .getSelectedHandle()
                var handlePoints = []; 
                var handlers=HandleManager.handleGetAll();
                for(var iterator=0; iterator<handlers.length; iterator++){
                    if(handlers[iterator].type!="r")
                        handlePoints.push(new Point(handlers[iterator].x,handlers[iterator].y));
                }
                
                if(Util.isPointInside(new Point(x,y),handlePoints)){
                    canvas.style.cursor = 'move';
                    canvas_pencil.style.cursor = 'move';
                }
                else if(handle != null){ //We are over a Handle of selected Figure               
                    canvas.style.cursor = handle.getCursor();
                    canvas_pencil.style.cursor = handle.getCursor();
                    Log.info('onMouseMove() - STATE_FIGURE_SELECTED + over a Handler = change cursor to: ' + canvas.style.cursor);
                }
                else{
                    /*move figure only if no handle is selected*/
                    var tmpFigId = STACK.figureGetByXY(x, y); //pick first figure from (x, y)
                    if(tmpFigId != -1){
                        canvas.style.cursor = 'move';   
                        canvas_pencil.style.cursor = 'move';                         
                        Log.info("onMouseMove() + STATE_FIGURE_SELECTED + over a figure = change cursor");
                    }
                    else{
                        canvas.style.cursor = 'default';   
                        canvas_pencil.style.cursor = 'default';
                        canvas_app.style.cursor = 'default';                           
                        Log.info("onMouseMove() + STATE_FIGURE_SELECTED + over nothin = change cursor to default");
                    }
                }
            }
            break;


        case STATE_GROUP_SELECTED:
            
            if(mousePressed||touchState){
                if(lastMove != null){
                    var handle = HandleManager.handleGetSelected();
                    
                    if(handle != null){ //over a handle
                        Log.info('onMouseMove() - STATE_GROUP_SELECTED + mouse pressed  + over a Handle');
                        //HandleManager.handleSelectXY(x, y);
                        canvas.style.cursor = handle.getCursor();
                        canvas_pencil.style.cursor = handle.getCursor();
                        MOUSE_STATE = 'move';
                        handle.action(lastMove, x, y);
                        redraw = true;
                    }
                    else{ //not over any handle -so it must be translating
                        if (!SHIFT_PRESSED){
                            Log.info('onMouseMove() - STATE_GROUP_SELECTED + mouse pressed + NOT over a Handle');
                            canvas.style.cursor = 'move';
                            canvas_pencil.style.cursor = 'move';
                            var mTranslate = generateMoveMatrix(STACK.groupGetById(selectedGroupId), x, y);
                            var cmdTranslateGroup = new GroupTranslateCommand(selectedGroupId, mTranslate);
                            cmdTranslateGroup.execute();
                            //History.addUndo(cmdTranslateGroup);
                            setUpCropButton();
                            redraw = true;
                        }else{
                            state = STATE_SELECTING_MULTIPLE;
                            selectionArea.points[0] = new Point(x,y);
                            selectionArea.points[1] = new Point(x,y);
                            selectionArea.points[2] = new Point(x,y);
                            selectionArea.points[3] = new Point(x,y);//the selectionArea has no size until we start dragging the mouse
                            redraw = true;
                            Log.info('onMouseMove() - STATE_GROUP_SELECTED + mousePressed + SHIFT => STATE_SELECTING_MULTIPLE');
                        }
                    }
                }
            }
            else{ //mouse not pressed (only change cursor)
                Log.debug('onMouseMove() - STATE_GROUP_SELECTED + mouse NOT pressed');
                var handlePoints = []; 
                var handlers=HandleManager.handleGetAll();
                for(var iterator=0; iterator<handlers.length; iterator++){
                    if(handlers[iterator].type!="r")
                        handlePoints.push(new Point(handlers[iterator].x,handlers[iterator].y));
                }
                
                if(HandleManager.handleGet(x,y) != null){
                    canvas.style.cursor = HandleManager.handleGet(x,y).getCursor();
                    canvas_pencil.style.cursor = HandleManager.handleGet(x,y).getCursor();
                }
                //else if(STACK.figureIsOver(x,y)){
                else if(Util.isPointInside(new Point(x,y),handlePoints)){
                    canvas.style.cursor = 'move';
                    canvas_pencil.style.cursor = 'move';
                }
                else{
                    canvas.style.cursor = 'default';
                    canvas_pencil.style.cursor = 'default';
                }
            }                       

            break;
        case STATE_CONNECTOR_PICK_FIRST:
            //change FCP (figure connection points) color
            var fCpId = LineArrow_MANAGER.linearrowPointGetByXY(x, y, LineArrowPoint.TYPE_FIGURE); //find figure's CP

            if(fCpId != -1){ //we are over a figure's CP
                var fCp = LineArrow_MANAGER.linearrowPointGetById(fCpId);
                fCp.color = LineArrowPoint.OVER_COLOR;
                //                canvas.style.cursor = 'crosshair';
                selectedLineArrowPointId = fCpId;
            }
            else{ //change back old connection point to normal color
                if(selectedLineArrowPointId != -1){
                    var oldCp = LineArrow_MANAGER.linearrowPointGetById(selectedLineArrowPointId);
                    oldCp.color = LineArrowPoint.NORMAL_COLOR;
                    //                    canvas.style.cursor = 'normal';
                    selectedLineArrowPointId = -1;
                }
            }
            redraw = true;
            break;


        case STATE_CONNECTOR_PICK_SECOND:
            //moved to allow undo to access it
            connectorPickSecond(x,y,ev);
            redraw = true;
            break;


        case STATE_CONNECTOR_SELECTED:
            var cps = LineArrow_MANAGER.linearrowPointGetAllByParent(selectedLineArrowId);
            var start = cps[0];
            var end = cps[1];
            if(start.point.near(x, y, 3) || end.point.near(x, y, 3)){
                canvas.style.cursor = 'move';
                canvas_pencil.style.cursor = 'move';
            }
            else if(HandleManager.handleGet(x,y) != null){ //over a handle?. Handles should appear only for selected figures
                canvas.style.cursor = HandleManager.handleGet(x,y).getCursor();
            }
            else{
                canvas.style.cursor = 'default';
                canvas_pencil.style.cursor = 'default';
                canvas_app.style.cursor = 'default';
            }
            
            /*if we have a handle action*/
            if(mousePressed==true && lastMove != null && HandleManager.handleGetSelected() != null){
                Log.info("onMouseMove() + STATE_CONNECTOR_SELECTED - trigger a handler action");
                var handle = HandleManager.handleGetSelected();
                //store old turning points
                var turns = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId).turningPoints;
                var oldTurns = [turns.length];
                for(var i = 0; i < turns.length; i++){
                    oldTurns[i] = turns[i].clone();
                }


                //DO the handle action
                handle.action(lastMove,x,y);
                MOUSE_STATE = 'move';
                //store new turning points
                turns = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId).turningPoints;
                var newTurns = [turns.length];
                for(var i = 0; i < turns.length; i++){
                    newTurns[i] = turns[i].clone();
                }


                //see if old turning points are the same as the new turning points
                var difference = false;
                for(var k=0;k<newTurns.length; k++){
                    if(! newTurns[k].equals(oldTurns[k])){
                        difference = true;
                    }
                }

                redraw = true;
            }
            break;


        case STATE_CONNECTOR_MOVE_POINT:
            Log.info("Easy easy easy....it's fragile");
            if(mousePressed){ //only if we are dragging
                
                connectorMovePoint(selectedLineArrowPointId, x, y, ev);

                redraw = true;
            }
            break;
    }

    //////console.log("Current"+state);
    lastMove = [x, y];
    
    if(redraw||!exeFlag){
        //////console.log("Triggered redraw");
        draw();
    }
    return false;
}
// store clicked figure or linearrow
// var shape = null;

/**Treats the mouse double click event
 **/
function onDblClick(ev) {
    var coords = getCanvasXY(ev);
    var x = coords[0];
    var y = coords[1];
    lastClick = [x,y];

    // store clicked figure or linearrow
    shape = null;

    // store id value (from Stack) of clicked text primitive
    var textPrimitiveId = -1;


    //find LineArrow at (x,y)
    //find Figure at (x,y)
    var fId = STACK.figureGetByXY(x,y);

    // check if we clicked a figure
    if (fId != -1) {
        var figure = STACK.figureGetById(fId);
        var tId = STACK.textGetByFigureXY(fId, x, y);

        // if we clicked text primitive inside of figure
        if (tId !== -1) {
            shape = figure;
            textPrimitiveId = tId;
        }
    } 
    
    // check if we clicked a text primitive inside of shape
    if (textPrimitiveId != -1) {
        // if group selected
        if (state == STATE_GROUP_SELECTED) {
            var selectedGroup = STACK.groupGetById(selectedGroupId);

            // if group is temporary then destroy it
            if(!selectedGroup.permanent){
                STACK.groupDestroy(selectedGroupId);
            }

            //deselect current group
            selectedGroupId = -1;
        }

        // deselect current figure
        selectedFigureId = -1;

        // set current state
        state = STATE_TEXT_EDITING;

        // set up text editor
        setUpTextEditorPopup(shape, textPrimitiveId);
        redraw = true;
    }

    draw();

    return false;
}
function editText(fId){
    ////console.log("1stedittext")
  var textPrimitiveId = -1;
  // check if we clicked a figure
    if (fId != -1) {
        var figure = STACK.figureGetById(fId);
        ////console.log("figure",fId)
        var tId = figure.primitives[1].id;
        ////console.log("tId",tId)

        // if we clicked text primitive inside of figure
        if (tId !== -1) {
            shape = figure;
            ////console.log("shape",shape)
            textPrimitiveId = tId;
        }
    } 
    
    // check if we clicked a text primitive inside of shape
    if (textPrimitiveId != -1) {
        // if group selected
        if (state == STATE_GROUP_SELECTED) {
            var selectedGroup = STACK.groupGetById(selectedGroupId);

            // if group is temporary then destroy it
            if(!selectedGroup.permanent){
                STACK.groupDestroy(selectedGroupId);
            }

            //deselect current group
            selectedGroupId = -1;
        }

        // deselect current figure
        selectedFigureId = -1;

        // set current state
        state = STATE_TEXT_EDITING;
        ////console.log(shape);
        // set up text editor
        setUpTextEditorPopup(shape, textPrimitiveId);
        redraw = true;
    }
    setUpEditPanel(null);
    draw();

    //return false;
}
function connectorPickFirst(x, y, ev){
    Log.group("connectorPickFirst");
    //create linearrow
    var conId = LineArrow_MANAGER.linearrowCreate(new Point(x, y),new Point(x+10,y+10) /*fake cp*/, linearrowType);
    selectedLineArrowId = conId;
    state = STATE_CONNECTOR_PICK_SECOND;
    Log.groupEnd();
}

function connectorPickSecond(x, y, ev){
    Log.group("main: connectorPickSecond");
    
    //current linearrow
    var con = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId); //it should be the last one
    var cps = LineArrow_MANAGER.linearrowPointGetAllByParent(con.id);

    var rStartPoint = con.turningPoints[0].clone();
    
    //end point
    var rEndPoint = new Point(x, y);
    
    WHITEBOARD.debugSolutions = LineArrow_MANAGER.linearrow2Points(
        con.type, 
        rStartPoint, /*Start point*/
        rEndPoint, /*End point*/
        null, 
        null
    );
    var firstConPoint = LineArrow_MANAGER.linearrowPointGetFirstForConnector(selectedLineArrowId);
    var secConPoint = LineArrow_MANAGER.linearrowPointGetSecondForConnector(selectedLineArrowId);
    //adjust linearrow
    Log.info("connectorPickSecond() -> Solution: " + WHITEBOARD.debugSolutions[0][2]);
    
    con.turningPoints = Point.cloneArray(WHITEBOARD.debugSolutions[0][2]);
    firstConPoint.point = con.turningPoints[0].clone();
    secConPoint.point = con.turningPoints[con.turningPoints.length-1].clone();
    
    currentCloud = [];
        
    Log.groupEnd();
}


function connectorMovePoint(connectionPointId, x, y, ev){
    Log.group("main: connectorMovePoint");


    //current linearrow
    var con = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId);
    var cps = LineArrow_MANAGER.linearrowPointGetAllByParent(con.id);

    //get the LineArrowPoint's id if we are over it (and belonging to a figure)
    var fCpOverId = LineArrow_MANAGER.linearrowPointGetByXY(x,y, LineArrowPoint.TYPE_FIGURE);

    //get Figure's id if over it
    var fOverId = STACK.figureGetByXY(x,y);


    
    var rStartPoint = con.turningPoints[0].clone();
    var rEndPoint = con.turningPoints[con.turningPoints.length-1].clone();
    
    // before solution we reset currentCloud
    currentCloud = [];
    
    if(cps[0].id == connectionPointId){ //FIRST POINT
        rStartPoint = new Point(x, y);
         
        //solutions
        WHITEBOARD.debugSolutions = LineArrow_MANAGER.linearrow2Points(con.type, rStartPoint, rEndPoint, null, null);
        //UPDATE CONNECTOR 
        var firstConPoint = LineArrow_MANAGER.linearrowPointGetFirstForConnector(selectedLineArrowId);
        var secondConPoint = LineArrow_MANAGER.linearrowPointGetSecondForConnector(selectedLineArrowId);
        //adjust linearrow
        Log.info("connectorMovePoint() -> Solution: " + WHITEBOARD.debugSolutions[0][2]);

        con.turningPoints = Point.cloneArray(WHITEBOARD.debugSolutions[0][2]);
        
        firstConPoint.point = con.turningPoints[0].clone();
        secondConPoint.point = con.turningPoints[con.turningPoints.length - 1].clone();
    }     
    else if (cps[1].id == connectionPointId){ //SECOND POINT
        rEndPoint = new Point(x, y);
    
        //solutions
        WHITEBOARD.debugSolutions = LineArrow_MANAGER.linearrow2Points(con.type, rStartPoint, rEndPoint, null, null);


        //UPDATE CONNECTOR
        var firstConPoint = LineArrow_MANAGER.linearrowPointGetFirstForConnector(selectedLineArrowId);
        var secondConPoint = LineArrow_MANAGER.linearrowPointGetSecondForConnector(selectedLineArrowId);
        
        //adjust linearrow
        Log.info("connectorMovePoint() -> Solution: " + WHITEBOARD.debugSolutions[0][2]);

        con.turningPoints = Point.cloneArray(WHITEBOARD.debugSolutions[0][2]);
        firstConPoint.point = con.turningPoints[0].clone();
        secondConPoint.point = con.turningPoints[con.turningPoints.length - 1].clone();
    } else{
        throw "main:connectorMovePoint() - this should never happen";
    }   
    Log.groupEnd();
}

function generateMoveMatrix(fig, x,y){
    if(typeof x === 'undefined'){
        throw "Exception in generateMoveMatrix, x is undefined";
    }
    
    if(typeof y === 'undefined'){
        throw "Exception in generateMoveMatrix,  is undefined";
    }
    
    Log.info("main.js --> generateMoveMatrix x:" + x + ' y:' + y + ' lastMove=[' + lastMove + ']' );
    var dx = x - lastMove[0];
    var dy = y - lastMove[1];
    
    var moveMatrix = null;
        
    if(false){ //snap effect
        moveMatrix = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
        ];
                    
        snapMonitor[0] += dx;
        snapMonitor[1] += dy;

        var jump = GRIDWIDTH / 2; //the figure will jump half of grid cell width
        
        //HORIZONTAL
        if(dx != 0){ //dragged to right
            
            var startGridX = ( Math.floor( (fig.getBounds()[0] + snapMonitor[0])  / jump ) + 1 ) * jump;            
            var deltaStart = startGridX - fig.getBounds()[0];
            
            var endGridX = (Math.floor( (fig.getBounds()[2] + snapMonitor[0])  / jump ) + 1) * jump;
            var deltaEnd = endGridX - fig.getBounds()[2];
            
            if(deltaStart < deltaEnd){
                if( fig.getBounds()[0] + snapMonitor[0]  >= startGridX - SNAP_DISTANCE ){
                    moveMatrix[0][2] = deltaStart;
                    snapMonitor[0] -= deltaStart;
                }
                else if( fig.getBounds()[2] + snapMonitor[0]  >= endGridX - SNAP_DISTANCE ){ 
                    moveMatrix[0][2] = deltaEnd;
                    snapMonitor[0] -= deltaEnd;
                }
            }
            else{
                if( fig.getBounds()[2] + snapMonitor[0]  >= endGridX - SNAP_DISTANCE ){ 
                    moveMatrix[0][2] = deltaEnd;
                    snapMonitor[0] -= deltaEnd;
                }
                else if( fig.getBounds()[0] + snapMonitor[0]  >= startGridX - SNAP_DISTANCE ){
                    moveMatrix[0][2] = deltaStart;
                    snapMonitor[0] -= deltaStart;
                }
            }            
        }


        //VERTICAL
        /*if(dy != 0){ //dragged to bottom
            var upperGridY = ( Math.floor( (fig.getBounds()[1] + snapMonitor[1])  / jump ) + 1 ) * jump;            
            var deltaUpper = upperGridY - fig.getBounds()[1];
            var lowerGridY = (Math.floor( (fig.getBounds()[3] + snapMonitor[1])  / jump ) + 1) * jump;
            var deltaLower = lowerGridY - fig.getBounds()[3];
            
            if(deltaUpper < deltaLower){
                if( fig.getBounds()[1] + snapMonitor[1]  >= upperGridY - SNAP_DISTANCE ){
                    moveMatrix[1][2] = deltaUpper;
                    snapMonitor[1] -= deltaUpper;
                }
                else if( fig.getBounds()[3] + snapMonitor[1]  >= lowerGridY - SNAP_DISTANCE ){ 
                    moveMatrix[1][2] = deltaLower;
                    snapMonitor[1] -= deltaLower;
                }
            }
            else{
                if( fig.getBounds()[3] + snapMonitor[1]  >= lowerGridY - SNAP_DISTANCE ){ 
                    moveMatrix[1][2] = deltaLower;
                    snapMonitor[1] -= deltaLower;
                }
                else if( fig.getBounds()[1] + snapMonitor[1]  >= upperGridY - SNAP_DISTANCE ){
                    moveMatrix[1][2] = deltaUpper;
                    snapMonitor[1] -= deltaUpper;
                }
            }               
        }*/


    //Log.info("generateMoveMatrix() - 'trimmed' snapMonitor : " + snapMonitor);
        
    } else{ //normal move
        moveMatrix = [
        [1, 0, dx],
        [0, 1, dy],
        [0, 0, 1]
        ];
    }

    Log.groupEnd();
    return moveMatrix;
}


function getCanvasBounds(name){
    name = typeof name !== 'undefined' ? name : '#canvas_main';
    var canvasMinX = $(name).offset().left;
    var canvasMaxX = canvasMinX + $(name).width();
    
    var canvasMinY = $(name).offset().top;
    var canvasMaxY = canvasMinY + $(name).height();

    return [canvasMinX, canvasMinY, canvasMaxX, canvasMaxY];
}

function getBodyXY(ev){
    return [ev.pageX,ev.pageY];//TODO: add scroll
}


function getCanvasXY(ev,name){
    name = typeof name !== 'undefined' ? '#canvas_temp' : '#canvas_main';
    var position = null;
    var canvasBounds = getCanvasBounds();
    Log.debug("Canvas bounds: [" + canvasBounds + ']');
    var tempPageX = null;
    var tempPageY = null;
    
    if(ev.touches){ //iPad 
        if(ev.touches.length > 0){
            tempPageX = ev.touches[0].pageX;
            tempPageY = ev.touches[0].pageY;
        }
    }
    else{ //normal Desktop
        tempPageX = ev.pageX; //Retrieves the x-coordinate of the mouse pointer relative to the top-left corner of the document.
        tempPageY = ev.pageY; //Retrieves the y-coordinate of the mouse pointer relative to the top-left corner of the document.          
        Log.debug("ev.pageX:" + ev.pageX + " ev.pageY:" + ev.pageY);
    }
    
    if(canvasBounds[0] <= tempPageX && tempPageX <= canvasBounds[2]
        && canvasBounds[1] <= tempPageY && tempPageY <= canvasBounds[3])
    {
        position = [tempPageX - $("#canvas_main").offset().left, tempPageY - $("#canvas_main").offset().top];
    }
    return position;
}

function updateShape(shapeId, property, newValue, skipCommand, previousValue){
    ////console.log("5thupdateshaape")
    //Log.group("main.js-->updateFigure");
    //Log.info("updateShape() figureId: " + figureId + " property: " + property + ' new value: ' + newValue);

    // set default values of optional params
    skipCommand = skipCommand || false;
    
    var obj = STACK.figureGetById(shapeId); //try to find it inside {Figure}s
    if(!obj){
        // if(shapeId==-1)
        //   shapeId = selectedLineArrowId;
        obj = LineArrow_MANAGER.linearrowGetById(shapeId);
    }
    var objSave = obj; //keep a reference to initial shape

    /*Example of property 'primitives.1.str' */
    var props = property.split(".");
    //Log.info("Splitted props: " + props);


    //Log.info("Object before descend: " +  obj.oType);
    var figure = obj; //TODO: Why this variable when we already have objSave?
    for(var i = 0; i<props.length-1; i++){
        obj = obj[props[i]];
    }

    //the property name
    var propName = props[props.length -1];
    var propSet = "set" + Util.capitaliseFirstLetter(propName);
    var propGet = "get" + Util.capitaliseFirstLetter(propName);
    
    if(propSet in obj){ //@see https://developer.mozilla.org/en/JavaScript/Reference/Operators/Special_Operators/in_Operator
        if((typeof(previousValue) !== 'undefined' && previousValue != obj[propGet])
            || (typeof(previousValue) === 'undefined' && newValue != obj[propGet]())){ //update ONLY if new value differ from the old one
            //Log.info('updateShape() : penultimate propSet: ' +  propSet);
                var undo = new ShapeChangePropertyCommand(shapeId, property, newValue, previousValue);
                undo.execute();

                if (!skipCommand) {
                    History.addUndo(undo);
                }
            }
            obj[propSet](newValue);
    }
    else{
        if( (typeof(previousValue) !== 'undefined' && obj[propName] != previousValue)
            || (typeof(previousValue) === 'undefined' && obj[propName] != newValue)){ //try to change it ONLY if new value is different than the last one
                var undo = new ShapeChangePropertyCommand(shapeId, property, newValue, previousValue);
                undo.execute();

                if (!skipCommand) {
                    History.addUndo(undo);
                }
            obj[propName] = newValue;
        }
    }
    if(objSave instanceof LineArrow && propName == 'str'){
        //Log.info("updateShape(): it's a connector 2");
        objSave.updateMiddleText();
    }
    
    draw();
}

function reset(canvas){
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);   
    /*ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0,canvas.width,canvas.height); */          
}


function draw(){

    var ctx = getContext();
    reset(getCanvas()); 
    reset(getCanvasApp()); 
    //step(getCanvas());   
    STACK.paint(ctx);


    if(!WHITEBOARD.interactivity)
    {
      if(STACK.figures.length!=0||LineArrow_MANAGER.linearrows.length !=0)
      {
        WHITEBOARD.interactivity = true;
      }
    }
}


function renderedCanvas(){
   var canvas = getCanvas();
   var tempCanvas = document.getElementById('tempCanvas');
   if(tempCanvas === null){
           tempCanvas = document.createElement('canvas');
           tempCanvas.setAttribute('id', 'tempCanvas');                 
           tempCanvas.style.display = 'none';
   }
   tempCanvas.setAttribute('width', canvas.width);
   tempCanvas.setAttribute('height', canvas.height);
   reset(tempCanvas);
   STACK.paint(tempCanvas.getContext('2d'), true);
   return tempCanvas.toDataURL();
}

/*Returns a text containing all the URL in a diagram */
function linkMap(){
    var csvBounds = '';
    var first = true;
    for(f in STACK.figures){
		////console.log("stackfigre",f)
        var figure = STACK.figures[f];
        if(figure.url != ''){
            var bounds = figure.getBounds();
            if(first){
                first = false;                                                        
            }
            else{
                csvBounds += "\n";
            }

            csvBounds += bounds[0] + ',' + bounds[1] + ',' + bounds[2] + ',' + bounds[3] + ',' + figure.url;
        }
    }
    Log.info("editor.php->linkMap()->csv bounds: " + csvBounds);

    return csvBounds;
}


/*======================APPLE=====================================*/
function touchStart(event){
    event.preventDefault();
    //alert("asdf");
    onMouseDown(event);                                                
}


function touchMove(event){
    event.preventDefault();

    onMouseMove(event,true);                
}


function touchEnd(event){
    event.preventDefault();
    onMouseUp(event,"TouchUp");
}

function touchCancel(event){
//nothing
    event.preventDefault();
    onMouseUp(event,"TouchUp");
}
function addBackground(){
    Log.info("addBackground: called");
    var canvasElement = document.getElementById('canvas_background');
    var ctx = canvasElement.getContext('2d');
    var backgroundImage = canvasProps.backgroundURL;
    var bgType = canvasProps.bgType;
    // set background image if backgroundImage is not null
    if (backgroundImage !== null && backgroundImage !== undefined && backgroundImage!='' &&backgroundShow) {
        // set new buffered background image
        var imageDat = new Image();
        imageDat.src = backgroundImage;
        imageDat.onload = function(e){
            var offset = 10;
            var padding = 4;
            var added_offset = offset + padding;
            if(bgType <4 || bgType>6)
            {
                var newPattern = document.createElement('canvas');
                newPattern.style.display = 'block';
                newPattern.height = imageDat.height;
                
                newPattern.width = added_offset;
                newPattern.getContext('2d').drawImage(this,this.width - added_offset,0,offset,imageDat.height,0,0,added_offset,imageDat.height);
                var pat = ctx.createPattern(newPattern,"repeat-x");
                ctx.rect(this.width-padding,0,canvasElement.width-this.width+padding,canvasElement.height);
                ctx.fillStyle = pat;
                ctx.fill();
                
            }
            else
            {
                ctx.rect(0,0,canvasElement.width,canvasElement.height);
                ctx.fillStyle = "#fff";
                ctx.fill();
            }

            ctx.drawImage(this, 0, 0);
        } //end onload
        //ctx.drawImage(backgroundImage, 0, 0);
    }
    else
    {
        // fill canvas with fill color
        ctx.rect(0,0,canvasElement.width,canvasElement.height);
        ctx.fillStyle = "#fff";
        ctx.fill();
    } 
}//end function
        
function events(can){
    //add event handlers for Canvas
    can.addEventListener("mousemove", onMouseMove, false);
    can.addEventListener("mousedown", onMouseDown, false);
    can.addEventListener("mouseup", onMouseUp, false);
    //can.addEventListener("dblclick", onDblClick, false);
    //add event handlers for Canvas
    can.addEventListener("touchstart", touchStart, false);
    can.addEventListener("touchmove", touchMove, false);
    can.addEventListener("touchend", touchEnd, false);
    can.width = canvasProps.getWidth();
    can.height = canvasProps.getHeight();

}
function addListeners(){
    var canvas = getCanvas();
    var canvas_temp = getCanvasTemp();
    var canvas_pencil = getCanvasPencil();
    var canvas_app = getCanvasApp();
    document.addEventListener("selectstart", stopselection, false);                
    events(canvas);
    events(canvas_pencil);
    events(canvas_temp);
    events(canvas_app);
    events(document.getElementById("canvas_background"));
    /*//add event handlers for Canvas
    canvas.addEventListener("mousemove", onMouseMove, false);
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    
    canvas_pencil.addEventListener("mousemove", onMouseMove, false);
    canvas_pencil.addEventListener("mousedown", onMouseDown, false);
    canvas_pencil.addEventListener("mouseup", onMouseUp, false);

    canvas_temp.addEventListener("mousemove", onMouseMove, false);
    canvas_temp.addEventListener("mousedown", onMouseDown, false);
    canvas_temp.addEventListener("mouseup", onMouseUp, false);*/

    if(false){
        //add listeners for iPad/iPhone
        //As this was only an experiment (for now) it is not well supported nor optimized
        ontouchstart="touchStart(event);"
        ontouchmove="touchMove(event);"
        ontouchend="touchEnd(event);"
        ontouchcancel="touchCancel(event);"
    }

}
var currentDiagramId = [];
function addBlankTab(){
  $(".action-icons-left").removeClass("disabledstate");
    if(tab_size < 10){
        resetToNoneState();
        tab_size = tab_size + 1;
        current_tab = tab_size;
        $('.tabstyles li').removeAttr('class');
        $('.tabstyles li:first-child').after('<li id="tab_'+tab_size+'"><a id="a_hed" href="#one">'+tab_size+'</a></li>');
        $( ".tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
        $( ".tabs" ).tabs('refresh');
        $('.tabstyles').children('li').eq(1).children('a').trigger('click');
        /*if($(this).attr('data-bg') != -1)
        {
            var backgroundURL = WHITEBOARD.hostURL+bg[$(this).attr('data-bg')];
            load(current_tab,backgroundURL,$(this).attr('data-bg'));
        }
        else
        {    */
          load(current_tab,'none','none'); 
       // }
        if(tab_size == 10)
            $("#add_tab").hide();
        $(".whiteboard-overlay").hide();
        $(".action-icons-bg").find(".sitewidth").removeClass("disabledstate");
    }
    else{
        alert("Maximum Tab Size");
    }
}
/*Initialize the Gallery */
function loadImage(path, load_url, width, height, target) {
  $('<img src="'+ path +'">').load(function() {
      $(target).html('');
      $(this).width(width).height(height).attr('data-url',load_url).appendTo($(target));
    });
/*$(target).html('<embed src="'+path+'" width="'+width+'" height="'+height+'"/>');*/
}
var searchDataList = [];
var shellCat = "";
var actualCat = "";
var allImages = [];
function gallerySearch(){
  var search_string = $('#gallery_search').val();
  var responseCount = 0;
  var loopCount = 0;
  $.ajax({
    url: $().getbaseurl()+"/fetchWhiteboardGallery", success: function(data){
      var optionHTML = ''; 
      if(searchDataList.length>0)
      {
        checkandConstruct(search_string);
      } 
      else
      {
        for(var i=0;i<data.list.length;i++)
        {
          for(var j=0;j<data.list[i].list.length;j++)
          {
            
            loopCount = loopCount + 1;
                /*if(data.list[i].label.toLowerCase().indexOf(search_string) >= 0){searchDataList.push(data.list[i]);}  */
             $.ajax({
                url:WHITEBOARD.API_HOST+"/fetchWhiteboardAssets?category1="+data.list[i].label+"&category2="+data.list[i].list[j].label,
                success:function(imgs)
                {
                  ////console.log(imgs);   
                  searchDataList = searchDataList.concat(imgs.objects);   
                  ////console.log(searchDataList); 
                  responseCount = responseCount + 1;  
                  if(responseCount == loopCount)
                  {                
                    checkandConstruct(search_string);
                  }     
                }
              })   
          }
        } 
      }
    }  
  });
}
var constructedSearchArr = [];
function checkandConstruct(search_string)
{

  constructedSearchArr = [];
  for(var i=0;i<searchDataList.length;i++)
  {
    if(searchDataList[i].title.toLowerCase().indexOf(search_string) >= 0)
    {
      ////console.log(searchDataList[i]);
      constructedSearchArr.push(searchDataList[i]);
      ////console.log("POsition"+i);
    }
  }
  initSearchShow();
}

function initSearchShow()
{  
  var loader_url = window.location.protocol + '//' + window.location.host+'/ce-static/classedgelx/css/images/loader.gif';
  $("body .subject-ellabration").html('');
  $("body .subject-ellabration").html('<ul class="vscroll clearfix"></ul>');        
  $.each(constructedSearchArr, function( index, value )
    {
      $("body .subject-ellabration>ul").append('<li><a href="javascript:void(0)" class="delete-gallery '+value.isAuthor+'" data-id="'+value.id+'"></a><a href="javascript:void(0);" class="insert_image" data-tooltip="'+value.title+'"><div id="gallery_'+value.id+'"><img src="'+loader_url+'" alt="loading" class="loader" style="max-width:15px;max-height:15px"/></div><div style="position: absolute;bottom: 0;max-height: 40px;overflow: hidden;left:0px;right:0px;color:#000;text-overflow: ellipsis;white-space: nowrap;word-wrap: normal;width: 100%;">'+value.title+'</div></a></li>');
        $.ajax({url: WHITEBOARD.API_HOST+"/streamWhiteboardGalleryAssetDLFilePath?id="+value.id+"&filename="+value.assetSrc, success: function(img_url){
            img_url =window.location.protocol + '//' + window.location.host+"/delegate/fileservice/"+img_url.replace("\\", "/");
            loadImage(img_url,img_url,'100%','auto','#gallery_'+value.id);
        }});  
    });
}
function initGallery(){
  $.ajax({url: $().getbaseurl()+"/fetchWhiteboardGallery", success: function(data){
      //$(document).ready(function(){
    var optionHTML = '';
    $.each(data.list, function( index, value ) {
      var childHTML = '';
      if(value.list.length!=0)
      {
        optionHTML += '<option>'+value.label+'</option>';
        childHTML = '<ul class="detail-list clearfix">';
         $.each(value.list, function( index1, childValue ) {
            childHTML += '<li><a href="javascript:void(0);" class="load_subject_ellabration" data-category1="'+value.label+'" data-category2="'+childValue.label+'"><span></span><div>'+childValue.label+'</div></a></li>';
         });
        childHTML += '</ul>';
      }
      $("body #WhiteboardGallery").append('<li><a href="javascript:void(0);" class="subject-link"><span class="view-toggle"></span>'+value.label+'</a>'+childHTML+'</li>');
    });
    $("#category1").html(optionHTML);
    $("#category1").trigger("change");
    //Accordian in whiteboard gallery
    $( ".galleryaccordion" ).accordion({
      heightStyle: "content",
      active:false,
      collapsible: true
    });
    $(".vscroll").mCustomScrollbar({
        theme:"rounded-dots",
        scrollInertia:400,
        callbacks:{
          onScrollStart: function(){
             
            $(".select").select2("close");
          }
        }
      });
      $(".hscroll").mCustomScrollbar({
        axis:"x",
        theme:"rounded-dots",
        scrollbarPosition: "inside"
      });
    $("body .subject-ellabration>ul").html('');
    $("body").on('click',".detail-list li a.load_subject_ellabration",function () {
      $.ajax({url: WHITEBOARD.API_HOST+"/fetchWhiteboardAssets?category1="+$(this).attr('data-category1')+"&category2="+$(this).attr('data-category2'), success: function(images){
        $(".detail-list li a").find('span').removeClass('view-active');
        $(this).find('span').addClass('view-active');
        //var images = {"objects":[{"id":"img-023089de-48b7-46bf-b9fb-89d5d03d187b","type":"image","title":"Heart: External view","thumbnail":"8_sci_00029_th.jpg","assetSrc":"8_sci_00029.jpg"},{"id":"img-5a56cb05-85ff-401b-a08b-2e640c7802ea","type":"image","title":"Brain","thumbnail":"8_sci_00033_th.jpg","assetSrc":"8_sci_00033.jpg"},{"id":"img-eef88519-d237-4dc5-81b1-f4013f51f729","type":"image","title":"Kidney: Cross section","thumbnail":"8_sci_00028_th.jpg","assetSrc":"8_sci_00028.jpg"}]};
        $("body .subject-ellabration").html('');
        $("body .subject-ellabration").html('<ul class="vscroll clearfix"></ul>');
        $.each(images.objects, function( index, value ) {
          var loader_url = window.location.protocol + '//' + window.location.host+'/ce-static/classedgelx/css/images/loader.gif';
          $("body .subject-ellabration>ul").append('<li><a href="javascript:void(0)" class="delete-gallery '+value.isAuthor+'" data-id="'+value.id+'"></a><a href="javascript:void(0);" class="insert_image" data-tooltip="'+value.title+'"><div id="gallery_'+value.id+'"><img src="'+loader_url+'" alt="loading" class="loader" style="max-width:15px;max-height:15px"/></div><div style="position: absolute;bottom: 0;max-height: 40px;overflow: hidden;left:0px;right:0px;color:black;">'+value.title+'</div></a></li>');
          $.ajax({url: WHITEBOARD.API_HOST+"/streamWhiteboardGalleryAssetDLFilePath?id="+value.id+"&filename="+value.assetSrc, success: function(img_url){ 
            //var img_url = "http://203.199.38.98:8080/delegate/fileservice/asset/tata/Biology/Human%20Body/img-023089de-48b7-46bf-b9fb-89d5d03d187b/8_sci_00029_th.jpg";
          //var load_url = "http://203.199.38.98:8080/delegate/fileservice/asset/tata/Biology/Human%20Body/img-023089de-48b7-46bf-b9fb-89d5d03d187b/8_sci_00029.jpg";
            img_url =window.location.protocol + '//' + window.location.host+"/delegate/fileservice/"+img_url.replace("\\", "/");
            loadImage(img_url,img_url,'100%','auto','#gallery_'+value.id);
          }});
          //alert("d");
        });
        $(".vscroll").mCustomScrollbar({
          theme:"rounded-dots",
          scrollInertia:400,
          callbacks:{
            onScrollStart: function(){
              $(".select").select2("close");
            }
          }
        });
        
      }});
      
    });
    $.ajax({url: WHITEBOARD.API_HOST+"/fetchWhiteboardAssets?category1=Wbackground(S)&category2=background", success: function(images){
      $(".detail-list li a").find('span').removeClass('view-active');
      $(this).find('span').addClass('view-active');
      WHITEBOARD.backgrounds = {};
      //var images = {"objects":[{"id":"img-023089de-48b7-46bf-b9fb-89d5d03d187b","type":"image","title":"Heart: External view","thumbnail":"8_sci_00029_th.jpg","assetSrc":"8_sci_00029.jpg"},{"id":"img-5a56cb05-85ff-401b-a08b-2e640c7802ea","type":"image","title":"Brain","thumbnail":"8_sci_00033_th.jpg","assetSrc":"8_sci_00033.jpg"},{"id":"img-eef88519-d237-4dc5-81b1-f4013f51f729","type":"image","title":"Kidney: Cross section","thumbnail":"8_sci_00028_th.jpg","assetSrc":"8_sci_00028.jpg"}]};
      $("body .background_tabs").html('');
      $("body .background_tabs").html('<ul class="clearfix  vscroll bglist pgbgtypes"></ul>');
      $.each(images.objects, function( index, value ) {
        WHITEBOARD.backgrounds[value.id] = null;
        var loader_url = window.location.protocol + '//' + window.location.host+'/ce-static/classedgelx/css/images/loader.gif';
        $("body .background_tabs>ul").append('<li data-bg="'+value.id+'" style="width: 145px;"><a href="javascript:void(0);" data-tooltip="'+value.title+'"><div id="'+value.id+'"><img src="'+loader_url+'" alt="loading" class="loader"/></div><div style="padding-top: 10px;color: #fff;">'+value.title+'</div></a></li>');
        $.ajax({url: WHITEBOARD.API_HOST+"/streamWhiteboardGalleryAssetDLFilePath?id="+value.id+"&filename="+value.assetSrc, success: function(img_url){
          //var img_url = "http://203.199.38.98:8080/delegate/fileservice/asset/tata/Biology/Human%20Body/img-023089de-48b7-46bf-b9fb-89d5d03d187b/8_sci_00029_th.jpg";
        //var load_url = "http://203.199.38.98:8080/delegate/fileservice/asset/tata/Biology/Human%20Body/img-023089de-48b7-46bf-b9fb-89d5d03d187b/8_sci_00029.jpg";
          img_url =window.location.protocol + '//' + window.location.host+"/delegate/fileservice/"+img_url.replace("\\", "/");
          WHITEBOARD.backgrounds[value.id] = img_url;
          loadImage(img_url,img_url,'100px','auto','#'+value.id);
        }});
        //alert("d");
      });
      $(".vscroll").mCustomScrollbar({
        theme:"rounded-dots",
        scrollInertia:400,
        callbacks:{
          onScrollStart: function(){
            $(".select").select2("close");
          }
        }
      });
      
    }});
    //<li data-bg="-1"><a href="javascript:void(0);"><img src="'+WHITEBOARD.hostURL+'images/whiteboardbgs/bg-1.jpg" alt="" /></a></li>
  //});
  }});
  //var data = {"list":[{"id":null,"type":"category1","list":[{"id":null,"type":"category2","list":[],"label":"Animals"},{"id":null,"type":"category2","list":[],"label":"Fruits"},{"id":null,"type":"category2","list":[],"label":"Leaves"},{"id":null,"type":"category2","list":[],"label":"Insects"},{"id":null,"type":"category2","list":[],"label":"Vegetables"},{"id":null,"type":"category2","list":[],"label":"Birds"},{"id":null,"type":"category2","list":[],"label":"Plants"},{"id":null,"type":"category2","list":[],"label":"Transportation"},{"id":null,"type":"category2","list":[],"label":"Flowers"},{"id":null,"type":"category2","list":[],"label":"Water Animals"}],"label":"Environmental Science"},{"id":null,"type":"category1","list":[{"id":null,"type":"category2","list":[],"label":"Human Body"},{"id":null,"type":"category2","list":[],"label":"Hormones"},{"id":null,"type":"category2","list":[],"label":"Animal Kingdom"},{"id":null,"type":"category2","list":[],"label":"Human"},{"id":null,"type":"category2","list":[],"label":"Environment"},{"id":null,"type":"category2","list":[],"label":"Classification of Animals"},{"id":null,"type":"category2","list":[],"label":"Reproduction"},{"id":null,"type":"category2","list":[],"label":"Cell and Tissues"},{"id":null,"type":"category2","list":[],"label":"Evolution"},{"id":null,"type":"category2","list":[],"label":"Human Anatomy"},{"id":null,"type":"category2","list":[],"label":"Laboratory Equipment"},{"id":null,"type":"category2","list":[],"label":"Plant Nutrition"},{"id":null,"type":"category2","list":[],"label":"Respiration in Animals"},{"id":null,"type":"category2","list":[],"label":"Plant Kingdom"}],"label":"Biology"},{"id":null,"type":"category1","list":[{"id":null,"type":"category2","list":[],"label":"Optics New"},{"id":null,"type":"category2","list":[],"label":"Optics"},{"id":null,"type":"category2","list":[],"label":"Physical Quantities"},{"id":null,"type":"category2","list":[],"label":"Mechanics"},{"id":null,"type":"category2","list":[],"label":"Electronics"},{"id":null,"type":"category2","list":[],"label":"Modern Physics"},{"id":null,"type":"category2","list":[],"label":"Electricity"},{"id":null,"type":"category2","list":[],"label":"Astronomy"},{"id":null,"type":"category2","list":[],"label":"Fluid Mechanics"},{"id":null,"type":"category2","list":[],"label":"Sound"},{"id":null,"type":"category2","list":[],"label":"Heat"}],"label":"Physics"},{"id":null,"type":"category1","list":[{"id":null,"type":"category2","list":[],"label":"Map"}],"label":"Geography"},{"id":null,"type":"category1","list":[{"id":null,"type":"category2","list":[],"label":"Personality"}],"label":"History"},{"id":null,"type":"category1","list":[{"id":null,"type":"category2","list":[],"label":"Widgets"}],"label":"Mathematics"}]};
  /*//$(document).ready(function(){
    $.each(data.list, function( index, value ) {
      var childHTML = '';
      if(value.list.length!=0)
      {
        childHTML = '<ul class="detail-list clearfix">';
         $.each(value.list, function( index1, childValue ) {
            childHTML += '<li><a href="javascript:void(0);"><span></span><div>'+childValue.label+'</div></a></li>';
         });
        childHTML += '</ul>';
      }
      $("body #WhiteboardGallery").append('<li><a href="javascript:void(0);" class="subject-link"><span class="view-toggle"></span>'+value.label+'</a>'+childHTML+'</li>');
    });
    //Accordian in whiteboard gallery
    $( ".galleryaccordion" ).accordion({
      heightStyle: "content",
      active:1,
      collapsible: true,
    });
    
    $("body").on('click',".detail-list li a",function () {
      $(".detail-list li a").find('span').removeClass('view-active');
      $(this).find('span').addClass('view-active');
      var images = {"objects":[{"id":"img-023089de-48b7-46bf-b9fb-89d5d03d187b","type":"image","title":"Heart: External view","thumbnail":"8_sci_00029_th.jpg","assetSrc":"8_sci_00029.jpg"},{"id":"img-5a56cb05-85ff-401b-a08b-2e640c7802ea","type":"image","title":"Brain","thumbnail":"8_sci_00033_th.jpg","assetSrc":"8_sci_00033.jpg"},{"id":"img-eef88519-d237-4dc5-81b1-f4013f51f729","type":"image","title":"Kidney: Cross section","thumbnail":"8_sci_00028_th.jpg","assetSrc":"8_sci_00028.jpg"}]};
      $("body .subject-ellabration>ul").html('');
      $.each(images.objects, function( index, value ) {
        $("body .subject-ellabration>ul").append('<li><a href="javascript:void(0);""><div id="'+value.id+'"></div><div>'+value.title+'</div></a></li>');
        var img_url = "http://203.199.38.98:8080/delegate/fileservice/asset/tata/Biology/Human%20Body/img-023089de-48b7-46bf-b9fb-89d5d03d187b/8_sci_00029_th.jpg";
        var load_url = "http://203.199.38.98:8080/delegate/fileservice/asset/tata/Biology/Human%20Body/img-023089de-48b7-46bf-b9fb-89d5d03d187b/8_sci_00029.jpg";
        loadImage(img_url,load_url,'100%','auto','#'+value.id);
        //alert("d");
      });
    });
  //});*/
}
function encodeImageData(imageData){
  return imageData.replace(/\+|_/g,'~');
}
function decodeImageData(imageData){
  return imageData.replace(/~|_/g,'+');
}
function refreshTabs(spliceId)
{
  canvasProps.pencil = [];
  if(spliceId != undefined)
  {
    if(canvas_diagram.length>1)
    {
      ////console.log("before slice");
      ////console.log(canvas_diagram.length);
      canvas_diagram.splice(parseInt(spliceId),1);
      ////console.log("after slice");
      ////console.log(canvas_diagram.length);
      var initialDiagramLength = canvas_diagram[0].c.pencil.length;
      for(var i = 0;i < canvas_diagram.length;i++)
      {
          canvas_diagram[i].i = i+1;
          if(canvas_diagram[i].c.pencil.length==initialDiagramLength&&canvas_diagram[i].c.pencil.length>=parseInt(spliceId))
          {
            canvas_diagram[i].c.pencil.splice(parseInt(spliceId),1);
          }
          
      }
      ////console.log("after slice Modification");
      ////console.log(canvas_diagram);
    }
    /**/
  }    
  
  tab_size = 0;
  $('.tabstyles li').not('li:first-child').remove();
  for(var i = 0;i < canvas_diagram.length;i++)
  {
      tab_size = tab_size + 1;
      current_tab = tab_size;
      $('.tabstyles li').removeAttr('class');
      $('.tabstyles li:first-child').after('<li id="tab_'+tab_size+'"><a id="a_hed" href="#one">'+tab_size+'</a></li>');
      $( ".tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
      $( ".tabs" ).tabs('refresh');
  }
  
  current_tab = 1;
  load(1);
  //asdf;
  //load(1);
  if(tab_size == 10)
    $("#add_tab").hide();
  else
    $("#add_tab").show();
  window.setTimeout(function(){
    $('.tabstyles').children('li').eq(tab_size).children('a').trigger('click');
  },100);
}

//Added ColorPicker
window.jscolor||(window.jscolor=function(){var e={register:function(){e.attachDOMReadyEvent(e.init),e.attachEvent(document,"mousedown",e.onDocumentMouseDown),e.attachEvent(document,"touchstart",e.onDocumentTouchStart),e.attachEvent(window,"resize",e.onWindowResize)},init:function(){e.jscolor.lookupClass&&e.jscolor.installByClassName(e.jscolor.lookupClass)},tryInstallOnElements:function(t,n){var r=new RegExp("(^|\\s)("+n+")(\\s*(\\{[^}]*\\})|\\s|$)","i");for(var i=0;i<t.length;i+=1){if(t[i].type!==undefined&&t[i].type.toLowerCase()=="color"&&e.isColorAttrSupported)continue;var s;if(!t[i].jscolor&&t[i].className&&(s=t[i].className.match(r))){var o=t[i],u=null,a=e.getDataAttr(o,"jscolor");a!==null?u=a:s[4]&&(u=s[4]);var f={};if(u)try{f=(new Function("return ("+u+")"))()}catch(l){e.warn("Error parsing jscolor options: "+l+":\n"+u)}o.jscolor=new e.jscolor(o,f)}}},isColorAttrSupported:function(){var e=document.createElement("input");if(e.setAttribute){e.setAttribute("type","color");if(e.type.toLowerCase()=="color")return!0}return!1}(),isCanvasSupported:function(){var e=document.createElement("canvas");return!!e.getContext&&!!e.getContext("2d")}(),fetchElement:function(e){return typeof e=="string"?document.getElementById(e):e},isElementType:function(e,t){return e.nodeName.toLowerCase()===t.toLowerCase()},getDataAttr:function(e,t){var n="data-"+t,r=e.getAttribute(n);return r!==null?r:null},attachEvent:function(e,t,n){e.addEventListener?e.addEventListener(t,n,!1):e.attachEvent&&e.attachEvent("on"+t,n)},detachEvent:function(e,t,n){e.removeEventListener?e.removeEventListener(t,n,!1):e.detachEvent&&e.detachEvent("on"+t,n)},_attachedGroupEvents:{},attachGroupEvent:function(t,n,r,i){e._attachedGroupEvents.hasOwnProperty(t)||(e._attachedGroupEvents[t]=[]),e._attachedGroupEvents[t].push([n,r,i]),e.attachEvent(n,r,i)},detachGroupEvents:function(t){if(e._attachedGroupEvents.hasOwnProperty(t)){for(var n=0;n<e._attachedGroupEvents[t].length;n+=1){var r=e._attachedGroupEvents[t][n];e.detachEvent(r[0],r[1],r[2])}delete e._attachedGroupEvents[t]}},attachDOMReadyEvent:function(e){var t=!1,n=function(){t||(t=!0,e())};if(document.readyState==="complete"){setTimeout(n,1);return}if(document.addEventListener)document.addEventListener("DOMContentLoaded",n,!1),window.addEventListener("load",n,!1);else if(document.attachEvent){document.attachEvent("onreadystatechange",function(){document.readyState==="complete"&&(document.detachEvent("onreadystatechange",arguments.callee),n())}),window.attachEvent("onload",n);if(document.documentElement.doScroll&&window==window.top){var r=function(){if(!document.body)return;try{document.documentElement.doScroll("left"),n()}catch(e){setTimeout(r,1)}};r()}}},warn:function(e){window.console&&window.console.warn&&window.console.warn(e)},preventDefault:function(e){e.preventDefault&&e.preventDefault(),e.returnValue=!1},captureTarget:function(t){t.setCapture&&(e._capturedTarget=t,e._capturedTarget.setCapture())},releaseTarget:function(){e._capturedTarget&&(e._capturedTarget.releaseCapture(),e._capturedTarget=null)},fireEvent:function(e,t){if(!e)return;if(document.createEvent){var n=document.createEvent("HTMLEvents");n.initEvent(t,!0,!0),e.dispatchEvent(n)}else if(document.createEventObject){var n=document.createEventObject();e.fireEvent("on"+t,n)}else e["on"+t]&&e["on"+t]()},classNameToList:function(e){return e.replace(/^\s+|\s+$/g,"").split(/\s+/)},hasClass:function(e,t){return t?-1!=(" "+e.className.replace(/\s+/g," ")+" ").indexOf(" "+t+" "):!1},setClass:function(t,n){var r=e.classNameToList(n);for(var i=0;i<r.length;i+=1)e.hasClass(t,r[i])||(t.className+=(t.className?" ":"")+r[i])},unsetClass:function(t,n){var r=e.classNameToList(n);for(var i=0;i<r.length;i+=1){var s=new RegExp("^\\s*"+r[i]+"\\s*|"+"\\s*"+r[i]+"\\s*$|"+"\\s+"+r[i]+"(\\s+)","g");t.className=t.className.replace(s,"$1")}},getStyle:function(e){return window.getComputedStyle?window.getComputedStyle(e):e.currentStyle},setStyle:function(){var e=document.createElement("div"),t=function(t){for(var n=0;n<t.length;n+=1)if(t[n]in e.style)return t[n]},n={borderRadius:t(["borderRadius","MozBorderRadius","webkitBorderRadius"]),boxShadow:t(["boxShadow","MozBoxShadow","webkitBoxShadow"])};return function(e,t,r){switch(t.toLowerCase()){case"opacity":var i=Math.round(parseFloat(r)*100);e.style.opacity=r,e.style.filter="alpha(opacity="+i+")";break;default:e.style[n[t]]=r}}}(),setBorderRadius:function(t,n){e.setStyle(t,"borderRadius",n||"0")},setBoxShadow:function(t,n){e.setStyle(t,"boxShadow",n||"none")},getElementPos:function(t,n){var r=0,i=0,s=t.getBoundingClientRect();r=s.left,i=s.top;if(!n){var o=e.getViewPos();r+=o[0],i+=o[1]}return[r,i]},getElementSize:function(e){return[e.offsetWidth,e.offsetHeight]},getAbsPointerPos:function(e){e||(e=window.event);var t=0,n=0;return typeof e.changedTouches!="undefined"&&e.changedTouches.length?(t=e.changedTouches[0].clientX,n=e.changedTouches[0].clientY):typeof e.clientX=="number"&&(t=e.clientX,n=e.clientY),{x:t,y:n}},getRelPointerPos:function(e){e||(e=window.event);var t=e.target||e.srcElement,n=t.getBoundingClientRect(),r=0,i=0,s=0,o=0;return typeof e.changedTouches!="undefined"&&e.changedTouches.length?(s=e.changedTouches[0].clientX,o=e.changedTouches[0].clientY):typeof e.clientX=="number"&&(s=e.clientX,o=e.clientY),r=s-n.left,i=o-n.top,{x:r,y:i}},getViewPos:function(){var e=document.documentElement;return[(window.pageXOffset||e.scrollLeft)-(e.clientLeft||0),(window.pageYOffset||e.scrollTop)-(e.clientTop||0)]},getViewSize:function(){var e=document.documentElement;return[window.innerWidth||e.clientWidth,window.innerHeight||e.clientHeight]},redrawPosition:function(){if(e.picker&&e.picker.owner){var t=e.picker.owner,n,r;t.fixed?(n=e.getElementPos(t.targetElement,!0),r=[0,0]):(n=e.getElementPos(t.targetElement),r=e.getViewPos());var i=e.getElementSize(t.targetElement),s=e.getViewSize(),o=e.getPickerOuterDims(t),u,a,f;switch(t.position.toLowerCase()){case"left":u=1,a=0,f=-1;break;case"right":u=1,a=0,f=1;break;case"top":u=0,a=1,f=-1;break;default:u=0,a=1,f=1}var l=(i[a]+o[a])/2;if(!t.smartPosition)var c=[n[u],n[a]+i[a]-l+l*f];else var c=[-r[u]+n[u]+o[u]>s[u]?-r[u]+n[u]+i[u]/2>s[u]/2&&n[u]+i[u]-o[u]>=0?n[u]+i[u]-o[u]:n[u]:n[u],-r[a]+n[a]+i[a]+o[a]-l+l*f>s[a]?-r[a]+n[a]+i[a]/2>s[a]/2&&n[a]+i[a]-l-l*f>=0?n[a]+i[a]-l-l*f:n[a]+i[a]-l+l*f:n[a]+i[a]-l+l*f>=0?n[a]+i[a]-l+l*f:n[a]+i[a]-l-l*f];var h=c[u],p=c[a],d=t.fixed?"fixed":"absolute",v=(c[0]+o[0]>n[0]||c[0]<n[0]+i[0])&&c[1]+o[1]<n[1]+i[1];e._drawPosition(t,h,p,d,v)}},_drawPosition:function(t,n,r,i,s){var o=s?0:t.shadowBlur;e.picker.wrap.style.position=i,e.picker.wrap.style.left=n+"px",e.picker.wrap.style.top=r+"px",e.setBoxShadow(e.picker.boxS,t.shadow?new e.BoxShadow(0,o,t.shadowBlur,0,t.shadowColor):null)},getPickerDims:function(t){var n=!!e.getSliderComponent(t),r=[2*t.insetWidth+2*t.padding+t.width+(n?2*t.insetWidth+e.getPadToSliderPadding(t)+t.sliderSize:0),2*t.insetWidth+2*t.padding+t.height+(t.closable?2*t.insetWidth+t.padding+t.buttonHeight:0)];return r},getPickerOuterDims:function(t){var n=e.getPickerDims(t);return[n[0]+2*t.borderWidth,n[1]+2*t.borderWidth]},getPadToSliderPadding:function(e){return Math.max(e.padding,1.5*(2*e.pointerBorderWidth+e.pointerThickness))},getPadYComponent:function(e){switch(e.mode.charAt(1).toLowerCase()){case"v":return"v"}return"s"},getSliderComponent:function(e){if(e.mode.length>2)switch(e.mode.charAt(2).toLowerCase()){case"s":return"s";case"v":return"v"}return null},onDocumentMouseDown:function(t){t||(t=window.event);var n=t.target||t.srcElement;n._jscLinkedInstance?n._jscLinkedInstance.showOnClick&&n._jscLinkedInstance.show():n._jscControlName?e.onControlPointerStart(t,n,n._jscControlName,"mouse"):e.picker&&e.picker.owner&&e.picker.owner.hide()},onDocumentTouchStart:function(t){t||(t=window.event);var n=t.target||t.srcElement;n._jscLinkedInstance?n._jscLinkedInstance.showOnClick&&n._jscLinkedInstance.show():n._jscControlName?e.onControlPointerStart(t,n,n._jscControlName,"touch"):e.picker&&e.picker.owner&&e.picker.owner.hide()},onWindowResize:function(t){e.redrawPosition()},onParentScroll:function(t){e.picker&&e.picker.owner&&e.picker.owner.hide()},_pointerMoveEvent:{mouse:"mousemove",touch:"touchmove"},_pointerEndEvent:{mouse:"mouseup",touch:"touchend"},_pointerOrigin:null,_capturedTarget:null,onControlPointerStart:function(t,n,r,i){var s=n._jscInstance;e.preventDefault(t),e.captureTarget(n);var o=function(s,o){e.attachGroupEvent("drag",s,e._pointerMoveEvent[i],e.onDocumentPointerMove(t,n,r,i,o)),e.attachGroupEvent("drag",s,e._pointerEndEvent[i],e.onDocumentPointerEnd(t,n,r,i))};o(document,[0,0]);if(window.parent&&window.frameElement){var u=window.frameElement.getBoundingClientRect(),a=[-u.left,-u.top];o(window.parent.window.document,a)}var f=e.getAbsPointerPos(t),l=e.getRelPointerPos(t);e._pointerOrigin={x:f.x-l.x,y:f.y-l.y};switch(r){case"pad":switch(e.getSliderComponent(s)){case"s":s.hsv[1]===0&&s.fromHSV(null,100,null);break;case"v":s.hsv[2]===0&&s.fromHSV(null,null,100)}e.setPad(s,t,0,0);break;case"sld":e.setSld(s,t,0)}e.dispatchFineChange(s)},onDocumentPointerMove:function(t,n,r,i,s){return function(t){var i=n._jscInstance;switch(r){case"pad":t||(t=window.event),e.setPad(i,t,s[0],s[1]),e.dispatchFineChange(i);break;case"sld":t||(t=window.event),e.setSld(i,t,s[1]),e.dispatchFineChange(i)}}},onDocumentPointerEnd:function(t,n,r,i){return function(t){var r=n._jscInstance;e.detachGroupEvents("drag"),e.releaseTarget(),e.dispatchChange(r)}},dispatchChange:function(t){t.valueElement&&e.isElementType(t.valueElement,"input")&&e.fireEvent(t.valueElement,"change")},dispatchFineChange:function(e){if(e.onFineChange){var t;typeof e.onFineChange=="string"?t=new Function(e.onFineChange):t=e.onFineChange,t.call(e)}},setPad:function(t,n,r,i){var s=e.getAbsPointerPos(n),o=r+s.x-e._pointerOrigin.x-t.padding-t.insetWidth,u=i+s.y-e._pointerOrigin.y-t.padding-t.insetWidth,a=o*(360/(t.width-1)),f=100-u*(100/(t.height-1));switch(e.getPadYComponent(t)){case"s":t.fromHSV(a,f,null,e.leaveSld);break;case"v":t.fromHSV(a,null,f,e.leaveSld)}},setSld:function(t,n,r){var i=e.getAbsPointerPos(n),s=r+i.y-e._pointerOrigin.y-t.padding-t.insetWidth,o=100-s*(100/(t.height-1));switch(e.getSliderComponent(t)){case"s":t.fromHSV(null,o,null,e.leavePad);break;case"v":t.fromHSV(null,null,o,e.leavePad)}},_vmlNS:"jsc_vml_",_vmlCSS:"jsc_vml_css_",_vmlReady:!1,initVML:function(){if(!e._vmlReady){var t=document;t.namespaces[e._vmlNS]||t.namespaces.add(e._vmlNS,"urn:schemas-microsoft-com:vml");if(!t.styleSheets[e._vmlCSS]){var n=["shape","shapetype","group","background","path","formulas","handles","fill","stroke","shadow","textbox","textpath","imagedata","line","polyline","curve","rect","roundrect","oval","arc","image"],r=t.createStyleSheet();r.owningElement.id=e._vmlCSS;for(var i=0;i<n.length;i+=1)r.addRule(e._vmlNS+"\\:"+n[i],"behavior:url(#default#VML);")}e._vmlReady=!0}},createPalette:function(){var t={elm:null,draw:null};if(e.isCanvasSupported){var n=document.createElement("canvas"),r=n.getContext("2d"),i=function(e,t,i){n.width=e,n.height=t,r.clearRect(0,0,n.width,n.height);var s=r.createLinearGradient(0,0,n.width,0);s.addColorStop(0,"#F00"),s.addColorStop(1/6,"#FF0"),s.addColorStop(2/6,"#0F0"),s.addColorStop(.5,"#0FF"),s.addColorStop(4/6,"#00F"),s.addColorStop(5/6,"#F0F"),s.addColorStop(1,"#F00"),r.fillStyle=s,r.fillRect(0,0,n.width,n.height);var o=r.createLinearGradient(0,0,0,n.height);switch(i.toLowerCase()){case"s":o.addColorStop(0,"rgba(255,255,255,0)"),o.addColorStop(1,"rgba(255,255,255,1)");break;case"v":o.addColorStop(0,"rgba(0,0,0,0)"),o.addColorStop(1,"rgba(0,0,0,1)")}r.fillStyle=o,r.fillRect(0,0,n.width,n.height)};t.elm=n,t.draw=i}else{e.initVML();var s=document.createElement("div");s.style.position="relative",s.style.overflow="hidden";var o=document.createElement(e._vmlNS+":fill");o.type="gradient",o.method="linear",o.angle="90",o.colors="16.67% #F0F, 33.33% #00F, 50% #0FF, 66.67% #0F0, 83.33% #FF0";var u=document.createElement(e._vmlNS+":rect");u.style.position="absolute",u.style.left="-1px",u.style.top="-1px",u.stroked=!1,u.appendChild(o),s.appendChild(u);var a=document.createElement(e._vmlNS+":fill");a.type="gradient",a.method="linear",a.angle="180",a.opacity="0";var f=document.createElement(e._vmlNS+":rect");f.style.position="absolute",f.style.left="-1px",f.style.top="-1px",f.stroked=!1,f.appendChild(a),s.appendChild(f);var i=function(e,t,n){s.style.width=e+"px",s.style.height=t+"px",u.style.width=f.style.width=e+1+"px",u.style.height=f.style.height=t+1+"px",o.color="#F00",o.color2="#F00";switch(n.toLowerCase()){case"s":a.color=a.color2="#FFF";break;case"v":a.color=a.color2="#000"}};t.elm=s,t.draw=i}return t},createSliderGradient:function(){var t={elm:null,draw:null};if(e.isCanvasSupported){var n=document.createElement("canvas"),r=n.getContext("2d"),i=function(e,t,i,s){n.width=e,n.height=t,r.clearRect(0,0,n.width,n.height);var o=r.createLinearGradient(0,0,0,n.height);o.addColorStop(0,i),o.addColorStop(1,s),r.fillStyle=o,r.fillRect(0,0,n.width,n.height)};t.elm=n,t.draw=i}else{e.initVML();var s=document.createElement("div");s.style.position="relative",s.style.overflow="hidden";var o=document.createElement(e._vmlNS+":fill");o.type="gradient",o.method="linear",o.angle="180";var u=document.createElement(e._vmlNS+":rect");u.style.position="absolute",u.style.left="-1px",u.style.top="-1px",u.stroked=!1,u.appendChild(o),s.appendChild(u);var i=function(e,t,n,r){s.style.width=e+"px",s.style.height=t+"px",u.style.width=e+1+"px",u.style.height=t+1+"px",o.color=n,o.color2=r};t.elm=s,t.draw=i}return t},leaveValue:1,leaveStyle:2,leavePad:4,leaveSld:8,BoxShadow:function(){var e=function(e,t,n,r,i,s){this.hShadow=e,this.vShadow=t,this.blur=n,this.spread=r,this.color=i,this.inset=!!s};return e.prototype.toString=function(){var e=[Math.round(this.hShadow)+"px",Math.round(this.vShadow)+"px",Math.round(this.blur)+"px",Math.round(this.spread)+"px",this.color];return this.inset&&e.push("inset"),e.join(" ")},e}(),jscolor:function(t,n){function i(e,t,n){e/=255,t/=255,n/=255;var r=Math.min(Math.min(e,t),n),i=Math.max(Math.max(e,t),n),s=i-r;if(s===0)return[null,0,100*i];var o=e===r?3+(n-t)/s:t===r?5+(e-n)/s:1+(t-e)/s;return[60*(o===6?0:o),100*(s/i),100*i]}function s(e,t,n){var r=255*(n/100);if(e===null)return[r,r,r];e/=60,t/=100;var i=Math.floor(e),s=i%2?e-i:1-(e-i),o=r*(1-t),u=r*(1-t*s);switch(i){case 6:case 0:return[r,u,o];case 1:return[u,r,o];case 2:return[o,r,u];case 3:return[o,u,r];case 4:return[u,o,r];case 5:return[r,o,u]}}function o(){e.unsetClass(d.targetElement,d.activeClass),e.picker.wrap.parentNode.removeChild(e.picker.wrap),delete e.picker.owner}function u(){function l(){var e=d.insetColor.split(/\s+/),n=e.length<2?e[0]:e[1]+" "+e[0]+" "+e[0]+" "+e[1];t.btn.style.borderColor=n}d._processParentElementsInDOM(),e.picker||(e.picker={owner:null,wrap:document.createElement("div"),box:document.createElement("div"),boxS:document.createElement("div"),boxB:document.createElement("div"),pad:document.createElement("div"),padB:document.createElement("div"),padM:document.createElement("div"),padPal:e.createPalette(),cross:document.createElement("div"),crossBY:document.createElement("div"),crossBX:document.createElement("div"),crossLY:document.createElement("div"),crossLX:document.createElement("div"),sld:document.createElement("div"),sldB:document.createElement("div"),sldM:document.createElement("div"),sldGrad:e.createSliderGradient(),sldPtrS:document.createElement("div"),sldPtrIB:document.createElement("div"),sldPtrMB:document.createElement("div"),sldPtrOB:document.createElement("div"),btn:document.createElement("div"),btnT:document.createElement("span")},e.picker.pad.appendChild(e.picker.padPal.elm),e.picker.padB.appendChild(e.picker.pad),e.picker.cross.appendChild(e.picker.crossBY),e.picker.cross.appendChild(e.picker.crossBX),e.picker.cross.appendChild(e.picker.crossLY),e.picker.cross.appendChild(e.picker.crossLX),e.picker.padB.appendChild(e.picker.cross),e.picker.box.appendChild(e.picker.padB),e.picker.box.appendChild(e.picker.padM),e.picker.sld.appendChild(e.picker.sldGrad.elm),e.picker.sldB.appendChild(e.picker.sld),e.picker.sldB.appendChild(e.picker.sldPtrOB),e.picker.sldPtrOB.appendChild(e.picker.sldPtrMB),e.picker.sldPtrMB.appendChild(e.picker.sldPtrIB),e.picker.sldPtrIB.appendChild(e.picker.sldPtrS),e.picker.box.appendChild(e.picker.sldB),e.picker.box.appendChild(e.picker.sldM),e.picker.btn.appendChild(e.picker.btnT),e.picker.box.appendChild(e.picker.btn),e.picker.boxB.appendChild(e.picker.box),e.picker.wrap.appendChild(e.picker.boxS),e.picker.wrap.appendChild(e.picker.boxB));var t=e.picker,n=!!e.getSliderComponent(d),r=e.getPickerDims(d),i=2*d.pointerBorderWidth+d.pointerThickness+2*d.crossSize,s=e.getPadToSliderPadding(d),o=Math.min(d.borderRadius,Math.round(d.padding*Math.PI)),u="crosshair";t.wrap.style.clear="both",t.wrap.style.width=r[0]+2*d.borderWidth+"px",t.wrap.style.height=r[1]+2*d.borderWidth+"px",t.wrap.style.zIndex=d.zIndex,t.box.style.width=r[0]+"px",t.box.style.height=r[1]+"px",t.boxS.style.position="absolute",t.boxS.style.left="0",t.boxS.style.top="0",t.boxS.style.width="100%",t.boxS.style.height="100%",e.setBorderRadius(t.boxS,o+"px"),t.boxB.style.position="relative",t.boxB.style.border=d.borderWidth+"px solid",t.boxB.style.borderColor=d.borderColor,t.boxB.style.background=d.backgroundColor,e.setBorderRadius(t.boxB,o+"px"),t.padM.style.background=t.sldM.style.background="#FFF",e.setStyle(t.padM,"opacity","0"),e.setStyle(t.sldM,"opacity","0"),t.pad.style.position="relative",t.pad.style.width=d.width+"px",t.pad.style.height=d.height+"px",t.padPal.draw(d.width,d.height,e.getPadYComponent(d)),t.padB.style.position="absolute",t.padB.style.left=d.padding+"px",t.padB.style.top=d.padding+"px",t.padB.style.border=d.insetWidth+"px solid",t.padB.style.borderColor=d.insetColor,t.padM._jscInstance=d,t.padM._jscControlName="pad",t.padM.style.position="absolute",t.padM.style.left="0",t.padM.style.top="0",t.padM.style.width=d.padding+2*d.insetWidth+d.width+s/2+"px",t.padM.style.height=r[1]+"px",t.padM.style.cursor=u,t.cross.style.position="absolute",t.cross.style.left=t.cross.style.top="0",t.cross.style.width=t.cross.style.height=i+"px",t.crossBY.style.position=t.crossBX.style.position="absolute",t.crossBY.style.background=t.crossBX.style.background=d.pointerBorderColor,t.crossBY.style.width=t.crossBX.style.height=2*d.pointerBorderWidth+d.pointerThickness+"px",t.crossBY.style.height=t.crossBX.style.width=i+"px",t.crossBY.style.left=t.crossBX.style.top=Math.floor(i/2)-Math.floor(d.pointerThickness/2)-d.pointerBorderWidth+"px",t.crossBY.style.top=t.crossBX.style.left="0",t.crossLY.style.position=t.crossLX.style.position="absolute",t.crossLY.style.background=t.crossLX.style.background=d.pointerColor,t.crossLY.style.height=t.crossLX.style.width=i-2*d.pointerBorderWidth+"px",t.crossLY.style.width=t.crossLX.style.height=d.pointerThickness+"px",t.crossLY.style.left=t.crossLX.style.top=Math.floor(i/2)-Math.floor(d.pointerThickness/2)+"px",t.crossLY.style.top=t.crossLX.style.left=d.pointerBorderWidth+"px",t.sld.style.overflow="hidden",t.sld.style.width=d.sliderSize+"px",t.sld.style.height=d.height+"px",t.sldGrad.draw(d.sliderSize,d.height,"#000","#000"),t.sldB.style.display=n?"block":"none",t.sldB.style.position="absolute",t.sldB.style.right=d.padding+"px",t.sldB.style.top=d.padding+"px",t.sldB.style.border=d.insetWidth+"px solid",t.sldB.style.borderColor=d.insetColor,t.sldM._jscInstance=d,t.sldM._jscControlName="sld",t.sldM.style.display=n?"block":"none",t.sldM.style.position="absolute",t.sldM.style.right="0",t.sldM.style.top="0",t.sldM.style.width=d.sliderSize+s/2+d.padding+2*d.insetWidth+"px",t.sldM.style.height=r[1]+"px",t.sldM.style.cursor="default",t.sldPtrIB.style.border=t.sldPtrOB.style.border=d.pointerBorderWidth+"px solid "+d.pointerBorderColor,t.sldPtrOB.style.position="absolute",t.sldPtrOB.style.left=-(2*d.pointerBorderWidth+d.pointerThickness)+"px",t.sldPtrOB.style.top="0",t.sldPtrMB.style.border=d.pointerThickness+"px solid "+d.pointerColor,t.sldPtrS.style.width=d.sliderSize+"px",t.sldPtrS.style.height=m+"px",t.btn.style.display=d.closable?"block":"none",t.btn.style.position="absolute",t.btn.style.left=d.padding+"px",t.btn.style.bottom=d.padding+"px",t.btn.style.padding="0 15px",t.btn.style.height=d.buttonHeight+"px",t.btn.style.border=d.insetWidth+"px solid",l(),t.btn.style.color=d.buttonColor,t.btn.style.font="12px sans-serif",t.btn.style.textAlign="center";try{t.btn.style.cursor="pointer"}catch(c){t.btn.style.cursor="hand"}t.btn.onmousedown=function(){d.hide()},t.btnT.style.lineHeight=d.buttonHeight+"px",t.btnT.innerHTML="",t.btnT.appendChild(document.createTextNode(d.closeText)),a(),f(),e.picker.owner&&e.picker.owner!==d&&e.unsetClass(e.picker.owner.targetElement,d.activeClass),e.picker.owner=d,e.isElementType(v,"body")?e.redrawPosition():e._drawPosition(d,0,0,"relative",!1),t.wrap.parentNode!=v&&v.appendChild(t.wrap),e.setClass(d.targetElement,d.activeClass)}function a(){switch(e.getPadYComponent(d)){case"s":var t=1;break;case"v":var t=2}var n=Math.round(d.hsv[0]/360*(d.width-1)),r=Math.round((1-d.hsv[t]/100)*(d.height-1)),i=2*d.pointerBorderWidth+d.pointerThickness+2*d.crossSize,o=-Math.floor(i/2);e.picker.cross.style.left=n+o+"px",e.picker.cross.style.top=r+o+"px";switch(e.getSliderComponent(d)){case"s":var u=s(d.hsv[0],100,d.hsv[2]),a=s(d.hsv[0],0,d.hsv[2]),f="rgb("+Math.round(u[0])+","+Math.round(u[1])+","+Math.round(u[2])+")",l="rgb("+Math.round(a[0])+","+Math.round(a[1])+","+Math.round(a[2])+")";e.picker.sldGrad.draw(d.sliderSize,d.height,f,l);break;case"v":var c=s(d.hsv[0],d.hsv[1],100),f="rgb("+Math.round(c[0])+","+Math.round(c[1])+","+Math.round(c[2])+")",l="#000";e.picker.sldGrad.draw(d.sliderSize,d.height,f,l)}}function f(){var t=e.getSliderComponent(d);if(t){switch(t){case"s":var n=1;break;case"v":var n=2}var r=Math.round((1-d.hsv[n]/100)*(d.height-1));e.picker.sldPtrOB.style.top=r-(2*d.pointerBorderWidth+d.pointerThickness)-Math.floor(m/2)+"px"}}function l(){return e.picker&&e.picker.owner===d}function c(){d.importColor()}this.value=null,this.valueElement=t,this.styleElement=t,this.required=!0,this.refine=!0,this.hash=!1,this.uppercase=!0,this.onFineChange=null,this.activeClass="jscolor-active",this.minS=0,this.maxS=100,this.minV=0,this.maxV=100,this.hsv=[0,0,100],this.rgb=[255,255,255],this.width=181,this.height=101,this.showOnClick=!0,this.mode="HSV",this.position="bottom",this.smartPosition=!0,this.sliderSize=16,this.crossSize=8,this.closable=!1,this.closeText="Close",this.buttonColor="#000000",this.buttonHeight=18,this.padding=12,this.backgroundColor="#FFFFFF",this.borderWidth=1,this.borderColor="#BBBBBB",this.borderRadius=8,this.insetWidth=1,this.insetColor="#BBBBBB",this.shadow=!0,this.shadowBlur=15,this.shadowColor="rgba(0,0,0,0.2)",this.pointerColor="#4C4C4C",this.pointerBorderColor="#FFFFFF",this.pointerBorderWidth=1,this.pointerThickness=2,this.zIndex=1e3,this.container=null;for(var r in n)n.hasOwnProperty(r)&&(this[r]=n[r]);this.hide=function(){l()&&o()},this.show=function(){u()},this.redraw=function(){l()&&u()},this.importColor=function(){this.valueElement?e.isElementType(this.valueElement,"input")?this.refine?!this.required&&/^\s*$/.test(this.valueElement.value)?(this.valueElement.value="",this.styleElement&&(this.styleElement.style.backgroundImage=this.styleElement._jscOrigStyle.backgroundImage,this.styleElement.style.backgroundColor=this.styleElement._jscOrigStyle.backgroundColor,this.styleElement.style.color=this.styleElement._jscOrigStyle.color),this.exportColor(e.leaveValue|e.leaveStyle)):this.fromString(this.valueElement.value)||this.exportColor():this.fromString(this.valueElement.value,e.leaveValue)||(this.styleElement&&(this.styleElement.style.backgroundImage=this.styleElement._jscOrigStyle.backgroundImage,this.styleElement.style.backgroundColor=this.styleElement._jscOrigStyle.backgroundColor,this.styleElement.style.color=this.styleElement._jscOrigStyle.color),this.exportColor(e.leaveValue|e.leaveStyle)):this.exportColor():this.exportColor()},this.exportColor=function(t){if(!(t&e.leaveValue)&&this.valueElement){var n=this.toString();this.uppercase&&(n=n.toUpperCase()),this.hash&&(n="#"+n),e.isElementType(this.valueElement,"input")?this.valueElement.value=n:this.valueElement.innerHTML=n}t&e.leaveStyle||this.styleElement&&(this.styleElement.style.backgroundImage="none",this.styleElement.style.backgroundColor="#"+this.toString(),this.styleElement.style.color=this.isLight()?"#000":"#FFF"),!(t&e.leavePad)&&l()&&a(),!(t&e.leaveSld)&&l()&&f()},this.fromHSV=function(e,t,n,r){if(e!==null){if(isNaN(e))return!1;e=Math.max(0,Math.min(360,e))}if(t!==null){if(isNaN(t))return!1;t=Math.max(0,Math.min(100,this.maxS,t),this.minS)}if(n!==null){if(isNaN(n))return!1;n=Math.max(0,Math.min(100,this.maxV,n),this.minV)}this.rgb=s(e===null?this.hsv[0]:this.hsv[0]=e,t===null?this.hsv[1]:this.hsv[1]=t,n===null?this.hsv[2]:this.hsv[2]=n),this.exportColor(r)},this.fromRGB=function(e,t,n,r){if(e!==null){if(isNaN(e))return!1;e=Math.max(0,Math.min(255,e))}if(t!==null){if(isNaN(t))return!1;t=Math.max(0,Math.min(255,t))}if(n!==null){if(isNaN(n))return!1;n=Math.max(0,Math.min(255,n))}var o=i(e===null?this.rgb[0]:e,t===null?this.rgb[1]:t,n===null?this.rgb[2]:n);o[0]!==null&&(this.hsv[0]=Math.max(0,Math.min(360,o[0]))),o[2]!==0&&(this.hsv[1]=o[1]===null?null:Math.max(0,this.minS,Math.min(100,this.maxS,o[1]))),this.hsv[2]=o[2]===null?null:Math.max(0,this.minV,Math.min(100,this.maxV,o[2]));var u=s(this.hsv[0],this.hsv[1],this.hsv[2]);this.rgb[0]=u[0],this.rgb[1]=u[1],this.rgb[2]=u[2],this.exportColor(r)},this.fromString=function(e,t){var n;if(n=e.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i))return n[1].length===6?this.fromRGB(parseInt(n[1].substr(0,2),16),parseInt(n[1].substr(2,2),16),parseInt(n[1].substr(4,2),16),t):this.fromRGB(parseInt(n[1].charAt(0)+n[1].charAt(0),16),parseInt(n[1].charAt(1)+n[1].charAt(1),16),parseInt(n[1].charAt(2)+n[1].charAt(2),16),t),!0;if(n=e.match(/^\W*rgba?\(([^)]*)\)\W*$/i)){var r=n[1].split(","),i=/^\s*(\d*)(\.\d+)?\s*$/,s,o,u;if(r.length>=3&&(s=r[0].match(i))&&(o=r[1].match(i))&&(u=r[2].match(i))){var a=parseFloat((s[1]||"0")+(s[2]||"")),f=parseFloat((o[1]||"0")+(o[2]||"")),l=parseFloat((u[1]||"0")+(u[2]||""));return this.fromRGB(a,f,l,t),!0}}return!1},this.toString=function(){return(256|Math.round(this.rgb[0])).toString(16).substr(1)+(256|Math.round(this.rgb[1])).toString(16).substr(1)+(256|Math.round(this.rgb[2])).toString(16).substr(1)},this.toHEXString=function(){return"#"+this.toString().toUpperCase()},this.toRGBString=function(){return"rgb("+Math.round(this.rgb[0])+","+Math.round(this.rgb[1])+","+Math.round(this.rgb[2])+")"},this.isLight=function(){return.213*this.rgb[0]+.715*this.rgb[1]+.072*this.rgb[2]>127.5},this._processParentElementsInDOM=function(){if(this._linkedElementsProcessed)return;this._linkedElementsProcessed=!0;var t=this.targetElement;do{var n=e.getStyle(t);n&&n.position.toLowerCase()==="fixed"&&(this.fixed=!0),t!==this.targetElement&&(t._jscEventsAttached||(e.attachEvent(t,"scroll",e.onParentScroll),t._jscEventsAttached=!0))}while((t=t.parentNode)&&!e.isElementType(t,"body"))};if(typeof t=="string"){var h=t,p=document.getElementById(h);p?this.targetElement=p:e.warn("Could not find target element with ID '"+h+"'")}else t?this.targetElement=t:e.warn("Invalid target element: '"+t+"'");if(this.targetElement._jscLinkedInstance){e.warn("Cannot link jscolor twice to the same element. Skipping.");return}this.targetElement._jscLinkedInstance=this,this.valueElement=e.fetchElement(this.valueElement),this.styleElement=e.fetchElement(this.styleElement);var d=this,v=this.container?e.fetchElement(this.container):document.getElementsByTagName("body")[0],m=3;if(e.isElementType(this.targetElement,"button"))if(this.targetElement.onclick){var g=this.targetElement.onclick;this.targetElement.onclick=function(e){return g.call(this,e),!1}}else this.targetElement.onclick=function(){return!1};if(this.valueElement&&e.isElementType(this.valueElement,"input")){var y=function(){d.fromString(d.valueElement.value,e.leaveValue),e.dispatchFineChange(d)};e.attachEvent(this.valueElement,"keyup",y),e.attachEvent(this.valueElement,"input",y),e.attachEvent(this.valueElement,"blur",c),this.valueElement.setAttribute("autocomplete","off")}this.styleElement&&(this.styleElement._jscOrigStyle={backgroundImage:this.styleElement.style.backgroundImage,backgroundColor:this.styleElement.style.backgroundColor,color:this.styleElement.style.color}),this.value?this.fromString(this.value)||this.exportColor():this.importColor()}};return e.jscolor.lookupClass="jscolor",e.jscolor.installByClassName=function(t){var n=document.getElementsByTagName("input"),r=document.getElementsByTagName("button");e.tryInstallOnElements(n,t),e.tryInstallOnElements(r,t)},e.register(),e.jscolor}());


/**Initialize the page
* */
function init(callback){
   var canvas = getCanvas();

   
   //Canvas properties (width and height)
   if(canvasProps == null){//only create a new one if we have not already loaded one
       canvasProps = new CanvasProps(CanvasProps.DEFAULT_WIDTH, CanvasProps.DEFAULT_HEIGHT, CanvasProps.DEFAULT_FILL_COLOR);
	   
   }
   //lets make sure that our canvas is set to the correct values
   
   canvasProps.setWidth(canvasProps.getWidth());
   canvasProps.setHeight(canvasProps.getHeight());
   // close layer when click-out
   Curtain.set();
   HandleManager.shapeSet(Curtain.figure);
   if(canvas_diagram.length)
   { 
      refreshTabs();
      WHITEBOARD.interactivity = true;
   }
   else
   {
    WHITEBOARD.interactivity = false;
    currentDiagramId = 1;
    addBlankTab();
    /*$(".whitebgover, .whiteboard-overlay").show();
    $(".action-icons-bg").find(".sitewidth").addClass("disabledstate");*/
    /*$.ajax({
      method: "GET",
      url: $().getbaseurl()+"/streamUnsavedWhiteboardDLPath",
    })
    .done(function( msg ) {
      if(msg!=null)
      {
        $( ".alert-unsaved-message-dialog" ).dialog("open");
        WHITEBOARD.unsavedjsonpath = msg;
      }
    });*/
   }
   //tagCreate();
   window.setTimeout(function(){
       
      $( ".tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
      $( ".tabhoriz" ).tabs();
      
            /*var position = $( "#tab_list li" ).length-1;
            $( ".tabs" ).tabs('refresh');
            $( '.tabstyles' ).children('li').eq(position).children('a').trigger('click');*/
    },1000);
    //myfunc();
   addListeners();
    $("#pencil_tools").hide();
   
   //draw();
    window.addEventListener("mousemove", documentOnMouseMove, false);
    window.addEventListener("mouseup", documentOnMouseUp, false);
    window.addEventListener("mousedown", documentOnMouseDown, false);
    window.addEventListener("touchmove", documentOnMouseMove, false);
    window.addEventListener("touchend", documentOnMouseUp, false);
    WHITEBOARD.API_HOST = $().getbaseurl();
    initGallery();
    var input = document.getElementById('jsColorBtn');
    var picker = new jscolor(input);
    picker.fromRGB(255, 152, 0);
    picker.valueElement = document.getElementById('jsColor');

    $("#jsColorBtn").html('');
    var input1 = document.getElementById('jsColorBtnHighlight');
    var picker1 = new jscolor(input1);
    picker1.valueElement = document.getElementById('jsColor');
    picker1.fromRGB(255, 152, 0);
    $("#jsColorBtnHighlight").html('');
    $("#jsColor").change(function(){
      selectcolor(document.getElementById('jsColor').value);
    });
    
    
    if(callback)
    {   
      callback();
    }
}
function tagCreate(){
        // alert("tagcreate");
        var obj = STACK.figureGetById(selectedFigureId);
        var url = "/tag/unassign";
        var jwtoken=window.localStorage.token;
        var object={
            "component_id":obj.componentId
        }
        var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
        xmlhttp.open("POST", url ,false);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader('Authorization', jwtoken);
        xmlhttp.send(JSON.stringify(object));
        //console.log("response",xmlhttp.responseText)
        var unassign_tag=JSON.parse(xmlhttp.responseText)
        // var oReq = new XMLHttpRequest();
        // oReq.addEventListener("load", reqListener);
        // oReq.open("GET", url);
        // oReq.send();
        // function reqListener () {
        //     var response=JSON.parse(this.responseText);
        //     //console.log("response",response)
        //   }
        if(unassign_tag.status=="failure")
        {
            alert("Please contact us to add more tag")
        }
        var str='';
        //  $.getJSON(tagid,function (data) {
             str=str+'<option value="">Select tagid</option>'
             str=str+'<option id="select-item-1" value="1">New tag</option>'
             //console.log("unassign",unassign_tag.data)
            $.each(unassign_tag.data, function (index, value){
                ////console.log("unassign",unassign_tag.data)
                str=str+'<option value="' + value.tag_id + '">' + value.tag_id + '</option>'
            $("#tagdetail").html(str);
            
            window.setTimeout(function(){
                var obj = STACK.figureGetById(selectedFigureId);
                if(obj)
                {
                    if(obj.tagid!=null){
                        $('#tagdetail').val(obj.tagid)
                    }
                }
                
            
            },5)
        
        });
    };
    function getTag()
    {   
        // alert("gettag")
        var obj = STACK.figureGetById(selectedFigureId);
        var url = "/tag";
        var jwtoken=window.localStorage.token
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", reqListener);
        oReq.open("GET", url);
        oReq.send();
        function reqListener () {
            var response=JSON.parse(this.responseText);
            //console.log("response",response)
            if(response.status=="failure")
        {
            alert("Please contact us to add more tag")
        }
        var strdata='';
        //  $.getJSON(tagid,function (data) {
             strdata=strdata+'<option value="">Select tagid</option>'
             //console.log("response",response.data)
            $.each(response.data, function (index, value){
                ////console.log("unassign",unassign_tag.data)
                strdata=strdata+'<option value="' + value.id + '">' + value.id + '</option>'
            $("#tagdetail").html(strdata);
            
            window.setTimeout(function(){
                var obj = STACK.figureGetById(selectedFigureId);
                if(obj)
                {
                    if(obj.tagid!=null){
                        $('#tagdetail').val(obj.tagid)
                    }
                }
                
            
            },5)
        
        });
          }
    }

function componentDetail(){
    
    var jwtoken=window.localStorage.token
    var url = window.location.href;
    var projectId = url.split(/\//)[6];
    var obj = STACK.figureGetById(selectedFigureId);
    
    var data = {
        "component_name" :"rectangle",
        "reference_id" : obj.id,
        "project_id": projectId,
    }
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "/project/component",false);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader('Authorization', jwtoken);
    xmlhttp.send(JSON.stringify(data));
    var dataval=JSON.parse(xmlhttp.responseText)
   
    updateShape(selectedFigureId,'componentId',dataval.data.id);
    updateShape(selectedFigureId,'created_at',dataval.data.created_at);
    // var created=document.getElementById("create_side").innerHTML=new Date(dataval.data.created_at);
    //componentButton()
}

function componentImageDetail(){
    var jwtoken=window.localStorage.token
    var url = window.location.href;
    var projectId = url.split(/\//)[6];
    var obj = STACK.figureGetById(selectedFigureId);
    var data = {
        "component_name" :currentImage.name,
        "reference_id" : obj.id,
        "project_id": projectId,
        "component_library_id":currentImage.id
    }
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "/project/component",false);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader('Authorization', jwtoken);
    xmlhttp.send(JSON.stringify(data));
    var dataval=JSON.parse(xmlhttp.responseText)
    updateShape(selectedFigureId,'componentId',dataval.data.id);
    updateShape(selectedFigureId,'componentLibraryId',dataval.data.component_library_id);
    updateShape(selectedFigureId,'created_at',dataval.data.created_at);
    //componentImage()
}



function componentTag()
{   
    var jwtoken=window.localStorage.token
    var url = window.location.href;
    var projectId = url.split(/\//)[6];
    var obj = STACK.figureGetById(selectedFigureId);
    var object = {
        "component_id" :obj.componentId,
        "project_id" : projectId,
        "tag_id": obj.tagid,
    }
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "/project/tag_component",false);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader('Authorization', jwtoken);
    xmlhttp.send(JSON.stringify(object));
    var component_tag =JSON.parse(xmlhttp.responseText)
    ////console.log("component")
    updateShape(selectedFigureId,'component_tag_id',component_tag.data.id);
    updateShape(selectedFigureId,'updated_at',component_tag.data.updated_at);
    var update=document.getElementById("update_side").innerHTML="Updated at"+" "+new Date(component_tag.data.updated_at)
}
// function componentImageTag()
// {   
//     var jwtoken=window.localStorage.token
//     var url = window.location.href;
//     var projectId = url.split(/\//)[6];
//     var obj = STACK.figureGetById(selectedFigureId);
//     //console.log("object_data.id",currentImage.id)
//     var object = {
//         "component_id" :currentImage.id,
//         "project_id" : projectId,
//         "tag_id": obj.tag_id,
//     }
//     var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
//     xmlhttp.open("POST", "/project/tag_component",false);
//     xmlhttp.setRequestHeader("Content-Type", "application/json");
//     xmlhttp.setRequestHeader('Authorization', jwtoken);
//     xmlhttp.send(JSON.stringify(object));
//     //console.log("xmlhttp.responseText",xmlhttp.responseText)
// }
// $.ajax({
//     type: 'POST',
//     url: '/project/tag_component',
//     data:{
//         "component_id" :obj.componentId,
//         "project_id" : projectId,
//         "tag_id": obj.tag_id
//     },
//     contentType: "application/json",
//     dataType: "json",
//     success: function(data) {
//      //console.log("Data added!", data);
//     }
//   });

/**Flag to inform if to drew or not the diagram. Similar to "Dirty pattern" */
var redraw = false;
function action(action){
    var canvas = getCanvas();
    var canvas_temp = getCanvasTemp();
    var canvas_app = getCanvasApp();
    var canvas_pencil = getCanvasPencil();
    redraw = false;
    clearPencil();
    $(".pencil-tools").hide();
    var shapeTool = false;
    setUpEditPanel(null);
    // store clicked figure or linearrow
    shape = null;
    state = STATE_NONE;
    // store id value (from Stack) of clicked text primitive
    var textPrimitiveId = -1;
    switch(action){
        case 'none':
            resetToNoneState();
            draw();
            break;

        case 'layers':
            refreshLayers();
            //$("#layers_tools").show();
            break;

        case 'undo':
            Log.info("main.js->action()->Undo. Nr of actions in the STACK: " + History.COMMANDS.length);
            History.undo();
            redraw = true;
            break;
            
        case 'redo':
            Log.info("main.js->action()->Redo. Nr of actions in the STACK: " + History.COMMANDS.length);
            History.redo();
            redraw = true;
            break;
        case 'reset':
              $(".alert-clear-message-dialog").dialog("open");
            break;

        case 'image_upload':
              $(".addattach-activity-dialog").dialog("open");
            break;
        case 'shape':
            shapeTool = true;
            break; 

        case 'circle':
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");
            createFigure(window['figure_Circle'] ,WHITEBOARD.hostURL+'images/shapes/circle.png');
            shapeTool = true;
            break; 
        
        case 'gauge':
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");
            createFigure(window['figure_Gauge'] ,WHITEBOARD.hostURL+'images/shapes/circle.png');
            shapeTool = true;
            break; 
    
        
        case currentImage:
            ////console.log("figure_image")
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");
            createFigure('imageComponent');
            shapeTool = true;
            break; 

        case 'slider':
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");
            createFigure(window['figure_Slider'] ,WHITEBOARD.hostURL+'images/shapes/rectangle.png');
            shapeTool = false;
            break;

        case 'trend':
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");
            createFigure(window['figure_Trend'] ,WHITEBOARD.hostURL+'images/shapes/square.png');
            shapeTool = true;
            break; 
        
        case 'video':
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");
            createFigure(window['figure_video'],WHITEBOARD.hostURL+'images/shapes/square.png');
            shapeTool = true;
            break; 

        case 'ellipse':
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");
            createFigure(window['figure_Ellipse'] ,WHITEBOARD.hostURL+'images/shapes/ellipse.png');
            shapeTool = true;
            break; 

        case 'pentagon':
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");
            $( ".polygon-side-dialog" ).dialog("open");
            /*createFigure(window['figure_Pentagon'] ,'images/shapes/pentagon.png');
            shapeTool = true;*/
            break; 
        
        case 'text':
            Log.info("main.js->action()->Circle. Nr of actions in the STACK: ");

            createFigure(window['figure_Text'] ,WHITEBOARD.hostURL+'images/shapes/text.png');
            break; 

        case 'copy-paste':
            if(state != STATE_GROUP_SELECTED) 
            {
                state = STATE_COPY_PASTE;
                canvas.style.cursor = 'crosshair';
                canvas_pencil.style.cursor = 'crosshair';
            }
           break;

        case 'free-copy-paste':
            
                state = STATE_FREE_COPY_PASTE;
                strokeColor = "#000";
                lineWidth = 2;
                canvas_temp.style.display = 'block';
                canvas_temp.style.cursor = 'crosshair';
                canvas_app.style.display = 'block';
                canvas_app.style.cursor = 'crosshair';

           break;

        case 'pencil':
            if(!(typeof canvasProps.pencil[current_tab-1] === 'undefined' || canvasProps.pencil[current_tab-1]===-1 || canvasProps.pencil[current_tab-1]===null))
            {
                
                var Fig  = STACK.figureGetById(canvasProps.pencil[current_tab-1]);
                if(!Fig.visibility)
                {
                    updateShape(canvasProps.pencil[current_tab-1], 'visibility', true);
                    pencil_draw = true;
                    Fig.primitives[0].setUrl(Fig.primitives[0].url,Fig.primitives[0].imageData);
                }

            }
            
            state = STATE_PENCIL_SELECT;
            canvas_temp.style.display = 'block';
            canvas_temp.style.cursor = 'default';
            canvas_app.style.display = 'block';
            canvas_app.style.cursor = 'default';
            strokeColor = "#000";
            lineWidth = 2;
            $("#pencil_tools").show();
           break;

        case 'gallery':
                state = STATE_NONE;
                $("#gallery_images").show();
           break;
           
        case 'marker':
            
                state = STATE_MARKER_SELECT;
                canvas_temp.style.display = 'block';
                canvas_temp.style.cursor = 'normal';
                canvas_app.style.display = 'block';
                canvas_app.style.cursor = 'normal';
                lineWidth = 10;
           break;

        case 'delete-figure':
            if(selectedFigureId != -1){
                var obj = STACK.figureGetById(selectedFigureId);
                if(!obj)
                    obj = LineArrow_MANAGER.linearrowGetById(selectedFigureId);
                if(obj instanceof LineArrow)
                {
                    var cmdDelFig = new LineArrowDeleteCommand(selectedFigureId);
                    cmdDelFig.execute();
                    History.addUndo(cmdDelFig);
                }
                else
                {
                    var cmdDelFig = new FigureDeleteCommand(selectedFigureId);
                    cmdDelFig.execute();
                    History.addUndo(cmdDelFig);
                }   
               
                draw();
                refreshLayers();
            }
            break;   

        case 'clone-figure':
            if(selectedFigureId != -1){
                var obj = STACK.figureGetById(selectedFigureId);
                if(!obj)
                    obj = LineArrow_MANAGER.linearrowGetById(selectedFigureId);
                if(obj instanceof LineArrow)
                {
                  alert("ds");
                  var conId = LineArrow_MANAGER.linearrowCreate(new Point(obj.turningPoints[0].x, obj.turningPoints[0].y+10),new Point(obj.turningPoints[1].x, obj.turningPoints[1].y+10), obj.type);
                  selectedLineArrowId = conId;
                  var cmdCreateCon = new LineArrowCreateCommand(selectedLineArrowId);
                  History.addUndo(cmdCreateCon);
                  
                  //reset all {LineArrowPoint}s' color
                  LineArrow_MANAGER.linearrowPointsResetColor();

                  //reset current connection cloud
                  currentCloud = [];

                  //select the current linearrow
                  state = STATE_CONNECTOR_SELECTED;
                  var con = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId);
                  setUpEditPanel(con);
                  //state = STATE_CONNECTOR_PICK_SECOND;
                   /* var cmdCloneFig = new FigureCloneCommand(selectedFigureId);
                    cmdCloneFig.execute();*/
                    //Clone for LineArrow
                    /*var cps = LineArrow_MANAGER.linearrowPointGetAllByParent(con.id);
                    cps.forEach(
                        function(connectionPoint){
                            LineArrow_MANAGER.linearrowPointCreate(ret.id,connectionPoint.point.clone(), LineArrowPoint.TYPE_FIGURE);
                        }
                    );*/
                }
                else
                {
                    var cmdCloneFig = new FigureCloneCommand(selectedFigureId);
                    cmdCloneFig.execute();
                    History.addUndo(cmdCloneFig);
                }   
               
                draw();
                refreshLayers();
            }
            break;   
        case 'mirror-figure':
            if(selectedFigureId != -1){
                var cmdTranslateFigure = new FigureFlipCommand(selectedFigureId);
                History.addUndo(cmdTranslateFigure);
                cmdTranslateFigure.execute();
                draw();
                refreshLayers();
            }
            break;
        case 'background-visiblity':
            if(backgroundShow)
                backgroundShow = false;
            else
                backgroundShow = true;
            addBackground();
            draw();
            break;
        case 'curtain':
            Curtain.visibility = true;
            redraw = true;
            break;
        case 'ruler':
            if(state_apps.indexOf(STATE_RULER_APP)== -1)
            {
              Ruler.set();
              state_apps.push(STATE_RULER_APP);
              redraw = true;
            }
            break;

        case 'protractor':
            if(state_apps.indexOf(STATE_PROTRACTOR_APP)== -1)
            {
            
              Protractor.set();
              state_apps.push(STATE_PROTRACTOR_APP);
              redraw = true;
            }
            break;
        
        
        case 'compass':
            if(state_apps.indexOf(STATE_COMPASS_APP)== -1)
            {
              Compass.set();
              state_apps.push(STATE_COMPASS_APP);
              redraw = true;
            }
            break;

        case 'linearrow-straight':
            if (state == STATE_TEXT_EDITING) {
                currentTextEditor.destroy();
                currentTextEditor = null;
            }
            selectedFigureId = -1;   
            selectedFigureThumb = WHITEBOARD.hostURL+'images/shapes/straightline.png';         
            state  = STATE_CONNECTOR_PICK_FIRST;
            linearrowType = LineArrow.TYPE_STRAIGHT;
            redraw = true;
            break;
        case 'linearrow-start':
            if (state == STATE_TEXT_EDITING) {
                currentTextEditor.destroy();
                currentTextEditor = null;
            }
            selectedFigureId = -1;          
            selectedFigureThumb = WHITEBOARD.hostURL+'images/shapes/startline.png';  
            state  = STATE_CONNECTOR_PICK_FIRST;
            linearrowType = LineArrow.TYPE_START;
            redraw = true;
            break;
        case 'linearrow-end':
            if (state == STATE_TEXT_EDITING) {
                currentTextEditor.destroy();
                currentTextEditor = null;
            }
            selectedFigureId = -1;            
            selectedFigureThumb = WHITEBOARD.hostURL+'images/shapes/endline.png';
            state  = STATE_CONNECTOR_PICK_FIRST;
            linearrowType = LineArrow.TYPE_END;
            redraw = true;
            break;
        case 'linearrow-both':
            if (state == STATE_TEXT_EDITING) {
                currentTextEditor.destroy();
                currentTextEditor = null;
            }
            selectedFigureId = -1;            
            selectedFigureThumb = WHITEBOARD.hostURL+'images/shapes/startendline.png';
            state  = STATE_CONNECTOR_PICK_FIRST;
            linearrowType = LineArrow.TYPE_BOTH;
            redraw = true;
            break;
        case 'delete-board':
            $( ".delete-confirm-dialog" ).dialog("open");
            break;
        case 'up-page':
            CanvasManager.gotoUp();
            break;
        case 'down-page':
            CanvasManager.gotoDown();
            break;
    }//end switch
    if(shapeTool)
        $("#shape_tools").show();
    else
        $("#shape_tools").hide();
    if(redraw){
        draw();
    }
}
function createPentagon(sides){
    if(isNaN(sides))
        return;
    $( ".polygon-side-dialog" ).dialog("close");
    PENTAGON_SIDES = sides;
    var main_canvas = getCanvas();
    var cmdCreateFig = new FigureCreateCommand(window['figure_Pentagon'], main_canvas.width/2, main_canvas.height/2);
    cmdCreateFig.execute();
    History.addUndo(cmdCreateFig);
    state = STATE_FIGURE_SELECTED;
    createFigureFunction = null;
    mousePressed = false;
    draw();
}
function closedialog(){
    $( ".polygon-side-dialog" ).dialog("close");
}
function refreshLayers(){
    $("#layers_list").html('');
    var htmlLI = '';
    for(var i = 0; i <STACK.figures .length; i++)
    {
        htmlLI += '<li><a href="javascript:selectFigure(\''+STACK.figures[i].id+'\');"><span class="view-indi" ';
        if(!STACK.figures[i].visibility)   
            htmlLI += 'style="background:#fff"';
        htmlLI += 'onclick="toggleFigure('+STACK.figures[i].id+');"></span>'+STACK.figures[i].name+' - '+STACK.figures[i].id+'</a><span class="del-indi" onclick="deleteFigure('+STACK.figures[i].id+');"></span>';
        if(STACK.figures[i].name!='Pencil')
          htmlLI +='<span class="duplicate"  data-tooltip="Clone"  onclick="cloneFigure('+STACK.figures[i].id+');"></span><span class="mirror" data-tooltip="Mirror" onclick="mirrorFigure('+STACK.figures[i].id+');"></span></li>';
        else
          htmlLI += '</li>';
    }
    for(var i = 0; i < LineArrow_MANAGER.linearrows.length; i++)
    {
        if(LineArrow_MANAGER.linearrows[i].visibility)   
            htmlLI += '<li><a href="javascript:selectFigure(\''+LineArrow_MANAGER.linearrows[i].id+'\');"><span class="view-indi"  onclick="toggleFigure('+LineArrow_MANAGER.linearrows[i].id+');"></span>'+LineArrow_MANAGER.linearrows[i].name+' - '+LineArrow_MANAGER.linearrows[i].id+'</a><span class="del-indi" onclick="deleteFigure('+LineArrow_MANAGER.linearrows[i].id+');"></span><span class="duplicate"  data-tooltip="Clone" onclick="cloneFigure('+LineArrow_MANAGER.linearrows[i].id+');"></span><span class="mirror" data-tooltip="Mirror" onclick="mirrorFigure('+LineArrow_MANAGER.linearrows[i].id+');"></span></li>';
        else
            htmlLI += '<li><a href="javascript:selectFigure(\''+LineArrow_MANAGER.linearrows[i].id+'\');"><span class="view-indi" style="background:#fff" onclick="toggleFigure('+LineArrow_MANAGER.linearrows[i].id+');"></span>'+LineArrow_MANAGER.linearrows[i].name+' - '+LineArrow_MANAGER.linearrows[i].id+'</a><span class="del-indi" onclick="deleteFigure('+LineArrow_MANAGER.linearrows[i].id+');"></span><span class="duplicate"  data-tooltip="Clone" onclick="cloneFigure('+LineArrow_MANAGER.linearrows[i].id+');"></span><span class="mirror" data-tooltip="Mirror" onclick="mirrorFigure('+LineArrow_MANAGER.linearrows[i].id+');"></span></li>';
    }
    $("#layers_list").html(htmlLI);
}
function toggleAngle(id){
    var Fig  = STACK.figureGetById(id);

    if(Fig.angles)
        updateShape(id, 'angles', false);
    else
        updateShape(id, 'angles', true);
    draw();
}
function toggleEditPoints(id)
{
    var Fig  = STACK.figureGetById(id);

    if(Fig.editPoints)
        updateShape(id, 'editPoints', false);
    else
        updateShape(id, 'editPoints', true);
    draw();
}
function deleteFigure(id){
        
        ////console.log("figure",fig_dup) 
        var obj = STACK.figureGetById(selectedFigureId); 
        var bottomId= document.getElementById("create_side").innerHTML="";
        var update=document.getElementById("update_side").innerHTML="";
        //fig_dup.video_tag = document.getElementById("video_"+fig_dup.id);
        ////console.log("fig_dup",fig_dup.video_tag)
        if(obj.name=="video"){
            obj.video_tag.src="";
        }
        // fig_dup.video_tag.removeEventListener('play', () => 
        // { 
        //     function step() {
        //         ctx_video.drawImage(play,figVal.xValue,figVal.yValue,figVal.vxValue,figVal.vyValue);
        //         requestAnimationFrame(step)
        //         //video.destroy();
        //       }
        //       requestAnimationFrame(step);
        //       fig_dup.remove();
        //      // resolve(video);
        // });
        var jwtoken=window.localStorage.token
        var url = window.location.href;
        var projectId = url.split(/\//)[6];
        var data_id={
            "id":obj.component_tag_id
        }
        var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
        xmlhttp.open("DELETE", "/project/tag_component",false);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader('Authorization', jwtoken);
        xmlhttp.send(JSON.stringify(data_id));
        selectedFigureId = id;
        action('delete-figure');
        pencil_draw = true;
}
function cloneFigure(id){
    selectedFigureId = id;
    action('clone-figure');
    pencil_draw = true;
}
function mirrorFigure(id){
    selectedFigureId = id;
    action('mirror-figure');
    pencil_draw = true;
}
function loadWhiteboard(id)
    {
        if(id[1] != current_tab)
        {
            save();
            current_tab = parseInt(id[1]);
            resetToNoneState();
            load(current_tab);
        }
    }
    function closeAddTab(){
      $(".whiteboard-overlay").hide();
      //loadWhiteboard(tab_size);
      var position = tab_size;
            $( ".tabs" ).tabs('refresh');
            $('.tabstyles').children('li').eq(position).children('a').trigger('click');
            $('.sitewidth').removeClass('disabledstate');
    }
function selectFigure(id){
    var Fig  = STACK.figureGetById(id);

    if(!Fig)
    {
        Fig = LineArrow_MANAGER.linearrowGetById(id);
        if(Fig.visibility)
        {
          selectedLineArrowId = id;
          state = STATE_CONNECTOR_SELECTED;
        }
    } 
    else
    {
        if(Fig.visibility)
        {
          if(Fig.name =="Pencil")
            return;
          selectedFigureId = id;
          state = STATE_FIGURE_SELECTED;
        }
    }  
    if(Fig.visibility)
        setUpEditPanel(Fig);
    draw();
}
function toggleFigure(id){
    var Fig  = STACK.figureGetById(id);
    if(!Fig)
        Fig = LineArrow_MANAGER.linearrowGetById(id);
    if(Fig.visibility)
    {
        state = STATE_NONE;
        updateShape(id, 'visibility', false);
        if(Fig.name == "Pencil")
            clearPencilCanvas();
        selectedLineArrowId = -1;
    }   
    else
    {
        updateShape(id, 'visibility', true);
        if(Fig.name == "Pencil")
        {
            pencil_draw = true;
            Fig.primitives[0].setUrl(Fig.primitives[0].url,Fig.primitives[0].imageData);
        }    
    }
    refreshLayers();
    setTimeout(function(){HandleManager.selectRect.points = [];selectedFigureId = -1;setUpEditPanel(null);
    draw();},1);

}

function selectcolor(color){
    erasor_state = false;
    var canvas = getCanvas();
    var canvas_temp = getCanvasTemp();
    switch(color){
        case 'black':
            strokeColor = "#000";
			canvas_temp.style.cursor = 'normal';
			canvas_app.style.cursor = 'normal';
            break;
        case 'red':
            strokeColor = "#FF0000";
			canvas_temp.style.cursor = 'normal';
			canvas_app.style.cursor = 'normal';
            break;
        case 'green':
            strokeColor = "#01FF00";
			canvas_temp.style.cursor = 'normal';
			canvas_app.style.cursor = 'normal';
            break;
        case 'blue':
            strokeColor = "#0000FF";
			canvas_temp.style.cursor = 'normal';
			canvas_app.style.cursor = 'normal';
            break;
        case 'erasor':
            state = STATE_PENCIL_SELECT;
            canvas_temp.style.display = 'block';
            canvas_temp.style.cursor = 'normal';
            canvas_app.style.display = 'block';
            canvas_app.style.cursor = 'normal';
            $("#pencil_tools").show();
            erasor_state = true;
            strokeColor = "none";
            break;
        case 'jscolor':
		canvas_temp.style.cursor = 'normal';
			canvas_app.style.cursor = 'normal';
            if(document.getElementById('jsColor').value!='')
              strokeColor = "#"+document.getElementById('jsColor').value;
            break;
        case 'clear':
            var canvas_temp = getCanvasPencil();
            var ctx_temp = canvas_temp.getContext('2d');
            if(typeof canvasProps.pencil[current_tab-1] === 'undefined' || canvasProps.pencil[current_tab-1]===-1)
            {
                var imgData = canvas_temp.toDataURL();
                  //creates a container
                var cmdFigureCreate = new InsertedImageFigureCreateCommand("Pencil", canvas_temp.width/2,canvas_temp.height/2,imgData);
                cmdFigureCreate.execute();
                History.addUndo(cmdFigureCreate);
                //ctx_temp.clearRect(0, 0, 1300, 650);
            }
            else
            {
                ctx_temp.clearRect(0, 0, canvas_temp.width, canvas_temp.height);
                var imgData = canvas_temp.toDataURL();
                var fig = STACK.figureGetById(canvasProps.pencil[current_tab-1]);
                fig.primitives[0].imageData = imgData;
                var cmdFigureCreate = new InsertedImageFigureCreateCommand("Pencil", canvas_temp.width/2,canvas_temp.height/2,imgData);
                cmdFigureCreate.figureId = fig.id;
                Timer.stop();
                cmdFigureCreate.timeGap = Timer.time();
                Timer.start();
                cmdFigureCreate.firstDraw = false;
                History.addUndo(cmdFigureCreate);
                /* ////console.log("Dadsf");
                ////console.log(imgData);*/
            }
            break;
        default:
            strokeColor = "#"+document.getElementById('jsColor').value;
            break;
    }
}
function selectsize(size){
    switch(size){
        case 'small':
            lineWidth = 2;
            break;
            
        case 'medium':
            lineWidth = 4;
            break;

        case 'large':
            lineWidth = 6;
            break;

        case 'medium_highlight':
            lineWidth = 10;
            break;

        case 'large_highlight':
            lineWidth = 15;
            break;
    }
}
/**Stores last mouse position. Null initially.*/
var lastMousePosition = null;



var draggingFigure = null;
function documentOnMouseMove(evt){
    //Log.info("documentOnMouseMove");

    switch(state){
        case STATE_FIGURE_CREATE:
        case STATE_CONNECTOR_PICK_FIRST:
            //Log.info("documentOnMouseMove: trying to draw the D'n'D figure");
            if(selectedFigureThumb!=null)
            {
              if(!draggingFigure){
                  draggingFigure = document.createElement('img');
                  draggingFigure.setAttribute('id', 'draggingThumb');
                  draggingFigure.style.position = 'absolute';
                  draggingFigure.style.zIndex = 3;  // set it in front of editor
                  document.body.appendChild(draggingFigure);
              }
              
              draggingFigure.setAttribute('src', selectedFigureThumb);                        
              draggingFigure.style.width = '32px';
              draggingFigure.style.height = '32px';
              draggingFigure.style.left = (evt.pageX - 16) + 'px';
              draggingFigure.style.top = (evt.pageY - 16) + 'px';
              //draggingFigure.style.backgroundColor  = 'red';
              draggingFigure.style.display  = 'block';
              if(state==STATE_FIGURE_CREATE)
              draggingFigure.addEventListener('mousedown', function (event){
                  //Log.info("documentOnMouseMove: How stupid. Mouse down on dragging figure");
                  //alert("ASDf");
              }, false);
            }
            

            break;

        case STATE_NONE:
            //document.removeChild(document.getElementById('draggingThumb'));
            break;
    }
}

function documentOnMouseDown(evt){
    Log.info("documentOnMouseDown");

    switch(state){
        case STATE_CONNECTOR_PICK_FIRST:
        
             var coords = getCanvasXY(evt);

            if(coords == null){
              var eClicked = document.elementFromPoint(evt.clientX, evt.clientY);
              if(eClicked.id != 'canvas_main'){
                  if(draggingFigure){
                      //draggingFigure.style.display  = 'none';
                      draggingFigure.parentNode.removeChild(draggingFigure);
                      if(!figure_created)
                          state = STATE_NONE;
                      draggingFigure = null;
                      //evt.stopPropagation();
                  }
              }
              return;
            }
            var x = coords[0];
            var y = coords[1];
            var figure_created = false;
            
            //draw();
            var eClicked = document.elementFromPoint(evt.clientX, evt.clientY);
            if(eClicked.id == 'canvas_pencil'|| eClicked.id != 'canvas_main')
            {
              if(draggingFigure){
                  //draggingFigure.style.display  = 'none';
                  draggingFigure.parentNode.removeChild(draggingFigure);
                  //state = STATE_NONE;
                  selectedFigureThumb = null;
                  draggingFigure = null;
                  //evt.stopPropagation();
              }
              connectorPickFirst(x,y,evt);
            }
            else if(eClicked.id != 'canvas_main'){
                if(draggingFigure){
                    //draggingFigure.style.display  = 'none';
                    draggingFigure.parentNode.removeChild(draggingFigure);
                    //state = STATE_NONE;
                    selectedFigureThumb = null;
                    draggingFigure = null;
                    //evt.stopPropagation();
                }
            }

            break;
    }
}
function documentOnMouseUp(evt){
    Log.info("documentOnMouseUp");

    switch(state){
        /*Added to Reset the Pencil Select on Mouse up in document- By Prakash 31-10-2017*/
        case STATE_PENCIL_MOVE:      
            pecilDrawFinished();
            break;
        case STATE_MARKER_MOVE:
            markerDrawFinished();
            break;  

        case STATE_FIGURE_CREATE:
        case STATE_CONNECTOR_PICK_FIRST:
        
             var coords = getCanvasXY(evt);

            if(coords == null){
              var eClicked = document.elementFromPoint(evt.clientX, evt.clientY);
              if(eClicked.id != 'canvas_main'){
                  if(draggingFigure){
                      //draggingFigure.style.display  = 'none';
                      draggingFigure.parentNode.removeChild(draggingFigure);
                      if(!figure_created)
                          state = STATE_NONE;
                      draggingFigure = null;
                      //evt.stopPropagation();
                  }
              }
              return;
            }
            var x = coords[0];
            var y = coords[1];
            var figure_created = false;
            if(window.createFigureFunction=="imageComponent")
            {   
                var cmdFigureCreate = new InsertedImageFigureCreateCommand(currentImage.name,x, y,currentUrl);
                cmdFigureCreate.execute();
                History.addUndo(cmdFigureCreate);
                state = STATE_FIGURE_SELECTED;
                createFigureFunction = null;
                mousePressed = false;
                figure_created = true;
                
            }
            else if(window.createFigureFunction){
                
                var cmdCreateFig = new FigureCreateCommand(window.createFigureFunction, x, y);
                cmdCreateFig.execute();
				var whiteboard_content=WHITEBOARD.json();
                History.addUndo(cmdCreateFig);
                state = STATE_FIGURE_SELECTED;
                createFigureFunction = null;
                mousePressed = false;
                figure_created = true;
            }
            draw();
            var eClicked = document.elementFromPoint(evt.clientX, evt.clientY);
            if(eClicked.id != 'canvas_main'){
                if(draggingFigure){
                    //draggingFigure.style.display  = 'none';
                    draggingFigure.parentNode.removeChild(draggingFigure);
                    if(!figure_created&&state==STATE_FIGURE_CREATE)
                        state = STATE_NONE;
                    draggingFigure = null;
                    //evt.stopPropagation();
                }
            }
            break;
    }
}

/*shape.js */

/**Figure set declaration*/
figureSets["basic"] = {
    name: 'Basic',
    description : 'A basic set of figures',
    figures: [
        {figureFunction: "Circle", image: "circle.png"}
    ]
};

/**Object with default values for figures*/
var FigureDefaults = {
    /**Size of figure's segment*/
    segmentSize : 50,

    /**Size of figure's short segment*/
    segmentShortSize : 400,

    /**Size of radius*/
    radiusSize : 50,

    /**Size of offset for parallels
    * For example: for parallelogram it's projection of inclined line on X axis*/
    parallelsOffsetSize : 100,

    /**Corner radius
    * For example: for rounded rectangle*/
    corner : 0,

    /**Corner roundness
    * Value from 0 to 10, where 10 - it's circle radius.*/
    cornerRoundness : 8,

    /**Color of lines*/
    strokeStyle : "rgba(0,0,0)",

    /**Color of fill*/
    fillStyle : "rgba(255,255,255)",

    /**Text size*/
    textSize : 10,

    /**Text label*/
    textStr : "Text",

    /**Text font*/
    textFont : "Arial",

    /**Color of text*/
    textColor : "#000000"
};

function figure_RulerLine()
{
    var f = new Figure("Line");
    f.style.fillStyle = FigureDefaults.fillStyle;
    f.style.strokeStyle = FigureDefaults.strokeStyle;
    var r = new Line(Ruler.actualStartPoint,Ruler.actualEndPoint);
    var bound = Ruler.lineBounds.clone();
    bound.style = new Style();
    bound.style.strokeStyle = "none";
    bound.style.fillStyle = "none";
    //bound.style.globalAlpha = 0;
    //f.addPrimitive(bound);
    f.addPrimitive(r);
    
    f.finalise();
    return f;
}
function figure_ProtractorAngle(x,y)
{
    var f = new Figure("Angle");
    f.style.fillStyle = FigureDefaults.fillStyle;
    f.style.strokeStyle = FigureDefaults.strokeStyle;
    var centerPoint = new Point(x,y);
    var line1Point = new Point(Protractor.startPoint.x,Protractor.startPoint.y);
    var line2Point = new Point(Protractor.endPoint.x,Protractor.endPoint.y);
    /*var r = new Line(centerPoint,line1Point);
    var r1 = new Line(centerPoint,line2Point);*/
    var r=new Polyline();
    r.addPoint(line1Point);
    r.addPoint(centerPoint);
    r.addPoint(line2Point);
    r.style.fillStyle="rgba(0,0,0,0)";
    f.addPrimitive(r);
    //f.addPrimitive(r1);
    f.finalise();
    return f;
}
function figure_compassArc(x,y)
{
  if(Compass.startPoint != null &Compass.endPoint!=null)
  {
    var f = new Figure("Arc");
    f.style.strokeStyle = Compass.color[Compass.penColor][1];
    f.style.fillStyle = "rgba(0, 0, 0, 0)";
    var centerPoint = new Point(x,y);
    centerPoint.style.strokeStyle = "rgb(0, 0, 0)";
    centerPoint.style.fillStyle = "rgba(0, 0, 0, 0)";
    centerPoint.style.lineWidth = 2;
    var endPoint  = Compass.endPoint-90;
    if(Compass.changePoint !== null)
    {
      if(endPoint>Compass.startPoint-90)
        endPoint = Compass.startPoint-90+360;
      else
        endPoint = endPoint + 360;
    }  
    var c = new Arc(Compass.x, Compass.y, Compass.radius, Compass.startPoint-90, endPoint, false, 0);
    f.addPrimitive(c);
    f.addPrimitive(centerPoint);
    f.finalise();
    return f;
  }
}

function figure_Circle(x,y)
{   
   
    var f = new Figure("Circle");
    f.style.fillStyle = FigureDefaults.fillStyle;
    f.style.strokeStyle = FigureDefaults.strokeStyle;
    var c = new Arc(x, y, FigureDefaults.radiusSize, 0, 360, false, 0);
    

    f.addPrimitive(c)
    var t2 = new Text(FigureDefaults.textStr, x, y, FigureDefaults.textFont, FigureDefaults.textSize);
    t2.style.fillStyle = FigureDefaults.textColor;
    f.addPrimitive(t2);
    f.finalise();
    return f;
}

// function figure_Image(x,y)
// {   
//     //console.log("figureimage")
//     var f = new Figure("Image");
//     f.style.fillStyle = FigureDefaults.fillStyle;
//     //console.log("color",FigureDefaults)
//     f.style.strokeStyle = FigureDefaults.strokeStyle;
//     var cmdFigureCreate = new InsertedImageFigureCreateCommand(currentImage.name,x, y,currentUrl);
//     // var t2 = new Text(FigureDefaults.textStr, x, y, FigureDefaults.textFont, FigureDefaults.textSize);
//     // ////console.log("t2",t2)
//     // t2.style.fillStyle = FigureDefaults.textColor;
//     // f.addPrimitive(t2);
//     cmdFigureCreate.execute();
//     History.addUndo(cmdFigureCreate);
//     //console.log("x value",x)
// 	//console.log("connect",currentUrl)
    
//     // f.addPrimitive(c);
//     f.finalise();
//     return f;
// }
function addLine(startx,starty,endx,endy,fillcolor,strokecolor){
    
    var start=new Point(startx , starty);
    var end=new Point(endx, endy);
    var line = new Line(start,end);
    line.style.fillStyle = fillcolor;
    line.style.strokeStyle = strokecolor;
    return line;
}
function figure_Slider(x,y)
{   
   //console.log("x and y valu for slider",x ,y)
    var f = new Figure("slider");
    f.style.strokeStyle = FigureDefaults.strokeStyle;
    //var rectangleHeight = FigureDefaults.segmentShortSize + 5;
    ////console.log("rectangleHeight",rectangleHeight)
    // var r = new Polygon();
    // //console.log("xy value",x,y)
    // r.addPoint(new Point(x, y));
    // r.addPoint(new Point(x + FigureDefaults.segmentSize, y));
    // r.addPoint(new Point(x + FigureDefaults.segmentSize, y + rectangleHeight));
    // r.addPoint(new Point(x, y + rectangleHeight));
    // r.style.strokeStyle="rgba(0,0,0)";
    var rectangleHeight = (400);
    var tx = x - 70;
    var ty = y - 45;
    
    ////console.log("tx and ty",tx,ty)
    var r = new Polygon();
    r.addPoint(new Point(tx, ty + rectangleHeight));
    r.addPoint(new Point(tx + 140, ty + rectangleHeight));
    r.addPoint(new Point(tx + 140 , ty));
    r.addPoint(new Point(tx, ty ));
    r.style.fillStyle = "#fff";
    r.style.strokeStyle = "rgba(0,0,0)";
    f.addPrimitive(r);
    // var dy=ty+400;
    // var dx=tx+50;
    // var scale=0;
    // for(i=0;i<21;i++)
    // {
    // var marker=new OrdinaryText(scale.toString(), dx, dy, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12)
    // marker.style.fillStyle = "rgb(0,0,0)";
    // f.addPrimitive(marker);
    // dy=dy-20;
    // scale=scale+20;
    // }
 
    var r = new Polygon();
    r.addPoint(new Point(tx+20, ty+rectangleHeight));
    r.addPoint(new Point(tx, ty+rectangleHeight));
    r.addPoint(new Point(tx , (ty+rectangleHeight)));
    r.addPoint(new Point(tx+20,  (ty+rectangleHeight)));
    ////console.log("delay",delay)
    r.style.fillStyle = "rgba(116,204,84)";
    r.style.strokeStyle = "rgba(116,204,84)";
    f.addPrimitive(r);

    //setTimeout(timer,3000);
    
    
    // function addLine(startx,starty,endx,endy,fillcolor,strokecolor){
    //     var start=new Point(startx , starty);
    //     var end=new Point(endx, endy);
    //     var line = new Line(start,end);
    //     line.style.fillStyle = fillcolor;
    //     line.style.strokeStyle = strokecolor;
    //     return line;
    // }
    var tyvalue=ty+400;
    var tyval=ty+390;
    for(i=0;i<21;i++)
    {
        f.addPrimitive(addLine(tx+40,tyvalue,tx+20,tyvalue,"#fff","black"));
        tyvalue=tyvalue-20;
        f.addPrimitive(addLine(tx+30,tyval,tx+20,tyval,"#fff","black"));
        tyval=tyval-20;
        //f.addPrimitive(addLine(tx+30,tyvalue,ty+370,tyvalue,"#fff","black"));
    }
    var dy=ty+400;
    var dx=tx+50;
    var scale=0;
    for(i=0;i<21;i++)
    {
    var marker=new OrdinaryText(scale.toString(), dx, dy, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12)
    marker.style.fillStyle = "rgb(0,0,0)";
    f.addPrimitive(marker);
    dy=dy-20;
    scale=scale+20;
    }
    f.finalise();
    return f;
    
        
}
// function editModel(id){
//     //console.log("edit model called")
//     var d=document.getElementById('sliderModel');
//     //console.log("data",d)
// }
// function figure_Rectangle(x, y)
// {
//     var f = new Figure("Rectangle");
//     f.style.fillStyle = FigureDefaults.fillStyle;
//     f.style.strokeStyle = FigureDefaults.strokeStyle;

//     var rectangleHeight = FigureDefaults.segmentShortSize + 5;

//     var r = new Polygon();
//     r.addPoint(new Point(x, y));
//     r.addPoint(new Point(x + FigureDefaults.segmentSize, y));
//     r.addPoint(new Point(x + FigureDefaults.segmentSize, y + rectangleHeight));
//     r.addPoint(new Point(x, y + rectangleHeight));

//     f.addPrimitive(r);
//     // var t2 = new Text(FigureDefaults.textStr, x, y, FigureDefaults.textFont, FigureDefaults.textSize);
//     //  t2.style.fillStyle = FigureDefaults.textColor;
//     // f.addPrimitive(t2)
//     f.finalise();
//     return 
// }
var tx=400;
var ty=200;
function figure_Trend(x,y)
{
    var r = new Polygon();
    r.addPoint(new Point(x, y));
    r.addPoint(new Point(x + tx, y));
    r.addPoint(new Point(x + tx, y + ty));
    r.addPoint(new Point(x, y + ty));
    var fig=new Figure("trend");
    fig.style.fillStyle = FigureDefaults.fillStyle;
    fig.style.strokeStyle = FigureDefaults.strokeStyle;
    fig.xValue=x;
    fig.yValue=y;
    
    fig.addPrimitive(r);
    var yvalue=y+200;
    var yval=y+190;
    for(i=0;i<10;i++)
    {
        fig.addPrimitive(addLine(x,yvalue,x-10,yvalue,"#fff","black"));
        yvalue=yvalue-20;
        fig.addPrimitive(addLine(x,yval,x-5,yval,"#fff","black"));
        yval=yval-20;
    }
    var yvalue=y+200;
    var yval=y+190;
    for(i=0;i<10;i++)
    {
        fig.addPrimitive(addLine(x+400,yvalue,x+410,yvalue,"#fff","black"));
        yvalue=yvalue-20;
        fig.addPrimitive(addLine(x+400,yval,x+405,yval,"#fff","black"));
        yval=yval-20;
    }
    //f.addPrimitive(new OrdinaryText('0'.toString(), x+, y+380, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12));
    var dy=y+200;
    var dx=x+420;
    var scale=0;
    for(i=1;i<=11;i++)
    {
    var text=new OrdinaryText(scale.toString(), dx, dy, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
    dy=dy-20;
    scale=scale+20;
    text.style.fillStyle = "rgb(0,0,0)"
    fig.addPrimitive(text);
    }
    var dy=y+200;
    var dx=x-20;
    var scale=0;
    for(i=1;i<=11;i++)
    {
    var text=new OrdinaryText(scale.toString(), dx, dy, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 16,12);
    dy=dy-20;
    scale=scale+20;
    text.style.fillStyle = "rgb(0,0,0)";
    fig.addPrimitive(text);
    }
    // var start=new Point(x, y+10);
    // //console.log("linestart",start);
    // var end=new Point(x+20, y+20);
    // //console.log("lineend",end)
    // var line = new Line(start,end);
    // //console.log("line",line);
    // f.addPrimitive(line);
    // var start=new Point(x+20 , y+20);
    // var end=new Point(x+40,  y+30);
    // var line2 = new Line(start,end);
    // f.addPrimitive(line2);
    // var start=new Point(x+40 , y+30);
    // var end=new Point(x+60,  y+40);
    // var line3 = new Line(start,end);
    // f.addPrimitive(line3);
    //     var array=[68,200,30];
    //       //console.log("figure",fig)
    //       //console.log("primitivex",x,y);
    //       var startX=x;
    //       var endX=x+20;
    //       var startY=(y+(200-array[0]));
    //       for(i=0;i<array.length;i++){ 
    //           var start=new Point(startX,startY);
    //           var endY=(y+(200-array[i]));
    //           var end=new Point(endX,endY);
    //           var line=new Line(start,end);
    //           //console.log("linewhite",line)
    //           startY=endY;
    //           endX=endX+20;
    //           startX=startX+20;
    //           line.style.strokeStyle ="rgb(116,204,84)";
    //           fig.addPrimitive(line);
    //  }
    fig.finalise();
    return fig;
    
}
var vx=400;
var vy=200;
function figure_video(x,y){
    var r = new Polygon();
    r.addPoint(new Point(x, y));
    r.addPoint(new Point(x + vx, y));
    r.addPoint(new Point(x + vx, y + vy));
    r.addPoint(new Point(x, y + vy));
    var fig_var=new Figure("video");
    fig_var.style.fillStyle = FigureDefaults.fillStyle;
    fig_var.style.strokeStyle = FigureDefaults.strokeStyle;
    fig_var.xValue=x;
    fig_var.yValue=y;
    var vid = document.createElement('video');
    fig_var.videoURL="http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv";
    vid.src = "";
    vid.setAttribute('id',"video_"+fig_var.id);
    vid.setAttribute('autoplay',true);
    vid.setAttribute('controls',true);
    var video_tag=$("#white").append(vid);
    fig_var.video_tag=video_tag;
    
    // fig_var.video_tag="document";
    ////console.log("d tag",d)
    fig_var.vxValue=vx;
    fig_var.vyValue=vy;
    
    // var str='<video id="video1" src='+fig_var.videoURL+' width="80" height="80" controls autoplay></video>';
    // var video_tag=$("#white").html(str);
    // fig_var.video_tag=video_tag;
    fig_var.addPrimitive(r);
    
   
    ////console.log("canvas line3",video)
    // video.addEventListener("play", function() {var i = window.setInterval(function() {ctx.drawImage(video,100,100,f.xValue,f.yValue)},20);}, false);
    // // video.addEventListener("pause", function() {window.clearInterval(i);}, false);
    // // video.addEventListener("ended", function() {clearInterval(i);}, false); 
    // video.addEventListener('play', () => {

        // function step() {
        //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        //   requestAnimationFrame(step)
        // }
        // requestAnimationFrame(step);
      //})
    fig_var.finalise();
    // var video = document.getelementbyid('video1');
    // video.src = videoFile;
    // video.load();
    // video.play();
    return fig_var;

    }
function figure_Ellipse(x,y)
{

    var f = new Figure("Ellipse");
    f.style.fillStyle = FigureDefaults.fillStyle;
    f.style.strokeStyle = FigureDefaults.strokeStyle;

    var c = new Ellipse(new Point(x, y), FigureDefaults.segmentShortSize, FigureDefaults.segmentShortSize/2);

    f.addPrimitive(c);
    
    f.finalise();
    return f;
}

function figure_Pentagon(x,y)
{
    var r = new Polygon();
    var l = FigureDefaults.radiusSize;
    var selection = PENTAGON_SIDES;
    /*do{
        selection = parseInt(window.prompt("Please enter a number from 3 to 10", ""), 10);
    }while(isNaN(selection) || selection > 10 || selection < 3);*/
    for (var i = 0; i < selection; i++){
        r.addPoint(new Point(x - l * Math.sin(2 * Math.PI * i / selection), y - l * Math.cos(2 * Math.PI * i / selection)));
    }
    var f=new Figure("Pentagon");
    f.style.fillStyle = FigureDefaults.fillStyle;
    f.style.strokeStyle = FigureDefaults.strokeStyle;

    f.addPrimitive(r);

    f.finalise();
    return f;
}

function figure_Text(x,y)
{

    var f = new Figure('Text');
    f.style.fillStyle = FigureDefaults.fillStyle;
    f.style.strokeStyle = "";

    
    var rectangleHeight = 90;
    var tx = x - 70;
    var ty = y - 45;
    var r = new Polygon();
    r.addPoint(new Point(tx, ty));
    r.addPoint(new Point(tx + 140, ty));
    r.addPoint(new Point(tx + 140 , ty + rectangleHeight));
    r.addPoint(new Point(tx, ty + rectangleHeight));
    r.style.fillStyle = "#fff";
    f.addPrimitive(r);

    var t2 = new Text(FigureDefaults.textStr, x, y, FigureDefaults.textFont, FigureDefaults.textSize, false, Text.ALIGN_CENTER, 140, rectangleHeight);
    t2.style.fillStyle = FigureDefaults.textColor;
    f.addPrimitive(t2);

    var tx = x - 80;
    var ty = y - 45;
    var r = new Polygon();
    r.addPoint(new Point(tx, ty));
    r.addPoint(new Point(tx + 10, ty));
    r.addPoint(new Point(tx + 10 , ty + rectangleHeight));
    r.addPoint(new Point(tx, ty + rectangleHeight));
    r.style.fillStyle = "#929292";

    f.addPrimitive(r);
    f.finalise();
    return f;
}

function figure_Pencil(ppts)
{

    var f = new Figure("Path");
    f.objType = 'Pencil';

    f.style.fillStyle = FigureDefaults.fillStyle;
    f.style.strokeStyle = strokeColor;
    ////console.log("Excute Stared");
    for (var i = 0; i < ppts.length - 1; i=i+1) {
        ppts[i].style = new Style();
        ppts[i].style.fillStyle = FigureDefaults.fillStyle;
        ppts[i].style.strokeStyle = strokeColor;
        ppts[i].style.lineWidth = lineWidth;
        if(i < ppts.length - 1)
        {
            ppts[i+1].style = new Style();
            ppts[i+1].style.fillStyle = FigureDefaults.fillStyle;
            ppts[i+1].style.strokeStyle = strokeColor;
            ppts[i+1].style.lineWidth = lineWidth;
        }
        var startPoints = ppts[i];
        var endpoints = ppts[i];
        if(i!=0)
           startPoints = ppts[i-1];
        if(i< ppts.length - 1)
            endpoints = ppts[i+1];
        var c = new QuadCurve(ppts[i],ppts[i],endpoints);
        c.style.fillStyle = FigureDefaults.fillStyle;
        c.style.strokeStyle = strokeColor;
        c.style.lineWidth = lineWidth;
        //ctx_temp.quadraticCurveTo(ppts[i].x,ppts[i].y,ppts[i+1].x,ppts[i+1].y);
        f.addPrimitive(c);
    }
    ////console.log("Excute Started");
    
    
    f.finalise();
    return f;
}

function drawAngleSymbol(ct, pt1, pt2, pt3, size) {
    var dx1 = pt1.x - pt2.x;
    var dy1 = pt1.y - pt2.y;
    var dx2 = pt3.x - pt2.x;
    var dy2 = pt3.y - pt2.y;
    var a1 = Math.atan2(dy1, dx1);
    var a2 = Math.atan2(dy2, dx2);
    var a = parseInt((a2 - a1) * 180 / Math.PI + 360) % 360;
    var deg = a;
    if(a>180)
    {
        dx1 = pt3.x - pt2.x;
        dy1 = pt3.y - pt2.y;
        dx2 = pt1.x - pt2.x;
        dy2 = pt1.y - pt2.y;
        a1 = Math.atan2(dy1, dx1);
        a2 = Math.atan2(dy2, dx2);
        a = parseInt((a2 - a1) * 180 / Math.PI + 360) % 360;
    }

    // draw angleSymbol
    ct.save();
    ct.beginPath();
    ct.moveTo(pt2.x, pt2.y);
    if(size)
      ct.arc(pt2.x, pt2.y, 50, a1, a2);
    else
      ct.arc(pt2.x, pt2.y, 20, a1, a2);
    ct.closePath();
    ct.fillStyle = "red";
    if(size)
      ct.fillStyle = "grey";
    ct.globalAlpha = 0.25;
    ct.fill();
    ct.restore();
    ct.fillStyle = "black";
    if(size)
    {
      var d = deg+45;
      if(deg>180)
        d = deg + 135;
      var p = Util.getEndPoint(pt2,50,d*(Math.PI/180));
      ct.fillText(a+"°", p.x, p.y);
    }
    else
      ct.fillText(a+"°", pt2.x + 15, pt2.y-5);
}

/* Canvas command.js */
function CanvasChangeSizeCommand(newWidth, newHeight){

    this.previousWidth = canvasProps.width;
    this.previousHeight = canvasProps.height;

    this.width = newWidth;
    this.height = newHeight;

    this.oType = "CanvasChangeSizeCommand";
}

CanvasChangeSizeCommand.prototype = {

    constructor : CanvasChangeSizeCommand,

    /**This method got called every time the Command must execute*/
    execute : function(){
        //Attention: canvasProps is a global variable
        canvasProps.setWidth(this.width);
        canvasProps.setHeight(this.height);

        setUpEditPanel(canvasProps);
    },


    /**This method should be called every time the Command should be undone*/
    undo : function(){
        canvasProps.setWidth(this.previousWidth);
        canvasProps.setHeight(this.previousHeight);

        setUpEditPanel(canvasProps);
    }
};
function CanvasChangeColorCommand(newColor){
    
    this.previousColor = canvasProps.fillColor;
    this.color = newColor;
    
    this.oType = "CanvasChangeColorCommand";
}

CanvasChangeColorCommand.prototype = {
    
    constructor : CanvasChangeColorCommand,
    
    /**This method got called every time the Command must execute*/
    execute : function(){
        //Attention: canvasProps is a global variable
        canvasProps.setFillColor(this.color);
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){
        //Attention: canvasProps is a global variable
        canvasProps.setFillColor(this.previousColor);
        
        setUpEditPanel(canvasProps);
    }
};


/* FigureCommand.js */
/** 
 * Pencil Creation Commands*/
function PencilDrawCommand(factoryFunction, ppts){
    this.oType = 'PencilDrawCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = false;
    this.factoryFunction = factoryFunction;
    this.ppts = ppts; 
    this.firstExecute = true;
    this.figureId = null;
    this.timeGap = 0;
}


PencilDrawCommand.prototype = {
    /**This method got called every time the Command must execute*/
    execute : function(){
        if(this.firstExecute){
            //create figure
            //Log.info("FigureCreateCommand> execute> factoryFunction=" + this.factoryFunction);
            var createdFigure = this.factoryFunction(this.ppts);
              
            //move it into position
            //createdFigure.transform(Matrix.translationMatrix(this.x - createdFigure.rotationCoords[0].x, this.y - createdFigure.rotationCoords[0].y))
            //createdFigure.style.lineWidth = defaultLineWidth;
        
            //store id for later use
            //TODO: maybe we should try to recreate it with same ID (in case further undo will recreate objects linked to this)
            this.figureId = createdFigure.id;
        
            //add to STACK
            STACK.figureAdd(createdFigure);
            
            //make this the selected figure
            //selectedFigureId = createdFigure.id;
        
            //set up it's editor
            //setUpEditPanel(createdFigure);
        
            //move to figure selected state
            //state = STATE_FIGURE_SELECTED;
        
            this.firstExecute = false;
        }
        else{ //redo
            throw "Not implemented";
        }
    },
}

/** 
 * Figure Creation Commands*/
function FigureCreateCommand(factoryFunction, x, y){
    this.oType = 'FigureCreateCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = false;
    this.factoryFunction = factoryFunction;
    this.x = x; 
    this.y = y;
    this.firstExecute = true;
    this.figureId = null;
    this.timeGap = 0;
}


FigureCreateCommand.prototype = {
	
    /**This method got called every time the Command must execute*/
    execute : function(){
        if(this.firstExecute){
            //create figure
            //Log.info("FigureCreateCommand> execute> factoryFunction=" + this.factoryFunction);
            var createdFigure = this.factoryFunction(this.x, this.y,this.tagid);
            if(createdFigure.name!="Angle"&&createdFigure.name!="Arc")
            //move it into position
            createdFigure.transform(Matrix.translationMatrix(this.x - createdFigure.rotationCoords[0].x, this.y - createdFigure.rotationCoords[0].y))
            createdFigure.style.lineWidth = defaultLineWidth;
        
            //store id for later use
            //TODO: maybe we should try to recreate it with same ID (in case further undo will recreate objects linked to this)
            this.figureId = createdFigure.id;
            //add to STACK
            STACK.figureAdd(createdFigure);
            Timer.stop();
            this.timeGap = Timer.time();
            Timer.start();
            
            //make this the selected figure
            selectedFigureId = createdFigure.id;
            //set up it's editor
            setUpEditPanel(createdFigure);
		
            //move to figure selected state
            state = STATE_FIGURE_SELECTED;
        
            this.firstExecute = false;
            // for(var i=0;i<=STACK.figures.length;i++)
            // {
            // var obj=STACK.figures[i];
            
            // //console.log("obj",obj.name);
            // if(obj.name=="Circle"){
            //     //console.log("sjdh")
            
            // var shape = STACK.figureGetById(this.figureId)
            // //console.log("shape",shape.name)
            // if(shape.name=="Circle"){
                componentDetail();
            //}
            // // break;
            // }
            // }
            
        }
    
        else{ //redo
            var createdFigure = this.factoryFunction(this.x, this.y);
            //move it into position
            createdFigure.transform(Matrix.translationMatrix(this.x - createdFigure.rotationCoords[0].x, this.y - createdFigure.rotationCoords[0].y))
            createdFigure.style.lineWidth = defaultLineWidth;
        
            //store id for later use
            //TODO: maybe we should try to recreate it with same ID (in case further undo will recreate objects linked to this)
            //this.figureId = createdFigure.id;
            createdFigure.id = this.figureId;
            //add to STACK
            STACK.figureAdd(createdFigure);
		
            Timer.stop();
            this.timeGap = Timer.time();
            Timer.start();
            
            //make this the selected figure
            //selectedFigureId = createdFigure.id;
        
            //set up it's editor
            setUpEditPanel(createdFigure);
        
            //move to figure selected state
            //state = STATE_FIGURE_SELECTED;
        
            this.firstExecute = false;
        }
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){

        // if current figure is in text editing state
        if (state == STATE_TEXT_EDITING) {
            // remove current text editor
            currentTextEditor.destroy();
            currentTextEditor = null;
        }

        //remove figure
        STACK.figureRemoveById(this.figureId);
        
        //change state
        state = STATE_NONE;

        // set properties panel to canvas because current figure doesn't exist anymore
        setUpEditPanel(canvasProps);
    }
}

function FigureDeleteCommand(figureId){
    this.oType = 'FigureDeleteCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = false;
    
    this.figureId = figureId;
    
    this.deletedFigure = null;

    this.deletedGlues = null;
    this.deletedCPs = null;
        
    this.firstExecute = true;
    this.timeGap = 0;
}


FigureDeleteCommand.prototype = {
    
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        //if(this.firstExecute){
            //store deleted figure (safe copy)
//            this.deletedFigure = STACK.figureGetById(this.figureId).clone();
            this.deletedFigure = STACK.figureGetById(this.figureId);

            if(this.deletedFigure.name == "Pencil")
            {
                canvasProps.pencil[current_tab-1] = -1;
                clearPencilCanvas();
            }    
            //delete it
            STACK.figureRemoveById(this.figureId);
            Timer.stop();
            this.timeGap = Timer.time();
            Timer.start();
            
            //interface settings            
            selectedFigureId = -1;
            setUpEditPanel(canvasProps);
            state = STATE_NONE;            
            
            this.firstExecute = false;
        /*}
        else{ //a redo
            throw "Not implemented";
        }*/
    },

    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        if(this.deletedFigure){
            
            //add deleted figure back
//            STACK.figureAdd(this.deletedFigure.clone());  //safe copy
            STACK.figureAdd(this.deletedFigure);
        }
        else{
            throw "No soted deleted figure";
        }
    }
}

/* 
 * This is triggered when a figure was rotated
 */
function FigureRotateCommand(figureId, matrix, reverseMatrix){
    this.oType = 'FigureRotateCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = true;
    
    this.figureId = figureId;
    this.timeGap = 0;
    this.matrix = matrix;           
    this.reverseMatrix = reverseMatrix;
        
}


FigureRotateCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        Timer.stop();
        this.timeGap = Timer.time();
        Timer.start();
            
        var fig = STACK.figureGetById(this.figureId);                
        fig.transform(this.matrix);

    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        var fig = STACK.figureGetById(this.figureId);
        fig.transform(this.reverseMatrix);
    }
}

/** 
 * This command just clones an existing {Figure}. All it needs is an id of
 */
function FigureCloneCommand(parentFigureId){
    this.oType = 'FigureCloneCommand';
    
    this.firstExecute = true;
    this.timeGap = 0;
    /**This will keep the newly created  Figure id*/
    this.figureId = null; 
    
    /**This keeps the cloned figure Id*/
    this.parentFigureId = parentFigureId;    
}


FigureCloneCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){
        if(this.firstExecute){
            //get old figure and clone it
            var createdFigure = STACK.figureGetById(this.parentFigureId).clone();
            
            //move it 10px low and 10px right
            createdFigure.transform(Matrix.translationMatrix(10,10));
            
            //store newly created figure
            STACK.figureAdd(createdFigure);
            Timer.stop();
            this.timeGap = Timer.time();
            Timer.start();
                
            //store newly created figure id
            this.figureId = createdFigure.id;
            
            //update diagram state
            selectedFigureId = this.figureId;
            setUpEditPanel(createdFigure);
            state = STATE_FIGURE_SELECTED;
            
            this.firstExecute = false;
        }
        else{ //redo
            throw "Not implemented";
        }
    },
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){ 
        STACK.figureRemoveById(this.figureId);
        state = STATE_NONE;
    }
}

/* 
 * This is triggered when a figure was scaled/expanded
 */
function FigureScaleCommand(figureId, matrix, reverseMatrix){
    this.oType = 'FigureScaleCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = true;
    
    this.figureId = figureId;
    this.timeGap = 0;  
    this.matrix = matrix;           
    this.reverseMatrix = reverseMatrix;
        
}


FigureScaleCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        Timer.stop();
        this.timeGap = Timer.time();
        Timer.start();
            
        var fig = STACK.figureGetById(this.figureId);                
        fig.transform(this.matrix);        
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        var fig = STACK.figureGetById(this.figureId);
        fig.transform(this.reverseMatrix);
    }
}
/* 
 * This is triggered when a figure was translated
 */
function FigureFlipCommand(figureId){
    this.oType = 'FigureFlipCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = true;
    
    this.figureId = null;
    this.timeGap = 0;
    //compute the translation matrix
//    this.matrix = generateMoveMatrix(STACK.figureGetById(figureId), this.x,this. y);
    /**This keeps the cloned figure Id*/
    this.parentFigureId = figureId;
}


FigureFlipCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        Timer.stop();
        this.timeGap = Timer.time();
        Timer.start();
        var obj = STACK.figureGetById(this.parentFigureId);
        if(!obj)
            obj = LineArrow_MANAGER.linearrowGetById(this.parentFigureId);
        if(obj instanceof LineArrow)
        {
          ////console.log(obj);
          var bounds = obj.getBounds();
          var originX = bounds[0]+(bounds[2]-bounds[0])/2;
          var originY = bounds[1];
          var x = originX;
          var y = originX;
          var translateMatrix = [
              [-1, 0, 0],
              [0, 1, 0],
              [0, 0, 1]
              ];  
          var origin = new Point(x,y);
          //origin.transform(translateMatrix,true);   
          var points = [];
          points[0] = new Point(obj.turningPoints[0].x, obj.turningPoints[0].y);
          points[0].transform(translateMatrix);
          points[1] = new Point(obj.turningPoints[1].x, obj.turningPoints[1].y);
          points[1].transform(translateMatrix);
          var bounds = Util.getBounds(points);
          var originX = bounds[0]+(bounds[2]-bounds[0])/2;
          //var originY = bounds[1];
          var dx = x-originX;
          var dy = 0;
          var moveMatrix = [
                [1, 0, dx],
                [0, 1, dy],
                [0, 0, 1]
                ];
            points[0].transform(moveMatrix);
            points[1].transform(moveMatrix);
            /*for(var i in obj.turningPoints)
            {
              con.turningPoints[i].transform(moveMatrix);
            }*/

            var conId = LineArrow_MANAGER.linearrowCreate(points[0],points[1], obj.type);
            selectedLineArrowId = conId;
            var cmdCreateCon = new LineArrowCreateCommand(selectedLineArrowId);
            //History.addUndo(cmdCreateCon);

            //reset all {LineArrowPoint}s' color
            LineArrow_MANAGER.linearrowPointsResetColor();

            //reset current connection cloud
            currentCloud = [];

            //select the current linearrow
            state = STATE_CONNECTOR_SELECTED;
            var con = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId);

            setUpEditPanel(con);
            this.figureId = selectedLineArrowId;
            //state = STATE_CONNECTOR_PICK_SECOND;
            /* var cmdCloneFig = new FigureCloneCommand(selectedFigureId);
            cmdCloneFig.execute();*/
            //Clone for LineArrow
            /*var cps = LineArrow_MANAGER.linearrowPointGetAllByParent(con.id);
            cps.forEach(
            function(connectionPoint){
                LineArrow_MANAGER.linearrowPointCreate(ret.id,connectionPoint.point.clone(), LineArrowPoint.TYPE_FIGURE);
            }
            );*/
        }
        else
        {
            var cmdCloneFig = new FigureCloneCommand(this.parentFigureId);
            cmdCloneFig.execute();
            this.figureId = cmdCloneFig.figureId;
            var fig = STACK.figureGetById(this.figureId);
            var x = fig.rotationCoords[0].x;
            var y = fig.rotationCoords[0].y;
            var translateMatrix = [
                [-1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
                ];  
            fig.transform(translateMatrix,true);   
            var dx = x-fig.rotationCoords[0].x;
            var dy = y-fig.rotationCoords[0].y;
            var moveMatrix = [
                    [1, 0, dx],
                    [0, 1, dy],
                    [0, 0, 1]
                    ];
            fig.transform(moveMatrix);
            //History.addUndo(cmdCloneFig);
        }
        
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        var obj = STACK.figureGetById(this.figureId);
        if(!obj)
            obj = LineArrow_MANAGER.linearrowGetById(this.figureId);
        if(obj instanceof LineArrow)
        {
          //var linearrow = LineArrow_MANAGER.linearrowGetById(this.figureNewId);
          LineArrow_MANAGER.linearrowRemoveById(this.figureId, true);
      }
      else
      {
        STACK.figureRemoveById(this.figureId);
        }
        state = STATE_NONE;
        /*var x = fig.rotationCoords[0].x;
        var y = fig.rotationCoords[0].y;
        var translateMatrix = [
            [-1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
            ];  
        fig.transform(translateMatrix);   
        var dx = x-fig.rotationCoords[0].x;
        var dy = y-fig.rotationCoords[0].y;
        var moveMatrix = [
                [1, 0, dx],
                [0, 1, dy],
                [0, 0, 1]
                ];
        fig.transform(moveMatrix);*/
    }
}

/* 
 * This is triggered when a figure was translated
 */
function FigureTranslateCommand(figureId, matrix){
    this.oType = 'FigureTranslateCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = true;
    
    this.figureId = figureId;
    this.timeGap = 0;
    //compute the translation matrix
//    this.matrix = generateMoveMatrix(STACK.figureGetById(figureId), this.x,this. y);
    this.matrix = matrix;
        
    //compute the reverse matrix
    this.reverseMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
    ];
    this.reverseMatrix[0][2] = -this.matrix[0][2];
    this.reverseMatrix[1][2] = -this.matrix[1][2];
        
}


FigureTranslateCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        Timer.stop();
        this.timeGap = Timer.time();
        Timer.start();
            
        var fig = STACK.figureGetById(this.figureId);                
        fig.transform(this.matrix);        
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        var fig = STACK.figureGetById(this.figureId);
        fig.transform(this.reverseMatrix);
    }
}


/**
 * Object that is used to undo actions when figures are moved from front to back
 */
function FigureZOrderCommand(figureId, newPosition){
    this.figureId = figureId;
    this.oType = "FigureZOrderCommand";
    this.timeGap = 0;
    this.oldPosition = STACK.idToIndex[figureId];
    this.newPosition = newPosition;
}

FigureZOrderCommand.prototype = {
    /**This method got called every time the Command must execute*/
    execute : function(){
        if(this.oldPosition + 1 == this.newPosition || this.oldPosition - 1 == this.newPosition){
            STACK.swapToPosition(this.figureId, this.newPosition);
        }
        else{
            STACK.setPosition(this.figureId, this.newPosition);
        }
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){
        if(this.newPosition + 1 == this.oldPosition || this.newPosition - 1 == this.oldPosition){
            STACK.swapToPosition(this.figureId, this.oldPosition);
        }
        else{
            STACK.setPosition(this.figureId, this.oldPosition);
        }
    }
    
}

/* Groupcommand.js */
/**
 * It will group a set of figures
 */
function GroupCreateCommand(groupId){
    this.groupId = groupId;
    
    /**Figures ids that belong to this group*/
    this.figuresIds = STACK.figureGetIdsByGroupId(groupId);
    
    this.firstExecute = true;
    this.timeGap = 0;
    this.oType = "GroupCreateCommand";            
}

GroupCreateCommand.prototype = {
    
    /**This method got called every time the Command must execute.
     *The problem is that is a big difference between first execute and a "redo" execute
     **/
    execute : function(){
        
        if(this.firstExecute){ //first execute
            STACK.groupGetById(this.groupId).permanent = true; //transform this group into a permanent one
            
            this.firstExecute = false;
        } 
        else{ //a redo (group was previously destroyed)
            //create group
            var g = new Group();
            g.id = this.groupId; //copy old Id
            g.permanent = true;

            //add figures to group
            for(var i=0; i < this.figuresIds.length; i++){
                var f = STACK.figureGetById(this.figuresIds[i]);
                f.groupId = g.id;
            }
            
            var bounds = g.getBounds();
            g.rotationCoords.push(new Point(bounds[0]+(bounds[2]-bounds[0])/2, bounds[1] + (bounds[3] - bounds[1]) / 2));
            g.rotationCoords.push(new Point(bounds[0]+(bounds[2]-bounds[0])/2, bounds[1]));

            //save group to STACK
            STACK.groups.push(g);
        }
        
        state = STATE_GROUP_SELECTED;
        selectedGroupId = this.groupId;            
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){
        STACK.groupDestroy(this.groupId);
        
        selectedGroupId = -1;
        state = STATE_NONE;
    }
}

function GroupDeleteCommand(groupId){
    this.oType = 'GroupDeleteCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = false;
    this.timeGap = 0;
    this.groupId = groupId;
    
    //undo data 
    this.deletedGroup = null;
    this.deletedFiguresCommands = [];
    
        
    this.firstExecute = true;
}


GroupDeleteCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        if(this.firstExecute){
            
            this.deletedGroup = STACK.groupGetById(this.groupId);
            
            var figuresIds = STACK.figureGetIdsByGroupId(this.groupId);
            for(var i=0; i<figuresIds.length; i++){
                var tmpDelFig = new FigureDeleteCommand(figuresIds[i]);
                tmpDelFig.execute();
                this.deletedFiguresCommands.push(tmpDelFig);
            }
                                    
            
            //delete it
            STACK.groupDestroy(this.groupId);            
            
            //interface settings            
            selectedGroupId = -1;
            state = STATE_NONE;
            setUpEditPanel(canvasProps);
            
            this.firstExecute = false;
        }
        else{ //a redo
            throw "Not implemented";
        }
    },

    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        if(this.deletedGroup){
            //add back figures
            for(var i=0; i< this.deletedFiguresCommands.length; i++){
                this.deletedFiguresCommands[i].undo();
            }
            
            //add back group
            STACK.groups.push(this.deletedGroup);
            
            
            selectedGroupId = this.groupId;
            state = STATE_GROUP_SELECTED;
            
        }
        else{
            throw "No soted deleted figure";
        }
    }
}

/**
 * Object that is used to undo actions when figures are grouped or ungrouped
 */
function GroupDestroyCommand(groupId){
    this.groupId = groupId;
    
    this.figuresIds = STACK.figureGetIdsByGroupId(groupId);
    this.timeGap = 0;
    this.firstExecute = true;
    this.oType = "GroupDestroyCommand";            
}

GroupDestroyCommand.prototype = {
    
    /**Split group apart*/
    execute : function(){
        STACK.groupDestroy(this.groupId);
        
        selectedGroupId = -1;
        state = STATE_NONE;
    },
    
    
    /**Group figures back*/
    undo : function(){
        
        //recreate create group
        var g = new Group();
        g.id = this.groupId; //copy old Id
        g.permanent = true;

        //add figures to group
        for(var i=0; i < this.figuresIds.length; i++){
            var f = STACK.figureGetById(this.figuresIds[i]);
            f.groupId = g.id;
        }
            
        var bounds = g.getBounds();
        g.rotationCoords.push(new Point(bounds[0]+(bounds[2]-bounds[0])/2, bounds[1] + (bounds[3] - bounds[1]) / 2));
        g.rotationCoords.push(new Point(bounds[0]+(bounds[2]-bounds[0])/2, bounds[1]));

        //save group to STACK
        STACK.groups.push(g);
        
        state = STATE_GROUP_SELECTED;
        selectedGroupId = this.groupId;       
    }
}

/* 
 * This is triggered when a group was rotated
 */
function GroupRotateCommand(groupId, matrix, reverseMatrix){
    this.oType = 'GroupRotateCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = true;
    
    this.groupId = groupId;
        
    this.matrix = matrix;           
    this.reverseMatrix = reverseMatrix;
     this.timeGap = 0;   
}


GroupRotateCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        var group = STACK.groupGetById(this.groupId);                
        group.transform(this.matrix);        
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        var group = STACK.groupGetById(this.groupId);                
        group.transform(this.reverseMatrix);        
    }
}

/* 
 * This is triggered when a group was rotated
 */
function GroupRotateCommand(groupId, matrix, reverseMatrix){
    this.oType = 'GroupRotateCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = true;
    this.timeGap = 0;
    this.groupId = groupId;
        
    this.matrix = matrix;           
    this.reverseMatrix = reverseMatrix;
        
}


GroupRotateCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        var group = STACK.groupGetById(this.groupId);                
        group.transform(this.matrix);        
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        var group = STACK.groupGetById(this.groupId);                
        group.transform(this.reverseMatrix);        
    }
}

/* 
 * This is triggered when a figure was scaled/expanded
*/
function GroupScaleCommand(groupId, matrix, reverseMatrix){
    this.oType = 'GroupScaleCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = true;
    this.timeGap = 0;
    this.groupId = groupId;
        
    this.matrix = matrix;           
    this.reverseMatrix = reverseMatrix;
        
}


GroupScaleCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        var group = STACK.groupGetById(this.groupId);                
        group.transform(this.matrix);        
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        var group = STACK.groupGetById(this.groupId);                
        group.transform(this.reverseMatrix);        
    }
}

/* 
 * This is triggered when a figure was moved
 */
function GroupTranslateCommand(groupId, matrix){
    this.oType = 'GroupTranslateCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = true;
    
    this.groupId = groupId;
    this.timeGap = 0;
    //compute the translation matrix
    this.matrix = matrix;
        
    //compute the reverse matrix
    this.reverseMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
    ];
    this.reverseMatrix[0][2] = -this.matrix[0][2];
    this.reverseMatrix[1][2] = -this.matrix[1][2];
        
}


GroupTranslateCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        var group = STACK.groupGetById(this.groupId);                
        group.transform(this.matrix);        
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        var group = STACK.groupGetById(this.groupId);
        group.transform(this.reverseMatrix);
    }
}

/*ShapeChangePropertyCommand.js*/
function ShapeChangePropertyCommand(figureId, property, newValue, previousValue){
    this.figureId = figureId;
    this.property = property;    
    this.newValue = newValue;
    this.previousValue = typeof(previousValue) !== 'undefined' ? previousValue : this._getValue(figureId, property);
    this.firstExecute = true;
    this.timeGap = 0;
    // check if property corresponds to a Text primitive
    // isTextPrimitiveProperty property used for calling TextEditorPopup callback on property change
    this.textPrimitiveId = this._getTextPrimitiveId();
    this.isTextPrimitiveProperty = this.textPrimitiveId !== -1;
    
    this.oType = "ShapeChangePropertyCommand";
}

ShapeChangePropertyCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){
        if(this.firstExecute){
            Timer.stop();
            this.timeGap = Timer.time();
            Timer.start();
            
            this._setValue(this.figureId, this.property, this.newValue);
            this.firstExecute = false; 
            //setUpEditPanel(STACK.figureGetById(this.figureId));

            // if property change of Text primitive executed
            // then state must be equal to text editing
            // and we call it's setProperty method to provide WYSIWYG functionality
            if (this.isTextPrimitiveProperty) {
                if (state == STATE_TEXT_EDITING) {
                    currentTextEditor.setProperty(this.property, this.newValue);
                } 
            //else {
            //        throw "ShapeChangePropertyCommand:execute() - this should never happen";
            //     }
            }
        }
        else{
            Timer.stop();
            this.timeGap = Timer.time();
            Timer.start();
            
            this._setValue(this.figureId, this.property, this.newValue);
            this.firstExecute = false; 
            //setUpEditPanel(STACK.figureGetById(this.figureId));

            // if property change of Text primitive executed
            // then state must be equal to text editing
            // and we call it's setProperty method to provide WYSIWYG functionality
            if (this.isTextPrimitiveProperty) {
                if (state == STATE_TEXT_EDITING) {
                    currentTextEditor.setProperty(this.property, this.newValue);
//                } else {
//                    throw "ShapeChangePropertyCommand:execute() - this should never happen";
                }
            }
        }
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){
        this._setValue(this.figureId, this.property, this.previousValue);
        
        var shape = this.__getShape(this.figureId);
        
        setUpEditPanel(shape);

        // if property of Text primitive is changing back
        // then we need to set this change on TextEditorPopup
        // to provide WYSIWYG functionality
        if (this.isTextPrimitiveProperty) {

            // if we already in text editing state
            if (state == STATE_TEXT_EDITING) {
                // if currentTextEditor refers to another shape/primitive
                // then we destroy current and create new TextEditorPopup
                if (!currentTextEditor.refersTo(shape, this.textPrimitiveId)) {
                    currentTextEditor.destroy();
                    setUpTextEditorPopup(shape, this.textPrimitiveId);
                    // and we call setProperty of currentTextEditor method to provide WYSIWYG functionality
                    currentTextEditor.setProperty(this.property, this.previousValue);
                }
            }

        }
    },
    
    
    /**As 
     *@param id {Numeric} the id of the shape (Figure, LineArrow, Container)a
     **/
    __getShape : function(id){
        var shape = STACK.figureGetById(id);
        if(shape == null){
            shape = LineArrow_MANAGER.linearrowGetById(id);
        }
        if(shape == null){
            shape = STACK.containerGetById(id);
        }
        return shape;
    },
    
    
    /**Get */
    _getValue : function(figureId, property){
        //gel old value
        var shape = this.__getShape(this.figureId);

        var propertyObject = shape;
        var propertyAccessors = property.split(".");
        for(var i = 0; i<propertyAccessors.length-1; i++){
            propertyObject = propertyObject[propertyAccessors[i]];
        }

        if(propertyObject[propertyAccessors[propertyAccessors.length -1]] === undefined){
            /*if something is complicated enough to need a function, 
             *likelyhood is it will need access to its parent figure*/
            return propertyObject["get"+propertyAccessors[propertyAccessors.length -1]];
        }
        else{
            return propertyObject[propertyAccessors[propertyAccessors.length -1]];
        }  
    },
    
    /**Set */
    _setValue : function(figureId, property, value){
        //gel old value
        var shape = this.__getShape(this.figureId);

        var propertyObject = shape;
        var propertyAccessors = property.split(".");
        for(var i = 0; i<propertyAccessors.length-1; i++){
            propertyObject = propertyObject[propertyAccessors[i]];
        }

        if(propertyObject[propertyAccessors[propertyAccessors.length -1]] === undefined){
            /*if something is complicated enough to need a function, 
             *likelyhood is it will need access to its parent figure*/
            propertyObject["set"+propertyAccessors[propertyAccessors.length -1]](value);
        }
        else{
            propertyObject[propertyAccessors[propertyAccessors.length -1]] = value;                
        }  
    },

    /**
     * Checks if property applied to Text primitive
     * @return -1 if property didn't apply to Text primitive or id of the corresponding Text primitive otherwise
    **/
    _getTextPrimitiveId : function() {
        var textPrimitiveId = -1;

        // check by RegExp - is property applying to a Text primitive
        // typical examples: "primitives.3.size", "primitives.1.str", "primitives.5.font" and "middleText.str" for a LineArrow
        if (/(primitives\.\d+|middleText)\.(str|size|font|align|underlined|style\.fillStyle)/g.test(this.property)) {
            // according to RegExp this (between first and second dots) part is a number
            var id = this.property.split('.')[1];

            textPrimitiveId = parseInt(id, 10);
        }
        return textPrimitiveId;
    }
}

/* Imagecreate command.js */

function InsertedImageFigureCreateCommand(imgFileName, x, y,imageData){
    this.oType = 'InsertedImageFigureCreateCommand';
    this.mergeable = false;
    this.imgFileName = imgFileName;
    this.x = x;
    this.y = y;
    this.firstExecute = true;
    this.firstDraw = true;
    this.figureId = null;
    this.timeGap = 0;
    this.imageData = imageData;
}


InsertedImageFigureCreateCommand.prototype = {
    execute : function(){
         if(this.firstExecute&&this.firstDraw){
            //create figure
            var imageURL = '/editor/data/import/' + this.imgFileName;
            if(this.imgFileName=="ImageData"||this.imgFileName=="Pencil")
            {
                imageURL = this.imgFileName;
            }
            else
                imageURL = this.imageData;
            var createdFigure = ImageFrame.figure_InsertedImage(imageURL, this.x, this.y,this.imageData);

            //move it into position
            createdFigure.transform(Matrix.translationMatrix(this.x - createdFigure.rotationCoords[0].x, this.y - createdFigure.rotationCoords[0].y))
            createdFigure.style.lineWidth = defaultLineWidth;

            this.figureId = createdFigure.id;
            if(this.imgFileName=="Pencil")
                canvasProps.pencil[current_tab-1] = createdFigure.id;
            //add to STACK
            STACK.figureAdd(createdFigure);
            //console.log("set",createdFigure)
            Timer.stop();
            this.timeGap = Timer.time();
            Timer.start();
            
            //make this the selected figure
            selectedFigureId = createdFigure.id;

            //set up it's editor
            setUpEditPanel(createdFigure);
            

            //move to figure selected state
            state = STATE_FIGURE_SELECTED;

            this.firstExecute = false;
            componentImageDetail()
        }
        else{ //redo
            if(this.firstDraw)
            {
              var imageURL = '/editor/data/import/' + this.imgFileName;
              if(this.imgFileName=="ImageData"||this.imgFileName=="Pencil")
              {
                  imageURL = this.imgFileName;
              }
              else
                  imageURL = this.imageData;
              var createdFigure = ImageFrame.figure_InsertedImage(imageURL, this.x, this.y,this.imageData);

              //move it into position
              createdFigure.transform(Matrix.translationMatrix(this.x - createdFigure.rotationCoords[0].x, this.y - createdFigure.rotationCoords[0].y))
              createdFigure.style.lineWidth = defaultLineWidth;

              createdFigure.id = this.figureId;
              if(this.imgFileName=="Pencil")
                canvasProps.pencil[current_tab-1] = this.figureId;
              //add to STACK
              STACK.figureAdd(createdFigure);
              
              //console.log("image",createdFigure)
              Timer.stop();
              this.timeGap = Timer.time();
              Timer.start();
            }
            else
            {
              var fig = STACK.figureGetById(canvasProps.pencil[current_tab-1]);
              fig.primitives[0].imageData = this.imageData;
              fig.primitives[0].setUrl('Pencil',this.imageData);
              pencil_draw= true;
              draw();
            }
        }
    },


    /**This method should be called every time the Command should be undone*/
    undo : function(){
        if(this.firstDraw)
        {
          // if current figure is in text editing state
          if (state == STATE_TEXT_EDITING) {
              // remove current text editor
              currentTextEditor.destroy();
              currentTextEditor = null;
          }

          //remove figure
          STACK.figureRemoveById(this.figureId);

          //change state
          state = STATE_NONE;
          // set properties panel to canvas because current figure doesn't exist anymore
          setUpEditPanel(canvasProps);
          if(this.imgFileName=="Pencil")
          {
            clearPencilCanvas();
            canvasProps.pencil[current_tab-1] = -1;
            //pencil_draw= true;
            draw();
          }
        }
        else
        {
          var previousPencilPointer = History.getPreviousPencilPointer();
          var fig = STACK.figureGetById(canvasProps.pencil[current_tab-1]);
          fig.primitives[0].imageData = History.COMMANDS[previousPencilPointer].imageData;
          fig.primitives[0].setUrl('Pencil',History.COMMANDS[previousPencilPointer].imageData);
          pencil_draw= true;
          draw();
        }
    }
}


/* Whiteboard.js */
var Whammy = (function() {
    // a more abstract-ish API

    function WhammyVideo(duration) {
        this.frames = [];
        this.duration = duration || 1;
        this.quality = 0.8;
    }

    /**
     * Pass Canvas or Context or image/webp(string) to {@link Whammy} encoder.
     * @method
     * @memberof Whammy
     * @example
     * recorder = new Whammy().Video(0.8, 100);
     * recorder.add(canvas || context || 'image/webp');
     * @param {string} frame - Canvas || Context || image/webp
     * @param {number} duration - Stick a duration (in milliseconds)
     */
    WhammyVideo.prototype.add = function(frame, duration) {
        if ('canvas' in frame) { //CanvasRenderingContext2D
            frame = frame.canvas;
        }

        if ('toDataURL' in frame) {
            frame = frame.toDataURL('image/webp', this.quality);
        }

        if (!(/^data:image\/webp;base64,/ig).test(frame)) {
            throw 'Input must be formatted properly as a base64 encoded DataURI of type image/webp';
        }
        this.frames.push({
            image: frame,
            duration: duration || this.duration
        });
    };

    function processInWebWorker(_function) {
        var blob = URL.createObjectURL(new Blob([_function.toString(),
            'this.onmessage =  function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(blob);
        URL.revokeObjectURL(blob);
        return worker;
    }

    function whammyInWebWorker(frames) {
        function ArrayToWebM(frames) {
            var info = checkFrames(frames);
            if (!info) {
                return [];
            }

            var clusterMaxDuration = 30000;

            var EBML = [{
                'id': 0x1a45dfa3, // EBML
                'data': [{
                    'data': 1,
                    'id': 0x4286 // EBMLVersion
                }, {
                    'data': 1,
                    'id': 0x42f7 // EBMLReadVersion
                }, {
                    'data': 4,
                    'id': 0x42f2 // EBMLMaxIDLength
                }, {
                    'data': 8,
                    'id': 0x42f3 // EBMLMaxSizeLength
                }, {
                    'data': 'webm',
                    'id': 0x4282 // DocType
                }, {
                    'data': 2,
                    'id': 0x4287 // DocTypeVersion
                }, {
                    'data': 2,
                    'id': 0x4285 // DocTypeReadVersion
                }]
            }, {
                'id': 0x18538067, // Segment
                'data': [{
                    'id': 0x1549a966, // Info
                    'data': [{
                        'data': 1e6, //do things in millisecs (num of nanosecs for duration scale)
                        'id': 0x2ad7b1 // TimecodeScale
                    }, {
                        'data': 'whammy',
                        'id': 0x4d80 // MuxingApp
                    }, {
                        'data': 'whammy',
                        'id': 0x5741 // WritingApp
                    }, {
                        'data': doubleToString(info.duration),
                        'id': 0x4489 // Duration
                    }]
                }, {
                    'id': 0x1654ae6b, // Tracks
                    'data': [{
                        'id': 0xae, // TrackEntry
                        'data': [{
                            'data': 1,
                            'id': 0xd7 // TrackNumber
                        }, {
                            'data': 1,
                            'id': 0x73c5 // TrackUID
                        }, {
                            'data': 0,
                            'id': 0x9c // FlagLacing
                        }, {
                            'data': 'und',
                            'id': 0x22b59c // Language
                        }, {
                            'data': 'V_VP8',
                            'id': 0x86 // CodecID
                        }, {
                            'data': 'VP8',
                            'id': 0x258688 // CodecName
                        }, {
                            'data': 1,
                            'id': 0x83 // TrackType
                        }, {
                            'id': 0xe0, // Video
                            'data': [{
                                'data': info.width,
                                'id': 0xb0 // PixelWidth
                            }, {
                                'data': info.height,
                                'id': 0xba // PixelHeight
                            }]
                        }]
                    }]
                }]
            }];

            //Generate clusters (max duration)
            var frameNumber = 0;
            var clusterTimecode = 0;
            while (frameNumber < frames.length) {

                var clusterFrames = [];
                var clusterDuration = 0;
                do {
                    clusterFrames.push(frames[frameNumber]);
                    clusterDuration += frames[frameNumber].duration;
                    frameNumber++;
                } while (frameNumber < frames.length && clusterDuration < clusterMaxDuration);

                var clusterCounter = 0;
                var cluster = {
                    'id': 0x1f43b675, // Cluster
                    'data': getClusterData(clusterTimecode, clusterCounter, clusterFrames)
                }; //Add cluster to segment
                EBML[1].data.push(cluster);
                clusterTimecode += clusterDuration;
            }

            return generateEBML(EBML);
        }

        function getClusterData(clusterTimecode, clusterCounter, clusterFrames) {
            return [{
                'data': clusterTimecode,
                'id': 0xe7 // Timecode
            }].concat(clusterFrames.map(function(webp) {
                var block = makeSimpleBlock({
                    discardable: 0,
                    frame: webp.data.slice(4),
                    invisible: 0,
                    keyframe: 1,
                    lacing: 0,
                    trackNum: 1,
                    timecode: Math.round(clusterCounter)
                });
                clusterCounter += webp.duration;
                return {
                    data: block,
                    id: 0xa3
                };
            }));
        }

        // sums the lengths of all the frames and gets the duration

        function checkFrames(frames) {
            if (!frames[0]) {
                postMessage({
                    error: 'Something went wrong. Maybe WebP format is not supported in the current browser.'
                });
                return;
            }

            var width = frames[0].width,
                height = frames[0].height,
                duration = frames[0].duration;

            for (var i = 1; i < frames.length; i++) {
                duration += frames[i].duration;
            }
            return {
                duration: duration,
                width: width,
                height: height
            };
        }

        function numToBuffer(num) {
            var parts = [];
            while (num > 0) {
                parts.push(num & 0xff);
                num = num >> 8;
            }
            return new Uint8Array(parts.reverse());
        }

        function strToBuffer(str) {
            return new Uint8Array(str.split('').map(function(e) {
                return e.charCodeAt(0);
            }));
        }

        function bitsToBuffer(bits) {
            var data = [];
            var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
            bits = pad + bits;
            for (var i = 0; i < bits.length; i += 8) {
                data.push(parseInt(bits.substr(i, 8), 2));
            }
            return new Uint8Array(data);
        }

        function generateEBML(json) {
            var ebml = [];
            for (var i = 0; i < json.length; i++) {
                var data = json[i].data;

                if (typeof data === 'object') {
                    data = generateEBML(data);
                }

                if (typeof data === 'number') {
                    data = bitsToBuffer(data.toString(2));
                }

                if (typeof data === 'string') {
                    data = strToBuffer(data);
                }

                var len = data.size || data.byteLength || data.length;
                var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
                var sizeToString = len.toString(2);
                var padded = (new Array((zeroes * 7 + 7 + 1) - sizeToString.length)).join('0') + sizeToString;
                var size = (new Array(zeroes)).join('0') + '1' + padded;

                ebml.push(numToBuffer(json[i].id));
                ebml.push(bitsToBuffer(size));
                ebml.push(data);
            }

            return new Blob(ebml, {
                type: 'video/webm'
            });
        }

        function toBinStrOld(bits) {
            var data = '';
            var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
            bits = pad + bits;
            for (var i = 0; i < bits.length; i += 8) {
                data += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
            }
            return data;
        }

        function makeSimpleBlock(data) {
            var flags = 0;

            if (data.keyframe) {
                flags |= 128;
            }

            if (data.invisible) {
                flags |= 8;
            }

            if (data.lacing) {
                flags |= (data.lacing << 1);
            }

            if (data.discardable) {
                flags |= 1;
            }

            if (data.trackNum > 127) {
                throw 'TrackNumber > 127 not supported';
            }

            var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function(e) {
                return String.fromCharCode(e);
            }).join('') + data.frame;

            return out;
        }

        function parseWebP(riff) {
            var VP8 = riff.RIFF[0].WEBP[0];

            var frameStart = VP8.indexOf('\x9d\x01\x2a'); // A VP8 keyframe starts with the 0x9d012a header
            for (var i = 0, c = []; i < 4; i++) {
                c[i] = VP8.charCodeAt(frameStart + 3 + i);
            }

            var width, height, tmp;

            //the code below is literally copied verbatim from the bitstream spec
            tmp = (c[1] << 8) | c[0];
            width = tmp & 0x3FFF;
            tmp = (c[3] << 8) | c[2];
            height = tmp & 0x3FFF;
            return {
                width: width,
                height: height,
                data: VP8,
                riff: riff
            };
        }

        function getStrLength(string, offset) {
            return parseInt(string.substr(offset + 4, 4).split('').map(function(i) {
                var unpadded = i.charCodeAt(0).toString(2);
                return (new Array(8 - unpadded.length + 1)).join('0') + unpadded;
            }).join(''), 2);
        }

        function parseRIFF(string) {
            var offset = 0;
            var chunks = {};

            while (offset < string.length) {
                var id = string.substr(offset, 4);
                var len = getStrLength(string, offset);
                var data = string.substr(offset + 4 + 4, len);
                offset += 4 + 4 + len;
                chunks[id] = chunks[id] || [];

                if (id === 'RIFF' || id === 'LIST') {
                    chunks[id].push(parseRIFF(data));
                } else {
                    chunks[id].push(data);
                }
            }
            return chunks;
        }

        function doubleToString(num) {
            return [].slice.call(
                new Uint8Array((new Float64Array([num])).buffer), 0).map(function(e) {
                return String.fromCharCode(e);
            }).reverse().join('');
        }

        var webm = new ArrayToWebM(frames.map(function(frame) {
            var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
            webp.duration = frame.duration;
            return webp;
        }));

        postMessage(webm);
    }

    /**
     * Encodes frames in WebM container. It uses WebWorkinvoke to invoke 'ArrayToWebM' method.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof Whammy
     * @example
     * recorder = new Whammy().Video(0.8, 100);
     * recorder.compile(function(blob) {
     *    // blob.size - blob.type
     * });
     */
    WhammyVideo.prototype.compile = function(callback) {
        var webWorker = processInWebWorker(whammyInWebWorker);

        webWorker.onmessage = function(event) {
            if (event.data.error) {
                console.error(event.data.error);
                return;
            }
            callback(event.data);
        };

        webWorker.postMessage(this.frames);
    };

    return {
        /**
         * A more abstract-ish API.
         * @method
         * @memberof Whammy
         * @example
         * recorder = new Whammy().Video(0.8, 100);
         * @param {?number} speed - 0.8
         * @param {?number} quality - 100
         */
        Video: WhammyVideo
    };
})();

/* On Screen Keyboard */

//
// This code is released to the public domain by Jim Studt, 2007. 
// Corrected a mistake with ;
// He may keep some sort of up to date copy at http://www.federated.com/~jim/canvastext/
//
var CanvasTextFunctions = { };

CanvasTextFunctions.letters = {
    ' ': { width: 16, points: [] },
    '!': { width: 10, points: [[5,21],[5,7],[-1,-1],[5,2],[4,1],[5,0],[6,1],[5,2]] },
    '"': { width: 16, points: [[4,21],[4,14],[-1,-1],[12,21],[12,14]] },
    '#': { width: 21, points: [[11,25],[4,-7],[-1,-1],[17,25],[10,-7],[-1,-1],[4,12],[18,12],[-1,-1],[3,6],[17,6]] },
    '$': { width: 20, points: [[8,25],[8,-4],[-1,-1],[12,25],[12,-4],[-1,-1],[17,18],[15,20],[12,21],[8,21],[5,20],[3,18],[3,16],[4,14],[5,13],[7,12],[13,10],[15,9],[16,8],[17,6],[17,3],[15,1],[12,0],[8,0],[5,1],[3,3]] },
    '%': { width: 24, points: [[21,21],[3,0],[-1,-1],[8,21],[10,19],[10,17],[9,15],[7,14],[5,14],[3,16],[3,18],[4,20],[6,21],[8,21],[10,20],[13,19],[16,19],[19,20],[21,21],[-1,-1],[17,7],[15,6],[14,4],[14,2],[16,0],[18,0],[20,1],[21,3],[21,5],[19,7],[17,7]] },
    '&': { width: 26, points: [[23,12],[23,13],[22,14],[21,14],[20,13],[19,11],[17,6],[15,3],[13,1],[11,0],[7,0],[5,1],[4,2],[3,4],[3,6],[4,8],[5,9],[12,13],[13,14],[14,16],[14,18],[13,20],[11,21],[9,20],[8,18],[8,16],[9,13],[11,10],[16,3],[18,1],[20,0],[22,0],[23,1],[23,2]] },
    '\'': { width: 10, points: [[5,19],[4,20],[5,21],[6,20],[6,18],[5,16],[4,15]] },
    '(': { width: 14, points: [[11,25],[9,23],[7,20],[5,16],[4,11],[4,7],[5,2],[7,-2],[9,-5],[11,-7]] },
    ')': { width: 14, points: [[3,25],[5,23],[7,20],[9,16],[10,11],[10,7],[9,2],[7,-2],[5,-5],[3,-7]] },
    '*': { width: 16, points: [[8,21],[8,9],[-1,-1],[3,18],[13,12],[-1,-1],[13,18],[3,12]] },
    '+': { width: 26, points: [[13,18],[13,0],[-1,-1],[4,9],[22,9]] },
    ',': { width: 10, points: [[6,1],[5,0],[4,1],[5,2],[6,1],[6,-1],[5,-3],[4,-4]] },
    '-': { width: 26, points: [[4,9],[22,9]] },
    '.': { width: 10, points: [[5,2],[4,1],[5,0],[6,1],[5,2]] },
    '/': { width: 22, points: [[20,25],[2,-7]] },
    '0': { width: 20, points: [[9,21],[6,20],[4,17],[3,12],[3,9],[4,4],[6,1],[9,0],[11,0],[14,1],[16,4],[17,9],[17,12],[16,17],[14,20],[11,21],[9,21]] },
    '1': { width: 20, points: [[6,17],[8,18],[11,21],[11,0]] },
    '2': { width: 20, points: [[4,16],[4,17],[5,19],[6,20],[8,21],[12,21],[14,20],[15,19],[16,17],[16,15],[15,13],[13,10],[3,0],[17,0]] },
    '3': { width: 20, points: [[5,21],[16,21],[10,13],[13,13],[15,12],[16,11],[17,8],[17,6],[16,3],[14,1],[11,0],[8,0],[5,1],[4,2],[3,4]] },
    '4': { width: 20, points: [[13,21],[3,7],[18,7],[-1,-1],[13,21],[13,0]] },
    '5': { width: 20, points: [[15,21],[5,21],[4,12],[5,13],[8,14],[11,14],[14,13],[16,11],[17,8],[17,6],[16,3],[14,1],[11,0],[8,0],[5,1],[4,2],[3,4]] },
    '6': { width: 20, points: [[16,18],[15,20],[12,21],[10,21],[7,20],[5,17],[4,12],[4,7],[5,3],[7,1],[10,0],[11,0],[14,1],[16,3],[17,6],[17,7],[16,10],[14,12],[11,13],[10,13],[7,12],[5,10],[4,7]] },
    '7': { width: 20, points: [[17,21],[7,0],[-1,-1],[3,21],[17,21]] },
    '8': { width: 20, points: [[8,21],[5,20],[4,18],[4,16],[5,14],[7,13],[11,12],[14,11],[16,9],[17,7],[17,4],[16,2],[15,1],[12,0],[8,0],[5,1],[4,2],[3,4],[3,7],[4,9],[6,11],[9,12],[13,13],[15,14],[16,16],[16,18],[15,20],[12,21],[8,21]] },
    '9': { width: 20, points: [[16,14],[15,11],[13,9],[10,8],[9,8],[6,9],[4,11],[3,14],[3,15],[4,18],[6,20],[9,21],[10,21],[13,20],[15,18],[16,14],[16,9],[15,4],[13,1],[10,0],[8,0],[5,1],[4,3]] },
    ':': { width: 10, points: [[5,14],[4,13],[5,12],[6,13],[5,14],[-1,-1],[5,2],[4,1],[5,0],[6,1],[5,2]] },
    ';': { width: 10, points: [[5,14],[4,13],[5,12],[6,13],[5,14],[-1,-1],[6,1],[5,0],[4,1],[5,2],[6,1],[6,-1],[5,-3],[4,-4]] },
    '<': { width: 24, points: [[20,18],[4,9],[20,0]] },
    '=': { width: 26, points: [[4,12],[22,12],[-1,-1],[4,6],[22,6]] },
    '>': { width: 24, points: [[4,18],[20,9],[4,0]] },
    '?': { width: 18, points: [[3,16],[3,17],[4,19],[5,20],[7,21],[11,21],[13,20],[14,19],[15,17],[15,15],[14,13],[13,12],[9,10],[9,7],[-1,-1],[9,2],[8,1],[9,0],[10,1],[9,2]] },
    '@': { width: 27, points: [[18,13],[17,15],[15,16],[12,16],[10,15],[9,14],[8,11],[8,8],[9,6],[11,5],[14,5],[16,6],[17,8],[-1,-1],[12,16],[10,14],[9,11],[9,8],[10,6],[11,5],[-1,-1],[18,16],[17,8],[17,6],[19,5],[21,5],[23,7],[24,10],[24,12],[23,15],[22,17],[20,19],[18,20],[15,21],[12,21],[9,20],[7,19],[5,17],[4,15],[3,12],[3,9],[4,6],[5,4],[7,2],[9,1],[12,0],[15,0],[18,1],[20,2],[21,3],[-1,-1],[19,16],[18,8],[18,6],[19,5]] },
    'A': { width: 18, points: [[9,21],[1,0],[-1,-1],[9,21],[17,0],[-1,-1],[4,7],[14,7]] },
    'B': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,15],[17,13],[16,12],[13,11],[-1,-1],[4,11],[13,11],[16,10],[17,9],[18,7],[18,4],[17,2],[16,1],[13,0],[4,0]] },
    'C': { width: 21, points: [[18,16],[17,18],[15,20],[13,21],[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5]] },
    'D': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[11,21],[14,20],[16,18],[17,16],[18,13],[18,8],[17,5],[16,3],[14,1],[11,0],[4,0]] },
    'E': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,21],[17,21],[-1,-1],[4,11],[12,11],[-1,-1],[4,0],[17,0]] },
    'F': { width: 18, points: [[4,21],[4,0],[-1,-1],[4,21],[17,21],[-1,-1],[4,11],[12,11]] },
    'G': { width: 21, points: [[18,16],[17,18],[15,20],[13,21],[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[18,8],[-1,-1],[13,8],[18,8]] },
    'H': { width: 22, points: [[4,21],[4,0],[-1,-1],[18,21],[18,0],[-1,-1],[4,11],[18,11]] },
    'I': { width: 8, points: [[4,21],[4,0]] },
    'J': { width: 16, points: [[12,21],[12,5],[11,2],[10,1],[8,0],[6,0],[4,1],[3,2],[2,5],[2,7]] },
    'K': { width: 21, points: [[4,21],[4,0],[-1,-1],[18,21],[4,7],[-1,-1],[9,12],[18,0]] },
    'L': { width: 17, points: [[4,21],[4,0],[-1,-1],[4,0],[16,0]] },
    'M': { width: 24, points: [[4,21],[4,0],[-1,-1],[4,21],[12,0],[-1,-1],[20,21],[12,0],[-1,-1],[20,21],[20,0]] },
    'N': { width: 22, points: [[4,21],[4,0],[-1,-1],[4,21],[18,0],[-1,-1],[18,21],[18,0]] },
    'O': { width: 22, points: [[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[19,8],[19,13],[18,16],[17,18],[15,20],[13,21],[9,21]] },
    'P': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,14],[17,12],[16,11],[13,10],[4,10]] },
    'Q': { width: 22, points: [[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[19,8],[19,13],[18,16],[17,18],[15,20],[13,21],[9,21],[-1,-1],[12,4],[18,-2]] },
    'R': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,15],[17,13],[16,12],[13,11],[4,11],[-1,-1],[11,11],[18,0]] },
    'S': { width: 20, points: [[17,18],[15,20],[12,21],[8,21],[5,20],[3,18],[3,16],[4,14],[5,13],[7,12],[13,10],[15,9],[16,8],[17,6],[17,3],[15,1],[12,0],[8,0],[5,1],[3,3]] },
    'T': { width: 16, points: [[8,21],[8,0],[-1,-1],[1,21],[15,21]] },
    'U': { width: 22, points: [[4,21],[4,6],[5,3],[7,1],[10,0],[12,0],[15,1],[17,3],[18,6],[18,21]] },
    'V': { width: 18, points: [[1,21],[9,0],[-1,-1],[17,21],[9,0]] },
    'W': { width: 24, points: [[2,21],[7,0],[-1,-1],[12,21],[7,0],[-1,-1],[12,21],[17,0],[-1,-1],[22,21],[17,0]] },
    'X': { width: 20, points: [[3,21],[17,0],[-1,-1],[17,21],[3,0]] },
    'Y': { width: 18, points: [[1,21],[9,11],[9,0],[-1,-1],[17,21],[9,11]] },
    'Z': { width: 20, points: [[17,21],[3,0],[-1,-1],[3,21],[17,21],[-1,-1],[3,0],[17,0]] },
    '[': { width: 14, points: [[4,25],[4,-7],[-1,-1],[5,25],[5,-7],[-1,-1],[4,25],[11,25],[-1,-1],[4,-7],[11,-7]] },
    '\\': { width: 14, points: [[0,21],[14,-3]] },
    ']': { width: 14, points: [[9,25],[9,-7],[-1,-1],[10,25],[10,-7],[-1,-1],[3,25],[10,25],[-1,-1],[3,-7],[10,-7]] },
    '^': { width: 16, points: [[6,15],[8,18],[10,15],[-1,-1],[3,12],[8,17],[13,12],[-1,-1],[8,17],[8,0]] },
    '_': { width: 16, points: [[0,-2],[16,-2]] },
    '`': { width: 10, points: [[6,21],[5,20],[4,18],[4,16],[5,15],[6,16],[5,17]] },
    'a': { width: 19, points: [[15,14],[15,0],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'b': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,11],[6,13],[8,14],[11,14],[13,13],[15,11],[16,8],[16,6],[15,3],[13,1],[11,0],[8,0],[6,1],[4,3]] },
    'c': { width: 18, points: [[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'd': { width: 19, points: [[15,21],[15,0],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'e': { width: 18, points: [[3,8],[15,8],[15,10],[14,12],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'f': { width: 12, points: [[10,21],[8,21],[6,20],[5,17],[5,0],[-1,-1],[2,14],[9,14]] },
    'g': { width: 19, points: [[15,14],[15,-2],[14,-5],[13,-6],[11,-7],[8,-7],[6,-6],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'h': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0]] },
    'i': { width: 8, points: [[3,21],[4,20],[5,21],[4,22],[3,21],[-1,-1],[4,14],[4,0]] },
    'j': { width: 10, points: [[5,21],[6,20],[7,21],[6,22],[5,21],[-1,-1],[6,14],[6,-3],[5,-6],[3,-7],[1,-7]] },
    'k': { width: 17, points: [[4,21],[4,0],[-1,-1],[14,14],[4,4],[-1,-1],[8,8],[15,0]] },
    'l': { width: 8, points: [[4,21],[4,0]] },
    'm': { width: 30, points: [[4,14],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0],[-1,-1],[15,10],[18,13],[20,14],[23,14],[25,13],[26,10],[26,0]] },
    'n': { width: 19, points: [[4,14],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0]] },
    'o': { width: 19, points: [[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3],[16,6],[16,8],[15,11],[13,13],[11,14],[8,14]] },
    'p': { width: 19, points: [[4,14],[4,-7],[-1,-1],[4,11],[6,13],[8,14],[11,14],[13,13],[15,11],[16,8],[16,6],[15,3],[13,1],[11,0],[8,0],[6,1],[4,3]] },
    'q': { width: 19, points: [[15,14],[15,-7],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'r': { width: 13, points: [[4,14],[4,0],[-1,-1],[4,8],[5,11],[7,13],[9,14],[12,14]] },
    's': { width: 17, points: [[14,11],[13,13],[10,14],[7,14],[4,13],[3,11],[4,9],[6,8],[11,7],[13,6],[14,4],[14,3],[13,1],[10,0],[7,0],[4,1],[3,3]] },
    't': { width: 12, points: [[5,21],[5,4],[6,1],[8,0],[10,0],[-1,-1],[2,14],[9,14]] },
    'u': { width: 19, points: [[4,14],[4,4],[5,1],[7,0],[10,0],[12,1],[15,4],[-1,-1],[15,14],[15,0]] },
    'v': { width: 16, points: [[2,14],[8,0],[-1,-1],[14,14],[8,0]] },
    'w': { width: 22, points: [[3,14],[7,0],[-1,-1],[11,14],[7,0],[-1,-1],[11,14],[15,0],[-1,-1],[19,14],[15,0]] },
    'x': { width: 17, points: [[3,14],[14,0],[-1,-1],[14,14],[3,0]] },
    'y': { width: 16, points: [[2,14],[8,0],[-1,-1],[14,14],[8,0],[6,-4],[4,-6],[2,-7],[1,-7]] },
    'z': { width: 17, points: [[14,14],[3,0],[-1,-1],[3,14],[14,14],[-1,-1],[3,0],[14,0]] },
    '{': { width: 14, points: [[9,25],[7,24],[6,23],[5,21],[5,19],[6,17],[7,16],[8,14],[8,12],[6,10],[-1,-1],[7,24],[6,22],[6,20],[7,18],[8,17],[9,15],[9,13],[8,11],[4,9],[8,7],[9,5],[9,3],[8,1],[7,0],[6,-2],[6,-4],[7,-6],[-1,-1],[6,8],[8,6],[8,4],[7,2],[6,1],[5,-1],[5,-3],[6,-5],[7,-6],[9,-7]] },
    '|': { width: 8, points: [[4,25],[4,-7]] },
    '}': { width: 14, points: [[5,25],[7,24],[8,23],[9,21],[9,19],[8,17],[7,16],[6,14],[6,12],[8,10],[-1,-1],[7,24],[8,22],[8,20],[7,18],[6,17],[5,15],[5,13],[6,11],[10,9],[6,7],[5,5],[5,3],[6,1],[7,0],[8,-2],[8,-4],[7,-6],[-1,-1],[8,8],[6,6],[6,4],[7,2],[8,1],[9,-1],[9,-3],[8,-5],[7,-6],[5,-7]] },
    '~': { width: 24, points: [[3,6],[3,8],[4,11],[6,12],[8,12],[10,11],[14,8],[16,7],[18,7],[20,8],[21,10],[-1,-1],[3,8],[4,10],[6,11],[8,11],[10,10],[14,7],[16,6],[18,6],[20,7],[21,10],[21,12]] }
};

CanvasTextFunctions.letter = function (ch)
{
    return CanvasTextFunctions.letters[ch];
}

CanvasTextFunctions.ascent = function( font, size)
{
    return size;
}

CanvasTextFunctions.descent = function( font, size)
{
    return 7.0*size/25.0;
}

CanvasTextFunctions.measure = function( font, size, str)
{
    var total = 0;
    var len = str.length;

    for ( i = 0; i < len; i++) {
    var c = CanvasTextFunctions.letter( str.charAt(i));
    if ( c) total += c.width * size / 25.0;
    }
    return total;
}

CanvasTextFunctions.draw = function(ctx,font,size,x,y,str)
{
    var total = 0;
    var len = str.length;
    var mag = size / 25.0;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = 2.0 * mag;

    for (var i = 0; i < len; i++) {
    var c = CanvasTextFunctions.letter( str.charAt(i));
    if ( !c) continue;

    ctx.beginPath();

    var penUp = 1;
    var needStroke = 0;
    for (var j = 0; j < c.points.length; j++) {
        var a = c.points[j];
        if ( a[0] == -1 && a[1] == -1) {
        penUp = 1;
        continue;
        }
        if ( penUp) {
        ctx.moveTo( x + a[0]*mag, y - a[1]*mag);
        penUp = false;
        } else {
        ctx.lineTo( x + a[0]*mag, y - a[1]*mag);
        }
    }
    ctx.stroke();
    x += c.width*mag;
    }
    ctx.restore();
    return total;
}

CanvasTextFunctions.enable = function( ctx)
{
    ctx.drawText = function(font,size,x,y,text) { return CanvasTextFunctions.draw( ctx, font,size,x,y,text); };
    ctx.measureText = function(font,size,text) { return CanvasTextFunctions.measure( font,size,text); };
    ctx.fontAscent = function(font,size) { return CanvasTextFunctions.ascent(font,size); }
    ctx.fontDescent = function(font,size) { return CanvasTextFunctions.descent(font,size); }

    ctx.drawTextRight = function(font,size,x,y,text) { 
    var w = CanvasTextFunctions.measure(font,size,text);
    return CanvasTextFunctions.draw( ctx, font,size,x-w,y,text); 
    };
    ctx.drawTextCenter = function(font,size,x,y,text) { 
    var w = CanvasTextFunctions.measure(font,size,text);
    return CanvasTextFunctions.draw( ctx, font,size,x-w/2,y,text); 
    };
}

function LineArrow(startPoint,endPoint,type, id){
    /**LineArrow's id*/
    this.id = id;
    
    this.name = "Line";

    /**An {Array} of {Point}s. They will be used to draw the linearrow*/
    this.turningPoints = [startPoint,endPoint];
    
    /**Type of linearrow. Ex. TYPE_STRAIGHT*/
    this.type = type;

    this.userChanges = [];

    /**Solution of linearrow's shape calculated with ConnectionManager.linearrow2Points.
     * It can be one of: 's0', 's1_1', 's2_2', etc. */
    this.solution = '';
    
    /**The {Style} this linearrow will have*/
    this.style = new Style();
    this.style.strokeStyle = "#000000";
    this.style.lineWidth = 2.005;   // fixes linearrow's display in Chrome for now
    this.style.lineStyle = Style.LINE_STYLE_CONTINOUS;
    if(type == LineArrow.TYPE_STRAIGHT)
    {
        this.startStyle = LineArrow.STYLE_NORMAL;
        this.endStyle = LineArrow.STYLE_NORMAL;
    }
    else if(type == LineArrow.TYPE_START)
    {
        this.startStyle = LineArrow.STYLE_FILLED_TRIANGLE;
        this.endStyle = LineArrow.STYLE_NORMAL;
    }
    else if(type == LineArrow.TYPE_END)
    {
        this.startStyle = LineArrow.STYLE_NORMAL;
        this.endStyle = LineArrow.STYLE_FILLED_TRIANGLE;
    }
    else if(type == LineArrow.TYPE_BOTH)
    {
        this.startStyle = LineArrow.STYLE_FILLED_TRIANGLE;
        this.endStyle = LineArrow.STYLE_FILLED_TRIANGLE;
    }
    /**The {LineArrowPoint}'s id that is currently being dragged*/
    this.activeConnectionPointId = -1;
    
    /**Serialization type*/
    this.oType = 'LineArrow'; //object type used for JSON deserialization

    this.visibility = true;
}

/**Straight linearrow type*/
LineArrow.TYPE_STRAIGHT = 'straight';
LineArrow.TYPE_START = 'start';
LineArrow.TYPE_END = 'end';
LineArrow.TYPE_BOTH = 'both';


/**Normal end linearrow style*/
LineArrow.STYLE_NORMAL = "Normal";

/**Arrow like end linearrow style*/
LineArrow.STYLE_ARROW = "Arrow";

/**Empty triangle end linearrow style*/
LineArrow.STYLE_EMPTY_TRIANGLE = "Empty";

/**Filled triangle end linearrow style*/
LineArrow.STYLE_FILLED_TRIANGLE = "Filled";

/**End linearrow arrow size*/
LineArrow.ARROW_SIZE = 12;

/**End linearrow arrow angle*/
LineArrow.ARROW_ANGLE = 15;


/**User change horizontal align*/
LineArrow.USER_CHANGE_HORIZONTAL_ALIGN = 'h';

/**User change vertical align*/
LineArrow.USER_CHANGE_VERTICAL_ALIGN = 'v';


LineArrow.load = function(o){
    var newLineArrow = new LineArrow(new Point(0,0), new Point(0,0), LineArrow.TYPE_STRAIGHT, 0); //fake constructor
    newLineArrow.id = o.id;

    newLineArrow.name = o.name;
    newLineArrow.turningPoints = Point.loadArray(o.turningPoints);
    newLineArrow.type = o.type;
    newLineArrow.userChanges = o.userChanges;
    newLineArrow.solution = o.solution;
    newLineArrow.style = Style.load(o.style);

    newLineArrow.endStyle = o.endStyle;
    newLineArrow.startStyle = o.startStyle;

    newLineArrow.activeConnectionPointId = o.activeConnectionPointId;
    newLineArrow.visibility = o.visibility;
    return newLineArrow;
}

LineArrow.loadArray = function(v){
    var newLineArrows = [];

    for(var i=0; i<v.length; i++){
        newLineArrows.push(LineArrow.load(v[i]));
    }

    return newLineArrows;
}

LineArrow.prototype = {
    
    constructor : LineArrow,
    
    getArrow:function(x,y){
        var startPoint = new Point(x,y);
        var line = new Line(startPoint.clone(),Util.getEndPoint(startPoint,LineArrow.ARROW_SIZE, Math.PI/180*LineArrow.ARROW_ANGLE));
        var line1 = new Line(startPoint.clone(),Util.getEndPoint(startPoint,LineArrow.ARROW_SIZE, Math.PI/180*-LineArrow.ARROW_ANGLE));
   
        var path = new Path();

        path.style = this.style;
        line.style = this.style;
        line1.style = this.style;
        
        path.addPrimitive(line);
        path.addPrimitive(line1);
        
        return path;
    },

    
    getTriangle:function(x,y,fill){

        var startPoint = new Point(x,y);
        var point2 = Util.getEndPoint(startPoint,LineArrow.ARROW_SIZE, Math.PI/180*LineArrow.ARROW_ANGLE);
        var point3 = Util.getEndPoint(startPoint, LineArrow.ARROW_SIZE, - Math.PI/180*LineArrow.ARROW_ANGLE);
        
        var tri = new Polygon();
        tri.addPoint(startPoint);
        tri.addPoint(point2);
        tri.addPoint(point3);
        
        tri.style = this.style.clone();
        if(fill){
            tri.style.fillStyle = this.style.strokeStyle;
        }
        else{
            tri.style.fillStyle = '#FFFFFF';
        }
        
        return tri;
    },


    
    paint:function(context){
        //Do the start and end point match?
        if (this.areStartEndPointsMatch()) {
            // then not paint LineArrow at all
            return;
        }

        context.save();
        
        this.style.setupContext(context);
                context.beginPath();

                //paint linearrow's line
                context.moveTo(this.turningPoints[0].x, this.turningPoints[0].y);
        
                for(var i=1; i< this.turningPoints.length; i++){
                    //start style
                    if(this.startStyle == LineArrow.STYLE_EMPTY_TRIANGLE && i == 1){ //special case
                        //get the angle of the start line
                        var angle = Util.getAngle(this.turningPoints[0],this.turningPoints[1]);
                        var newPoint = Util.getEndPoint(this.turningPoints[0], LineArrow.ARROW_SIZE * Math.cos(Math.PI/180 * LineArrow.ARROW_ANGLE), angle);
                        //move to new start
                        context.moveTo(newPoint.x, newPoint.y);
                    }
            
                    //end style
                    if(this.endStyle == LineArrow.STYLE_EMPTY_TRIANGLE && i == this.turningPoints.length -1){ //special case 
                        //get the angle of the final line
                        var angle = Util.getAngle(this.turningPoints[i-1],this.turningPoints[i]);
                        var newPoint = Util.getEndPoint(this.turningPoints[i], -LineArrow.ARROW_SIZE * Math.cos(Math.PI/180 * LineArrow.ARROW_ANGLE), angle)
                        //line to new end
                        context.lineTo(newPoint.x, newPoint.y);
                    }
                    else{
                        context.lineTo(this.turningPoints[i].x, this.turningPoints[i].y);
                    }
                }
                context.stroke();
        this.paintStart(context);
        this.paintEnd(context);

        
        
        context.restore();
    },
    
    paintStart : function(context){
        //paint start style
        var path = null;
        if(this.startStyle == LineArrow.STYLE_ARROW){
            path = this.getArrow(this.turningPoints[0].x, this.turningPoints[0].y);
        }
        if(this.startStyle == LineArrow.STYLE_EMPTY_TRIANGLE){
            path = this.getTriangle(this.turningPoints[0].x, this.turningPoints[0].y, false);
        }
        if(this.startStyle == LineArrow.STYLE_FILLED_TRIANGLE){
            path = this.getTriangle(this.turningPoints[0].x, this.turningPoints[0].y, true);
        }


        //move start path(arrow, triangle, etc) into position
        if(path){
            var transX = this.turningPoints[0].x;
            var transY = this.turningPoints[0].y;

            var lineAngle = Util.getAngle(this.turningPoints[0], this.turningPoints[1], 0);
            path.transform(Matrix.translationMatrix(-transX, -transY));
            path.transform(Matrix.rotationMatrix(lineAngle));
            path.transform(Matrix.translationMatrix(transX,transY));

            context.save();

            //context.lineJoin = "miter";
            context.lineJoin = "round";
            context.lineCap = "round";
            path.paint(context);
            
            context.restore();
        }
    },
    
    paintEnd : function(context){
        //paint end style
        var path = null;
        if(this.endStyle == LineArrow.STYLE_ARROW){
            path = this.getArrow(this.turningPoints[this.turningPoints.length-1].x, this.turningPoints[this.turningPoints.length-1].y);
        }
        if(this.endStyle == LineArrow.STYLE_EMPTY_TRIANGLE){
            path = this.getTriangle(this.turningPoints[this.turningPoints.length-1].x, this.turningPoints[this.turningPoints.length-1].y, false);
        }
        if(this.endStyle == LineArrow.STYLE_FILLED_TRIANGLE){
            path = this.getTriangle(this.turningPoints[this.turningPoints.length-1].x, this.turningPoints[this.turningPoints.length-1].y, true);
        }

        //move end path (arrow, triangle, etc) into position
        if(path){
            var transX = this.turningPoints[this.turningPoints.length-1].x;
            var transY = this.turningPoints[this.turningPoints.length-1].y;
            var lineAngle = Util.getAngle(this.turningPoints[this.turningPoints.length-1], this.turningPoints[this.turningPoints.length-2], 0);
            
            path.transform(Matrix.translationMatrix(-transX, -transY));
            path.transform(Matrix.rotationMatrix(lineAngle));
            path.transform(Matrix.translationMatrix(transX, transY));

            context.save();

            context.lineJoin = "round";
            context.lineCap = "round";

            path.paint(context);

            context.restore();
        }
    },
    
    
    
    transform:function(matrix){

        //are we moving the whole LineArrow, or just one point?
        if(this.activeConnectionPointId != -1){
            var point = LineArrow_MANAGER.linearrowPointGetById(this.activeConnectionPointId);
            point.transform(matrix);
        }
        else{
            for(var i=0; i<this.turningPoints.length; i++){
                this.turningPoints[i].transform(matrix);
            }
        }

    },

    connect2Points:function(p1, p2){
        var solutions = [];

        if(p1.equals(p2)){
            
        }
        
        return solutions;
    },

    redraw:function(){
        if(this.type=='jagged'){
            var changed=true;
            while(changed==true){
                changed=false;
                for(var i=1; i<this.turningPoints.length-2; i++){
                    if(this.turningPoints[i].x == this.turningPoints[i-1].x && this.turningPoints[i-1].x == this.turningPoints[i+1].x){
                        this.turningPoints.splice(i,1);
                        changed=true;
                    }
                    if(this.turningPoints[i].y == this.turningPoints[i-1].y && this.turningPoints[i-1].y == this.turningPoints[i+1].y){
                        this.turningPoints.splice(i,1);
                        changed=true;
                    }
                }
            }
            
        }
    },

    adjust:function(matrix, point){
        
        //Log.info('Adjusting...');
        if(this.type == LineArrow.TYPE_STRAIGHT){
            //Log.info("straight ");
            
            var tempConPoint = LineArrow_MANAGER.linearrowPointGetByParentAndCoordinates(this.id, point.x, point.y);

            //find index of the turning point
            var index = -1;
            if(this.turningPoints[0].equals(point)){
                index = 0;
            }
            else if(this.turningPoints[1].equals(point)){
                index = 1;
            }
            else{
                Log.error("LineArrow:adjust() - This should not happend" + this.toString() + ' point is ' + point);
            }

            
            //Log.info('\tinitial' +  tempConPoint.toString());
            tempConPoint.transform(matrix);
            //Log.info('\tafter' +  tempConPoint.toString());


            this.turningPoints[index].x = tempConPoint.point.x;
            this.turningPoints[index].y = tempConPoint.point.y;

        }

    },


    areStartEndPointsMatch: function() {
        return this.turningPoints[0].equals(this.turningPoints[this.turningPoints.length - 1]);
    },
    

    contains:function(x,y){
        var r = false;
       
                for(var i=0; i<this.turningPoints.length-1; i++){
                    var l = new Line(this.turningPoints[i],this.turningPoints[i+1]);
                    if( l.contains(x, y) ){
                        r = true;
                        break;
                    }
                }
        
        return r;
    },

    near:function(x,y,radius){
        var r = false;
                for(var i=0; i<this.turningPoints.length-1; i++){
                    var l = new Line(this.turningPoints[i],this.turningPoints[i+1]);
                    if( l.near(x, y, radius) ){
                        r = true;
                        break;
                    }
                }
                
        return r;                
    },


    getBounds:function(){
       
        var minX = null;
        var minY = null;
        var maxX = null;
        var maxY = null;
        for(var i=0; i<this.turningPoints.length; i++){
            if(this.turningPoints[i].x<minX || minX==null)
                minX = this.turningPoints[i].x;
            if(this.turningPoints[i].x>maxX || maxX==null)
                maxX = this.turningPoints[i].x;
            if(this.turningPoints[i].y<minY || minY==null)
                minY = this.turningPoints[i].y;
            if(this.turningPoints[i].y>maxY || maxY==null)
                maxY = this.turningPoints[i].y;
        }
        return [minX, minY, maxX, maxY];
    },
    
    /**String representation*/
    toString:function(){
        return 'LineArrow : (id = ' + this.id
            + ', type = ' + this.type
            + ', turningPoints = [' + this.turningPoints + ']'
            + ', userChanges = [' + this.userChanges + ']'
            + ', solution = ' + this.solution
            + ', startStyle = ' + this.startStyle
            + ', endStyle = ' + this.endStyle
            + ', activeConnectionPointId = ' + this.activeConnectionPointId
            + ')';
    },


}


function LineArrowPoint(parentId,point,id, type){
    /**Connection point id*/
    this.id = id;
    
    /**The {Point} that is behind this LineArrowPoint*/
    this.point = point.clone(); //we will create a clone so that no side effect will appear
    
    /**Parent id (id of the Figure or LineArrow)*/
    this.parentId = parentId;
    
    /**Type of LineArrowPoint. Ex: LineArrowPoint.TYPE_FIGURE*/
    this.type = type;
    
    /**Current connection point color*/
    this.color = LineArrowPoint.NORMAL_COLOR;
    
    /**Radius of the connection point*/
    this.radius = 10;
    
    /**Serialization type*/
    this.oType = 'LineArrowPoint'; //object type used for JSON deserialization

}

/**Color used by default to draw the connection point*/
LineArrowPoint.NORMAL_COLOR = "#CCC"; //yellow.

/*Color used to signal that the 2 connection points are about to glue*/
LineArrowPoint.OVER_COLOR = "#FF9900"; //orange

/*Color used to draw connected (glued) connection points*/
LineArrowPoint.CONNECTED_COLOR = "#ff0000"; //red

/**Connection point default radius*/
LineArrowPoint.RADIUS = 10;

/**Connection point (liked to)/ type figure*/
LineArrowPoint.TYPE_FIGURE = 'figure';

/**Connection point (liked to)/ type linearrow*/
LineArrowPoint.TYPE_CONNECTOR = 'linearrow';

LineArrowPoint.load = function(o){
    var newConnectionPoint = new LineArrowPoint(0, new Point(0,0), LineArrowPoint.TYPE_FIGURE); //fake constructor

    newConnectionPoint.id = o.id;
    newConnectionPoint.point = Point.load(o.point);
    newConnectionPoint.parentId = o.parentId;
    newConnectionPoint.type = o.type;
    
    newConnectionPoint.color = o.color;
    newConnectionPoint.radius = o.radius;

    return newConnectionPoint;
}

LineArrowPoint.loadArray = function(v){
    var newConnectionPoints = [];

    for(var i=0; i<v.length; i++){
        newConnectionPoints.push(LineArrowPoint.load(v[i]));
    }

    return newConnectionPoints;
}


LineArrowPoint.cloneArray = function(v){
    var newConnectionPoints = [];
    for(var i=0; i< v.length; i++){
        newConnectionPoints.push(v[i].clone());
    }
    return newConnectionPoints;
}


LineArrowPoint.prototype = {
    constructor : LineArrowPoint,

    
    /**Clone current {LineArrowPoint}
     **/
    clone: function(){
        //parentId,point,id, type
        return new LineArrowPoint(this.parentId, this.point.clone(), this.id, this.type );
    },
    
    equals:function(anotherConnectionPoint){

        return this.id == anotherConnectionPoint.id
        && this.point.equals(anotherConnectionPoint.point)
        && this.parentId == anotherConnectionPoint.parentId
        && this.type == anotherConnectionPoint.type
        && this.color == anotherConnectionPoint.color
        && this.radius == anotherConnectionPoint.radius;    
    },

    paint:function(context){
        
        context.save();
        context.fillStyle = this.color;
        context.strokeStyle = '#000000';
        context.lineWidth = defaultThinLineWidth;
        context.beginPath();
        context.arc(this.point.x, this.point.y, LineArrowPoint.RADIUS, 0, (Math.PI/180)*360, false);
        context.globalAlpha = "0.3";
        context.stroke();
        context.fill();
        context.restore();
    },


    transform:function(matrix){
        this.point.transform(matrix);
    },

    
    /**Highlight the connection point*/
    highlight:function(){
        this.color = LineArrowPoint.OVER_COLOR;
    },

    /**Un-highlight the connection point*/
    unhighlight:function(){
        this.color = LineArrowPoint.NORMAL_COLOR;
    },


    contains:function(x, y){
        return this.near(x, y, LineArrowPoint.RADIUS);
    },

    near:function(x, y, radius){
        return new Point(this.point.x,this.point.y).near(x,y,radius);
    },
    

    /**A String representation of the point*/
    toString:function(){
        return "LineArrowPoint id = " + this.id  + ' point = ['+ this.point + '] ,type = ' + this.type + ", parentId = " + this.parentId + ")";
    }
}




function LineArrowManager(){
    /**An {Array} of {LineArrow}s. Keeps all Connectors from canvas*/
    this.linearrows = [];
    
    /**An {Array} of {LineArrowPoint}s. Keeps all ConnectionPoints from canvas*/
    this.connectionPoints = []; 
    
    /**Used to generate unique IDs for LineArrowPoint*/
    this.connectionPointCurrentId = 0; //

    
    this.connectionMode = LineArrowManager.MODE_DISABLED;
}

// defines current cloud's paint details
LineArrowManager.CLOUD_RADIUS = 12;
LineArrowManager.CLOUD_LINEWIDTH = 3;
LineArrowManager.CLOUD_STROKE_STYLE = "rgba(255, 153, 0, 0.8)"; //orange

LineArrowManager.load = function(o){
    var newLineArrowManager = new LineArrowManager(); //empty constructor

    var localLog = '';

    //1 - load linearrows
    localLog += '\nCONNECTORS';
    newLineArrowManager.linearrows = LineArrow.loadArray(o.linearrows);    
//    newLineArrowManager.connectorSelectedIndex = o.connectorSelectedIndex;
    for(var i=0;i<newLineArrowManager.linearrows.length;i++){
        localLog += '\n' + newLineArrowManager.linearrows[i].toString();
    }

    //2 - load connection points
    localLog += '\nCONNECTION POINTS';
    newLineArrowManager.connectionPoints = LineArrowPoint.loadArray(o.connectionPoints);
    for(var i=0;i<newLineArrowManager.connectionPoints.length; i++){
        localLog += "\n" +  newLineArrowManager.connectionPoints[i].toString();
    }
    //alert(str);
    
//    newLineArrowManager.connectionPointSelectedIndex = o.connectionPointSelectedIndex;
    newLineArrowManager.connectionPointCurrentId = o.connectionPointCurrentId;


    
    newLineArrowManager.connectionMode = o.connectionMode;

    return newLineArrowManager ;
}

LineArrowManager.prototype = {
    
    constructor : LineArrowManager,
    
    
    /**Export the entire ConnectionManager to SVG format*/
    toSVG : function(){
        var r = '';
        
        for(var i=0; i<this.linearrows.length; i++){
            r += this.linearrows[i].toSVG();
        }

        return r;
    },

    linearrowCreate:function(startPoint,endPoint,type){
        //get a new id for LineArrow
        var id = STACK.generateId();

        //create and save linearrow
        this.linearrows.push(new LineArrow(startPoint,endPoint,type, id));

        //create ConnectionPoints for LineArrow
        this.linearrowPointCreate(id, startPoint, LineArrowPoint.TYPE_CONNECTOR);
        this.linearrowPointCreate(id, endPoint, LineArrowPoint.TYPE_CONNECTOR);

        //log
        var c = this.linearrowGetById(id);
        //alert('log:linearrowCreate: linearrow has ' + c.turningPoints.length);

        return id;
    },


    linearrowRemove:function(linearrow){
        this.linearrowRemoveById(linearrow.id, true);
    },


    linearrowRemoveById:function(connectorId, cascade){
        
        if(cascade){
            
            //remove all affected ConnectionPoints 
            this.linearrowPointRemoveAllByParent(connectorId);
        }
        
        //remove the linearrow
        for(var i=0; i<this.linearrows.length; i++){
            if(this.linearrows[i].id == connectorId){
                this.linearrows.splice(i,1);
                break;
            }//end if
        }//end for
    },


    linearrowPaint:function(context, highlightedConnectorId){
        for(var i=0; i<this.linearrows.length; i++){
            if(this.linearrows[i].visibility)
            {
                this.linearrows[i].paint(context);
                if(this.linearrows[i].id == highlightedConnectorId){
                    this.linearrowPointPaint(context, this.linearrows[i].id)
                }
            }    
         }
    },

    
    linearrowSelectXY:function(x,y){
        //try to pick the new selected linearrow
        this.connectorSelectedIndex = -1;
        for(var i=0; i<this.linearrows.length; i++){
            if(this.linearrows[i].contains(x,y)){
                this.connectorSelectedIndex = i;
                break;
            }
        }
    },


    linearrowGetSelected:function(){
        if(this.connectorSelectedIndex!=-1){
            return this.linearrows[this.connectorSelectedIndex];
        }
        return null;
    },


    linearrowGetById:function(connectorId){
        for(var i=0; i<this.linearrows.length; i++){
            if(this.linearrows[i].id == connectorId){
                return this.linearrows[i];
            }
        }
        return null;
    },


    linearrowGetByXY:function(x,y){
        var id = -1;
        for(var i=0; i<this.linearrows.length; i++){
            if(this.linearrows[i].near(x, y, 3)){
                id = this.linearrows[i].id;
                break;
            }
        }
        return id;
    },


    linearrowPointGetFirstForConnector : function(connectorId) {
        return this.linearrowPointGetAllByParentIdAndType(connectorId, LineArrowPoint.TYPE_CONNECTOR)[0];
    },
    
    
    linearrowPointGetSecondForConnector : function(connectorId) {
        return this.linearrowPointGetAllByParentIdAndType(connectorId, LineArrowPoint.TYPE_CONNECTOR)[1];
    },

    linearrow2Points: function(type,  startPoint, endPoint, sBounds, eBounds ){
        var oldLogLevel = Log.level;
        
        Log.group("connectionManager: linearrow2Points");
        
        
        Log.info("ConnectionManager: linearrow2Points (" + type + ", " + startPoint + ", " + endPoint + ", " + sBounds + ", " + eBounds + ')');
        var solutions = [];
        
        
        
                var points = [startPoint.clone(), endPoint.clone()];
                solutions.push( ['straight', 'straight', points] );
        Log.groupEnd();
        
        Log.level = oldLogLevel; 
        
        return solutions;
    },
    
    
    /**Reset this ConnectionManager*/
    reset:function(){
        this.linearrows = [];
        this.connectorSelectedIndex = -1;
        this.connectionPoints = [];
        this.connectionPointSelectedIndex = -1;
        this.connectionPointCurrentId = 0;
    },
    


    linearrowPointGetSelected:function(){
        if(this.connectionPointSelectedIndex == -1){
            return null
        }
        return this.connectionPoints[this.connectionPointSelectedIndex];
    },

    linearrowPointGetByXY:function(x,y, type){
        var id = -1;

        for(var i=0; i<this.connectionPoints.length; i++){
            if( this.connectionPoints[i].contains(x,y) && this.connectionPoints[i].type == type ){
                id = this.connectionPoints[i].id;
                break;
            }
        }

        return id;
    },

    linearrowPointGetByXYRadius: function(x,y, radius, type, ignoreConPoint) {
        var curId = -1,
            closestId = -1,
            curX,
            curY,
            minDistance = -1,
            curDistance;

        for (curX = x - radius; curX <= x + radius; curX++) {
            for (curY = y - radius; curY <= y + radius; curY++) {
                if ( !ignoreConPoint.contains(curX,curY) ) {
                    curId = this.linearrowPointGetByXY(curX, curY, type);
                    if (curId !== -1) {
                        curDistance = Math.sqrt( Math.pow(curX - x, 2) + Math.pow(curY - y, 2) );
                        if (minDistance === -1 || curDistance < minDistance) {
                            minDistance = curDistance;
                            closestId = curId;
                        }
                    }
                }
            }
        }

        return closestId;
    },


    linearrowPointsResetColor : function(){
        for(var i=0; i<this.connectionPoints.length; i++){
            this.connectionPoints[i].color = LineArrowPoint.NORMAL_COLOR;
        }
    },

    linearrowPointCreate:function(parentId, point, type){
        var conPoint = new LineArrowPoint(parentId, point.clone(), this.connectionPointCurrentId++, type);
        this.connectionPoints.push(conPoint);
        
        return conPoint;
    },


    linearrowPointAdd:function(connectionPoint){
        this.connectionPoints.push(connectionPoint);
    },


    linearrowPointRemoveAllByParent:function(parentId){
        for(var i=0; i<this.connectionPoints.length; i++){
            if(this.connectionPoints[i].parentId == parentId){
                this.connectionPoints.splice(i,1);
                i--;
            }
        }
    },


    linearrowPointGetById:function(connectionPointId){
        for(var i=0; i<this.connectionPoints.length; i++){
            if(this.connectionPoints[i].id == connectionPointId){
                return this.connectionPoints[i];
            }
        }
        return null;
    },
    
    
    linearrowPointGetByParentAndCoordinates:function(parentId, x, y){
        for(var i=0; i<this.connectionPoints.length; i++){
            if(this.connectionPoints[i].parentId == parentId 
                && this.connectionPoints[i].point.x == x
                && this.connectionPoints[i].point.y == y

                )
                {
                return this.connectionPoints[i];
            }
        }
        return null;
    },


    linearrowPointGetAllByParent:function(parentId){
        var collectedPoints = [];
       
        for(var connectionPoint in this.connectionPoints){
            if(this.connectionPoints[connectionPoint].parentId == parentId){
                collectedPoints.push(this.connectionPoints[connectionPoint]);
            }
        }
        return collectedPoints;
    },
    
    
    linearrowPointGetAllByParentIdAndType:function(parentId, type){
        var collectedPoints = [];
       
        for(var cpIndex in this.connectionPoints){
            if(this.connectionPoints[cpIndex].parentId == parentId && this.connectionPoints[cpIndex].type == type){
                collectedPoints.push(this.connectionPoints[cpIndex]);
            }
        }
        return collectedPoints;
    },


    
    linearrowPointOver:function(x, y, parentFigureId){
        var foundedConnectionPoint = null;

        if(typeof(parentFigureId) == 'number'){ //we have a Figure id specified
            if(parentFigureId < 0 ){ //search whole canvas except a figure
                for(var canvasConnectionPoint in this.connectionPoints){
                    if(this.connectionPoints[canvasConnectionPoint].parentId != -parentFigureId && this.connectionPoints[canvasConnectionPoint].contains(x,y)){
                        this.connectionPoints[canvasConnectionPoint].color = LineArrowPoint.OVER_COLOR;
                        foundedConnectionPoint = this.connectionPoints[canvasConnectionPoint];
                    }
                }
            }
            else{ //search only a  figure
                var figureConnectionPoints = this.linearrowPointGetAllByParent(parentFigureId);
                for(var figureConnectionPoint in figureConnectionPoints){
                    if(figureConnectionPoints[figureConnectionPoint].contains(x,y)){
                        figureConnectionPoints[figureConnectionPoint].color = LineArrowPoint.OVER_COLOR;
                        foundedConnectionPoint = figureConnectionPoints[figureConnectionPoint];
                    }
                }
            }
        }
        else{ //search whole canvas
            for(var connectionPoint in this.connectionPoints){
                if(this.connectionPoints[connectionPoint].contains(x,y)){
                    this.connectionPoints[connectionPoint].color = LineArrowPoint.OVER_COLOR;
                    foundedConnectionPoint = this.connectionPoints[connectionPoint];
                }
            }
        }
        

        return foundedConnectionPoint;
    },
    

    linearrowPointPaint:function(context, parentFigureId){
        var figureConnectionPoints = this.linearrowPointGetAllByParent(parentFigureId);
        
        for(var conPoint in figureConnectionPoints){
            figureConnectionPoints[conPoint].paint(context);
        }
    },

    clone : function(o){
        if (null == o) return o;
        var copy = new LineArrowManager();
        for (var attr in o) {
            if (o.hasOwnProperty(attr)) copy[attr] = o[attr];
        }
        return copy;
    }

}

var LineArrow_MANAGER = new LineArrowManager();
function LineArrowCreateCommand(connectorId){
    this.oType = 'LineArrowCreateCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = false;
    
    this.firstExecute = true;
    
    this.connectorId = connectorId;
    this.linearrow = LineArrow_MANAGER.linearrowGetById(this.connectorId);
    this.connectionpoints = LineArrow_MANAGER.linearrowPointGetAllByParentIdAndType(this.connectorId, LineArrowPoint.TYPE_CONNECTOR);
            
}


LineArrowCreateCommand.prototype = {
    /**This method got called every time the Command must execute*/
    execute : function(){
        if(this.linearrow){
            //add back the connecor
            LineArrow_MANAGER.linearrows.push(this.linearrow);
            
            //add back the connection points
            LineArrow_MANAGER.connectionPoints = LineArrow_MANAGER.connectionPoints.concat(this.connectionpoints);
            redraw = true;
        }
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){ 
        LineArrow_MANAGER.linearrowRemoveById(this.connectorId, true);

        // if current linearrow is in text editing state
        if (state == STATE_TEXT_EDITING) {
            // remove current text editor
            currentTextEditor.destroy();
            currentTextEditor = null;
        }
        
        state = STATE_NONE;
        selectedLineArrowId = -1;
    }
}
function LineArrowAlterCommand(connectorId){
    this.oType = 'LineArrowAlterCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = false;
    
    this.firstExecute = true;
    
    this.connectorId = connectorId;
    
    var con = LineArrow_MANAGER.linearrowGetById(this.connectorId);
    
    
    
    //-------------------store previous state-------------------------------
    
    //TODO: totally inefficient (massive storage) - we should store deltas
    this.turningPoints = Point.cloneArray(con.turningPoints);
    this.connectionPoints = LineArrowPoint.cloneArray(LineArrow_MANAGER.connectionPoints);            
    this.newturningPoints = null;
    this.newconnectionPoints = null;            
    
}


LineArrowAlterCommand.prototype = {
    /**This method got called every time the Command must execute*/
    execute : function(){
            var con = LineArrow_MANAGER.linearrowGetById(this.connectorId);
            con.turningPoints = this.newturningPoints;
            con.userChanges = this.userChanges;
            LineArrow_MANAGER.connectionPoints = this.newconnectionPoints;
            draw();
    },
    
    
    /**This method should be called every time the Command should be undone*/
    undo : function(){ 
        var con = LineArrow_MANAGER.linearrowGetById(this.connectorId);
        con.turningPoints = this.turningPoints;
        con.userChanges = this.userChanges;
        LineArrow_MANAGER.connectionPoints = this.connectionPoints;
        draw();
    }
}
function LineArrowDeleteCommand(connectorId){
    this.oType = 'LineArrowDeleteCommand';
    
    /**Any sequence of many mergeable actions can be packed by the history*/
    this.mergeable = false;
    
    this.connectorId = connectorId;
    
        
    this.firstExecute = true;
    
    
    this.linearrow = null;        
    this.connectionpoints = null;
}
LineArrowDeleteCommand.prototype = {
    
    /**This method got called every time the Command must execute*/
    execute : function(){  
        if(this.firstExecute){
            //---------SAVE DATA FOR UNDO------------
            //store linearrow
            this.linearrow = LineArrow_MANAGER.linearrowGetById(this.connectorId);
            
            //store linearrow's connectionpoints
            this.connectionpoints = LineArrow_MANAGER.linearrowPointGetAllByParentIdAndType(this.connectorId, LineArrowPoint.TYPE_CONNECTOR);
            
            //do the "real job"
            LineArrow_MANAGER.linearrowRemoveById(this.connectorId, true);
            
            selectedLineArrowId = -1;
            setUpEditPanel(canvasProps);
            state = STATE_NONE;
            redraw = true;       
            
            this.firstExecute = false;
        }
        else{ //a redo
            throw "Not implemented";
        }
    },

    
    /**This method should be called every time the Command should be undone*/
    undo : function(){        
        if(this.linearrow){
            //add back the connecor
            LineArrow_MANAGER.linearrows.push(this.linearrow);
            
            //add back the connection points
            LineArrow_MANAGER.connectionPoints = LineArrow_MANAGER.connectionPoints.concat(this.connectionpoints);
            
            redraw = true;
        }
    }
}


function onScreenKeyBoard($){
var sMode = false;
var gripXY,hit;
var c = 0;
var events = [];
var canvas, ctx, kbCanvas;
var strokes = [];
var drawing = false, clicked = false, grip = false;
var trashLetters = [];
var autofire, autoFireInt = 200, autofireX;
var objFocus;
function simpleSprite() { return {
    
}
}

function Sprite(o) {
    var s = simpleSprite();
    
    // Use new keys
    for (var k in o) {
        s[k] = o[k];
        
    }
    
    return s;
}
 var fps = 50;
 var fdur = 1000/fps;
var lastU = new Date();

function frameRate() {
    
    var n = (new Date()).getTime();
    if ((n-lastU)<fdur) return;
    lastU = n;
    if (events['mousemove']) {
        var e = events['mousemove'];
        strokes.push({x:e.x, y:e.y});
        kbCanvas.mousemove(e);
        kbCanvas.paint();
        
        if (sMode && drawing) { // For drawing keyboard paths
            ctx.beginPath();
            ctx.moveTo(strokes[0].x,strokes[0].y);
            
            for (var s=1; s<strokes.length;s++) {
                ctx.lineTo(strokes[s].x,strokes[s].y);
            }
            ctx.stroke();
        }
    } 
    
    //events = [];
    
}

var keyObjects = [];

var startKb =  function() {
        
        var canvas = document.createElement('canvas');
        
        if (!canvas.getContext){ 
                 alert("Sorry, your browser does not support html 5 canvas. Please try with another browser!!");
                 return;
             }
             
        var kbWidth = 435;
        var kbHeight = 175;
        
        // Setting Keyboard DOM attributes
        $(canvas).attr('id', 'onScreenKeyBoard')
        .attr('width', kbWidth)
        .attr('height', kbHeight)
        .attr('style', 'display:none;border: solid 2px #666; padding:5px; position: fixed; left:100px;\
            top:100px;\
            background:#262626;\
            ');
        
            
        // Centers Keyboard
        $(canvas).css({left: ($(window).width()-kbWidth)/2, top: ($(window).height()-kbHeight)/2});
                
             $('body').append(canvas);
             ctx = canvas.getContext("2d");
             CanvasTextFunctions.enable(ctx);
             
             var zz = 0;
             var handleKeyboardDrag =  function(e) {
                  if (grip) {       
                $('#onScreenKeyBoard').css({left:e.pageX - gripXY.x, 
                top:e.pageY - gripXY.y});
            }
          }
             
              kbCanvas = {
                elements:[],    
                paint:function() {
                    ctx.clearRect(0,0,canvas.width,canvas.height);
                    for (var e in this.elements) {
                        this.elements[e].paint();
                }
            },
            mousemove:function(e) {
                if (clicked) {
                    drawing = true;
                    
                }
                
                
                
                $('#out').html('Mouse moving');
                var hit = false; 
                for (var o in this.elements) {
                    var o2 = this.elements[o];
                    
                    
                    if (o2.ispressed) {
                        o2.isdragged = true;
                        if (typeof o2.drag == 'function') 
                        o2.drag(e);
                    }
                    
                    if (typeof o2.hover != 'function') continue;
                    
                    
                    if ((o2.x<e.x)&&(o2.y<e.y)&&
                        ((o2.x+o2.w)>e.x)&&
                        ((o2.y+o2.h)>e.y)) {
                        
                        if (typeof o2.hover == 'function') 
                            o2.hover(e);
                        hit = true;
                        
                    } else {
                        if (o2.ishover) {
                            o2.hoveroff(e);
                        }
                    }
                }
                if (!hit) {
                    $('#onScreenKeyBoard').css({cursor:'auto'});
                }
            },
            mousedown:function(e) {
                clicked =true;
                strokes = [];
                grip = true;
                gripXY = e;
                strokes.push({x:e.x, y:e.y});
                for (var o in this.elements) {
                    var o2 = this.elements[o];
                    
                    if ((o2.x<e.x)&&(o2.y<e.y)&&
                        ((o2.x+o2.w)>e.x)&&
                        ((o2.y+o2.h)>e.y)) {
                        o2.clicked = true;
                        grip = false;
                        if (typeof o2.mousedown == 'function')  {
                            o2.ispress = true;
                            o2.mousedown(e);
                            $( "textarea" ).change();
                        }
                        o2.paint();
                        
                        break;
                    }
                }
                
                if (grip) {
                    $(document).mousemove(handleKeyboardDrag);
                }
            },
            mouseup:function(e) {
                if (grip) {
                    $(document).unbind('mousemove', handleKeyboardDrag);
                }
                grip = false;
                clicked = false; drawing = false;
                for (var o in this.elements) {
                    var o2 = this.elements[o];
                    if (o2.ispress) {
                        
                        if (typeof o2.mouseup != 'function') continue;
                        if ((o2.x<e.x)&&(o2.y<e.y)&&
                            ((o2.x+o2.w)>e.x)&&
                            ((o2.y+o2.h)>e.y)) {
                            o2.mouseup(e);
                            hit = true;
                        }
                        o2.ispress = false;
                    }
                }
            }
             };
             

             
             
             // Keyboard Layout.
             var kbItems = [];
             kbItems[0] = [ 'close'];
             kbItems[1] = [ '`','1','2','3','4','5','6','7','8','9','0','-','=','del'];
             kbItems[2] = [ 'tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'];
             kbItems[3] = [ 'caps','a','s','d','f','g','h','j','k','l', ';','\'','enter'];
             kbItems[5] = [ 'shift ','z','x','c','v','b','n','m',',','.','/','shift'];
             kbItems[6] = [ 'space'];
             
             
        function roundedRect(ctx,x,y,width,height,radius,hover, click){  
            ctx.beginPath();  
            ctx.moveTo(x,y+radius);  
            ctx.lineTo(x,y+height-radius);  
            ctx.quadraticCurveTo(x,y+height,x+radius,y+height);  
            ctx.lineTo(x+width-radius,y+height);  
            ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);  
            ctx.lineTo(x+width,y+radius);  
            ctx.quadraticCurveTo(x+width,y,x+width-radius,y);  
            ctx.lineTo(x+radius,y);  
            ctx.quadraticCurveTo(x,y,x,y+radius);  
            
            // 000 333 666 dark light ligher
            // click hover default 000 555 aaa , 000 999 555
            if (click) {
                ctx.strokeStyle = "#000";
                ctx.stroke();
                
            } else 
            if (hover) {
                ctx.strokeStyle = "#555";
                
                ctx.stroke();
                //ctx.fillStyle = "yellow"; 
                //ctx.fill();  
            } else {
                ctx.strokeStyle = "#A8A8A8";
                ctx.stroke();
            }
        }  
        
        function hover() {
            $('#out').html(':)');
            this.ishover = true;
            //kbCanvas.paint();
            $('#onScreenKeyBoard').css({cursor:'pointer'});
        }
        
        function hoveroff() {
            this.ishover = false;
            this.ispress = false;
            $('#onScreenKeyBoard').css({cursor:'auto'});
        }
        
        function replaceIt(txtarea, newtxt) {
            if (!txtarea) return;
            
            // IE txtarea.selection
            //document.selection.createRange().text = 'Some new text';

            
            var oldtxt = $(txtarea).val();
            var start = txtarea.selectionStart;
            var end = txtarea.selectionEnd;
            if (autofireX > -1) { autofireX+= newtxt.length ; 
            start =  end = autofireX;  } // Work around for Chrome
            else { autofireX = start; }
             
            var select = end - start;
            
            //$('#out2').append('start '+start + ' end ' +end+ ' select ' + select + ' ' + newtxt.length  + '<br />');
            
          $(txtarea).val(
            oldtxt.substr(0, start)+
            newtxt+
            oldtxt.substr(end)
           );
          
          
          //if (select>0) // There's no need for checking selection here? 
          if (txtarea.setSelectionRange) {
             txtarea.setSelectionRange(start+newtxt.length , start+newtxt.length);
          }
          
          
         // txtarea.focus();
         
        }

        
        function lettermousepress() {
            replaceIt(findFocusTarget(),this.txt);
            
            // Set autofire
            
            autofire = window.setInterval(replaceIt, autoFireInt,
                findFocusTarget(),this.txt);
            
            
        }
        
        function mouseup() {
            this.ispress = false;
        }
             
             function paint() {
            
                if(this.txt == "close")
                {
                    roundedRect(ctx, (this.x-5) , this.y-5, this.w, 15, 5, this.ishover, this.ispress ); 
                    //ctx.strokeRect(this.x , this.y, this.w, this.h ); //ctx.fillText(this.txt, this.x + this.w/2, this.y + this.h/2);
                    ctx.drawText(null,10, 20 + this.w/2, (this.y-5) + 15/2+5, 'On-screen Keyboard');
                    ctx.drawText(null,10, 250, (this.y-5) + 15/2+5, '[Drag Here]');
                    ctx.drawTextCenter(null,10, (this.x-5) + this.w/2, (this.y-5) + 15/2+5, 'X');
                }
                else
                {
                    roundedRect(ctx, this.x-5 , this.y-5, this.w, this.h, 5, this.ishover, this.ispress ); 
                    //ctx.strokeRect(this.x , this.y, this.w, this.h ); //ctx.fillText(this.txt, this.x + this.w/2, this.y + this.h/2);
                    ctx.drawTextCenter(null,10,(this.x-5) + this.w/2, (this.y-5) + this.h/2+5, this.txt);   
                }
                 
             }
             
             function lookupwidth(c) {
                 if (c=='tab') return 35;
                 if (c=='del') return 35;
                 if (c=='caps') return 45;
                 if (c=='enter') return 44;
                 if (c=='shift') return 59;
                 if (c=='shift ') return 59;
                 if (c=='reserved') return 60;
                 if (c=='space') return 425;
                 
                 return 25;
             }
             
             
             // Init Objects
             
             
             var kx,ky;
             var starting = true;
             var padding = 5;
             ky = padding;

             for (var i1 in kbItems) {

                 kx = padding+5;
                 if(starting)
                 {
                    kx = 400;
                 } 
                 for (var i2 in kbItems[i1]) {
                     var key1 = kbItems[i1][i2]
                     
                     
                     var item = {txt: key1, x:kx, y:ky, w:lookupwidth(key1), h:25, 
                     paint:paint,
                     hover:hover,
                     hoveroff:hoveroff,
                     mousedown:lettermousepress,
                     mouseup:mouseup};
                     kx += item.w + padding;
                     
                     keyObjects[key1] = item;
                     kbCanvas.elements.push(keyObjects[key1]);
                 }
                if(starting)
                    ky += padding + 15;
                else
                    ky += padding + 25;
                starting = false;
             }
             
             /* Key Bindings*/
             
             function kd(key) {
                 if ($(findFocusTarget()).attr('type')=='password') return;
                 keyObjects[key].ispress = true; keyObjects[key].paint();
                 
             }
             function ku(key) { keyObjects[key].ispress = false; kbCanvas.paint(); }
             
             function findFocusTarget() {
                 var target = $(':focus');
                 
             if (target.is('input') || target.is('textarea') ) {
                 return target[0];
             } else {
                 return null;
             }
                
             }
             
       
             keyObjects['caps'].mousedown = function() {
                 var lower = ( keyObjects['a'].txt=='a');
                 
                 var az = 'abcdefghijklmnopqrstuvwxyz';
                 if (lower) az = az.toUpperCase();
                 
                 for (var i in az) {
                     keyObjects[az[i].toLowerCase()].txt = az[i]; 
                 }
                 
                 var charsLower = '`1234567890-=[]\\;\',./';
                 var charsUpper = '~!@#$%^&*()_+{}|:"<>?';
                 
                 if (lower) {
                     for (var i in charsLower) {
                         keyObjects[charsLower[i]].txt = charsUpper[i]; 
                     }
                 } else {
                     for (var i in charsLower) {
                         keyObjects[charsLower[i]].txt = charsLower[i]; 
                     }
                 }
                 
                 kbCanvas.paint();
             }
             
             // To Implement Reserved keys for Language options perhaps?
             //keyObjects['reserved'].mousedown = null;
             
             // To implement proper shift
             keyObjects['shift '].mousedown = keyObjects['caps'].mousedown;
             
             // To implement proper shift
             keyObjects['shift'].mousedown = keyObjects['caps'].mousedown;
             
             keyObjects['space'].mousedown = function() {
                 replaceIt(findFocusTarget(),' ');
                 autofire = window.setInterval(replaceIt, autoFireInt,
                findFocusTarget(),' ');
             }
             keyObjects['close'].mousedown = function() {
                $('#onScreenKeyBoard').toggle();
             }
             keyObjects['enter'].mousedown = function() {
                 replaceIt(findFocusTarget(),'\n');
                 autofire = window.setInterval(replaceIt, autoFireInt,
                findFocusTarget(),'\n');
             }
             
             keyObjects['del'].mousedown = function() {
                 txtarea = objFocus;
                if (!txtarea) return;
                        
            
            var start = txtarea.selectionStart;
            var end = txtarea.selectionEnd;
            var oldtxt = $(txtarea).val();
            
            var af = (autofireX > -1);
            
            if (af) { start =  end = --autofireX;  } // Work around for Chrome
            
            
            var selection = end - start;
            
            if ((selection ==0) || af) {
                
                var newstr = oldtxt.substr(0, start-1)+
                    oldtxt.substr(end);
                                    
                $(txtarea).val(newstr);
              
              
                   if (txtarea.setSelectionRange) {
                      txtarea.setSelectionRange(start-1,start-1);
        
                  }
            
            } else {
                replaceIt(objFocus,'');
            }
            
            if (!af) { autofireX = start; }
            
            autofire = window.setTimeout(keyObjects['del'].mousedown, autoFireInt);
             }
             
             keyObjects['tab'].mousedown = function() {
                 replaceIt(findFocusTarget(),'\t');
             }
             
   
             // Set event handlers for the main Canvas
        $('#onScreenKeyBoard').mousemove(function(e) {
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;
            //kbCanvas.mousemove({x:x,y:y});
            events['mousemove'] = {x:x,y:y};
            frameRate();
        }).mousedown(function(e) {
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;
            objFocus = findFocusTarget();
            kbCanvas.mousedown({x:x,y:y});
            
                        
        }).mouseup(function(e) {
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;
            kbCanvas.mouseup({x:x,y:y});
            
            // Stop the auto fire!
            window.clearInterval(autofire);
            autofireX = -1;
            
            if (objFocus) objFocus.focus();  
        });
        $('body').mouseup(function(e){
            var x = e.pageX - $(this).offset().left;
              var y = e.pageY - $(this).offset().top;
            kbCanvas.mouseup({x:x,y:y});
            
            // Stop the auto fire!
            window.clearInterval(autofire);
            autofireX = -1;
            
          });
        kbCanvas.paint();
        //setInterval(frameRate,1000/fps); // Auto fire rate
}

startKb();
}
/* Jquery Button Clicks */

$(document).ready(function() {
    onScreenKeyBoard($);
    //Tabination
    $( ".tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
    
    
    $("body").on('click',".inline-brush",function(){
        var obj = STACK.figureGetById(selectedFigureId);
        if(obj.name=="Text")
        getTag();
        else
        tagCreate();
    });
    // $("body").on('click',".inline-del",function(){
    //     tagDelete();
    // });
    $("body").on('click','.overviewclick', function () {
        $(".overlaywhitbg").toggle();
        resetToNoneState();
        //alert("Toggle");
        $(this).addClass("active");
        if($('.overlaywhitbg').css('display') == 'none' ){
            $(".overviewclick").removeClass("active");
            $(".action-icons-left").removeClass("disabledstate");
        }
        else{
            $("div.action-icons-left:not(:first)").addClass("disabledstate");
            save();
            $('.created-whiteboards').empty();
            for(var i = 0; i < canvas_diagram.length;i++)
            {
                if(canvas_diagram.length==1)
                  $('.created-whiteboards').append('<li id="previewlist_'+(i+1)+'"><a href="javascript:void(0);"><canvas id="preview_'+(i+1)+'" width="250" height="125"></canvas><p class="text-bold">White Board - '+(i+1)+'</p> </a></li>');
                else
                  $('.created-whiteboards').append('<li id="previewlist_'+(i+1)+'"><a href="javascript:void(0);"><canvas id="preview_'+(i+1)+'" width="250" height="125"></canvas><p class="text-bold">White Board - '+(i+1)+'</p> <p class="small-text small-text-white alertpopup closewhiteboardtab" data-id="'+i+'" style="cursor:pointer;color:#ff3b3b;">Remove </p> </a></li>');
                getPreviewCanvas(i);
            }
        }
    });
    $('body').on('click','.closewhiteboardtab',function(e){
      $(".delete-tab-confirm-dialog").dialog("open");
      WHITEBOARD.delete_tab = $(this).attr("data-id");
    });
    $('body').on('click','#delete_whiteboard_tab_confirm',function(e){
      $(".overlaywhitbg").hide();
      $(".delete-tab-confirm-dialog").dialog("close");
      refreshTabs(WHITEBOARD.delete_tab);  
      e.stopImmediatePropagation();
      return false;
    });
  $('body').on('click','#network_retry_confirm',function(e){
    if(WHITEBOARD.save_type==1)
      $().autosaveWhiteBoard();
    else
      $().saveWhiteBoard();
      e.stopImmediatePropagation();
      return false;
    });
  $('body').on('click','#close_network_popup',function(e){
    $(".network-error-dialog").dialog("close");
    $( ".rename-whiteboard-dialog" ).dialog("close");
    e.stopImmediatePropagation();
    return false;
  });
    var previewPaneClick = false;
    $("body").on('click', '.created-whiteboards li',function () {
        /*if(!WHITEBOARD.saveprogress)
        {*/
          $(".overlaywhitbg").hide();
          $(".action-icons-left").removeClass("disabledstate");
          $(".overviewclick").removeClass("active");
          var id = $(this).attr('id').split('_');
          
          if(id[1] != current_tab)
          {
              setUpEditPanel(null);
              previewPaneClick = true;
              save();
              current_tab = parseInt(id[1]);
              resetToNoneState();
              load(current_tab);
              
              var position = $( "#tab_list li" ).length-id[1];
              $( ".tabs" ).tabs('refresh');
              $('.tabstyles').children('li').eq(position).children('a').trigger('click');
          }
        /*}
        else
          $().showNotificationDismiss("Please wait.. Saving whiteboard is in progress");*/
    });

    $("body").on('click', '.tabstyles li',function (event) {
        /*if(!WHITEBOARD.saveprogress)
        {*/
          setUpEditPanel(null);
          if(!previewPaneClick)
          {
              erasor_state = false;
              pencil_draw = false;
              strokeColor = '#000';
              resetToNoneState();
              if($('.tabstyles li').attr('aria-expanded') == 'true' ){
                  $(".action-icons-left").addClass("disabledstate");
                  save();
                  clearPencil();
              }
              else{
                  $(".action-icons-left").removeClass("disabledstate");
                  var id = $(this).attr('id').split('_');
                  save();
                  loadWhiteboard(id);
                  /*if(!WHITEBOARD.firstExecuteTab)
                    $().autosaveWhiteBoard();*/
              }
          }
          else
          {
              previewPaneClick = false;
          }
          WHITEBOARD.firstExecuteTab = false;
        /*}
        else
        {
          $().showNotificationDismiss("Please wait.. Saving whiteboard is in progress rab");
          event.preventDefault();
        }*/  
    });
    $("ul.tabstyles li").delegate('a', 'click', function(e){
        if(WHITEBOARD.saveprogress)
        {
         e.preventDefault();
         return false;
        }
    });
    // $('body').on('change','#tagdetail',function(){
    //     //var value=$(this).text()
    //     var dummy=1;
    //     var selectedId=$('#tagdetail option:selected').text();
    //     updateShape(selectedFigureId,'tagid',selectedId);
    //     updateShape(selectedFigureId,'value',dummy);
        
    //     if(dummy==1)
    //     {
    //     updateShape(selectedFigureId,'style.fillStyle',"rgba(85,93,204)");
    //     updateShape(selectedFigureId,'style.strokeStyle',"rgba(85,93,204)");
        
    //     alert(dummy);
    //     }
    //     draw()
    // });
    
    
    $('body').on('change','#tagdetail',function(){
        selectedId=$('#tagdetail option:selected').text();
      if(selectedId=='Select tagid'){
        updateShape(selectedFigureId,'tagid',null);  
      }else if(selectedId=="New tag")
      {   
          if ($(this).val() == "1") {
              
              $('#larModal').modal("show");
              updateShape(selectedFigureId,'tagid',selectedId);
          }
      }

      else{
      updateShape(selectedFigureId,'tagid',selectedId);
      }
      componentTag()
});
    $('body').on('click','#component_model',function(){
       
        $('#componentModel').modal("show");
});
// $('body').on('click','#gauge_model',function(){
  
//     $('#gaugeModel').modal("show");
// });

    //var colors= {"red":"255,59,60","yellow":"204,186,86","green":"116,204,84","blue":"85,93,204","pink":"180,85,205","orange":"204,149,85","white":"255,255,255","black":"0,0,0"};
	var colors= {"tagid":"001","tagid":"002","tagid":"003"}
    $('body').on('click','ul.strokecolor li span',function(){
        var myClasses = this.classList;
        shapeStrokeColor = colors[myClasses[1]];
        updateShape(selectedFigureId,'style.strokeStyle',"rgba("+shapeStrokeColor+",1)");
        $(".inline-secondarycolor").css("background", "rgba("+shapeStrokeColor+",1)");
        draw();
    });
    
    // $("body").tagcreate(function(){
    //     alert("The text has been changed.");
    // });
    /* $('body').on('click','ul.fillcolor li span',function(){
        var myClasses = this.classList;
        var myClasses = this.classList;
		//console.log("myclass",myClasses)
        shapeFillColor = colors[myClasses[1]];
		//console.log("shapeFillColor",shapeFillColor)
        updateShape(selectedFigureId,'style.fillStyle',"rgb("+shapeFillColor+")");
        $(".inline-primarycolor").css("background","rgb("+shapeFillColor+")");
        
        draw();
    }); */
	/* $('body').on('click','ul.image-editoptions',function(){
		var PHONES = new Array("tag1","tag2","tag3","tag4");
		$(".inline-primarycolor").find('option').remove();
                for(i=0; i < PHONES.length; i++){
                     $(".inline-primarycolor").append('<option value="'+PHONES[i]+'">'+PHONES[i]+'</option>');
                 }
        }); */
		
		// $('body').on('click','.image-editoptions',function(){
        //     //console.log("call")
        // $('body').init(function(){
        //     //console.log("ini called")
		// 	var url = "http://127.0.0.1:8000/tag/create";
		// 	 $.getJSON(url, function (data) {
		// 		 //console.log("aasfaadadadAsa",data)
        //         $.each(data.data, function (index, value){
        //             var str='<option value="' + value.name + '">' + value.tag_id + '</option>'
		// 			//console.log("value",str)
        //             $("#mydata").html(str);
					
        //         });
				
        //     });
        // });
		
	
		
    $('body').on('click','ul.strokewidth li span.inline-opup',function(){
        var fig = STACK.figureGetById(selectedFigureId);
        if(selectedFigureId==-1)
          var fig = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId);
        var linWidth = fig.style.lineWidth;
        if(linWidth == 2.005)
          linWidth = 2;
        if(linWidth+1>10)
            return;
        updateShape(selectedFigureId,'style.lineWidth',linWidth + 1);
        //STACK.figures[selectedFigureId].style.lineWidth += 1;
        $(".strokeWidthVal").html(fig.style.lineWidth);
        draw();
    });
    $('body').on('click','ul.strokewidth li span.inline-opdown',function(){
        var fig = STACK.figureGetById(selectedFigureId);
        if(selectedFigureId==-1)
          var fig = LineArrow_MANAGER.linearrowGetById(selectedLineArrowId);
        var linWidth = fig.style.lineWidth;
        if(linWidth == 2.005)
          linWidth = 2;
        if(linWidth-1<1)
            return;
        updateShape(selectedFigureId,'style.lineWidth',linWidth - 1);
        
        //STACK.figures[selectedFigureId].style.lineWidth -= 1;
        $(".strokeWidthVal").html(fig.style.lineWidth);
        draw();
    });
    $('body').on('click','ul.fillopacity li span.inline-opdown',function(){
        var fig = STACK.figureGetById(selectedFigureId);
        if(fig.style.globalAlpha === null)
            updateShape(selectedFigureId,'style.globalAlpha',1);
        else if(fig.style.globalAlpha-0.1<0.1)
            return;
        updateShape(selectedFigureId,'style.globalAlpha',fig.style.globalAlpha - 0.1);
        $(".fillOpacityVal").html(Math.round(fig.style.globalAlpha*100));
        draw();
    });
    $('body').on('click','ul.fillopacity li span.inline-opup',function(){
        var fig = STACK.figureGetById(selectedFigureId);
        if(fig.style.globalAlpha === null)
        {
            updateShape(selectedFigureId,'style.globalAlpha',1);
            return;
        }    
        else if(fig.style.globalAlpha+0.1>1)
            return;
        updateShape(selectedFigureId,'style.globalAlpha',fig.style.globalAlpha + 0.1);
        $(".fillOpacityVal").html(Math.round(fig.style.globalAlpha*100));
        draw();
    });

    // $('body').on('click','ul.image-mainoptions span.inline-brush',function(){
    //     $(".shapeEditHTML").toggle(100);
    // });

    $('body').on('click','ul.textSize li span.inline-opup',function(){
        var fig = STACK.figureGetById(selectedFigureId);
        if(fig.primitives[1].size+1>34)
            return;
        updateShape(selectedFigureId,'primitives.1.size',fig.primitives[1].size+1);
        //STACK.figures[selectedFigureId].style.lineWidth += 1;
        $(".textSizeVal").html(fig.primitives[1].size);
        draw();
    });
    $('body').on('click','ul.textSize li span.inline-opdown',function(){
         var fig = STACK.figureGetById(selectedFigureId);
        if(fig.primitives[1].size-1<10)
            return;
        updateShape(selectedFigureId,'primitives.1.size',fig.primitives[1].size - 1);
        
        //STACK.figures[selectedFigureId].style.lineWidth -= 1;
        $(".textSizeVal").html(fig.primitives[1].size);
        draw();
    });

    $('body').on('click','.textBoldVal',function(){
        var fig = STACK.figureGetById(selectedFigureId);
        if(fig.primitives[1].bold)
        {
            $(".textBoldVal").removeClass('selected');
            $(".textBoldVal").removeClass('active');
            updateShape(selectedFigureId,'primitives.1.bold',false);
        }
        else
        {
            $(".textBoldVal").addClass('selected');
            updateShape(selectedFigureId,'primitives.1.bold',true);
        }
        draw();
    });
    $('body').on('click','.textItalicVal',function(){
        var fig = STACK.figureGetById(selectedFigureId);
        if(fig.primitives[1].italic)
        {
            $(".textItalicVal").removeClass('selected');
            $(".textItalicVal").removeClass('active');
            updateShape(selectedFigureId,'primitives.1.italic',false);
        }
        else
        {
            $(".textItalicVal").addClass('selected');
            updateShape(selectedFigureId,'primitives.1.italic',true);
        }
        draw();
    });
    $('body').on('click','.textUnderlinedVal',function(){
        var fig = STACK.figureGetById(selectedFigureId);
        if(fig.primitives[1].underlined)
        {
            $(".textUnderlinedVal").removeClass('selected');
            $(".textUnderlinedVal").removeClass('active');
            updateShape(selectedFigureId,'primitives.1.underlined',false);
        }
        else
        {
            $(".textUnderlinedVal").addClass('selected');
            updateShape(selectedFigureId,'primitives.1.underlined',true);
        }
        draw();
    });
    $('body').on('click','ul.textSize li span.inline-opdown',function(){
         var fig = STACK.figureGetById(selectedFigureId);
        if(fig.primitives[1].size-1<10)
            return;
        updateShape(selectedFigureId,'primitives.1.size',fig.primitives[1].size - 1);
        
        //STACK.figures[selectedFigureId].style.lineWidth -= 1;
        $(".textSizeVal").html(fig.primitives[1].size);
        draw();
    });
    $('body').on('click','ul.textAlign li span',function(){
        var myClasses = this.classList;
		//console.log("mycals",myClasses)
        updateShape(selectedFigureId,'primitives.1.align',myClasses[1]);
        var classes = "inline-align textAlignVal active-wicon "+myClasses[1];
        $("#textAlign").attr('class',classes);
        draw();
    });
    $('body').on('click','ul.fontcolor li span',function(){
        var myClasses = this.classList;
		//console.log("3",myClasses)
        shapeFillColor = colors[myClasses[1]];
        if(myClasses[1] !="white")
        {
            updateShape(selectedFigureId,'primitives.1.style.fillStyle',"rgb("+shapeFillColor+")");
            $(".inline-primarycolor").css("background", "rgb("+shapeFillColor+")");
            draw();
        }
        
    });
    $('body').on('click','ul.arrowcolor li span',function(){
        var myClasses = this.classList;
		//console.log("4",myClasses)
        shapeFillColor = colors[myClasses[1]];
        if(myClasses[1] !="white")
        {
            updateShape(selectedFigureId,'primitives.1.arrowColor',"rgb("+shapeFillColor+")");
            $(".inline-secondarycolor").css("background", "rgb("+shapeFillColor+")");
            draw();
        }
    });
    // var gallery = ['images/gallery/africa.png','images/gallery/cycle.png','images/gallery/ship.png'];
    // $('body').on('click','.subject-ellabration li a.insert_image',function(){
    //     //window.setTimeout(function(){
    //       //if(removeGalleryElement==null)
    //       //{
	// 		  //alert($(this).find('img').attr('data-url'));
    //         var main_canvas = getCanvas();
    //         var cmdFigureCreate = new InsertedImageFigureCreateCommand("Gallery_Image", main_canvas.width/2, main_canvas.height/2,$(this).find('img').attr('data-url'));
    //         cmdFigureCreate.execute();
    //         History.addUndo(cmdFigureCreate);
    //         hidecrop();
    //         $(this).siblings('.black-flyout').slideToggle();
    //         $(".black-flyout").hide();  
    //       //}
    //     //},500);
        
    // });
    $("body").on('click', ".flyout-link", function () {
        $(this).siblings('.black-flyout').slideToggle();
        var $div = $(this).next('.black-flyout');
        //console.log("div",$div)
        $(".black-flyout").not($div).hide();
        $div.show();
        $(".flyout-link").find('span').removeClass('active-wicon');   
        $(this).find('span').toggleClass('active-wicon');
        if($(this).hasClass('inlineimg-option')){
            $('.inlineimg-option').parent('li').addClass('active');     
          $(this).toggleClass('inlineimg-option');
          $(this).toggleClass('inlineimg-option1');       
        }
        if($(this).hasClass('inlineimg-option1')){
            $('.inlineimg-option').parent('li').removeClass('active');      
          $(this).toggleClass('inlineimg-option');
          $(this).toggleClass('inlineimg-option1');       
        } 
      });


    var bg = ['images/bg/blank_page.png','images/bg/double_line_page.png',
        'images/bg/four_line_page_without_space.png','images/bg/four_line_page_with_space.png',
        'images/bg/graph_paper_cm.png','images/bg/graph_paper_inches.png'
        ,'images/bg/math_square_line.png','images/bg/single_line_page.png'
        ,'images/bg/venn_with_lines.png','images/bg/venn_without_lines.png'];

    $('body').on('click','.pgbgtypes li',function () {
        if(!WHITEBOARD.saveprogress)
        {
          save();
        //$(".action-icons-left").removeClass("disabledstate");
        //if(tab_size < 10){
            resetToNoneState();
            /*tab_size = tab_size + 1;
            current_tab = tab_size;*/
            /*$('.tabstyles li').removeAttr('class');
            $('.tabstyles li:first-child').after('<li id="tab_'+tab_size+'"><a id="a_hed" href="#one">'+tab_size+'</a></li>');
            $( ".tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
            $( ".tabs" ).tabs('refresh');
            $('.tabstyles').children('li').eq(1).children('a').trigger('click');*/
            //alert("Call back");
            if($(this).attr('data-bg') != -1)
            {
                //var backgroundURL = WHITEBOARD.hostURL+bg[$(this).attr('data-bg')];
                load(current_tab,WHITEBOARD.backgrounds[$(this).attr('data-bg')],5);
            }
            else
            {    
              load(current_tab,'none','none'); 
            }

            /*if(tab_size == 10)
                $("#add_tab").hide();
            $(".whiteboard-overlay").hide();
            $(".action-icons-bg").find(".sitewidth").removeClass("disabledstate");*/
        /*}
        else{
            alert("Maximum Tab Size");
        }*/
        }
        else
        $().showNotificationDismiss("Please wait.. Saving whiteboard is in progress");
    });

    $('body').on('click','.action-icons-whiteboard>li>a',function(){
        $('.action-icons-whiteboard li').removeClass('selected');
        $(this).parent('li').addClass('selected');
    });
    
    $("body").on('click','#add_tab',function(){
      if(!WHITEBOARD.saveprogress)
      {
        addBlankTab();
      }
      else
        $().showNotificationDismiss("Please wait.. Saving whiteboard is in progress");
      /*$(".whitebgover, .whiteboard-overlay").show();
      $(".action-icons-bg").find(".sitewidth").addClass("disabledstate");*/
    });
    
    
    // $("body").on('click',".inline-brush-image",function(){
    //     imageTagCreate();
    // });
    // $("body").on('click',"#componentdetail",function(){
    //     componentDetail();
    // });
    //Whiteboard Resource toggle
    // $("body").on('click',"#componentdetail",function(){
    //     componentDetail();
    // });
    $("body").on('click','.resource-link', function(){
      $('.whitebgover').toggle();
      $(this).find('.resource').toggleClass('active-wicon');
    });
    /*Toggle Question*/
    $("body").on('click','.questindi li a', function(){
      var vinc=0;
      var $quest = $(this).parent('quest');
    });

    /*Toggle Question*/
    $("body").on('click','ul.qnaire li',function(){
      var tab_id = $(this).attr('data-tab');
      $('ul.qnaire li').removeClass('quest-active');
      $('.questionera').addClass('hidequiz');
      $(this).addClass('quest-active');
      $("#tab-"+tab_id).removeClass('hidequiz');
	  $("ul.qnaire li").trigger("quiz:question:select");
	  
    });
    //Accordian in whiteboard gallery
    $( ".galleryaccordion" ).accordion({
      heightStyle: "content",
      active:1,
      collapsible: true,
    });

    //Delete Confirmation
    $("body").on('click', ".deletemsg", function(e) {
      $( ".delete-confirm-dialog" ).dialog("open");
    });
    //Delete Confirmation Close
    $("body").on('click',".deleteclose", function(e) {
      $( ".delete-confirm-dialog" ).dialog("close");
    });
    
    //Alert Dialog
    $("body").on('click', ".alertpopup", function(e) {
      $( ".alert-message-dialog" ).dialog("open");
    });
      
    //Remane Whiteboard Dialog
    $("body").on('click', ".renamepopup", function(e) {
        if(!WHITEBOARD.saveprogress)
        { 
          WHITEBOARD.saveprogress = true;
          $( ".rename-whiteboard-dialog" ).dialog("open");
        }
    });
    $('body').on('focus','input[name="whiteboardtitle"]',function(){
      $("#onScreenKeyBoard").show();
    });
    $(document).bind('click', function(e) {
      if(!WHITEBOARD.textEditor)
      if(!$(e.target).is('input[name="whiteboardtitle"]')&&!$(e.target).is('#onScreenKeyBoard')) {
        $("#onScreenKeyBoard").hide();
      }
    });
      //Save Confirmation Dialog
    $("body").on('click', ".savepopup", function(e) {
        if(!WHITEBOARD.saveprogress)
        {
          WHITEBOARD.saveprogress = true;
          if(WHITEBOARD.whiteboardId==null)
          {
            $( ".rename-whiteboard-dialog" ).dialog("open");
            setTimeout(function(){
              var canvas = getCanvas();
              $("#onScreenKeyBoard").show();
              var leftCSS = ($('input[name="whiteboardtitle"]').offset().left)+$('input[name="whiteboardtitle"]').outerWidth();
              var topCSS = ($('input[name="whiteboardtitle"]').offset().top);
              if($('input[name="whiteboardtitle"]').offset().top>(canvas.height/2+60))
              topCSS = $('input[name="whiteboardtitle"]').offset().top-200;
              $('#onScreenKeyBoard').css({left:leftCSS, 
                        top:topCSS,"z-index":110});
            },500);
          }
          else
            $().saveWhiteBoard();
        }
    });
    $("body").on('click', ".exportpopup", function(e) {
          var canvas = getCanvas();
          if(canvas == null) {
            return;
          }
          var canvas_context = canvas.getContext('2d');
          ////console.log("saving"+canvasProps.backgroundURL);
          
          //var canvas_dummy = document.getElementById('canvas_dummy');
          var canvas_dummy = document.createElement('canvas');
          
          canvas_dummy.width = canvas.width;
          canvas_dummy.height = canvas.height;
          var ctx_temp = canvas_dummy.getContext('2d');
          ctx_temp.fillStyle = "#FFF";
          ctx_temp.fillRect(0, 0, canvas_dummy.width, canvas_dummy.height);
          ctx_temp.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,canvas_dummy.width, canvas_dummy.height);
          ctx_temp.drawImage(getCanvasPencil(),0,0,getCanvasPencil().width,getCanvasPencil().height,0,0,canvas_dummy.width, canvas_dummy.height);
    
          var dt = canvas_dummy.toDataURL();
          dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
          /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
          dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=whiteboard-screenshot.png');
          $(this).attr('href',dt);          
    });
    $("body").on('click',".save-dialog-close",function(){
    WHITEBOARD.saveprogress = false;
    $( ".rename-whiteboard-dialog" ).dialog("close");
  });
      //Close Save Confirmation Dialog
    $("body").on('click', ".close-save", function(e) {
    
      $( ".save-confirmation-dialog" ).dialog("close");
    }); 

    $("body").on('click',"#clear-tab",function(){
        reset(getCanvas());
        STACK.reset();
        History.reset();
        LineArrow_MANAGER.reset();
		canvasProps.pencil[current_tab-1] = null;
		clearPencil();
        clearPencilCanvas();
        state = STATE_NONE;
        $( ".alert-clear-message-dialog" ).dialog("close");
    });
    
    $("body").on('click',"#dialog-image",function(){
        //console.log("dialogImage")
        $("#dialogpopup").dialog ({
            show : "slide",
            hide : "puff"
          });
        });
    // });
    // $("body").on("click","#dialogImage",function() {
    //     //console.log("dialogImage")
    //   $(function() {
    //     $("#dialog").dialog({
    //       width:250,
    //       height: 180,
    //       modal:true
    //     });
    //   });
    //   evnt.preventDefault();
    // });        

    });   

