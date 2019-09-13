/* eslint-disable security/detect-object-injection */
/* eslint-disable security/detect-non-literal-fs-filename */

/* -------------------- ENV -------------------- */

/*
const fs = require('fs');
const path = require('path');
const paths = require('./paths');

delete require.cache[require.resolve('./paths')];

if (!process.env.NODE_ENV) {
    throw new Error(
        'The process.env.NODE_ENV environment variable is required but was not specified.'
    );
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
    `${paths.dotenv}.${process.env.NODE_ENV}.local`,
    `${paths.dotenv}.${process.env.NODE_ENV}`,
    process.env.NODE_ENV !== 'test' && `${paths.dotenv}.local`,
    paths.dotenv,
].filter(Boolean);

dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
        require('dotenv').config({
            path: dotenvFile,
        });
    }
});

const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter((folder) => folder && !path.isAbsolute(folder))
    .map((folder) => path.resolve(appDirectory, folder))
    .join(path.delimiter);

module.exports = () => {
    // define env vars you want to use in your client app here.
    // CAREFUL: don't use any secrets like api keys or database passwords as they are exposed publicly!
    const raw = {
        PORT: process.env.PORT || 8500,
        NODE_ENV: process.env.NODE_ENV || 'development',
        HOST: process.env.HOST || 'http://localhost',
    };

    // Stringify all values so we can feed into Webpack DefinePlugin
    const stringified = {
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {}),
    };

    return { raw, stringified };
};
*/

/* -------------------- PLUGINS -------------------- */

/*
const chalk = require("chalk");

const logMessage = (message, level = "info") => {
    const color = level === "error" ? "red" : level === "warning" ? "yellow" : level === "info" ? "blue" : "white";
    console.log(`[${new Date().toISOString()}]`, chalk[color](message));
};

const compilerPromise = (name, compiler) => {
    return new Promise((resolve, reject) => {
        compiler.hooks.compile.tap(name, () => {
            logMessage(`[${name}] Compiling `);
        });
        compiler.hooks.done.tap(name, (stats) => {
            if (!stats.hasErrors()) {
                return resolve();
            }
            return reject(`Failed to compile ${name}`);
        });
    });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clientOnly = () => process.argv.includes("--client-only");

module.exports = {
    clientOnly,
    compilerPromise,
    logMessage,
    sleep
};
*/
/* -------------------- PLUGINS -------------------- */

/*
const path = require("path");
const webpack = require("webpack");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const paths = require("../paths");
const { clientOnly } = require("../../scripts/utils");

const env = require("../env")();

const shared = [
    new MiniCssExtractPlugin({
        filename: process.env.NODE_ENV === "development" ? "[name].css" : "[name].[contenthash].css",
        chunkFilename: process.env.NODE_ENV === "development" ? "[id].css" : "[id].[contenthash].css"
    })
];

const client = [
    clientOnly() &&
    new HtmlWebpackPlugin({
        filename: path.join(paths.clientBuild, "index.html"),
        inject: true,
        template: paths.appHtml
    }),
    // new webpack.ProgressPlugin(), // make this optional e.g. via `--progress` flag
    new CaseSensitivePathsPlugin(),
    new webpack.DefinePlugin(env.stringified),
    new webpack.DefinePlugin({
        __SERVER__: "false",
        __BROWSER__: "true"
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ManifestPlugin({ fileName: "manifest.json" })
].filter(Boolean);

const server = [
    new webpack.DefinePlugin({
        __SERVER__: "true",
        __BROWSER__: "false"
    })
];

module.exports = {
    shared,
    client,
    server
};
*/

/* -------------------- RESOLVERS -------------------- */

/*
const paths = require("../paths");

module.exports = {
    extensions: [".js", ".mjs", ".json", ".jsx", ".ts", ".tsx", ".css"],
    modules: paths.resolveModules
};
*/

/* -------------------- LOADERS -------------------- */

