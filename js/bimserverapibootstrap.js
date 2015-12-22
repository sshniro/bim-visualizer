function loadBimServerApi(address, notifier, callback, errorCallback) {
	if (notifier == null) {
		function Notifier() {
			var othis = this;
			
			this.setSelector = function(selector) {
			};

			this.clear = function() {
			};

			this.resetStatus = function(){
			};

			this.resetStatusQuick = function(){
			};

			this.setSuccess = function(status, timeToShow) {
				console.log("success", status);
			};
			
			this.setInfo = function(info, timeToShow) {
				console.log("info", info);
			};

			this.setError = function(error) {
				console.log("error", error);
			};
		}

		notifier = new Notifier();
	}
	var timeoutId = window.setTimeout(function() {
		notifier.setError("Could not connect");
		errorCallback();
	}, 3000);
	if (address.endsWith("/")) {
		address = address.substring(0, address.length - 1);
	}
    

    window.clearTimeout(timeoutId);
    if (typeof bimapi != 'function') {
        notifier.setError("Could not connect");
        errorCallback();
    } else {
        if (bimapi != null) {
            var bimServerApi = new bimapi(address, notifier);
            bimServerApi.init(function(api, serverInfo){
                callback(bimServerApi, serverInfo);
            });
        } else {
            window.clearTimeout(timeoutId);
            notifier.setError("Could not find BIMserver API");
            errorCallback();
        }
    }
}