"use strict"


//TODO: error stack of some kind



function _loadResource(url, name, data, mode) {

    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = mode==0 ? 'arraybuffer' : 'text';

        xhr.onload = function() {
            if(xhr.status < 200 || xhr.status > 299) {
                //TODO: error code
                //reject

            } else {
                if(data === null) {
                    if(mode == 0) {
                        resolve(new Uint8Array(xhr.response));
                    } else if (mode == 1){
                        resolve(xhr.responseText);
                    } else if (mode == 2) {
                        resolve(JSON.parse(xhr.responseText));
                    }
                } else {
                    if(mode == 0) {
                        data[name] = xhr.response;
                    } else if (mode == 1){
                        data[name] = xhr.responseText;
                    } else if (mode == 2) {
                        data[name] = JSON.parse(xhr.responseText);
                    }

                    resolve(data);
                }
            }
        };
        xhr.onerror = function() {
            //TODO: error code
            //reject
        };
        xhr.send();
    });

}
