"use strict";

/*global module, require*/

var d3 = require("d3");

var makeToggleFunction = function(el, button) {
    return function() {
	var wasVisible = (el.style("visibility") === "visible");
	
	button.classed("element-visible", wasVisible ? false : true);
	el.style("visiblity", wasVisible ? "hidden" : "visible");
    };
};

/*
 Provides some functions which can be applied to an HTML element.
 */
module.exports = {
    drag: d3.behavior.drag()
	.origin(function(d){
	    var el = d3.select(this);
	    return {
		"x" : parseInt(el.style("left")),
		"y" : parseInt(el.style("top"))
	    };
	})
	.on("drag", function(d){
	    d3.select(this)
		.style("top", d3.event.y + "px")
		.style("left", d3.event.x + "px");
	}),

    open: function(el, button) {
	button
	    .classed("open-button", true)
	    .on("click", makeToggleFunction(el, button));
    },

    close: function(el, openButton) {
	var closeButton = el.append("span")
	    .classed("close-button", true)
	    .style("font-size", "large")
	    .style("position", "absolute")
	    .style("top", "5px")
	    .style("right", "5px")
	    .style("opacity", "0.6")
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
    },

    resize: function(el) {
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
	    .style("font-size", "large")
	    .style("position", "absolute")
	    .style("bottom", "5px")
	    .style("right", "5px")
	    .style("opacity", "0.6")
	    .html("⇲")
	    .call(dragHandle);
    }
};