'use strict';

export default {
    fetch(key) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get(key, (value) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                return resolve(value[key]);
            });
        });
    },
    save(object) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.set(object, () => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                return resolve();
            });
        });
    }
};
