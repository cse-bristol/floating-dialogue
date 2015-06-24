"use strict";

/*global module, require*/

var d3 = require("d3"),
    classes = require("./classes.js"),
    hideClass = classes.hide,
    dialogueClass = "floating-dialogue",
    closeButtonClass = "close-button",
    resizeButtonClass = "resize-dialgoue",
    bringToFrontClass = "bring-to-front",

    stickyness = 20,

    z = 10,
    getNextZ = function() {
	return z++;
    },

    noop = function() {
    },

    intersects1D = function(leftA, rightA, leftB, rightB) {
	if (leftA <= leftB) {
	    // A's sides either side of leftB
	    return rightA >= leftB;
	} else {
	    // B's sides either side of leftA
	    return leftA <= rightB
	    // A contained within B.
		|| rightA <= rightB;
	}
    },

    intersects = function(a, b) {
	return intersects1D(a.left, a.right, b.left, b.right)
	    && intersects1D(a.top, a.bottom, b.top, b.bottom);
    };

module.exports = function(container, getDataById, redraw, typeId, options, drawDialogueContent) {
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
	var bbox = (options.lockToScreen || options.findSpace) ? el.node().getBoundingClientRect() : null,
	    manuallyPositioned = datum.manuallyPositioned(),
	    manuallySized = datum.manuallySized();

	drawSize(
	    el,
	    manuallySized,
	    manuallySized ? datum.getWidth() : null,
	    manuallySized ? datum.getHeight() : null,
	    bbox
	);

	drawPosition(
	    el,
	    manuallyPositioned,
	    manuallyPositioned ? datum.getLeft() : null,
	    manuallyPositioned ? datum.getTop() : null,
	    bbox);
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
		// Position the dialogue according to whatever CSS applies to it.
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
	},

	maybeFindSpace = function(el, d) {
	    if (!d.manuallyPositioned()) {
		var dialogues = d3.selectAll("." + dialogueClass),
		    directionVector = [0, 1],
	    	    len = dialogues.size(),
	    	    i = 0,
		    bbox = el.node().getBoundingClientRect(),

	    	    x = parseInt(el.style("left")) || 0,
	    	    y = parseInt(el.style("top")) || 0;		

	    	while (i < len) {
	    	    var dialogue = d3.select(dialogues[0][i]);

	    	    if (el.datum().id !== dialogue.datum().id) {
	    		var target = dialogue.node().getBoundingClientRect();

	    		if (intersects(bbox, target)) {
	    		    // Move far enough to avoid the box we're colliding with.
	    		    var dx = directionVector[0] >= 0 ? (target.right - bbox.left) : (target.left - bbox.right),
	    			dy = directionVector[1] >= 0 ? (target.bottom - bbox.top) : (target.right - bbox.left);

	    		    // Add a little clearance.
	    		    dx += 1;
	    		    dy += 1;

	    		    // Make sure we're going in the right direction.
	    		    dx *= directionVector[0];
	    		    dy *= directionVector[1];

	    		    x += dx;
	    		    y += dy;

	    		    el
	    			.style("left", x + "px")
	    			.style("top", y + "px")
	    			.style("right", null)
	    			.style("bottom", null);
			    
	    		    bbox = el.node().getBoundingClientRect();
	    		    i = 0;
	    		}
	    	    }

	    	    i++;
		}
	    }
	},

	enlarge = function(bbox) {
	    return {
		left: bbox.left - stickyness,
		top: bbox.top - stickyness,
		right: bbox.right + stickyness,
		bottom: bbox.bottom + stickyness
	    };
	},

	maybeDockSide = function(modify, original, target) {
	    var val = target - original;

	    if (Math.abs(val) < stickyness) {
		modify(val);
		return false;
	    } else {
		return true;
	    }
	},

	maybeDock = function(id, bbox, modifyLeft, modifyTop, modifyRight, modifyBottom) {
	    if (options.sticky) {

		var stickHorizontal = true,
		    stickVertical = true,
		    enlarged = enlarge(bbox),
		    dialogues = d3.selectAll("." + dialogueClass),
		    i = 0,
		    len = dialogues.size();

		while ((stickHorizontal || stickVertical) && i < len) {
		    var dialogue = d3.select(
			dialogues[0][i]
		    );

		    if (dialogue.datum().getVisibility() && dialogue.datum().id !== id)  {
			var target = dialogue.node().getBoundingClientRect();

			if (intersects(enlarged, target)) {
			    
			    if (stickHorizontal) {
				stickHorizontal = maybeDockSide(modifyLeft, bbox.left, target.right) && maybeDockSide(modifyRight, bbox.right, target.left)
				    && maybeDockSide(modifyLeft, bbox.left, target.left) && maybeDockSide(modifyRight, bbox.right, target.right);
			    }

			    if (stickVertical) {
				stickVertical = maybeDockSide(modifyTop, bbox.top, target.bottom) && maybeDockSide(modifyBottom, bbox.bottom, target.top)
				    && maybeDockSide(modifyTop, bbox.top, target.top) && maybeDockSide(modifyBottom, bbox.bottom, target.bottom);
			    }
			}
		    }
		    
		    i++;
		}
	    }
	},

	dialogueId = function(d) {
	    return typeId + "-" + d.id;
	},

	fromSelection = function(dialogues, newDialogues) {
	    newDialogues = newDialogues.append("div")
	    	.classed(dialogueClass, true)
		.classed(typeId, true)
		.attr("id", dialogueId);

	    dialogues.classed(hideClass, function(d, i) {
		return !d.getVisibility();
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
				
	    			var el = d3.select(this),
				    translated = {
	    				left: originalBBox.left + dragDistance[0],
	    				right : originalBBox.right + dragDistance[0],
	    				top: originalBBox.top + dragDistance[1],
	    				bottom: originalBBox.bottom + dragDistance[1],
	    				width: originalBBox.width,
	    				height: originalBBox.height
	    			    };

				maybeDock(
				    el.datum().id,
				    translated,
				    function(leftChange) {
					dragDistance[0] += leftChange;
				    },
				    function(topChange) {
					dragDistance[1] += topChange;
				    },
				    function(rightChange) {
					dragDistance[0] += rightChange;
				    },
				    function(bottomChange) {
					dragDistance[1] += bottomChange;
				    }				    
				);

				drawPosition(
				    el,
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
		    var data = getDataById(d.id);
		    data.setVisibility(false);
		    redraw(data);
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
				var el = d3.select(this.parentNode),
				    dragDistance = [d3.event.x, d3.event.y],
				    translated = {
					left: originalBBox.left,
					top: originalBBox.top,
					right: originalBBox.right + dragDistance[0],
					bottom: originalBBox.bottom + dragDistance[1],
					width: originalBBox.width + dragDistance[0],
					height: originalBBox.height + dragDistance[1]
				    };

				maybeDock(
				    el.datum().id,
				    translated,
				    noop,
				    noop,
				    function(deltaRight) {
					dragDistance[0] += deltaRight;
				    },
				    function(deltaTop) {
					dragDistance[1] += deltaTop;
				    }
				);
				
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

	    dialogues
		.each(function(d, i) {
		    drawSizeAndPosition(d3.select(this), d);
		});

	    drawDialogueContent(dialogues, newDialogues);

	    if (options.findSpace) {
		dialogues.each(function(d, i) {
		    maybeFindSpace(d3.select(this), d);
		});
	    }	    
	};

    return {
	id: dialogueId,
	
	fromData: function(data) {
	    var dialogues = container.selectAll("." + typeId)
		    .data(
			data,
			function(d, i) {
			    return d.id;
			}
		    );

	    dialogues.exit().remove();

	    fromSelection(dialogues, dialogues.enter());
	},

	fromSelection: fromSelection
    };
};
