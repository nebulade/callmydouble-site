'use strict';

/* global superagent:false */

var BACKEND_URL = 'http://localhost:3001/api/v1/';

function getApplicationDetails(callback) {
    var form = document.getElementById('form-generate');
    var email = form.elements.namedItem('email').value;
    var password = form.elements.namedItem('password').value;

    superagent.post(BACKEND_URL + 'apps/0/details').withCredentials().auth(email, password).end(function (error, result) {
        if (error || !result.ok) {
            return callback(error ? error : result.status);
        }

        callback(null, result.body);
    });
}

function refreshApplicationDetails(callback) {
    var form = document.getElementById('form-generate');
    var email = form.elements.namedItem('email').value;
    var password = form.elements.namedItem('password').value;

    superagent.post(BACKEND_URL + 'apps/0/generate').withCredentials().auth(email, password).end(function (error, result) {
        if (error || !result.ok) {
            return callback(error ? error : result.status);
        }

        callback(null, result.body);
    });
}

function signin(email, password) {
    superagent.post(BACKEND_URL + 'users/signin').withCredentials().auth(email, password).end(function (error, result) {
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

            document.getElementById('application-key').innerHTML = result.appKey;
            document.getElementById('application-secret').innerHTML = result.appSecret;
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

    document.getElementById('app-refresh-button').addEventListener('click', function (event) {
        refreshApplicationDetails(function (error, result) {
            if (error) {
                console.error('Failed to get details.', error);
                return;
            }

            document.getElementById('application-key').innerHTML = result.appKey;
            document.getElementById('application-secret').innerHTML = result.appSecret;
        });
    });
}

window.addEventListener('load', init);
