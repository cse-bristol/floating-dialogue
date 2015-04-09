"use strict";

/*global require*/

var d3 = require("d3"),
    body = d3.select(document.body),
    floatDialogue = require("./js/floating-dialogue.js"),
    el = body.append("div")
	.style("padding-top", "1em")
	.style("padding-left", "1em")
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
	.style("padding-top", "1em")
	.style("padding-left", "1em")
	.style("width", "10em")
	.style("height", "4em")
	.style("border", "1px solid red")
	.style("background-color", "grey"),

    el3 = body.append("div")
	.style("padding-top", "1em")
	.style("padding-left", "1em")
	.style("width", "10em")
	.style("height", "4em")
	.style("border", "1px solid red")
	.style("background-color", "green");

floatDialogue(el)
    .drag()
    .resize()
    .show()
    .sticky()
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
    .sticky()
    .bringToFront()
    .content()
    .text("Standalone");


floatDialogue(el3)
    .drag()
    .resize()
    .show()
    .sticky()
    .findSpace()
    .content()
    .text("Automatically positioned in a free space");

