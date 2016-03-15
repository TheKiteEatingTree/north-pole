'use strict';

export default class PasswordList {
    constructor($q, fileSystem, bg) {
        this.promise = $q;
        this.fileSystem = fileSystem;
        this.bg = bg.getBackgroundPage();

        this.passwords = [];

        this.passDir = this.bg.then((bg) => {
            return this.promise.when(bg.fetchPassDir());
        });

        this.refreshPasswordList();
    }

    refreshPasswordList() {
        this.passwords = [];
        return this.passDir.then((passDir) => {
            return this.promise.when(passDir.getFiles());
        }).then((files) => {
            this.passwords = files;
            return this.passwords;
        }).catch(() => []);
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