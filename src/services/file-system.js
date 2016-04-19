'use strict';

import fs from 'chrome-fs';

export default class FileSystem {
    constructor($rootScope, $q) {
        this.scope = $rootScope;
        this.promise = $q;
    }

    chooseEntry(options) {
        return this.promise(function(resolve, reject) {
            fs.chooseEntry(options)
                .then(entry => resolve(entry))
                .catch(err => reject(err));
        });
    }
}

FileSystem.$injects = ['$rootScope', '$q'];