/*
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const generateSourceMap = process.env.OMIT_SOURCEMAP === "true" ? false : true;
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

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

const cssModuleLoaderClient = {
    test: cssModuleRegex,
    use: [
        require.resolve("css-hot-loader"),
        MiniCssExtractPlugin.loader,
        {
            loader: require.resolve("css-loader"),
            options: {
                localsConvention: "camelCase",
                importLoaders: 1,
                modules: {
                    getLocalIdent: getLocalIdentWorkaround
                },
                sourceMap: generateSourceMap
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

const cssLoaderClient = {
    test: cssRegex,
    exclude: cssModuleRegex,
    use: [
        require.resolve("css-hot-loader"),
        MiniCssExtractPlugin.loader,
        require.resolve("css-loader"),
        {
            loader: require.resolve("postcss-loader"),
            options: {
                sourceMap: generateSourceMap
            }
        }
    ]
};

const cssModuleLoaderServer = {
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

const cssLoaderServer = {
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

const urlLoaderServer = {
    ...urlLoaderClient,
    options: {
        ...urlLoaderClient.options,
        emitFile: false
    }
};

const fileLoaderClient = {
    exclude: [/\.(js|jsx|ts|tsx|css|mjs|html|ejs|json)$/],
    use: [
        {
            loader: require.resolve("file-loader"),
            options: {
                name: "assets/[name].[hash:8].[ext]"
            }
        }
    ]
};

const fileLoaderServer = {
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

const client = [
    {
        oneOf: [babelLoader, cssModuleLoaderClient, cssLoaderClient, urlLoaderClient, fileLoaderClient]
    }
];
const server = [
    {
        oneOf: [babelLoader, cssModuleLoaderServer, cssLoaderServer, urlLoaderServer, fileLoaderServer]
    }
];

module.exports = {
    client,
    server
};
*/

/* -------------------- PATHS -------------------- */
/*
const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const paths = {
    appHtml: resolveApp("config/webpack.config.js/template.html"),
    clientBuild: resolveApp("build/client"),
    serverBuild: resolveApp("build/server"),
    dotenv: resolveApp(".env"),
    src: resolveApp("src"),
    srcClient: resolveApp("src/client"),
    srcServer: resolveApp("src/server"),
    srcShared: resolveApp("src/shared"),
    types: resolveApp("node_modules/@types"),
    i18n: resolveApp("src/shared/i18n"),
    publicPath: "/static/"
};

paths.resolveModules = [paths.srcClient, paths.srcServer, paths.srcShared, paths.src, "node_modules"];

module.exports = paths;
*/

/* -------------------- CLIENT.BASE -------------------- */
/*
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const paths = require("../paths");
const { client: clientLoaders } = require("./loaders");
const resolvers = require("./resolvers");
const plugins = require("./plugins");
const generateSourceMap = process.env.OMIT_SOURCEMAP === "true" ? false : true;

module.exports = {
    name: "client",
    target: "web",
    entry: {
        bundle: [require.resolve("core-js/stable"), require.resolve("regenerator-runtime/runtime"), paths.srcClient]
    },
    output: {
        path: path.join(paths.clientBuild, paths.publicPath),
        filename: "bundle.js",
        publicPath: paths.publicPath,
        chunkFilename: "[name].[chunkhash:8].chunk.js"
    },
    module: {
        rules: clientLoaders
    },
    resolve: { ...resolvers },
    plugins: [...plugins.shared, ...plugins.client],
    node: {
        dgram: "empty",
        fs: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty"
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                // TerserPlugin config is taken entirely from react-scripts
                terserOptions: {
                    parse: {
                        // we want terser to parse ecma 8 code. However, we don't want it
                        // to apply any minfication steps that turns valid ecma 5 code
                        // into invalid ecma 5 code. This is why the 'compress' and 'output'
                        // sections only apply transformations that are ecma 5 safe
                        // https://github.com/facebook/create-react-app/pull/4234
                        ecma: 8
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        // Disabled because of an issue with Uglify breaking seemingly valid code:
                        // https://github.com/facebook/create-react-app/issues/2376
                        // Pending further investigation:
                        // https://github.com/mishoo/UglifyJS2/issues/2011
                        comparisons: false,
                        // Disabled because of an issue with Terser breaking valid code:
                        // https://github.com/facebook/create-react-app/issues/5250
                        // Pending futher investigation:
                        // https://github.com/terser-js/terser/issues/120
                        inline: 2
                    },
                    mangle: {
                        safari10: true
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        // Turned on because emoji and regex is not minified properly using default
                        // https://github.com/facebook/create-react-app/issues/2488
                        ascii_only: true
                    }
                },
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                parallel: true,
                // Enable file caching
                cache: true,
                sourceMap: generateSourceMap
            })
        ],
        namedModules: true,
        noEmitOnErrors: true,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }
    },
    stats: {
        cached: false,
        cachedAssets: false,
        chunks: false,
        chunkModules: false,
        colors: true,
        hash: false,
        modules: false,
        reasons: false,
        timings: true,
        version: false
    }
};
*/
/* -------------------- CLIENT.DEV -------------------- */
/*
const baseConfig = require("./client.base");
const webpack = require("webpack");
const WriteFileWebpackPlugin = require("write-file-webpack-plugin");
const generateSourceMap = process.env.OMIT_SOURCEMAP === "true" ? false : true;

const config = {
    ...baseConfig,
    plugins: [new WriteFileWebpackPlugin(), new webpack.HotModuleReplacementPlugin(), ...baseConfig.plugins],
    mode: "development",
    devtool: generateSourceMap ? "cheap-module-inline-source-map" : false,
    performance: {
        hints: false
    }
};

module.exports = config;
*/

