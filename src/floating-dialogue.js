"use strict";

/*global module, require*/

var d3 = require("d3");

/*
 Provides some functions which can be applied to an HTML element.
 */
module.exports = function(el) {
    var openButtons,
	currentOpenButton,
	closeButton,
	content = el.append("div")
	    .classed("content", true);

    var visibility = function(show, targetButton) {
	if (openButtons !== undefined) {
	    openButtons.classed("element-visible", false);

	    if (show && targetButton !== undefined) {
		currentOpenButton = targetButton;
		targetButton.classed("element-visible", true);
	    }
	}
	el.style("visibility", show ? "visible" : "hidden");
    };

    var disable = function() {
	if (openButtons !== undefined) {
	    openButtons.classed("element-visible", false);
	}

	el.style("visibility", "hidden");
    };

    var toggle = function(button) {
	// if it's not visible, open it with the button
	var wasVisible = (el.style("visibility") === "visible");

	visibility(
	    !(wasVisible && button.node() === currentOpenButton.node()),
	    button
	);
    };

    el
	.style("overflow", "hidden");

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
			el
			    .style("top", d3.event.y + "px")
			    .style("left", d3.event.x + "px");
		    })
	    );

	    return m;
	},
	
	open: function(buttons) {
	    if (buttons.empty()) {
		buttons = undefined;
		currentOpenButton = undefined;
		m.hide();
		return m;
	    } else {
		// If the current open button isn't in the selection, clear it.
		if (currentOpenButton && buttons.filter(function(d, i) {
		    return this === currentOpenButton.node();
		}.empty())) {
		    currentOpenButton = undefined;
		}
		
		buttons
		    .classed("open-button", true)
		    .classed("element-visible", function(d, i) {
			if (el.attr("visibility") !== "hidden") {
			    if (currentOpenButton && this === currentOpenButton.node()) {
				return true;
			    } else if (currentOpenButton === undefined) {
				currentOpenButton = d3.select(this);
				return true;
			    }
			}
			return false;
		    })
		    .style("cursor", "pointer")
		    .on("click", function(d, i) {
			d3.event.preventDefault();
			toggle(d3.select(this));
		    });
		
		openButtons = buttons;
		
		return m;
	    }
	},

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
		    .style("opacity", "0.6")
		    .style("cursor", "pointer")
		    .html("X");

	    closeButton.on("click", disable);

	    return m;
	},

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
			el.style("height", d3.event.y + "px");
			el.style("width", d3.event.x + "px");
		    });

	    el
	    // This padding prevents us from make the box too small to resize.
		.style("padding-bottom", "3em")
	    // This padding provides space for the button.
		.style("padding-right", "1.5em")
		.append("span")
		.style("font-size", "xx-large")
		.style("font-family", "monospace")
		.style("position", "absolute")
		.style("bottom", "0")
		.style("right", "5px")
		.style("opacity", "0.6")
		.html("⇘")
		.call(dragHandle);

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

	content: function() {
	    return content;
	},

	currentOpenButton: function() {
	    return currentOpenButton;
	}
    };
    return m;
};
