'use strict';

export default class SettingsController {
    constructor(passwordList, pgp, fileSystem, $q) {
        this.passwordList = passwordList;
        this.pgp = pgp;
        this.fileSystem = fileSystem;
        this.promise = $q;

        this.pgp.privateKey.then(entry => {
            if (entry !== null) {
                return this.fileSystem.getDisplayPath(entry);
            }
            return '';
        })
        .then(displayPath => this.keyPath = displayPath)
        .catch((err) => console.error(err));

        this.passwordList.passDir
            .then(passDir => this.promise.when(passDir.getDisplayPath()))
            .then(displayPath => this.passDir = displayPath)
            .catch((err) => this.passDir = err.getMessage());
    }

    selectKey() {
        this.pgp.selectPrivateKey().then(entry => this.fileSystem.getDisplayPath(entry))
            .then(displayPath => this.keyPath = displayPath)
            .catch(err => console.error(err));
    }

    selectDir() {
        this.passwordList.selectPassDir().then(entry => this.fileSystem.getDisplayPath(entry))
            .then(displayPath => this.passDir = displayPath)
            .catch(err => console.error(err));
    }
}

SettingsController.$inject = ['passwordList', 'pgp', 'fileSystem', '$q'];
