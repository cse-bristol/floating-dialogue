"use strict";

/*global module, require*/

var d3 = require("d3"),
    z = 10,
    getNextZ = function() {
	return z++;
    },
    callbacks = function() {
	var callbacks = [];
	
	var f = function() {
	    var args = arguments;
	    callbacks.forEach(function(c) {
		c.apply(this, args);
	    });
	};
	f.add = function(c) {
	    callbacks.push(c);
	};

	f.remove = function(c) {
	    var i = callbacks.indexOf(c);
	    if (i >= 0) {
		callbacks.splice(i, 1);
	    }
	};

	f.clear = function() {
	    while (callbacks.length > 0) {
		callbacks.pop();
	    }
	};

	return f;
    },
    // Values found by trial and error. I wouldn't expect these to be exact at different zoom levels, but they seem to work quite well.
    xBuffer = 30,
    yBuffer = 52;

/*
 Provides some functions which can be applied to an HTML element.
 */
module.exports = function(el) {
    var openButtons,
	currentOpenButton,
	closeButton,
	manuallyPositioned = false,
	manuallySized = false,
	onVisibilityChanged = callbacks(),
	onPositionChanged = callbacks(),
	onSizeChanged = callbacks(),
	content = el.append("div")
	    .classed("content", true),

	visibility = function(show, targetButton) {
	    if (openButtons !== undefined) {
		openButtons.classed("element-visible", false);
		
		if (show) {
		    if (targetButton !== undefined) {
			currentOpenButton = targetButton;

		    } else if (currentOpenButton === undefined) {
			currentOpenButton = d3.select(openButtons.node());
		    }
		    currentOpenButton.classed("element-visible", true);
		}
	    }
	    el.style("visibility", show ? "visible" : "hidden");
	    onVisibilityChanged(show);
	},

	disable = function() {
	    if (openButtons !== undefined) {
		openButtons.classed("element-visible", false);
	    }

	    el.style("visibility", "hidden");
	    onVisibilityChanged(false);
	},

	toggle = function(button) {
	    // if it's not visible, open it with the button
	    var wasVisible = (el.style("visibility") === "visible");

	    visibility(
		!(wasVisible && currentOpenButton && button.node() === currentOpenButton.node()),
		button
	    );
	},

	setSize = function(width, height) {
	    var x = parseInt(el.style("left")),
		y = parseInt(el.style("top"));
	    

	    if (x) {
		width = Math.min(
		    width,
		    window.innerWidth - x - xBuffer
		);
	    }
	    
	    if (y) {
		height = Math.min(
		    height,
		    window.innerHeight - y - yBuffer
		);
	    }

	    /*
	     No need to set a minimum width, since this is already handled by a css property.
	     */
	    
	    el
		.style("width", width + "px")
		.style("height", height + "px");

	    manuallySized = true;
	},

	setPosition = function(x, y) {
	    var width = parseInt(el.style("width")),
		height = parseInt(el.style("height"));

	    if (width) {
		x = Math.min(
		    x,
		    window.innerWidth - width - xBuffer
		);		   
	    }

	    if (height) {
		y = Math.min(
		    y,
		    window.innerHeight - height - yBuffer
		);
	    }

	    x = Math.max(x, 0);
	    y = Math.max(y, 0);
	    
	    el
		.style("left", x + "px")
		.style("top", y + "px")
		.style("bottom", null)
		.style("right", null);

	    manuallyPositioned = true;	    
	};

    var m = {
	drag: function() {
	    el
		.style("cursor", "move")
		.style("position", "absolute");

	    if(el.style("left") === "auto") {
		el.style("left", 0);
	    }
	    if(el.style("top") === "auto") {
		el.style("top", 0);
	    }

	    
	    el.call(
		d3.behavior.drag()
		    .origin(function(d){
			return {
			    "x" : parseInt(el.style("left")),
			    "y" : parseInt(el.style("top"))
			};
		    })
		    .on("drag", function(d){
			d3.event.sourceEvent.preventDefault();
			setPosition(d3.event.x, d3.event.y);
			onPositionChanged([d3.event.x, d3.event.y]);
		    })
	    );

	    return m;
	},

	/*
	 Allows the dialogue to be shown and hidden by buttons, which are other elements.
	 */
	open: function(buttons) {
	    if (buttons.empty()) {
		buttons = undefined;
		currentOpenButton = undefined;
		m.hide();
		return m;
	    } else {
		// If the current open button isn't in the selection, clear it.
		if (currentOpenButton) {
		    var current = buttons.filter(function(d, i) {
			return this === currentOpenButton.node();
		    });

		    if (current.empty()) {
			currentOpenButton = undefined;
		    }
		}
		
		buttons
		    .classed("open-button", true)
		    .on("click", function(d, i) {
			d3.event.preventDefault();
			d3.event.stopPropagation();
			toggle(d3.select(this));
		    });
		
		openButtons = buttons;

		visibility(m.visible());
		
		return m;
	    }
	},

	/*
	 Adds a hide button 'X' to the dialogue.
	 */
	close: function() {
	    var closeButton = el
	    // This padding provides space for the button.
		    .style("padding-right", "1.5em")
		    .append("span")
		    .classed("close-button", true)
		    .style("font-size", "x-large")
		    .style("font-family", "monospace")
		    .style("position", "absolute")
		    .style("top", "0")
		    .style("right", "5px")
		    .style("cursor", "pointer")
		    .html("X");

	    closeButton.on("click", disable);

	    return m;
	},

	/*
	 Adds a resize handle to the dialogue.
	 */
	resize: function() {
	    var dragHandle = d3.behavior.drag()
		    .origin(function(d){
			return {
			    "x" : parseInt(el.style("width")),
			    "y" : parseInt(el.style("height"))
			};
		    })
		    .on("dragstart", function(d){
			d3.event.sourceEvent.stopPropagation();
		    })
		    .on("drag", function(d){
			setSize(d3.event.x, d3.event.y);
			onSizeChanged([d3.event.x, d3.event.y]);
		    });

	    el
	    // This padding prevents us from make the box too small to resize.
		.style("padding-bottom", "3em")
	    // This padding provides space for the button.
		.style("padding-right", "1.5em")
		.append("span")
		.classed("resize-dialogue", true)
		.style("font-size", "xx-large")
		.style("font-family", "monospace")
		.style("position", "absolute")
		.style("bottom", "0")
		.style("right", "5px")
		.html("⇘")
		.call(dragHandle);

	    return m;
	},

	bringToFront: function() {
	    el.append("span")
		.classed("bring-to-front", true)
		.style("font-family", "monospace")
		.style("font-weight", "bold")
		.style("position", "absolute")
		.style("right", "2em")
		.style("bottom", "0.2em")
		.style("cursor", "pointer")
		.text("TOP")
		.on("click", function(d, i) {
		    el.style("z-index", getNextZ());
		});

	    return m;
	},

	hide: function() {
	    visibility(false);
	    return m;
	},

	show: function() {
	    visibility(true);
	    return m;
	},

	visible: function() {
	    return el.style("visibility") === "visible";
	},

	content: function() {
	    return content;
	},

	currentOpenButton: function() {
	    return currentOpenButton;
	},

	el: function() {
	    return el;
	},

	manuallySized: function() {
	    return manuallySized;
	},

	manuallyPositioned: function() {
	    return manuallyPositioned;
	},

	/*
	 Gets or sets the current size of the dialogue in [width, height] pixels
	 */
	size: function(value) {
	    if (value) {
		setSize(value[0], value[1]);
		onSizeChanged(value);
		return m;
	    }
	    
	    return [
		parseInt(el.style("width")),
		parseInt(el.style("height"))
	    ];
	},

	/*
	 Gets or sets the current position of the dialogue relative to the top-left corner in [x, y] pixels.
	 */
	position: function(value) {
	    if (value) {
		setPosition(value[0], value[1]);
		onPositionChanged(value);
		return m;
	    }
	    
	    return [
		parseInt(el.style("left")),
		parseInt(el.style("top"))
	    ];
	},

	onVisibilityChanged: onVisibilityChanged.add,
	onPositionChanged: onPositionChanged.add,
	onSizeChanged: onSizeChanged.add
    };

    el
	.style("overflow", "hidden");

    d3.select(window)
    // Each of these needs a unique namespace because otherwise they'll overwrite each other.
	.on("resize." + Math.random(), function(d, i) {
	    if (manuallyPositioned) {
		setPosition(
		    parseInt(el.style("left")),
		    parseInt(el.style("top"))
		);
	    }

	    if (manuallySized) {
		setSize(
		    parseInt(el.style("width")),
		    parseInt(el.style("height"))
		);
	    }
	});

    return m;
};