'use strict';

app.conferences = kendo.observable({
    afterShow: function () {}
});

// START_CUSTOM_CODE_conferences
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_conferences
(function (parent) {
    var dataProvider = app.data.progressExchange2016Novo,
        fetchFilteredData = function (paramFilter, searchFilter) {
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
        processImage = function (img) {
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
        flattenLocationProperties = function (dataItem) {
            var propName, propValue,
                isLocation = function (value) {
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
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'Conference',
                dataProvider: dataProvider
            },
            group: {
                field: 'Time'
            },
            change: function (e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    flattenLocationProperties(dataItem);
                }
            },
            error: function (e) {
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
                    iconTime: function () {
                        var i = 'time';
                        return kendo.format('km-icon km-{0}', i);
                    },
                    iconPresenter: function () {
                        var i = 'presenter';
                        return kendo.format('km-icon km-{0}', i);
                    }
                }
            },
            serverFiltering: true,
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        conferencesModel = kendo.observable({
            dataSource: dataSource,
            itemClick: function (e) {

                app.mobileApp.navigate('#components/conferences/details.html?uid=' + e.dataItem.uid);

            },
            rateShow: function (e) {
                // target element
                var el = $('#ratingStars');

                // current rating, or initial rating
                var currentRating = 0;

                // max rating, i.e. number of stars you want
                var maxRating = 5;

                // callback to run after setting the rating
                var callback = function (rating) {
                    alert(rating);
                };

                // rating instance
                var myRating = rating(el, currentRating, maxRating, callback);
            },
            detailsShow: function (e) {
                var item = e.view.params.uid,
                    dataSource = conferencesModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);
                itemModel.PhotoUrl = processImage(itemModel.Photo);

                if (!itemModel.Name) {
                    itemModel.Name = String.fromCharCode(160);
                }

                conferencesModel.set('currentItem', null);
                conferencesModel.set('currentItem', itemModel);
            },
            currentItem: null
        });

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('conferencesModel', conferencesModel);
        });
    } else {
        parent.set('conferencesModel', conferencesModel);
    }

    parent.set('onShow', function (e) {
        var param = {
            field: "Event",
            operator: "eq",
            value: app.currentEvent.Id
        };
        //e.view.params.filter ? JSON.parse(e.view.params.filter) : null;

        fetchFilteredData(param);
    });
})(app.conferences);
// START_CUSTOM_CODE_conferencesModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_conferencesModel