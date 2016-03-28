'use strict';

export default class FileSystem {
    constructor($rootScope, $q) {
        this.scope = $rootScope;
        this.promise = $q;
    }

    chooseEntry(options) {
        return this.promise(function(resolve, reject) {
            chrome.fileSystem.chooseEntry(options, (entry) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                return resolve(entry);
            });
        });
    }
}

FileSystem.$injects = ['$rootScope', '$q'];
