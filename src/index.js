'use strict';

/* global superagent:false */

var BACKEND_URL = 'http://localhost:3001';
// var BACKEND_URL = 'http://infinite-ravine-8074.herokuapp.com';

var context = {};
context.fragments = {};


// *********************************************
//  Navbar Fragment
// *********************************************

function NavbarFragment (context) {
    this.container = $('#box-navbar');
    this.buttonSignup = $('#signup-button');
    this.buttonLogin = $('#login-button');
    this.buttonLogout = $('#logout-button');
    this.buttonDeleteAccount = $('#delete-account-button');

    this.buttonSignup.click(function () {
        showFragment(context.fragments.signup);
    });

    this.buttonLogin.click(function () {
        showFragment(context.fragments.login);
    });

    this.buttonLogout.click(function (event) {
        logout();
    });

    this.buttonDeleteAccount.click(function (event) {
        console.warn('Not implemented.');
    });
}

NavbarFragment.prototype.show = function () {
    this.container.show();
};

NavbarFragment.prototype.hide = function () {
    this.container.hide();
};



// *********************************************
//  Welcome Fragment
// *********************************************

function WelcomeFragment (context) {
    this.context = context;
    this.container = $('#box-welcome');
}

WelcomeFragment.prototype.show = function () {
    this.container.show();
    this.context.navbar.buttonLogout.hide();
    this.context.navbar.buttonLogin.show();
    this.context.navbar.buttonDeleteAccount.hide();
};

WelcomeFragment.prototype.hide = function () {
    this.container.hide();
};



// *********************************************
//  Login Fragment
// *********************************************

function LoginFragment (context) {
    var that = this;
    this.context = context;

    this.container = $('#box-login');
    this.form = $('#form-generate');
    this.email = $('#form-generate > input[name=email]');
    this.password = $('#form-generate > input[name=password]');
    this.remember = $('#form-generate > input[name=remember]');

    this.form.submit(function (event) {
        event.preventDefault();

        superagent.post(BACKEND_URL + '/api/v1/users/login').withCredentials().auth(that.email.val(), that.password.val()).end(function (error, result) {
            if (error || !result.ok) {
                console.error('Failed to sign in.', error, result && result.status);
                return;
            }

            if (result.status !== 200 && result.status !== 201) {
                console.error('Failed to sign in.', result.status);
                return;
            }

            $.cookie('userToken', result.body.userToken, { expires: (that.remember.is(':checked') ? 7 : null ) });

            getApplicationDetails(function (error, result) {
                if (error) {
                    console.error('Failed to get details.', error);
                    return;
                }

                context.fragments.application.fillForm(result.appKey, result.appSecret);
                showFragment(context.fragments.application);
            });
        });
    });
}

LoginFragment.prototype.show = function () {
    this.container.show();
    this.context.navbar.buttonLogout.hide();
    this.context.navbar.buttonLogin.hide();
    this.context.navbar.buttonDeleteAccount.hide();
};

LoginFragment.prototype.hide = function () {
    this.container.hide();
};



// *********************************************
//  Signup Fragment
// *********************************************

function SignupFragment (context) {
    var that = this;
    this.context = context;

    this.container = $('#box-signup');
    this.form = $('#signup-form');
    this.email = $('#signup-form > input[name=email]');
    this.password = $('#signup-form > input[name=password]');
    this.passwordRepeat = $('#signup-form > input[name=password-repeat]');

    this.form.submit(function (event) {
        event.preventDefault();

        if (that.password.val() !== that.passwordRepeat.val()) {
            console.error('Passwords dont match');
            that.passwordRepeat.val('');
            return;
        }

        superagent.post(BACKEND_URL + '/api/v1/users/signup').auth(that.email.val(), that.password.val()).end(function (error, result) {
            if (error) {
                console.error('Unable to reach the server.', error);
                return;
            }

            if (!result.ok) {
                console.error('Unable to register new account "%s".', that.email.val());
                return;
            }

            console.log('Account for user %s created.', that.email.val());

            $.cookie('userToken', result.body.userToken);
            context.fragments.application.fillForm(result.body.appKey, result.body.appSecret);
            showFragment(context.fragments.application);
        });
    });
}

SignupFragment.prototype.show = function () {
    this.container.show();
    this.context.navbar.buttonLogout.hide();
    this.context.navbar.buttonLogin.show();
    this.context.navbar.buttonDeleteAccount.hide();
};

SignupFragment.prototype.hide = function () {
    this.container.hide();
};



// *********************************************
//  Application Fragment
// *********************************************

function ApplicationFragment (context) {
    var that = this;
    this.context = context;

    this.container = $('#box-application');
    this.confirmDialog = $('#modal-confirm');
    this.confirmDialogButtonOk = $('#modal-confirm-ok');
    this.confirmDialogButtonCancel = $('#modal-confirm-cancel');
    this.buttonRefresh = $('#app-refresh-button');
    this.inputAppKey = $('#application-key');
    this.inputAppSecret = $('#application-secret');
    this.inputCallbackUrl = $('#callback-url');

    this.buttonRefresh.click(function (event) {
        that.confirmDialog.modal('show');
    });

    this.confirmDialogButtonOk.click(function () {
        that.confirmDialog.modal('hide');
        refreshApplicationDetails(function (error, result) {
            if (error) {
                console.error('Failed to get details.', error);
                return;
            }

            that.fillForm(result.appKey, result.appSecret);
        });
    });

    this.confirmDialogButtonCancel.click(function (event) {
        that.confirmDialog.modal('hide');
    });
}

ApplicationFragment.prototype.show = function () {
    this.container.show();
    this.context.navbar.buttonLogout.show();
    this.context.navbar.buttonLogin.hide();
    this.context.navbar.buttonDeleteAccount.show();
};

ApplicationFragment.prototype.hide = function () {
    this.container.hide();
};

ApplicationFragment.prototype.fillForm = function (appKey, appSecret) {
    this.inputAppKey.val(appKey);
    this.inputAppKey.click(function () { $(this).select(); });
    this.inputAppSecret.val(appSecret);
    this.inputAppSecret.click(function () { $(this).select(); });
    this.inputCallbackUrl.text(BACKEND_URL + '/proxy/' + appKey);
    this.inputCallbackUrl.attr('href', BACKEND_URL + '/proxy/' + appKey + '/test/route');
};



// some global helpers
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

function logout() {
    $.removeCookie('userToken');
    window.location.href = '/';
}

function showFragment(fragment) {
    for (var frag in context.fragments) {
        if (context.fragments.hasOwnProperty(frag)) {
            context.fragments[frag].hide();
        }
    }

    fragment.show();
}


function init() {
    context.navbar = new NavbarFragment(context);
    context.fragments.welcome = new WelcomeFragment(context);
    context.fragments.login = new LoginFragment(context);
    context.fragments.signup = new SignupFragment(context);
    context.fragments.application = new ApplicationFragment(context);

    if ($.cookie('userToken')) {
        getApplicationDetails(function (error, result) {
            if (error) {
                console.error('Failed to get details.', error);
                showFragment(context.fragments.welcome);
                return;
            }

            context.fragments.application.fillForm(result.appKey, result.appSecret);
            showFragment(context.fragments.application);
        });
    } else {
        showFragment(context.fragments.welcome);
    }
}

window.addEventListener('load', init);
