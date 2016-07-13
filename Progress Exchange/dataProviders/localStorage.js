// logica do local binding
'use strict';

(function () {
	// set data if is undefined
	// localStorage.clear();
	function setNew(){
		if(!localStorage["agenda"]){
			localStorage["agenda"] = JSON.stringify([]);
			console.log(localStorage['agenda']);
		}
	}


	var localStorageOptions = {
		transport: {
			create: function(options){
				console.log('create:',options);
				//função que cria registro local
				options.data.ID = options.data.conferenceID;
				var localData = JSON.parse(localStorage["agenda"]);
				localData.push(options.data);
				console.log(localData);
				localStorage["agenda"] = JSON.stringify(localData);
				options.success(options.data);
			},
			read: function(options){
				// pega o array de contatos gravados localmente
				var localData = JSON.parse(localStorage["agenda"]);
				console.log('read:',localData);
				options.success(localData);
			},
			destroy: function(options){
				//apaga registro

				console.log('delete',options.data);
				var localData = JSON.parse(localStorage["agenda"]);
				for(var i=0; i<localData.length; i++){
					if(options.data.ID === localData[i].ID){
						localData.splice(i,1);
					}
				}
				localStorage["agenda"] = JSON.stringify(localData);
				options.success(options.data);
			}
		},
		schema: {
			model: {
				id: 'ID'
			}
		}
	}

	// set dataSource on a global variable
	var provider = app.data.localStorage = {
		dataSource: new kendo.data.DataSource(localStorageOptions),
		resetData: function(callback){
			localStorage.clear();
			setNew();
		},
		isReady: function(){
			return localStorage['agenda'];
		}
	}

	if(!provider.isReady){
		provider.resetData();
	}



})();