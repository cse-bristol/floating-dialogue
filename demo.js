"use strict";

/*global require*/

var d3 = require("d3"),
    body = d3.select(document.body),
    floatDialogue = require("./src/floating-dialogue.js"),
    el = body.append("div")
	.style("width", "10em")
	.style("height", "4em")
	.style("border", "1px solid red"),
    button = body.append("div")
	.text("Open/Close Button")
	.style("right", "1vw")
	.style("position", "absolute"),
    button2 = body.append("div")
	.text("Button 2")
	.style("right", "1vw")
	.style("top", "2em")
	.style("position", "absolute");

floatDialogue(el)
    .drag()
    .resize()
    .open(d3.selectAll([button.node(), button2.node()]))
    .hide()
    .close()
    .content()
    .text("Draggable Thing");
