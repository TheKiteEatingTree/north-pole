'use strict';

import fs from 'chrome-fs';
import storage from './storage.js';

export default class PassDirectory {
    constructor(dir) {
        this.dir = dir;
    }

    static fetch() {
        return storage.fetch('passDir').then((keyId) => {
            if (!keyId) {
                throw new Error('No directory saved');
            }
            return fs.restoreEntry(keyId);
        }).then((dir) => {
            if (!dir) {
                throw new Error('Could not find directory');
            }
            return new PassDirectory(dir);
        });
    }

    static save(dir) {
        const keyId = dir.retain();
        return storage.save({'passDir': keyId}).then(() => {
            return new PassDirectory(dir);
        });
    }

    getDisplayPath() {
        return this.dir.getDisplayPath();
    }

    getFiles() {
        return this.dir.readRecursive();
    }

    getSimpleFiles() {
        return this.dir.getSimpleFiles();
    }

    getFlatFiles() {
        return this.dir.getFlatFiles();
    }

    findFile(name) {
        return this.dir.getFile(`${name}.gpg`);
    }

    createFile(name, exclusive) {
        return this.dir.createFile(name, exclusive);
    }
}
