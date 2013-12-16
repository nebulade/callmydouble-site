'use strict';

/* global superagent:false */

var BACKEND_URL = 'http://localhost:3001/api/v1/';

function getApplicationDetails(callback) {
    var form = document.getElementById('form-generate');
    var auth = { email: form.elements.namedItem('email').value, password: form.elements.namedItem('password').value };

    superagent.post(BACKEND_URL + 'details').send(auth).end(function (error, result) {
        if (error || !result.ok) {
            return callback(error ? error : result.status);
        }

        callback(null, result.body);
    });
}

function signin(email, password) {
    superagent.post(BACKEND_URL + 'login').send({ email: email, password: password }).end(function (error, result) {
        if (error || !result.ok) {
            console.error('Failed to sign in.', error, result && result.status);
            return;
        }

        if (result.status !== 200 && result.status !== 201) {
            console.error('Failed to sign in.', result.status);
        }

        getApplicationDetails(function (error, result) {
            if (error) {
                console.error('Failed to get details.', error);
                return;
            }

            document.getElementById('application-key').innerHTML = result.key;
            document.getElementById('application-secret').innerHTML = result.secret;
            document.getElementById('box-signin').style.display = 'none';
            document.getElementById('box-application').style.display = 'block';
        });
    });
}

function init() {
    var form = document.getElementById('form-generate');

    form.addEventListener('submit', function (event) {
        signin(form.elements.namedItem('email').value, form.elements.namedItem('password').value);
        event.preventDefault();
    });
}

window.addEventListener('load', init);
