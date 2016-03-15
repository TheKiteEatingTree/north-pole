'use strict';

export default class BG {
    constructor($q) {
        this.promise = $q;
    }

    getBackgroundPage() {
        return this.promise(function(resolve, reject) {
            chrome.runtime.getBackgroundPage((bg) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                return resolve(bg);
            });
        });
    }
}

BG.$injects = ['$q'];
