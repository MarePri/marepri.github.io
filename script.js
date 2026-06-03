// Parallax Code
var scene = document.getElementById('scene');
var parallax = new Parallax(scene);

var button = document.getElementById('hover');
var body = document.body;

button.onmouseover = function() {
    body.className = 'hovered';
}

button.onmouseout = function() {
    body.className = '';
}