'use strict';

import fileSystem from './file-system.js';
import storage from './storage.js';

export default class PassDirectory {
    constructor(entry) {
        this.entry = entry;
    }

    static fetch() {
        return storage.fetch('passDir').then((keyId) => {
            if (!keyId) {
                throw new Error('No directory saved');
            }
            return fileSystem.restoreEntry(keyId);
        }).then((entry) => {
            if (!entry) {
                throw new Error('Could not find directory');
            }
            return new PassDirectory(entry);
        });
    }

    static save(dir) {
        const keyId = fileSystem.retainEntry(dir);
        return storage.save({'passDir': keyId}).then(() => {
            return new PassDirectory(dir);
        });
    }

    getDisplayPath() {
        return fileSystem.getDisplayPath(this.entry);
    }

    getFiles() {
        return fileSystem.readDirRecursive(this.entry)
            .then(result => result.files);
    }

    getSimpleFiles() {
        const convert = function(files) {
            const simple = files.map((file) => {
                if (file.isFile) {
                    return {name: file.name.slice(0, -4)};
                } else {
                    return {
                        name: file.entry.name,
                        files: convert(file.files)
                    };
                }
            });

            simple.sort((a, b) => {
                if (a.files && !b.files) {
                    return -1;
                } else if (b.files && !a.files) {
                    return 1;
                } else {
                    return a.name.localeCompare(b.name);
                }
            });

            return simple;
        };

        return this.getFiles().then((files) => {
            return {
                name: this.entry.name,
                files: convert(files)
            };
        });
    }

    getFlatFiles() {
        const add = function(files, flat) {
            files.forEach((file) => {
                if (file.isFile) {
                    flat.push(file);
                } else {
                    add(file.files, flat);
                }
            });
        };

        return this.getFiles().then((files) => {
            const flat = [];
            add(files, flat);
            return flat;
        });
    }

    findFile(name) {
        return new Promise((resolve, reject) => {
            this.entry.getFile(`${name}.gpg`, {}, entry => resolve(entry), err => reject(err));
        });
    }
}
