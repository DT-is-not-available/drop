document.getElementById("editor").onload = ()=>{
	editor = document.getElementById("editor").contentWindow
	editor.codeArea.placeholder = 
`/*
	Welcome to the drag-n-drop editor!
	Start typing, or drag in a snippet from the left.
*/`
	editor.codePalette({
		Images: [],
		Sounds: [],
		A: false,
		Graphics: [
			`canvas.width = \x01`,
			`canvas.height = \x01`,
			`canvas.remove()`,
			`ctx.drawImage(\x01, \x01, \x01)`,
			editor.reporter `\x01.width`,
			editor.reporter `\x01.height`,
		],
		Audio: [
			`\x01.play()`,
			`\x01.stop()`,
		],
		Events: [
`addEventListener("click", (event) => {
	
})`,
`addEventListener("mousedown", (event) => {
	
})`,
`addEventListener("mouseup", (event) => {
	
})`,
`addEventListener("mousemove", (event) => {
	
})`,
		],
		Control: [
`if (\x01) {
	
}`,
`if (\x01) {
	
} else {
	
}`,
`while (\x01) {
	
}`,
`for (let i = 0; i < \x01; i++) {
	
}`,
`function \x01() {
	
}`,
		],
		Sensing: [],
		Operators: [
			editor.reporter `(\x01 + \x01)`,
			editor.reporter `(\x01 - \x01)`,
			editor.reporter `(\x01 * \x01)`,
			editor.reporter `(\x01 / \x01)`,
		],
		Variables: [
			`var \x01 = 10`,
			`var \x01 = "Hello world!"`,
			`var \x01 = \x01`,
			`\x01 = 10`,
			`\x01 += 1`,
			`\x01 -= 1`,
		],
		Output: [
			`console.log(\x01)`,
			`alert(\x01)`,
			`prompt(\x01)`,
		],
		"My Snippets": []
	})
	
	Images_palette = editor.document.getElementById("Images_palette")
	let img_upload = document.createElement("snippet")
	img_upload.innerText = "Upload Image"
	img_upload.style.cursor = "pointer"
	img_upload.style.border = "none"
	Images_palette.append(img_upload)

	let i_u = document.createElement("input")
	i_u.type = "file"

	images = {}
	imgcount = 0

	i_u.addEventListener("change", function() {
		let image = document.createElement("img")
		image.src = URL.createObjectURL(this.files[0])
		let snippet = document.createElement("snippet")
		image.style.maxWidth = "300px"
		image.style.maxHeight = "100px"
		let imgname = "image_"+imgcount
		let imgnelem = document.createElement("span")
		imgnelem.style.pointerEvents = "none"
		imgnelem.innerText = imgname+"\x00\n"
		snippet.append(imgnelem)
		snippet.append(image)
		let editbtn = document.createElement("button")
		editbtn.className = "edit"
		snippet.append(editbtn)
		snippet.className = "rounded"
		editbtn.onclick = ()=>{
			let str = prompt("Please enter a name for the image. It can only contain _, $, and numbers and letters. It cannot start with a number.")
			if (str && str.match(/^[A-Za-z$_][\w$]*$/gm)) {
				if (images[str]) alert("An image with that name already exists.")
				else {
					delete images[imgname]
					window.editor.renameVar(imgname, str)
					imgname = str
					imgnelem.innerText = imgname+"\x00\n"
					images[imgname] = image.src
				}
			} else if (str) alert("The name you provided is invalid.")
		}
		let delbtn = document.createElement("button")
		delbtn.className = "delete"
		snippet.append(delbtn)
		delbtn.onclick = ()=>{
			if (confirm("Are you sure you want to delete this image? This will replace all instances of this image in your code with blanks.")) {
				delete images[imgname]
				window.editor.renameVar(imgname, "\x00\x00\x00\x00")
				snippet.remove()
			}
		}
		image.onload = ()=>{	
			snippet.append(image.naturalWidth+"x"+image.naturalHeight+"\n")
			snippet.append(image)
		}
		images[imgname] = image.src
		image.style.display = "block"
		snippet.addEventListener("mousedown", (e)=>{
			if (e.target == snippet) editor.repzonemake(e)
		})
		Images_palette.append(snippet)
		imgcount++
		i_u.value = null
	})

	img_upload.onclick = ()=>i_u.click()
	
	Sounds_palette = editor.document.getElementById("Sounds_palette")
	let mp3_upload = document.createElement("snippet")
	mp3_upload.innerText = "Upload Sound"
	mp3_upload.style.cursor = "pointer"
	mp3_upload.style.cursor = "not-allowed"
	mp3_upload.style.border = "none"
	Sounds_palette.append(mp3_upload)
	
	if (localStorage.darkmode) editor.document.body.className = "dark"
}
runtime = document.getElementById("runtime").contentWindow
;(document.getElementById("runtime").onload = ()=>{
	runtime.document.write(
String.raw`<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8">
	<title>runtime</title>
	<style>
body {
	margin: 0;
	background: white;
	color: #222;
	display: flex;
	flex-direction: column;
}
body, html {
	width: 100%;
	height: 100%;
	overflow: hidden;
	text-align: center;
}
body.dark {
	background: #222;
	color: white;
	color-scheme: dark;
}
#canvas {
	max-width: 100%;
	max-height: 100%;
	background: white;
	margin: 0px;
}
#log {
	text-align: left;
	padding: 2px;
	margin: 0px;
	white-space: pre-wrap;
	border-top: 1px solid gray;
	overflow-y: scroll;
 	flex: 1;
}
	</style>
</head>

<body>
	<div>
		<canvas id="canvas" width=480 height=360></canvas>
	</div>
	<pre id="log"></pre>
	<script>
function $__run(code, cb) {
	setTimeout(()=>{
		try {
			eval(code)
		} catch (e) {
			cb(e)
		}
	},1)
}
function $__log(txt) {
	document.getElementById("log").append(txt+"\n")
}
console.log = (...a)=>$__log(a.join(" "))
console.warn = (...a)=>$__log(a.join(" "))
console.error = (...a)=>$__log(a.join(" "))
console.debug = (...a)=>$__log(a.join(" "))
console.info = (...a)=>$__log(a.join(" "))
ctx = (canvas = document.getElementById("canvas")).getContext('2d')
	</script>
</body>

</html>`)
	if (localStorage.darkmode) runtime.document.body.className = "dark"

	let errhand = (e)=>{
		let stack1 = e.stack.split("\n")[1]
		runtime.$__log(e.stack)
		console.warn(e.stack)
		stack1 = stack1.replace(/\:5\:\d/,"")
		let lc = stack1.split(":")
		lc[1] = parseInt(lc[1])
		function getPosition(string, subString, index) {
			return string.split(subString, index).join(subString).length;
		}
		e.lineno = lc[1]
		e.colno = parseInt(lc[2])
		if (e.stack.split("\n").length == 2) {
			alert("Uncaught "+e.stack.split("\n")[0])
			editor.codeArea.focus()
		} else {
			alert("Uncaught "+e.stack.split("\n")[0]+"\nThe error is located at line "+e.lineno+" column "+e.colno+", your cursor will automatically be moved to the issue.")
			editor.codeArea.focus()
			editor.codeArea.selectionStart = editor.codeArea.selectionEnd = 
				(e.lineno == 1 ? -1 : getPosition(editor.codeArea.value, "\n", e.lineno-1))+e.colno
		}
	}
	
	runtime.addEventListener("error", (e)=>{
		alert(e.message+"\nThe error is located at line "+(e.lineno-2)+" column "+e.colno+", your cursor will automatically be moved to the issue.")
		editor.codeArea.focus()
		editor.codeArea.selectionStart = editor.codeArea.selectionEnd = 
			getPosition(editor.codeArea.value, "\n", e.lineno-3)+e.colno
	})
	
	if (editor.codeArea) {
		for (const [k, v] of Object.entries(images)) {
			runtime[k] = new Image()
			runtime[k].src = v
		}
		runtime.$__run(editor.codeArea.value, errhand)
	}
})()
function dark() {
	localStorage.darkmode = "true"
	document.body.className = "dark"
	editor.document.body.className = "dark"
	runtime.document.body.className = "dark"
}
function light() {
	localStorage.darkmode = ""
	document.body.className = ""
	editor.document.body.className = ""
	runtime.document.body.className = ""
}
function run() {
	runtime.location.reload()
}
if (localStorage.darkmode) document.body.className = "dark"

