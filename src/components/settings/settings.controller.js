'use strict';

export default class SettingsController {
    constructor(passwordList, pgp, fileSystem, $q) {
        this.passwordList = passwordList;
        this.pgp = pgp;
        this.fileSystem = fileSystem;
        this.promise = $q;

        this.pgp.privateKey
            .then(privateKey => this.promise.when(privateKey.getDisplayPath()))
            .then(displayPath => this.keyPath = displayPath)
            .catch((err) => this.keyPath = err.message);

        this.passwordList.passDir
            .then(passDir => this.promise.when(passDir.getDisplayPath()))
            .then(displayPath => this.passDir = displayPath)
            .catch((err) => this.passDir = err.message);
    }

    selectKey() {
        this.pgp.selectPrivateKey().then(privateKey => privateKey.getDisplayPath())
            .then(displayPath => this.keyPath = displayPath)
            .catch(err => console.error(err));
    }

    selectDir() {
        this.passwordList.selectPassDir().then(passDir => passDir.getDisplayPath())
            .then(displayPath => this.passDir = displayPath)
            .catch(err => console.error(err));
    }
}

SettingsController.$inject = ['passwordList', 'pgp', 'fileSystem', '$q'];
