// Parallax Code
var scene = document.getElementById('scene');
var parallax = new Parallax(scene);

var buttons = document.querySelectorAll('.bubble-link');
var body = document.body;

buttons.forEach(function(button) {
    button.onmouseover = function() {
        body.className = 'hovered';
    }

    button.onmouseout = function() {
        body.className = '';
    }
});
