"use strict";

/*global require*/

var d3 = require("d3"),
    body = d3.select(document.body),
    floatDialogue = require("./src/floating-dialogue.js"),
    el = body.append("div")
	.style("width", "10em")
	.style("height", "4em")
	.style("border", "1px solid red")
	.style("background-color", "pink"),
    button = body.append("div")
	.text("Open/Close Button")
	.style("right", "1vw")
	.style("position", "absolute"),
    button2 = body.append("div")
	.text("Button 2")
	.style("right", "1vw")
	.style("top", "2em")
	.style("position", "absolute"),

    el2 = body.append("div")
	.style("width", "10em")
	.style("height", "4em")
	.style("border", "1px solid red")
	.style("background-color", "grey");

floatDialogue(el)
    .drag()
    .resize()
    .show()
    .open(d3.selectAll([button.node(), button2.node()]))
    .close()
    .size([200, 200])
    .position([100, 100])
    .bringToFront()
    .content()
    .text("Connected to Buttons");

floatDialogue(el2)
    .drag()
    .resize()
    .show()
    .bringToFront()
    .content()
    .text("Standalone");




