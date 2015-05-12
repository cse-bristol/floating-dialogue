"use strict";

/*global module, require*/

var classes = require("./classes.js"),
    hideClass = classes.hide,
    openButtonClass = "open-button";


module.exports = function(getDataById, redraw) {
    /*
     Assumes we've already created some elements to act as buttons using d3.
     
     Adds some classes so that we get styling on them.

     Hooks up the click event to toggle visibility of the appropriate dialogue.
     */
    return function(selection, newSelection) {
	newSelection
	    .classed(openButtonClass, true)
	    .on("click", function(d, i) {
		getDataById(d.id)
		    .setVisibility(!d.getVisibility());
		redraw();
	    });

	selection.classed(hideClass, function(d, i) {
	    return !d.getVisibility();
	});
    };
};
