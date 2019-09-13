module.exports = {
    packagerConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "my_app"
            }
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: ["darwin"]
        },
        {
            name: "@electron-forge/maker-deb",
            config: {}
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {}
        }
    ],
    plugins: [
        [
            "@electron-forge/plugin-webpack",
            {
                mainConfig: "./config/webpack.main.config.js",
                renderer: {
                    config: "./config/webpack.renderer.config.js",
                    entryPoints: [
                        {
                            html: "./config/template.html",
                            js: "./src/renderer.tsx",
                            name: "main_window"
                        }
                    ]
                }
            }
        ]
    ]
};
