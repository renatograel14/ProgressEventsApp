'use strict';

app.conferences = kendo.observable({
    afterShow: function() {}
});

// START_CUSTOM_CODE_conferences
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_conferences
(function(parent) {
    var dataProvider = app.data.progressExchange2016Novo,
        localStorage = app.data.localStorage.dataSource,
        agendaDataSource = app.data.localStorage,
        fetchFilteredData = function(paramFilter, searchFilter) {
            var model = parent.get('conferencesModel'),
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
        processImage = function(img) {
            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            } else if (img.slice(0, 4) !== 'http' &&
                img.slice(0, 2) !== '//' && img.slice(0, 5) !== 'data:') {
                var setup = dataProvider.setup || {};
                img = setup.scheme + ':' + setup.url + setup.appId + '/Files/' + img + '/Download';
            }

            return img;
        },
        flattenLocationProperties = function(dataItem) {
            var propName, propValue,
                isLocation = function(value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };

            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        ratingDataSourceOpitions = {
            type: 'everlive',
            transport: {
                typeName: 'Rating',
                dataProvider: dataProvider
            },
            change: function(e) {
                console.log(e);
            },
            error: function(e) {

                if (e.xhr) {
                    navigator.notification.alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'Conference': {
                            field: 'Conference',
                            defaultValue: ''
                        },
                        'Rate': {
                            field: 'Rate',
                            defaultValue: ''
                        },
                        'Owner': {
                            field: 'Owner',
                            defaultValue: ''
                        },

                    }
                }
            },
            serverFiltering: true,
        },
        ratingDataSource = new kendo.data.DataSource(ratingDataSourceOpitions),
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'Conference',
                dataProvider: dataProvider
            },
            group: {
                field: 'Time'
            },
            change: function(e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    flattenLocationProperties(dataItem);
                }
            },
            error: function(e) {
                if (e.xhr) {
                    alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'Name': {
                            field: 'Name',
                            defaultValue: ''
                        },
                        'Time': {
                            field: 'Time',
                            defaultValue: ''
                        },
                    },
                    iconTime: function() {
                        var i = 'time';
                        return kendo.format('km-icon km-{0}', i);
                    },
                    iconPresenter: function() {
                        var i = 'presenter';
                        return kendo.format('km-icon km-{0}', i);
                    },
                    iconAgenda: function() {
                        var i = 'bookmarks';
                        return kendo.format('km-icon km-{0}', i);
                    },

                }
            },
            serverFiltering: true,
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        addNewRating = function(value) {

            var rateArray = ['Ruim D:', 'Insatisfatório :(', 'Regular :|', 'Bom :)', 'Excelente :D'];
            var item = conferencesModel.get('currentItem');
            var stringRate = 'Confirma?\n "Achei essa conferência ' + rateArray[value - 1] + '"';

            ratingDataSource.query({
                filter: [{
                    field: "Owner",
                    operator: "eq",
                    value: app.user.Id
                }, {
                    field: "Conference",
                    operator: "eq",
                    value: item.Id
                }]
            }).then(function(e) {
                
                if (ratingDataSource.view().length == 0) {
                    var confirma = confirm(stringRate) ? createRating(value) : false;
                } else {
                    navigator.notification.alert('Você já avaliou essa conferência! Obrigado! :)');
                };
            });
            if (conferencesModel.myRating) {
                    console.log(conferencesModel.myRating);
                    conferencesModel.myRating.setRating(0, false);
            }
            $("#ratePopuover").data("kendoMobilePopOver").close(); //detach events

        },
        createRating = function(value) {
            var item = conferencesModel.get('currentItem');
            var addModel = {
                    Rate: value,
                    Conference: item.Id,
                    Owner: app.user.Id
                },
                filter = conferencesModel && conferencesModel.get('paramFilter'),
                dataSource = ratingDataSource;

            dataSource.add(addModel);

            dataSource.one('change', function(e) {
                //console.log(e);
            });
            dataSource.sync();

        },
        conferencesModel = kendo.observable({
            dataSource: dataSource,
            itemClick: function(e) {

                app.mobileApp.navigate('#components/conferences/details.html?id=' + e.dataItem.id);

            },
            myRating: null,
            rateShow: function(e) {
                // var el = $('#ratingStars'),
                //     currentRating = 0,
                //     maxRating = 5;
                // var  rateObject = rating(el, currentRating, maxRating, addNewRating);
                // conferencesModel.set('myRating', rateObject);

            },
            detailsShow: function(e) {
                var el = $('#ratingStars'),
                    currentRating = 0,
                    maxRating = 5;

                var  rateObject = rating(el, currentRating, maxRating, addNewRating);

                

                var item = e.view.params.id,
                    dataSource = conferencesModel.get('dataSource'),
                    itemModel = dataSource.get(item);
                itemModel.PhotoUrl = processImage(itemModel.Photo);

                if (!itemModel.Name) {
                    itemModel.Name = String.fromCharCode(160);
                }

                conferencesModel.set('currentItem', null);
                conferencesModel.set('currentItem', itemModel);
                
                conferencesModel.set('myRating', rateObject);
            },
            currentItem: null,
            checkAgenda: function() {
                return !!localStorage.get(conferencesModel.currentItem.id);
            },
            addItem: function() {
                console.log('adding...');

                var newItem = {
                    conferenceID: conferencesModel.currentItem.id,
                    Time: conferencesModel.currentItem.Time,
                    Name: conferencesModel.currentItem.Name,
                    Track: conferencesModel.currentItem.Track,
                    Event: conferencesModel.currentItem.Event
                };

                console.log(conferencesModel.currentItem);

                if (conferencesModel.checkAgenda()) {
                    app.notification.show('Conferência já está na agenda! :)');
                } else {
                    agendaDataSource.dataSource.add(newItem);
                    agendaDataSource.dataSource.sync();
                    app.notification.show('Conferência adicionada à Agenda');

                }

            },
            deleteItem: function() {
                var agendaItem = agendaDataSource.dataSource.get(conferencesModel.currentItem.Id);
                agendaDataSource.dataSource.remove(agendaItem);
                agendaDataSource.dataSource.sync();
            },
        });

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('conferencesModel', conferencesModel);
        });
    } else {
        parent.set('conferencesModel', conferencesModel);
    }

    parent.set('onShow', function(e) {
        var param = {
            field: "Event",
            operator: "eq",
            value: app.currentEvent.Id
        };
        fetchFilteredData(param);
    });
})(app.conferences);
// START_CUSTOM_CODE_conferencesModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_conferencesModel