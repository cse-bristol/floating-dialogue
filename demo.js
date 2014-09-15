"use strict";

/*global require*/

var d3 = require("d3"),
    body = d3.select(document.body),
    floatDialogue = require("./src/floating-dialogue.js"),
    el = body.append("div")
	.style("width", "10em")
	.style("height", "4em")
	.style("position", "fixed")
	.style("border", "1px solid red"),
    button = body.append("div")
	.text("Open/Close Button")
	.style("position", "fixed")
	.style("right", "1vw");

floatDialogue(el)
    .drag()
    .resize()
    .open(button)
    .close()
    .content()
    .text("Draggable Thing");
