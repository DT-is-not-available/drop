let code = document.getElementById("codeArea")

var mouseX = 0
var mouseY = 0

addEventListener("mousemove", event=>{
	mouseX = event.clientX
	mouseY = event.clientY
})

let draggingtext = ""

function codePalette(obj) {
	let pal = document.getElementById("palette")
	for (const [k, v] of Object.entries(obj)) {
		if (v) {
			let details = document.createElement("details")
			details.className = "cat"
			let summary = document.createElement("summary")
			summary.innerText = k
			details.id = k+"_palette"
			details.append(summary)
			for (let i = 0; i < v.length; i++) {
				let snippet = document.createElement("snippet")
				let snipobj = v[i]
				let text
				if (typeof snipobj === "string") {
					text = snipobj
					snippet.addEventListener("mousedown", zonemake)
				} else {
					let label = document.createElement("label")
					if (snipobj.label) {
						label.innerText = snipobj.label
						details.append(label)
					}
					text = snipobj.text
					if (snipobj.reporter) {
						snippet.addEventListener("mousedown", repzonemake)
						snippet.className = "rounded"
					} else {
						snippet.addEventListener("mousedown", zonemake)
					}
				}
				snippet.innerHTML = text.replaceAll("\x01","<span class=slot>\x01</span>").replaceAll("\x02","<span class=typeslot>\x02</span>")
				details.append(snippet)
			}
			pal.append(details)
		} else {
			pal.append(document.createElement("hr"))
		}
	}
}

function zonemake(e) {
	document.getElementById("codeArea").parentElement.style.display = "none"
	let pre = document.querySelector(".input pre")
	pre.className = "flex column fill"
	let elems = [...pre.children]
	let gathered = []
	let target = e.target
	let parent = target.parentElement
	let MOVINGELEM = target.cloneNode(true)
	target.id = "sniphide"
	parent.append(MOVINGELEM)
	let ox = e.offsetX
	let oy = e.offsetY
	MOVINGELEM.id = "moving"
	MOVINGELEM.style.left = (mouseX-ox)+"px"
	MOVINGELEM.style.top = (mouseY-oy)+"px"
	draggingtext = target.innerText.split("\x00")[0]
	INTERVAL = setInterval(()=>{
		MOVINGELEM.style.left = (mouseX-ox)+"px"
		MOVINGELEM.style.top = (mouseY-oy)+"px"
	},0)
	function makeFromGathered() {
		let block = document.createElement("span")
		block.style.display = "block"
		if (gathered.length == 1 && gathered[0].className == "whitespace" || gathered.length == 0) {
			if (gathered.length == 0) {
				block.id = "blankline"
				block.innerText = " "
			}
			block.className = "replace"
		} else {
			block.className = "insert"
		}
		for (let i = 0; i < gathered.length; i++) {
			block.append(gathered[i])
		}
		pre.append(block)
		gathered = []
	}
	for (let i = 0; i < elems.length; i++) {
		if (elems[i].className != "newline") {
			elems[i].remove()
			gathered.push(elems[i])
		} else {
			elems[i].remove()
			makeFromGathered()
		}
	}
	let emptyspace = document.createElement("div")
	emptyspace.className = "append"
	makeFromGathered()
	pre.append(emptyspace)
	addEventListener("mouseup", zonereset, {once:true})
}

function repzonemake(e) {
	document.getElementById("codeArea").parentElement.style.display = "none"
	let pre = document.querySelector(".input pre")
	let target = e.target
	let parent = target.parentElement
	let MOVINGELEM = target.cloneNode(true)
	target.id = "sniphide"
	parent.append(MOVINGELEM)
	let ox = e.offsetX
	let oy = e.offsetY
	MOVINGELEM.id = "moving"
	MOVINGELEM.style.left = (mouseX-ox)+"px"
	MOVINGELEM.style.top = (mouseY-oy)+"px"
	draggingtext = target.innerText.split("\x00")[0]
	INTERVAL = setInterval(()=>{
		MOVINGELEM.style.left = (mouseX-ox)+"px"
		MOVINGELEM.style.top = (mouseY-oy)+"px"
	},0)
	// [...document.querySelectorAll(".editslot")]
	addEventListener("mouseup", repzonereset, {once:true})
}

