// Parallax Code
var scene = document.getElementById('scene');
var parallax = new Parallax(scene);

var buttons = document.querySelectorAll('.button-link');
var body = document.body;

buttons.forEach(function(button) {
    button.onmouseover = function() {
        body.className = 'hovered';
    }

    button.onmouseout = function() {
        body.className = '';
    }
});
