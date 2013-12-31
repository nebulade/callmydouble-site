'use strict';

/* global superagent:false */

var BACKEND_URL = 'http://localhost:3001';
// var BACKEND_URL = 'http://infinite-ravine-8074.herokuapp.com';

function getApplicationDetails(callback) {
    var req = superagent.post(BACKEND_URL + '/api/v1/apps/0/details').withCredentials().query({ userToken: $.cookie('userToken') }).end(function (error, result) {
        if (error || !result.ok) {
            return callback(error ? error : result.status);
        }

        callback(null, result.body);
    });
}

function refreshApplicationDetails(callback) {
    var req = superagent.post(BACKEND_URL + '/api/v1/apps/0/generate').withCredentials().query({ userToken: $.cookie('userToken') }).end(function (error, result) {
        if (error || !result.ok) {
            return callback(error ? error : result.status);
        }

        callback(null, result.body);
    });
}

function login(email, password, remember) {
    var req = superagent.post(BACKEND_URL + '/api/v1/users/login').withCredentials().auth(email, password).end(function (error, result) {
        if (error || !result.ok) {
            console.error('Failed to sign in.', error, result && result.status);
            return;
        }

        if (result.status !== 200 && result.status !== 201) {
            console.error('Failed to sign in.', result.status);
            return;
        }

        $.cookie('userToken', result.body.userToken, { expires: (remember ? 7 : null ) });

        getApplicationDetails(function (error, result) {
            if (error) {
                console.error('Failed to get details.', error);
                return;
            }

            fillApplicationDetailsForm(result.appKey, result.appSecret);
        });
    });
}

function logout() {
    $.removeCookie('userToken');
    window.location.href = '/';
}

function fillApplicationDetailsForm(appKey, appSecret) {
    $('#application-key').val(appKey);
    $('#application-key').click(function () { $(this).select(); });
    $('#application-secret').val(appSecret);
    $('#application-secret').click(function () { $(this).select(); });
    $('#callback-url').text(BACKEND_URL + '/proxy/' + appKey);
    $('#callback-url').attr('href', BACKEND_URL + '/proxy/' + appKey + '/test/route');
    $('#box-signin').hide();
    $('#box-application').show();
}

function init() {
    var form = $('#form-generate');
    var confirmDialog = $('#modal-confirm');

    if ($.cookie('userToken')) {
        getApplicationDetails(function (error, result) {
            if (error) {
                console.error('Failed to get details.', error);
                return;
            }

            fillApplicationDetailsForm(result.appKey, result.appSecret);
        });
    }

    form.submit(function (event) {
        login($('input[name=email]').val(), $('input[name=password]').val(), $('input[name=remember]').is(':checked'));
        event.preventDefault();
    });

    // setup event handler for all buttons
    $('#app-refresh-button').click(function (event) {
        confirmDialog.modal('show');
    });

    $('#modal-confirm-ok').click(function () {
        confirmDialog.modal('hide');
        refreshApplicationDetails(function (error, result) {
            if (error) {
                console.error('Failed to get details.', error);
                return;
            }

            fillApplicationDetailsForm(result.appKey, result.appSecret);
        });
    });

    $('#modal-confirm-cancel').click(function (event) {
        confirmDialog.modal('hide');
    });

    $('#logout-button').click(function (event) {
        logout();
    });

    $('#delete-account-button').click(function (event) {
        console.warn('Not implemented.');
    });
}

window.addEventListener('load', init);
