"use strict";

/*global module, require*/

var createData = require("./data.js"),
    drawDialogues = require("./draw-dialogues.js"),
    drawButtons = require("./draw-buttons.js");

/*
 Call this function to specify the kind of dialogue you want to create.

 container is the object the dialogues will be drawn inside.

 getDataById is a way to lookup the most up-to-data date for a dialogue. This is used when we want to modify that data.

 typeId is a string that uniquely identifies this class of dialogues.

 options is an object which may contain the following properties:
  + reposition (boolean) adds drag-to-move
  + close (boolean) adds a hide 'X' button to the dialogue
  + resize (boolean) adds a resize handle to the diaogue
  + bringToFront (boolean) adds a 'TOP' button to the dialogue
  + sticky (boolean) adds stickyness/snapping/docking behaviour towards other dialogues when being moved or resized
  + findSpace (boolean) causes new dialogues to attempt to find a free space which do not overlap another dialogues (unless they have a specific manual position already)
  + lockToScreen (boolean) locks the dialogue to fit inside the browser window when moving or resizing

 options may also contain the following events:
  + onSizeChanged (function)
  + onPositionChanged (function)
  + onVisibilityChanged (function)
*/
module.exports = function(container, getDataById, redraw, typeId, options) {
    var dataFactory = createData(options);
    
    return {
	/*
	 Create the underlying data for 1 dialogue of this type.
	 */
	createData: dataFactory.create,
	loadData: dataFactory.load,

	/*
	 Draw dialogues in the container using the data provided and a d3 data join.
	 */
	draw: drawDialogues(container, getDataById, redraw, typeId, options),

	buttons: drawButtons(getDataById, redraw)
    };
};
