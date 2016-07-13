// habilitando o notification do kendo-ui
$(document).ready(function(){
	if(!app) app = {};
	app.notification = $("#popUpNotification").kendoNotification({
        autoHideAfter: 2000
    }).data("kendoNotification");
});