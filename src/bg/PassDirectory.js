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
}
