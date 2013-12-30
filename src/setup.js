'use strict';

/* global superagent:false */

var BACKEND_URL = 'http://localhost:3001';

function getApplicationDetails(callback) {
    var email = $('input[name=email]').val();
    var password = $('input[name=password]').val();

    superagent.post(BACKEND_URL + '/api/v1/apps/0/details').withCredentials().auth(email, password).end(function (error, result) {
        if (error || !result.ok) {
            return callback(error ? error : result.status);
        }

        callback(null, result.body);
    });
}

function refreshApplicationDetails(callback) {
    var email = $('input[name=email]').val();
    var password = $('input[name=password]').val();

    superagent.post(BACKEND_URL + '/api/v1/apps/0/generate').withCredentials().auth(email, password).end(function (error, result) {
        if (error || !result.ok) {
            return callback(error ? error : result.status);
        }

        callback(null, result.body);
    });
}

function signin(email, password) {
    superagent.post(BACKEND_URL + '/api/v1/users/signin').withCredentials().auth(email, password).end(function (error, result) {
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

            fillApplicationDetailsForm(result.appKey, result.appSecret);
        });
    });
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

    form.submit(function (event) {
        signin($('input[name=email]').val(), $('input[name=password]').val());
        event.preventDefault();
    });

    $('#app-refresh-button').click(function (event) {
        confirmDialog.modal('show');
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
    });
}

window.addEventListener('load', init);
