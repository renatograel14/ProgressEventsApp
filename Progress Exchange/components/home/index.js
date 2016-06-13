'use strict';

app.home = kendo.observable({
    onShow: function () {
        if (!app.currentEvent) {
            app.mobileApp.navigate('components/loginView/view.html');
        } else {
            (function (parent) {
                var event = app.currentEvent,
                    homeModel = kendo.observable({
                        currentEvent: event,
                        openLink: function () {
                            var url = event.RegisterLink;
                            console.log(url);
                            window.open(url, '_system');
                            if (window.event) {
                                window.event.preventDefault && window.event.preventDefault();
                                window.event.returnValue = false;
                            }
                        }
                    });
                parent.set('homeModel', homeModel);
            })(app.home);
        }
    },
    afterShow: function () {
        if (!!app.currentEvent) {
            $("#navbar").data("kendoMobileNavBar").title(app.currentEvent.Name);
            $('#homeView .km-content').css('backgroundImage', 'url(' + app.currentEvent.backgroundURL + ')');
        }
    }
});

// START_CUSTOM_CODE_home
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home