function repzonereset(e) {
	let codeArea = document.getElementById("codeArea")
	let pre = document.querySelector(".input pre")
	clearInterval(INTERVAL)
	let target = e.target
	let movingchip = document.getElementById('moving')
	document.getElementById("sniphide").id = ""
	let update = false
	if (target.className == "editslot" ) {
		let htmlrevert = target.innerHTML
		target.innerText = draggingtext
		codeArea.value = pre.innerText
		target.innerHTML = htmlrevert
		update = true
		codeArea.placeholder = ""
	} else if (target.className == "number" || target.className == "string" || target.className == "define" || target.className == "keywordval") {
		let htmlrevert = target.innerHTML
		let val = target.innerText
		target.innerText = draggingtext.replace("\x01",target.innerText)
		codeArea.value = pre.innerText
		target.innerHTML = htmlrevert
		update = true
		codeArea.placeholder = ""
	}
	movingchip.id = ""
	codeArea.parentElement.style.display = "inline-block"
	if (update) setTimeout(()=>{
		let loc = codeArea.value.indexOf("\x01")
		if (loc != -1) {
			codeArea.focus()
			codeArea.value = codeArea.value.replaceAll("\x01","\x00\x00\x00\x00")
			codeArea.selectionStart = loc
			codeArea.selectionEnd = loc+4
		}
		decorator.update()
	},0)
	movingchip.remove()
}

function zonereset(e) {
	let codeArea = document.getElementById("codeArea")
	let pre = document.querySelector(".input pre")
	clearInterval(INTERVAL)
	let target = e.target
	let movingchip = document.getElementById('moving')
	document.getElementById("sniphide").id = ""
	let update = false
	if (target.className == "append") {
		codeArea.value += "\n"+draggingtext
		update = true
		codeArea.placeholder = ""
	} else if (target.className == "replace") {
		let htmlrevert = target.innerHTML
		let whitespace = target.innerText.replace(" ","")
		let lines = draggingtext.split("\n")
		for (let i = 0; i < lines.length; i++) {
			lines[i] = whitespace + lines[i]
		}
		target.innerText = lines.join("\n")
		codeArea.value = pre.innerText
		target.innerHTML = htmlrevert
		update = true
		codeArea.placeholder = ""
	} else if (target.className == "insert") {
		let htmlrevert = target.innerHTML
		let whitespace = target.innerText.replace(" ","").match(/^\s+/)
		if (whitespace) whitespace = whitespace[0]
		else whitespace = ''
		if (target.innerText[target.innerText.length-1] == "{") whitespace = "\t"+whitespace
		let lines = draggingtext.split("\n")
		for (let i = 0; i < lines.length; i++) {
			lines[i] = whitespace + lines[i]
		}
		target.innerText += "\n"+lines.join("\n")
		codeArea.value = pre.innerText
		target.innerHTML = htmlrevert
		update = true
		codeArea.placeholder = ""
	}
	movingchip.id = ""
	codeArea.parentElement.style.display = "inline-block"
	pre.className = ""
	let elems = [...pre.children]
	for (let i = 0; i < elems.length-1; i++) {
		elems[i].remove()
		let children = [...elems[i].children]
		for (let i = 0; i < children.length; i++) {
			pre.appendChild(children[i])
		}
		let newline = document.createElement("span")
		newline.innerText = "\n"
		newline.className = "newline"
		if (i < elems.length-2) pre.appendChild(newline)
	}
	elems[elems.length-1].remove()
	if (update) setTimeout(()=>{
		let loc = codeArea.value.indexOf("\x01")
		if (loc != -1) {
			codeArea.focus()
			codeArea.value = codeArea.value.replaceAll("\x01","\x00\x00\x00\x00")
			codeArea.selectionStart = loc
			codeArea.selectionEnd = loc+4
		}
		decorator.update()
	},0)
	codeArea.value = codeArea.value.replaceAll(" ","")
	movingchip.remove()
}

function renameVar(a, b) {
	let tokens = parser.tokenize(codeArea.value)
	if (tokens) {
		for (let i = 0; i < tokens.length; i++) {
			let type = parser.identify(tokens, i)
			if (type == "define" && tokens[i] == a) {
				tokens[i] = b
			}
		}
		codeArea.value = tokens.join("")
		decorator.update()
	}
}

