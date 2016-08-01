'use strict';

app.agenda = kendo.observable({
    onShow: function() {},
    afterShow: function() {},
    user: app.user
});

// START_CUSTOM_CODE_agenda
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_agenda


// START_CUSTOM_CODE_agendaModel
(function(parent) {
    var agendaProvider = app.data.localStorage;
    var fetchFilteredData = function (paramFilter, searchFilter) {
        var model = parent.get('agendaModel'),
        dataSource = model.get('dataSource');

        if (paramFilter) {
            model.set('paramFilter', paramFilter);
        } else {
            model.set('paramFilter', undefined);
        }

        if (paramFilter && searchFilter) {
            dataSource.filter({
                logic: 'and',
                filters: [paramFilter, searchFilter]
            });
        } else if (paramFilter || searchFilter) {
            dataSource.filter(paramFilter || searchFilter);
        } else {
            dataSource.filter({});
        }
    },
    agendaModel = kendo.observable({
        dataSource: agendaProvider.dataSource,
        listView: $("#listviewAgenda").data("kendoMobileListView"),
        delete: function() {
            var dataSource = agendaModel.get('dataSource');

            dataSource.remove(agendaModel.currentItem);

            dataSource.one('sync', function(e) {
                $("#listviewAgenda").data("kendoMobileListView").remove([agendaModel.currentItem]);
            });

            dataSource.one('error', function() {
                dataSource.cancelChanges();
            });
            
            dataSource.sync();
        },
        itemClick: function(e) {
            if(e.button){
                var item = e.dataItem.uid,
                dataSource = agendaModel.get('dataSource'),
                itemModel = dataSource.getByUid(item);
                if (!itemModel.name) {
                    itemModel.name = String.fromCharCode(160);
                }
                agendaModel.set('currentItem', null);
                agendaModel.set('currentItem', itemModel);
                agendaModel.delete();
            } else { 
                console.log(e);
                app.mobileApp.navigate('#components/conferences/details.html?id=' + e.dataItem.ID);
            }
        },
        clearAgenda: function(){
            agendaProvider.resetData(function callback(){
            agendaProvider.dataSource.read();
        });
       },
       currentItem: null
   });

    parent.set('onShow', function (e) {
        var param = {
            field: "Event",
            operator: "eq",
            value: app.currentEvent.Id
        };

        fetchFilteredData(param);
    });
    parent.set('agendaModel', agendaModel);
})(app.agenda);
// END_CUSTOM_CODE_agendaModel