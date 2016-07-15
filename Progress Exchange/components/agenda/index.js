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
    var agendaProvider = app.data.localStorage,
    agendaModel = kendo.observable({
        dataSource: agendaProvider.dataSource,
        listView: $("#listviewAgenda").data("kendoMobileListView"),
        delete: function() {
            // console.log(agendaModel.currentItem);
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
            }
        },
        clearAgenda: function(){
          	agendaProvider.resetData(function callback(){
                agendaProvider.dataSource.read();
            });
        },
        currentItem: null
    });


    parent.set('agendaModel', agendaModel);
})(app.agenda);
// END_CUSTOM_CODE_agendaModel