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
    /*
     Properties used during drag action.
     */
    var originalBBox,
	originalCSS,
	dragDistance;
    
    /*
     Sets the size and position of the dialogue element based on the data.
     */
    var drawSizeAndPosition = function(el, datum) {
	var bbox = options.lockToScreen ? el.node().getBoundingClientRect() : null;

	drawPosition(el, datum.manuallyPositioned(), datum.getLeft(), datum.getTop(), bbox);

	drawSize(el, datum.manuallySized(), datum.getWidth(), datum.getHeight(), bbox);	
    },

	drawPosition = function(el, manuallyPositioned, x, y, bbox) {
	    if (manuallyPositioned) {
		if (options.lockToScreen) {
		    // Make sure that our dialogue fits within the browser window.
		    
		    var dx = x - bbox.left,
			dy = y - bbox.top;
		    
		    x = bbox.left +
			Math.min(
			    dx,
			    window.innerWidth - bbox.right
			);

		    y = bbox.top +
			Math.min(
			    dy,
			    window.innerHeight - bbox.bottom
			);

		    x = Math.max(x, 0);
		    y = Math.max(y, 0);
		}

		el
		    .style("left", x + "px")
		    .style("top", y + "px")
		    .style("bottom", null)
		    .style("right", null);	    
		
	    } else {
		el.style("left", null)
		    .style("top", null);
	    }
	},

	drawSize = function(el, manuallySized, width, height, bbox) {
	    if (manuallySized) {
		if (options.lockToScreen) {
		    var dWidth = width - bbox.width,
			dHeight = height - bbox.height;

		    width = bbox.width +
			Math.min(
			    dWidth,
			    window.innerWidth - bbox.right
			);

		    height = bbox.height +
			Math.min(
			    dHeight,
			    window.innerHeight - bbox.bottom
			);
		}

		// No need to set a minimum width, since this is already handled by a css property.
		
		el
		    .style("width", width + "px")
		    .style("height", height + "px");

	    } else {
		el.style("width", null)
		    .style("height", null);
	    }
	};
    
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

	dialogues.each(function(d, i) {
	    drawSizeAndPosition(d3.select(this), d);
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

	if (options.reposition) {
	    newDialogues
	    	.style("cursor", "move")
	    	.call(
	    	    d3.behavior.drag()
	    		.origin(function() {
			    var el = d3.select(this);
			    
	    		    originalBBox = this.getBoundingClientRect();
			    originalCSS = [
				parseInt(el.style("left")) || 0,
				parseInt(el.style("top")) || 0
			    ];
			    dragDistance = null;
			    
	    		    return {
	    			x: 0,
	    			y: 0
	    		    };
	    		})
	    		.on("drag", function() {
	    		    d3.event.sourceEvent.preventDefault();

	    		    // Accumulated change over this whole drag gesture.
	    		    dragDistance = [d3.event.x, d3.event.y];
			    
	    		    var	translated = {
	    			left: originalBBox.left + dragDistance[0],
	    			right : originalBBox.right + dragDistance[0],
	    			top: originalBBox.top + dragDistance[1],
	    			bottom: originalBBox.bottom + dragDistance[1],
	    			width: originalBBox.width,
	    			height: originalBBox.height
	    		    };

			    // if (options.sticky) {
			    // 	maybeDock(translated, moveDistance);
			    // }

			    drawPosition(
				d3.select(this),
				true,
				originalCSS[0] + dragDistance[0],
				originalCSS[1] + dragDistance[1],
				translated
			    );
	    		})
			.on("dragend", function(d, i) {
			    if (dragDistance) {
				getDataById(d.id)
				    .setPosition([
					originalCSS[0] + dragDistance[0],
					originalCSS[1] + dragDistance[1]
				    ]);
			    }
			})
		);
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
	    newDialogues
	    // This padding prevents us from make the box too small to resize.
		.style("padding-bottom", "3em")
	    // This padding provides space for the button.
		.style("padding-right", "1.5em")
		.append("span")
		.classed("resize-dialogue", true)
		.html("⇘")
		.call(
		    d3.behavior.drag()
			.origin(function() {
			    var el = d3.select(this.parentNode);
			    
			    originalBBox = el.node().getBoundingClientRect();
			    originalCSS = [
				parseInt(el.style("width")) || 0,
				parseInt(el.style("height")) || 0
			    ];
			    dragDistance = null;
			    
			    return {
				x: 0,
				y: 0
			    };
			})
			.on("dragstart", function(d) {
			    d3.event.sourceEvent.stopPropagation();
			})
			.on("drag", function(d) {
			    // Accumulated change over this whole drag gesture.
			    var dragDistance = [d3.event.x, d3.event.y],
				translated = {
				    left: originalBBox.left,
				    top: originalBBox.top,
				    right: originalBBox.right + dragDistance[0],
				    bottom: originalBBox.bottom + dragDistance[1],
				    width: originalBBox.width + dragDistance[0],
				    height: originalBBox.height + dragDistance[1]
				};

			    // maybeDock(
			    //     translated, dragDistance
			    // );

			    drawSize(
				d3.select(this.parentNode),
				true,
				originalCSS[0] + dragDistance[0],
				originalCSS[1] + dragDistance[1],
				translated
			    );
			})
			.on("dragend", function(d) {
			    if (dragDistance) {
				getDataById(d.id)
				    .setSize([
					originalCSS[0] + dragDistance[0],
					originalCSS[1] + dragDistance[1]
				    ]);
			    }
			})
		);
	}

	if (options.findSpace !== undefined) {
	    // unitDirectionVector, attempts
	    
	    // do this for new elements only
	}

	if (options.bringToFront) {
	    newDialogues
	    // This padding prevents us from make the box too small to resize.
		.style("padding-bottom", "3em")
		.style("padding-right", "1.5em")
		.append("span")
		.classed("bring-to-front", true)
		.text("TOP")
		.on("click", function(d, i) {
		    d3.select(this.parentNode)
			.style("z-index", getNextZ());
		});
	}

	return {
	    dialogues: dialogues,
	    newDialogues: newDialogues
	};
    };
};