/* -------------------- INDEX -------------------- */
/*
module.exports = (env = "production") => {
    if (env === "development" || env === "dev") {
        process.env.NODE_ENV = "development";
        return [require("./client.dev"), require("./server.dev")];
    }
    process.env.NODE_ENV = "production";
    return [require("./client.prod"), require("./server.prod")];
};
*/

/* -------------------- FINAL -------------------- */

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

/* webpack plugins */
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WriteFileWebpackPlugin = require("write-file-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const generateSourceMap = process.env.OMIT_SOURCEMAP === "true" ? false : true;

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

const cssModuleRegex = /\.module\.css$/;

// temporary wrapper function around getCSSModuleLocalIdent until this issue is resolved:
// https://github.com/webpack-contrib/css-loader/pull/965
const getLocalIdentWorkaround = (context, localIdentName, localName, options) => {
    if (options && options.context === null) {
        options.context = undefined;
    }
    return getCSSModuleLocalIdent(context, localIdentName, localName, options);
};

const cssModuleLoaderClient = {
    test: cssModuleRegex,
    use: [
        // TODO: See if this can be added back - just testing to see if this is the cause of the infinite-reloading issue
        //        require.resolve("css-hot-loader"),
        MiniCssExtractPlugin.loader,
        {
            loader: require.resolve("css-loader"),
            options: {
                localsConvention: "camelCase",
                importLoaders: 1,
                modules: {
                    getLocalIdent: getLocalIdentWorkaround
                },
                sourceMap: generateSourceMap
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

const cssRegex = /\.css$/;

const cssLoaderClient = {
    test: cssRegex,
    exclude: cssModuleRegex,
    use: [
        // TODO: See if this can be added back - just testing to see if this is the cause of the infinite-reloading issue
        //        require.resolve("css-hot-loader"),
        MiniCssExtractPlugin.loader,
        require.resolve("css-loader"),
        {
            loader: require.resolve("postcss-loader"),
            options: {
                sourceMap: generateSourceMap
            }
        }
    ]
};

const urlLoaderClient = {
    test: /\.(png|jpe?g|gif|svg)$/,
    loader: require.resolve("url-loader"),
    options: {
        limit: 2048,
        name: "assets/[name].[hash:8].[ext]"
    }
};

const fileLoaderClient = {
    exclude: [/\.(js|jsx|ts|tsx|css|mjs|html|ejs|json)$/],
    use: [
        {
            loader: require.resolve("file-loader"),
            options: {
                name: "assets/[name].[hash:8].[ext]"
            }
        }
    ]
};

const clientLoaders = [
    {
        oneOf: [babelLoader, cssModuleLoaderClient, cssLoaderClient, urlLoaderClient, fileLoaderClient]
    }
];

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const paths = {
    appHtml: resolveApp("config/template.html"),
    build: resolveApp("build"),
    //    clientBuild: resolveApp("build/client"),
    //    serverBuild: resolveApp("build/server"),
    dotenv: resolveApp(".env"),
    src: resolveApp("src"),
    rendererEntryPath: resolveApp("src/renderer"),
    //    srcClient: resolveApp("src/client"),
    //    srcServer: resolveApp("src/server"),
    //    srcShared: resolveApp("src/shared"),
    types: resolveApp("node_modules/@types"),
    i18n: resolveApp("src/shared/i18n"),
    publicPath: "./static/"
};

// TODO: Look into the need for `srcShared` - it may actually be needed?
paths.resolveModules = [/*paths.srcClient, paths.srcServer, paths.srcShared,*/ paths.src, "node_modules"];

const resolvers = {
    extensions: [".js", ".mjs", ".json", ".jsx", ".ts", ".tsx", ".css"],
    modules: paths.resolveModules
};

// const clientOnly = () => process.argv.includes("--client-only");

const htmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: path.join(paths.build, "index.html"),
    inject: true,
    template: paths.appHtml
});

const raw = {
    PORT: process.env.PORT || 8500,
    NODE_ENV: process.env.NODE_ENV || "development",
    HOST: process.env.HOST || "http://localhost"
};

// Stringify all values so we can feed into Webpack DefinePlugin
const stringified = {
    "process.env": Object.keys(raw).reduce((env, key) => {
        env[key] = JSON.stringify(raw[key]);
        return env;
    }, {})
};

const env = { raw, stringified };

const plugins = {
    shared: [
        new MiniCssExtractPlugin({
            filename: process.env.NODE_ENV === "development" ? "[name].css" : "[name].[contenthash].css",
            chunkFilename: process.env.NODE_ENV === "development" ? "[id].css" : "[id].[contenthash].css"
        }),
        new CopyWebpackPlugin([{ from: "./node_modules/@atoll/shared/dist/index.es.css", to: "shared-bundle.css" }])
    ],
    client: [
        /*clientOnly() &&*/ htmlWebpackPlugin,
        // new webpack.ProgressPlugin(), // make this optional e.g. via `--progress` flag
        new CaseSensitivePathsPlugin(),
        new webpack.DefinePlugin(env.stringified),
        new webpack.DefinePlugin({
            __SERVER__: "false",
            __BROWSER__: "true"
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new ManifestPlugin({ fileName: "manifest.json" })
    ].filter(Boolean)
};

const baseConfig = {
    name: "client",
    target: "electron-renderer",
    entry: {
        bundle: [
            require.resolve("core-js/stable"),
            require.resolve("regenerator-runtime/runtime"),
            paths.rendererEntryPath /* changed from this: paths.srcClient*/
        ]
    },
    output: {
        path: path.join(paths.build, paths.publicPath),
        filename: "bundle.js",
        publicPath: paths.publicPath,
        chunkFilename: "[name].[chunkhash:8].chunk.js"
    },
    // node: {
    //     // NOTE: Used https://github.com/electron/electron/issues/5107 to resolve
    //     //            Not allowed to load local resource: file:/// ... /atoll/electron/build/index.html
    //     __dirname: false,
    //     __filename: false
    // },
    module: {
        rules: clientLoaders
    },
    resolve: { ...resolvers },
    plugins: [...plugins.shared, ...plugins.client],
    node: {
        dgram: "empty",
        fs: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty"
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                // TerserPlugin config is taken entirely from react-scripts
                terserOptions: {
                    parse: {
                        // we want terser to parse ecma 8 code. However, we don't want it
                        // to apply any minfication steps that turns valid ecma 5 code
                        // into invalid ecma 5 code. This is why the 'compress' and 'output'
                        // sections only apply transformations that are ecma 5 safe
                        // https://github.com/facebook/create-react-app/pull/4234
                        ecma: 8
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        // Disabled because of an issue with Uglify breaking seemingly valid code:
                        // https://github.com/facebook/create-react-app/issues/2376
                        // Pending further investigation:
                        // https://github.com/mishoo/UglifyJS2/issues/2011
                        comparisons: false,
                        // Disabled because of an issue with Terser breaking valid code:
                        // https://github.com/facebook/create-react-app/issues/5250
                        // Pending futher investigation:
                        // https://github.com/terser-js/terser/issues/120
                        inline: 2
                    },
                    mangle: {
                        safari10: true
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        // Turned on because emoji and regex is not minified properly using default
                        // https://github.com/facebook/create-react-app/issues/2488
                        ascii_only: true
                    }
                },
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                parallel: true,
                // Enable file caching
                cache: true,
                sourceMap: generateSourceMap
            })
        ],
        namedModules: true,
        noEmitOnErrors: true,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }
    },
    stats: {
        cached: false,
        cachedAssets: false,
        chunks: false,
        chunkModules: false,
        colors: true,
        hash: false,
        modules: false,
        reasons: false,
        timings: true,
        version: false
    }
};

module.exports = {
    ...baseConfig,
    // TODO: See if this can be added back - just testing to see if this is the cause of the infinite-reloading issue
    plugins: [new WriteFileWebpackPlugin(), /* new webpack.HotModuleReplacementPlugin(), */ ...baseConfig.plugins],
    mode: "development",
    devtool: generateSourceMap ? "cheap-module-inline-source-map" : false,
    performance: {
        hints: false
    }
};
