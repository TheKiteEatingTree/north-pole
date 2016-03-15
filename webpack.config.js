'use strict';

module.exports = {
    entry: {
        app: "./src/app.js",
        background: "./src/background.js"
    },
    output: {
        path: __dirname + '/app/dist',
        // publicPath: '/dist/',
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: "style!css"
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader"
        }, {
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
            loader: 'file-loader'
        }, {
            test: /\.html$/,
            loader: 'html-loader'
        }]
    }
};
