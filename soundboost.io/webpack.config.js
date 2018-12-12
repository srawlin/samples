"use strict";

const path = require("path");
const webpack = require("webpack");
const BundleTracker = require("webpack-bundle-tracker");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const SplitByPathPlugin = require("webpack-split-by-path");
const CompressionPlugin = require("compression-webpack-plugin");


const nodeDir = path.resolve(__dirname, "node_modules");

const context = path.resolve(__dirname);

const LEVEL = process.env.LEVEL || "development";

let publicPath;

if (LEVEL === "development") {
  publicPath = "http://localhost:7000/static/dist/development/";
} else if (LEVEL === "production") {
  publicPath = "https://soundboost.io/static/dist/production/";
}

const config = {
  debug: true,
  context,
  entry: "./soundboost/static/main",

  output: {
    path: path.resolve(`./soundboost/static/dist/${LEVEL}/`),
    filename: "[name]-[chunkhash].js",
    chunkFilename: "[name]-[chunkhash].js",
    publicPath,
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        LEVEL: JSON.stringify(LEVEL),
        NODE_ENV: JSON.stringify(LEVEL),
      },
    }),
    new SplitByPathPlugin([
      {
        name: "vendor",
        path: [
          path.join(context, "node_modules"),
        ],
      },
    ], {
      ignore: [path.resolve(nodeDir, "css-loader")],
    }),
    new ExtractTextPlugin("[name]-[chunkhash].css"),
    new BundleTracker({filename: `./webpack-stats.${LEVEL}.json`}),

  ],

  module: {
    preLoaders: [
      {
        name: "eslint",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint",
      },
    ],
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel",
      },
      {
        test: /\.css$/,
        loader: "style-loader!css",
      },
      {
        test: /\.less/,
        loader: "css!less",
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          `style!css!sass?includePaths[]=${nodeDir}`
        ),
      },
      {
        test: /\.sass$/,
        loader: "style!css!sass?indentedSyntax&sourceMap",
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&minetype=application/font-woff",
      },
      {
        test: /\.(ttf|eot|svg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader",
      },
      {
        test: /\.json$/,
        loaders: ["json-loader"],
      },
    ],
  },

  resolve: {
    root: path.resolve(__dirname, "soundboost", "static", "app"),
    modulesDirectories: ["node_modules"],
    extensions: ["", ".json", ".js", ".jsx"],
  },

  node: {
    fs: "empty",
    tls: "empty",
    net: "empty",
    "child_process": "empty",
    "aws-sdk": "empty",
  },
};

if (LEVEL === "production") {
  // Additional production config on top of staging config
  // source-maps will be removed by ezh-sentry-tools-js
  config.debug = false;
  config.plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      sourceMap: true,
    }),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        "IS_PROD": "TRUE",
      },
    })
  );
}

module.exports = config;

