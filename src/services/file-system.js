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

    getDisplayPath(entry) {
        return this.promise(function(resolve, reject) {
            chrome.fileSystem.getDisplayPath(entry, (displayPath) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                return resolve(displayPath);
            });
        });
    }

    readDir(dir) {
        const reader = dir.createReader();

        return this.promise((resolve, reject) => {
            reader.readEntries((results) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                return resolve({entry: dir, files: results});
            });
        });
    }

    readDirRecursive(dir) {
        const handler = (result) => {
            const promises = [];
            const files = [];
            result.files.forEach((result) => {
                if (result.isDirectory && result.name !== '.git') {
                    promises.push(this.readDir(result).then(handler));
                } else {
                    if (result.name.endsWith('.gpg')) {
                        files.push(result);
                    }
                }
            });

            if (promises.length) {
                return this.promise.all(promises).then((results) => {
                    results.forEach((result) => {
                        files.push(result);
                    });
                    return {entry: result.entry, files: files};
                });
            } else {
                return {entry: result.entry, files: files};
            }
        };

        return this.readDir(dir).then(handler);
    }

    readFileAsText(entry) {
        return this.promise((resolve, reject) => {
            entry.file((file) => {
                var reader = new FileReader();

                reader.onloadend = function() {
                    resolve(this.result);
                };

                reader.onerror = function() {
                    reject(this.error);
                };

                reader.readAsText(file);
            });
        });
    }

    readFileAsBlob(entry) {
        return this.promise((resolve, reject) => {
            entry.file((file) => {
                var reader = new FileReader();

                reader.onloadend = function() {
                    const buffer = new Buffer(new Uint8Array(this.result));
                    resolve(buffer);
                };

                reader.onerror = function() {
                    reject(this.error);
                };

                reader.readAsArrayBuffer(file);
            });
        });
    }

    restoreEntry(id) {
        return this.promise(function(resolve, reject) {
            chrome.fileSystem.restoreEntry(id, (entry) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                return resolve(entry);
            });
        });
    }

    retainEntry(entry) {
        return chrome.fileSystem.retainEntry(entry);
    }
}

FileSystem.$injects = ['$rootScope', '$q'];
