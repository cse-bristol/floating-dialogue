"use strict";

/*global module, require*/

var d3 = require("d3"),
    classes = require("./classes.js"),
    hideClass = classes.hide,
    dialogueClass = "floating-dialogue",
    closeButtonClass = "close-button",
    resizeButtonClass = "resize-dialgoue",
    bringToFrontClass = "bring-to-front",

    z = 10,
    getNextZ = function() {
	return z++;
    };

module.exports = function(container, getDataById, redraw, typeId, options) {
    return function(data) {
	var dialogues = container.selectAll("." + typeId)
	    .data(
		data,
		function(d, i) {
		    return d.id;
		}
	    );

	dialogues.exit().remove();

	var newDialogues = dialogues.enter()
		.append("div")
		.classed(dialogueClass, true)
		.classed(typeId, true);

	dialogues.classed(hideClass, function(d, i) {
	    return !d.getVisibility();
	});

	dialogues
	    .filter(function(d, i) {
		return d.manuallySized();
	    })
	    .style("width", function(d, i) {
		return d.getWidth() + "px";
	    })
	    .style("height", function(d, i) {
		return d.getHeight() + "px";
	    });

	dialogues
	    .filter(function(d, i) {
		return d.manuallyPositioned();
	    })
	    .style("left", function(d, i) {
		return d.getLeft() + "px";
	    })
	    .style("top", function(d, i) {
		return d.getTop() + "px";
	    });

	if (options.reposition) {
	    // newDialogues
	    // 	.style("cursor", "move")
	    // 	.call(
	    // 	    d3.behavior.drag()
	    // 		.origin(function() {
	    // 		    originBBox = el.node().getBoundingClientRect();
	    // 		    return {
	    // 			x: 0,
	    // 			y: 0
	    // 		    };
	    // 		})
	    // 	    .on("drag", function(d){
	    // 		d3.event.sourceEvent.preventDefault();

	    // 		var node = el.node(),
	    // 		    // Accumulated change over this whole drag gesture.
	    // 		    dx = d3.event.x,
	    // 		    dy = d3.event.y,
			    
	    // 		    translated = {
	    // 			left: originBBox.left + dx,
	    // 			right : originBBox.right + dx,
	    // 			top: originBBox.top + dy,
	    // 			bottom: originBBox.bottom + dy,
	    // 			width: originBBox.width,
	    // 			height: originBBox.height
	    // 		    };

	    // 		maybeDock(
	    // 		    translated,
	    // 		    function(leftChange) {
	    // 			dx += leftChange;
	    // 		    },
	    // 		    function(topChange) {
	    // 			dy += topChange;
	    // 		    },
	    // 		    function(rightChange) {
	    // 			dx += rightChange;
	    // 		    },
	    // 		    function(bottomChange) {
	    // 			dy += bottomChange;
	    // 		    }
	    // 		);
			
	    // 		setPosition(originBBox.left + dx, originBBox.top + dy);
	    // 		onPositionChanged([node.offsetLeft, node.offsetTop]);
	    // 	    })
	    // );
	}

	if (options.close) {
	    var newCloseButtons = newDialogues
	    // This padding provides space for the button.
		    .style("padding-right", "1.5em")
		    .append("span")
		    .classed("close-button", true)
		    .html("X");

	    newCloseButtons.on("click", function(d, i) {
		getDataById(d.id).setVisibility(false);
		redraw();
	    });
	}

	if (options.resize) {
	}

	if (options.sticky) {
	}

	if (options.findSpace !== undefined) {
	    // unitDirectionVector, attempts
	}

	if (options.lockScreen) {
	}

	return {
	    dialogues: dialogues,
	    newDialogues: newDialogues
	};
    };
};