function getImageData(img) {
    let c = document.createElement("canvas")
    let g = c.getContext("2d")
    c.width = img.width
    c.height = img.height
    g.drawImage(img, 0, 0)
    return g.getImageData(0, 0, c.width, c.height)
}
function binify(Uint8) {
    let ret = ''
    for (let i = 0; i < Uint8.length; i++) {
        ret += String.fromCharCode(Uint8[i])
    }
    return ret
}
function getImageStr(img) {
	let data = getImageData(img)
	return JSON.stringify([data.width, data.height, data.colorSpace, binify(data.data)])
}
function debinify(str) {
    let ret = []
    for (let i = 0; i < str.length; i++) {
        ret.push(str.charCodeAt(i))
    }
    return new Uint8ClampedArray(ret)
}
function fromImageStr(str) {
	let arr = JSON.parse(str)
	let data = new ImageData(debinify(arr[3]),arr[0], arr[1], {
		colorSpace: arr[2]
	})
    let c = document.createElement("canvas")
    let g = c.getContext("2d")
    c.width = data.width
    c.height = data.height
	g.putImageData(data, 0, 0)
	let image = new Image()
	image.src = c.toDataURL()
	return image
}
function $__debinify(str) {
    let ret = []
    for (let i = 0; i < str.length; i++) {
        ret.push(str.charCodeAt(i))
    }
    return new Uint8ClampedArray(ret)
}
function $__fromImageStr(str) {
	let arr = JSON.parse(str)
	let data = new ImageData($__debinify(arr[3]),arr[0], arr[1], {
		colorSpace: arr[2]
	})
    let c = document.createElement("canvas")
    let g = c.getContext("2d")
    c.width = data.width
    c.height = data.height
	g.putImageData(data, 0, 0)
	let image = new Image()
	image.src = c.toDataURL()
	return image
}
function fullscreen() {
	document.getElementById("runtime").requestFullscreen()
}