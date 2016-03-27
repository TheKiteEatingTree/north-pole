'use strict';

import 'material-design-icons/iconfont/material-icons.css';
import 'angular-material/angular-material.min.css';
import './style.css';

import angular from 'angular';
import ngRoute from 'angular-route';
import ngAnimate from 'angular-animate';
import 'angular-aria';
import ngMaterial from 'angular-material';

import config from './app.config.js';

import SettingsController from './components/settings/settings.controller.js';

import bg from './services/bg.js';
import fileSystem from './services/file-system.js';
import passwordList from './services/password-list.js';
import pgp from './services/pgp.js';

angular.module('northern-pass', [
    ngRoute,
    ngAnimate,
    ngMaterial
])
.config(config)
.service('bg', bg)
.service('fileSystem', fileSystem)
.service('passwordList', passwordList)
.service('pgp', pgp)
.controller('SettingsController', SettingsController);
