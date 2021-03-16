var button = document.getElementById('mainButton');

var openForm = function () {
    button.className = 'active';
};

var checkInput = function (input) {
    if (input.value.length > 0) {
        input.className = 'active';
    } else {
        input.className = '';
    }
};

var closeForm = function () {
    button.className = '';
};

var button2 = document.getElementById('mainButton2');

var openForm2 = function () {
    button2.className = 'active';
};


var closeForm2 = function () {
    button2.className = '';
};


document.addEventListener("keyup", function (e) {
    if (e.keyCode == 27 || e.keyCode == 13) {
        closeForm();
    }
});