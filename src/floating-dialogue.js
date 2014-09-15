"use strict";

/*global module, require*/

var d3 = require("d3");

var makeToggleFunction = function(el, button) {
    return function() {
	var wasVisible = (el.style("visibility") === "visible");
	
	button.classed("element-visible", wasVisible ? false : true);
	el.style("visibility", wasVisible ? "hidden" : "visible");
    };
};

/*
 Provides some functions which can be applied to an HTML element.
 */
module.exports = function(el) {
    var openButton,
	closeButton,
	content = el.append("div")
	    .classed("content", true);

    el
    // Padding prevents us from make the box too small to resize.
	.style("overflow", "hidden")
	.style("padding-right", "1.5em")
	.style("padding-bottom", "3em");

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
	
	open: function(button) {
	    button
		.classed("open-button", true)
		.style("cursor", "pointer")
		.on("click", makeToggleFunction(el, button));

	    openButton = button;

	    if (closeButton) {
		closeButton.on("click", makeToggleFunction(el, openButton));
	    };
	    
	    return m;
	},

	close: function() {
	    var closeButton = el.append("span")
		    .classed("close-button", true)
		    .style("font-size", "x-large")
		    .style("font-family", "monospace")
		    .style("position", "absolute")
		    .style("top", "0")
		    .style("right", "5px")
		    .style("opacity", "0.6")
		    .style("cursor", "pointer")
		    .html("❌");

	    if (openButton) {
		closeButton.on("click", makeToggleFunction(el, openButton));
		
	    } else {
		closeButton.on(
		    "click", 
		    function(d, i){
			el.style("visibility", "hidden");
		    }
		);
	    }

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

	    el.append("span")
		.style("font-size", "xx-large")
		.style("font-family", "monospace")
		.style("position", "absolute")
		.style("bottom", "0")
		.style("right", "5px")
		.style("opacity", "0.6")
		.html("⇲")
		.call(dragHandle);

	    return m;
	},

	content: function() {
	    return content;
	}
    };
    return m;
};
