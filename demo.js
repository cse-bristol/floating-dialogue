"use strict";

/*global require*/

var d3 = require("d3"),
    body = d3.select(document.body),
    dialogue = require("./js/index.js"),

    getData = function(id) {
	return data[id];
    },

    singleFact = dialogue(
    	"single-dialogue",
    	{
    	    reposition: true,
    	    resize: true,
    	    close: true,
    	    sticky: true,
    	    bringToFront: true,
    	    findSpace: true,
    	    lockToScreen: true,
    	    initialVisibility: false	    
    	}
    ).single(),

    singleDrawing = singleFact.drawing(
    	body,
    	function(dialogues, newDialogues) {
    	    newDialogues
    		.style("border", "1px solid red")
    		.style("background-color", "orange")
    		.text("Single Dialogue");
    	},
    	body,
    	function(buttons, newButtons) {
    	    newButtons
    		.text("Open/Close Button for single dialogue")
    		.classed("single-button", true)
    		.style("position", "absolute")
    		.style("right", "1vw")
    		.style("bottom", "1em");
    	}
    ),

    fact = dialogue(
	"demo-dialogue",
	{
	    reposition: true,
	    close: true,
	    resize: true,
	    sticky: true,
	    bringToFront: true,
	    findSpace: true,
	    lockToScreen: true
	}
    ),

    drawing = fact.drawing(
	getData,
	body,
	function(dialogues, newDialogues) {
	    newDialogues
		.style("border", "1px solid red")
		.style("background-color", function(d, i) {
		    return ["pink", "green"][i];
		});
	},
	function(buttons, newButtons) {
	    newButtons
		.text(function(d, i) {
		    return "Open/Close Button " + d.id;
		})
		.style("right", "1vw")
		.style("top", function(d, i) {
		    return (1 + (d.id * 2)) + "em";
		})
		.style("position", "absolute");
	},
	function(parentDatum) {
	    return parentDatum;
	}
    ),

    data = [
	fact.deserialize({
	    id: 0,
	    size: [200, 200],
	    visible: true
	}),
	fact.deserialize({
	    id: 1,
	    size: [200, 100],
	    visible: true
	})	
    ],

    buttonContainers = body.selectAll("div.button")
	.data(data);

buttonContainers.enter().append("div")
    .classed("button", true);	

drawing.dialogues(data);
drawing.buttons(buttonContainers);

singleFact.load({
    size: [300, 300]
});
