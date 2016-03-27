'use strict';

export default class PasswordList {
    constructor($q, fileSystem, bg) {
        this.promise = $q;
        this.fileSystem = fileSystem;
        this.bg = bg.getBackgroundPage();

        this.passwords = [];

        this.passDir = this.bg.then((bg) => {
            return this.promise.when(bg.passDir);
        });
    }

    selectPassDir() {
        return this.fileSystem.chooseEntry({
            type: 'openDirectory'
        }).then((entry) => {
            return this.bg.then(bg => this.promise.when(bg.savePassDir(entry)));
        }).then((passDir) => {
            this.passDir = this.promise.when(passDir);
            return passDir;
        });
    }
}

PasswordList.$injects = ['$q', 'fileSystem', 'bg'];
