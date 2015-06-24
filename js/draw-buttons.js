"use strict";

/*global module, require*/

var classes = require("./classes.js"),
    hideClass = classes.hide,
    openButtonClass = "open-button";


module.exports = function(getDataById, redraw, typeId, drawButtonContent, getDataFromParent) {
    var buttonId = function(d) {
	return typeId + "-button-" + d.id;
    },
	
	/*
	 Assumes we've already created some elements to act as buttons using d3.
	 
	 Adds some classes so that we get styling on them.

	 Hooks up the click event to toggle visibility of the appropriate dialogue.
	 */
	fromSelection = function(buttons, newButtons) {
	    newButtons = newButtons
		.append("div")
		.classed(openButtonClass, true)
		.attr("id", buttonId)
		.on("click", function(d, i) {
		    var data = getDataById(d.id);
		    
		    data.setVisibility(!d.getVisibility());
		    redraw(data);
		});

	    buttons.classed(hideClass, function(d, i) {
		return !d.getVisibility();
	    });

	    drawButtonContent(buttons, newButtons);
	};

    return {
	id: buttonId,
	
	fromSelection: fromSelection,

	fromParentSelection: function(parentSelection) {
	    var buttons = parentSelection.selectAll("." + openButtonClass)
		    .data(function(d, i) {
			return [
			    getDataFromParent(d)
			];
		    });

	    buttons.exit().remove();

	    fromSelection(buttons, buttons.enter());
	}
    };
};
