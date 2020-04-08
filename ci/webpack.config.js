const path = require('path');

const ClosurePlugin = require('closure-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, '../out/App.js'),
    styles: path.resolve(__dirname, '../stylesheets/styles.css'),
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new ClosurePlugin({ mode: 'STANDARD', platform: 'javascript' }, {}),
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
        ]
      },
      // URL handling for assets/**/*.png
      {
        test: /assets\/.*\.png$/i,
        loader: "file-loader",
        options: {
          emitFile: false,
          // Copy in path components relative to assets
          regExp: /assets\/((?:.*?\/)*)[^\/]+\.png/,
          name: "./assets/[1][name].[ext]",
        },
      },
      // URL handling for fonts
      {
        test: /\.ttf$/i,
        loader: "url-loader",
        options: {
          limit: 100000,
          name: "./assets/fonts/[name].[ext]",
          emitFile: false,
        },
      },
      {
        test: /\.html$/i,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true,
            },
          },
        ],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new FixStyleOnlyEntriesPlugin(),
    new OptimizeCssAssetsPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'template.html'),
      inject: true,
      inlineSource: '.(js|css)$',
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: [ "*.js", "*.css" ],
    }),
  ],
};
