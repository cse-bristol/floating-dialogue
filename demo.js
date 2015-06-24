"use strict";

/*global require*/

var d3 = require("d3"),
    body = d3.select(document.body),
    dialogue = require("./js/index.js"),

    getData = function(id) {
	return data[id];
    },

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
	fact.loadData({
	    id: 0,
	    size: [200, 200],
	    visible: true
	}),
	fact.loadData({
	    id: 1,
	    size: [200, 100],
	    visible: true
	})	
    ],

    buttonContainers = body.selectAll("div.button")
	.data(data);

buttonContainers.enter().append("div");	

drawing.dialogues(data);
drawing.buttons(buttonContainers);
	


