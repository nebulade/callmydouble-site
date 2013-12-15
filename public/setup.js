'use strict';

function init() {
    var form = $('#form-generate');
    form.submit(function (event) {
        alert('submit');
        event.preventDefault();
    });
}

window.addEventListener('load', init);
