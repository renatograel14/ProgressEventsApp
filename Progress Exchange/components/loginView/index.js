'use strict';

app.loginView = kendo.observable({
    onShow: function () {
        $('.km-content').css('background-color', '#ffffff');
    },
    afterShow: function () {}
});

// START_CUSTOM_CODE_loginView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_loginView
(function (parent) {
    var provider = app.data.progressExchange2016Novo,
        mode = 'signin',
        registerRedirect = 'events',
        signinRedirect = 'events',
        rememberKey = 'progressExchange2016Novo_authData_loginViewModel',
        init = function (error) {
            if (error) {
                if (error.message) {
					app.notification.show(error.message);
                }
                return false;
            }

            var activeView = mode === 'signin' ? '.signin-view' : '.signup-view';

            if (provider.setup && provider.setup.offlineStorage && !app.isOnline()) {
                $('.offline').show().siblings().hide();
            } else {
                $(activeView).show().siblings().hide();
            }

            var rememberedData = localStorage ? JSON.parse(localStorage.getItem(rememberKey)) : app[rememberKey];
            if (rememberedData && rememberedData.email && rememberedData.password) {

                parent.loginViewModel.set('email', rememberedData.email);
                parent.loginViewModel.set('password', rememberedData.password);
                parent.loginViewModel.signin();
            }
        },
        successHandler = function (data) {
            var redirect = mode === 'signin' ? signinRedirect : registerRedirect,
                model = parent.loginViewModel || {},
                logout = model.logout;

            if (logout) {
                model.set('logout', null);
            }
            if (data && data.result) {
                if (logout) {
                    provider.Users.logout(init, init);
                    return;
                }
                var rememberedData = {
                    email: model.email,
                    password: model.password
                };
                if (model.rememberme && rememberedData.email && rememberedData.password) {
                    if (localStorage) {
                        localStorage.setItem(rememberKey, JSON.stringify(rememberedData));
                    } else {
                        app[rememberKey] = rememberedData;
                    }
                }
                app.user = data.result;
                setTimeout(function () {
                    app.mobileApp.navigate('components/' + redirect + '/view.html');
                }, 0);
            } else {
                init();
            }
        },
        updateUserFacebookInfo = function (user, data) {
            provider.Users.updateSingle({
                    'Id': user.Id,
                    'Identity.Facebook': data,
                    'Display Name': data.name,
                },
                function (data) {
                    return;
                },
                function (error) {
                    throw error;
                });
        },
        loginViewModel = kendo.observable({
            displayName: '',
            email: '',
            password: '',
            company: '',
            validateData: function (data) {
                if (!data.email) {
                    alert('Missing email');
                    return false;
                }

                if (!data.password) {
                    alert('Missing password');
                    return false;
                }

                return true;
            },
            signin: function () {
                var model = loginViewModel,
                    email = model.email.toLowerCase(),
                    password = model.password;

                if (!model.validateData(model)) {
                    return false;
                }
                provider.Users.login(email, password, successHandler, init);
            },
            facebookLogin: function () {
                var facebookConfig = {
                    name: 'Facebook',
                    loginMethodName: 'loginWithFacebook',
                    endpoint: 'https://www.facebook.com/dialog/oauth',
                    response_type: 'token',
                    client_id: 1086764318010540,
                    redirect_uri: "http://www.facebook.com/connect/login_success.html",
                    access_type: 'online',
                    scope: 'email,user_posts',
                    display: 'touch'
                };

                var facebook = app.facebook = new IdentityProvider(facebookConfig);
                app.mobileApp.showLoading();
                facebook.getAccessToken(function (token) {
                    provider.Users.loginWithFacebook(token).then(function () {
                        app.mobileApp.hideLoading();
                        provider.Users.currentUser(function (data) {
                            updateUserFacebookInfo(data.result, facebook.getCurrentUser());
                            successHandler(data);
                        }, init);
                    });
                });
            },
            register: function () {
                var model = loginViewModel,
                    email = model.email.toLowerCase(),
                    password = model.password,
                    displayName = model.displayName,
                    company = model.company,
                    attrs = {
                        Email: email,
                        DisplayName: displayName,
                        Company: company
                    };

                if (!model.validateData(model)) {
                    return false;
                }
				mode = mode === 'signin' ? 'register' : 'signin';
                provider.Users.register(email, password, attrs, successHandler, init);
            },
            toggleView: function () {
                mode = mode === 'signin' ? 'register' : 'signin';
                init();
            }
        });

    parent.set('loginViewModel', loginViewModel);



    parent.set('afterShow', function (e) {
        if (e && e.view && e.view.params && e.view.params.logout) {
            if (localStorage) {
                localStorage.setItem(rememberKey, null);
            } else {
                app[rememberKey] = null;
            }
            loginViewModel.set('logout', true);
        }
        provider.Users.currentUser().then(successHandler, init);
    });
})(app.loginView);

// START_CUSTOM_CODE_loginViewModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_loginViewModel