let codeArea = document.getElementById('codeArea')
codeArea.addEventListener('keydown', function(e) {
	codeArea.placeholder = ""
	if (e.key == 'Tab') {
		e.preventDefault();
		var start = this.selectionStart;
		var end = this.selectionEnd;

		var indexOf = this.value.indexOf("\x00")

		if (indexOf != -1) {
			let index = this.value.indexOf("\x00", this.selectionEnd)
			if (index != -1) this.selectionStart = index
			else this.selectionStart = this.value.indexOf("\x00")
			this.selectionEnd = this.selectionStart + 4
		} else {
			// set textarea value to: text before caret + tab + text after caret
			this.value = this.value.substring(0, start) +
				"\t" + this.value.substring(end);
			
			// put caret at right position again
			this.selectionStart =
				this.selectionEnd = start + 1;
			  
			// update the syntax highlighting
			decorator.update()
		}
	}
	if (e.key == '{') {
		e.preventDefault();
		var start = this.selectionStart;
		var end = this.selectionEnd;
		
		// set textarea value to: text before caret + tab + text after caret
		this.value = this.value.substring(0, start) +
			"{" + this.value.substring(end);
		
		// put caret at right position again
		this.selectionStart =
			this.selectionEnd = start + 1;
		  
		// update the syntax highlighting
		decorator.update()
	}
	if (e.key == '[') {
		e.preventDefault();
		var start = this.selectionStart;
		var end = this.selectionEnd;
		
		// set textarea value to: text before caret + tab + text after caret
		this.value = this.value.substring(0, start) +
			"[" + this.value.substring(end);
		
		// put caret at right position again
		this.selectionStart =
			this.selectionEnd = start + 1;
		  
		// update the syntax highlighting
		decorator.update()
	}
	if (e.key == '(') {
		e.preventDefault();
		var start = this.selectionStart;
		var end = this.selectionEnd;
		
		// set textarea value to: text before caret + tab + text after caret
		this.value = this.value.substring(0, start) +
			"(" + this.value.substring(end);
		
		// put caret at right position again
		this.selectionStart =
			this.selectionEnd = start + 1;
		  
		// update the syntax highlighting
		decorator.update()
	}
	if (e.key == "Enter") {
		e.preventDefault();
		var start = this.selectionStart;
		var end = this.selectionEnd;

		var indentation = codeArea.value.substring(codeArea.value.lastIndexOf("\n", end-1), end).match(/^\s+/)
		if (indentation) indentation = indentation[0].replace("\n","")
		else indentation = ""

		var after = ""
		var pindent = indentation

		if (codeArea.value[end-1] == "{") {
			indentation += "\t"
			after = "\n"+pindent+"}"
		}
		if (codeArea.value[end-1] == "[") {
			indentation += "\t"
			after = "\n"+pindent+"]"
		}
		if (codeArea.value[end-1] == "(") {
			indentation += "\t"
			after = "\n"+pindent+")"
		}
		
		// set textarea value to: text before caret + newline + text after caret
		this.value = this.value.substring(0, start) +
			"\n" + indentation + after + this.value.substring(end);
		
		// put caret at right position again
		this.selectionStart =
			this.selectionEnd = start + 1 + indentation.length;
		  
		// update the syntax highlighting
		decorator.update()
	}
});

let oldStart = codeArea.selectionStart
let oldEnd = codeArea.selectionEnd

let mousedown = false

codeArea.addEventListener("mousedown",()=>{mousedown = true})
addEventListener("mouseup",()=>{mousedown = false;shift()})

function shift() {
	if (codeArea.value[codeArea.selectionStart-1] == "\x00") {
		codeArea.selectionStart = codeArea.selectionStart - 1
		shift()
	}
	if (codeArea.value[codeArea.selectionEnd] == "\x00") {
		codeArea.selectionEnd = codeArea.selectionEnd + 1
		shift()
	}
}
setInterval(()=>{
	if (codeArea.selectionStart != oldStart || codeArea.selectionEnd != oldEnd) {
		if (!mousedown) shift()
	}
	oldStart = codeArea.selectionStart
	oldEnd = codeArea.selectionEnd
},0)

function reporter(arg) {
	return { text: arg[0], reporter: true }
}