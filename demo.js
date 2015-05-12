"use strict";

/*global require*/

var d3 = require("d3"),
    body = d3.select(document.body),
    dialogue = require("./js/index.js"),

    getData = function(id) {
	return data[id];
    },

    redraw = function() {
	var dialogues = fact.draw(data);
	dialogues.newDialogues
	    .style("border", "1px solid red")
	    .style("background-color", function(d, i) {
		return ["pink", "green"][i];
	    });
	
	fact.buttons(buttons, newButtons);
    },

    fact = dialogue(
	body,
	getData,
	redraw,
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

    buttons = body.selectAll("div.button")
	.data(data),

    newButtons = buttons
	.enter()
	.append("div")
	.classed("button", true)
	.text(function(d, i) {
	    return "Open/Close Button " + i;
	})
	.style("right", "1vw")
	.style("top", function(d, i) {
	    return (1 + (i * 2)) + "em";
	})
	.style("position", "absolute");

redraw();
