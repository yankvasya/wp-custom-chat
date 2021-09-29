const path =require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const template = require("./file.handlebars");

module.exports = (env, args) => {
    const isProd = args.mode === 'production';

    const config = {
        entry: {
            style: ['./src/style.scss'],
            script: ['./src/main.js', './src/websocket.js'],
            templates: ['./src/message.js'],
        },
        output: {
            path: path.resolve(__dirname, 'docs'),
            filename: '[contenthash].[name].js',
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                        "css-loader"
                    ],
                },
                {
                    test: /\.scss$/i,
                    use: [
                        isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                        "css-loader",
                        "sass-loader",
                    ],
                },
                {
                    test: /\.html$/i,
                    loader: 'html-loader',
                },
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    loader:'file-loader'
                },
                // { test: /\.handlebars$/, loader: "handlebars-loader" }
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './src/index.html',
                chunks: ['style', 'script', 'templates']
            }),
        ],
        optimization: {
            runtimeChunk: 'single'
        }
    }

    if(isProd) {
        config.plugins.push(new MiniCssExtractPlugin({
            filename: '[contenthash].[name].css',
        }));
    }

    return config;
}
