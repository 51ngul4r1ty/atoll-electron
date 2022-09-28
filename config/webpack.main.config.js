const fs = require("fs");
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
// const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WriteFileWebpackPlugin = require("write-file-webpack-plugin");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const paths = {
    //    appHtml: resolveApp("config/webpack.config.js/template.html"),
    // clientBuild: resolveApp("build/client"),
    // serverBuild: resolveApp("build/server"),
    build: resolveApp("build"),
    dotenv: resolveApp(".env"),
    src: resolveApp("src"),
    // srcClient: resolveApp("src/client"),
    // srcServer: resolveApp("src/server"),
    // srcShared: resolveApp("src/shared"),
    types: resolveApp("node_modules/@types"),
//    i18n: resolveApp("src/shared/i18n"),
    publicPath: "/static/"
};

paths.resolveModules = [ /*paths.srcClient, paths.srcServer, paths.srcShared,*/ paths.src, "node_modules"];

//const path = require("path");
//const ManifestPlugin = require("webpack-manifest-plugin");
//const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
//const HtmlWebpackPlugin = require("html-webpack-plugin");
//const paths = require("../paths");
//const { clientOnly } = require("../../scripts/utils");

//const env = require("../env")();

const generateSourceMap = process.env.OMIT_SOURCEMAP !== "true";

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

// temporary wrapper function around getCSSModuleLocalIdent until this issue is resolved:
// https://github.com/webpack-contrib/css-loader/pull/965
const getLocalIdentWorkaround = (context, localIdentName, localName, options) => {
    if (options && options.context === null) {
        options.context = undefined;
    }
    return getCSSModuleLocalIdent(context, localIdentName, localName, options);
};

const babelLoader = {
    test: /\.(js|jsx|ts|tsx|mjs)$/,
    exclude: /node_modules/,
    loader: require.resolve("babel-loader"),
    options: {
        plugins: [
            [
                require.resolve("babel-plugin-named-asset-import"),
                {
                    loaderMap: {
                        svg: {
                            ReactComponent: "@svgr/webpack?-prettier,-svgo![path]"
                        }
                    }
                }
            ]
        ],
        cacheDirectory: true,
        cacheCompression: process.env.NODE_ENV === "production",
        compact: process.env.NODE_ENV === "production"
    }
};

const cssModuleLoaderDesktop = {
    test: cssModuleRegex,
    use: [
        {
            loader: require.resolve("css-loader"),
            options: {
                onlyLocals: true,
                localsConvention: "camelCase",
                importLoaders: 1,
                modules: {
                    getLocalIdent: getLocalIdentWorkaround
                }
            }
        },
        {
            loader: require.resolve("postcss-loader"),
            options: {
                sourceMap: generateSourceMap
            }
        }
    ]
};

const cssLoaderDesktop = {
    test: cssRegex,
    exclude: cssModuleRegex,
    use: [MiniCssExtractPlugin.loader, require.resolve("css-loader")]
};

const urlLoaderClient = {
    test: /\.(png|jpe?g|gif|svg)$/,
    loader: require.resolve("url-loader"),
    options: {
        limit: 2048,
        name: "assets/[name].[hash:8].[ext]"
    }
};

const urlLoaderDesktop = {
    ...urlLoaderClient,
    options: {
        ...urlLoaderClient.options,
        emitFile: false
    }
};

const fileLoaderDesktop = {
    exclude: [/\.(js|tsx|ts|tsx|css|mjs|html|ejs|json)$/],
    use: [
        {
            loader: require.resolve("file-loader"),
            options: {
                name: "assets/[name].[hash:8].[ext]",
                emitFile: false
            }
        }
    ]
};

const desktopLoaders = [
    {
        oneOf: [babelLoader, cssModuleLoaderDesktop, cssLoaderDesktop, urlLoaderDesktop, fileLoaderDesktop]
    }
];

module.exports = {
    mode: "development",
    name: "main",
    target: "electron-main",
    entry: {
        index: path.resolve(paths.src, "main.ts")
    },
    externals: [
        nodeExternals({
            // we still want imported css from external files to be bundled otherwise 3rd party packages
            // which require us to include their own css would not work properly
            allowlist: /\.css$/
        })
    ],
    output: {
        path: paths.build,
        filename: "[name].js",
        publicPath: paths.publicPath
    },
    // node: {
    //     // NOTE: Used https://github.com/electron/electron/issues/5107 to resolve
    //     //            Not allowed to load local resource: file:/// ... /atoll/electron/build/index.html
    //     __dirname: false,
    //     __filename: false
    // },
    resolve: {
        extensions: [".js", ".mjs", ".json", ".jsx", ".ts", ".tsx", ".css"],
        modules: paths.resolveModules
    },
    module: {
        rules: desktopLoaders
    },
    performance: {
        hints: false
    },
    plugins: [
        /* dev - plugins that must load first */
        new WriteFileWebpackPlugin(),

        /* shared */
        new MiniCssExtractPlugin({
            filename: process.env.NODE_ENV === "development" ? "[name].css" : "[name].[contenthash].css",
            chunkFilename: process.env.NODE_ENV === "development" ? "[id].css" : "[id].[contenthash].css"
        }),
        //        new CopyPlugin([{ from: "static", to: "." }]),

        /* desktop */
        new webpack.DefinePlugin({
            __SERVER__: "false",
            __BROWSER__: "false",
            __DESKTOP__: "true" // TODO: is this right??  Is it even needed?
        }) //,

        /* dev - plugins that should load later */
        // TODO: See if this can be added back - just testing to see if this is the cause of the infinite-reloading issue
        //        new webpack.HotModuleReplacementPlugin()
    ],
    stats: {
        colors: true
    }
};

// module.exports = (env = "production") => {
//     if (env === "development" || env === "dev") {
//         process.env.NODE_ENV = "development";
//         return require("./desktop.dev");
//     }
//     process.env.NODE_ENV = "production";
//     return require("./desktop.prod");
// };
