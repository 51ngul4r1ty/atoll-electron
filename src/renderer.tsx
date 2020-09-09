// externals
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ipcRenderer, remote } from "electron";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

// libraries
import {
    FEATURE_TOGGLE_LIST,
    FeatureTogglesState,
    StateTree,
    buildFeatureTogglesList,
    configureStore,
    createElectronClientHistory,
    initConfig,
    isPlatformMacOSX,
    isPlatformWindows,
    rootReducerInitialState,
    storeHistoryInstance
} from "@atoll/shared";

// shared code
import { buildRoutesForElectron } from "./common/routeBuilder";
import { AppState } from "@atoll/shared";

const history = createElectronClientHistory();
storeHistoryInstance(history);

const syncHistoryWithStore = (appStore, appHistory) => {
    const { router } = appStore.getState();
    if (router && router.location) {
        appHistory.replace(router.location);
    }
};

// TODO: Allow this to be configured - for now it is hard-coded to local development
initConfig({ getDocumentLocHref: () => "http://localhost:8500/" });

const featureToggles: FeatureTogglesState = {
    toggles: buildFeatureTogglesList(FEATURE_TOGGLE_LIST)
};

const baseState = rootReducerInitialState;
const oldState: StateTree = {
    ...baseState,
    app: { ...baseState.app, executingOnClient: true, electronClient: true } as AppState
} as StateTree;
const newApp = { ...oldState.app /*, locale */ };
const newState: StateTree = { ...oldState, app: newApp, featureToggles };

const store = configureStore({
    initialState: newState,
    history,
    middleware: [],
    windowRef: window
});
syncHistoryWithStore(store, history);

const mountElt = document.getElementById("appMountElt");

(window as any).atoll__CloseApp = () => {
    console.log("'atoll-close-app' sent from renderer");
    ipcRenderer.send("atoll-close-app");
};

(window as any).atoll__MaximizeApp = () => {
    console.log("'atoll-maximize-app' sent from renderer");
    ipcRenderer.send("atoll-maximize-app");
};

(window as any).atoll__RestoreApp = () => {
    console.log("'atoll-restore-app' sent from renderer");
    ipcRenderer.send("atoll-restore-app");
};

(window as any).atoll__MinimizeApp = () => {
    console.log("'atoll-minimize-app' sent from renderer");
    ipcRenderer.send("atoll-minimize-app");
};

enum TitleBarDoubleClickAction {
    None = 0,
    Miminize = 1,
    Default = 2
}

(window as any).atoll__IsWindowMaximized = (): boolean | undefined => {
    const win = remote.getCurrentWindow();
    if (!win) {
        return undefined;
    }
    return win.isMaximized();
};

(window as any).atoll__TitleBarDoubleClick = () => {
    console.log("'atoll-titlebar-doubleclick' sent from renderer");
    const win = remote.getCurrentWindow();
    if (win) {
        let titleBarDoubleClickAction = TitleBarDoubleClickAction.Default;
        if (process.platform === "darwin") {
            // `getUserDefault` is only available under macOS
            const action = remote.systemPreferences.getUserDefault("AppleActionOnDoubleClick", "string");
            switch (action) {
                case "None":
                    // Action disabled entirely, nothing to do
                    titleBarDoubleClickAction = TitleBarDoubleClickAction.None;
                    break;
                case "Minimize":
                    // The user prefers to minimize the window, weird
                    titleBarDoubleClickAction = TitleBarDoubleClickAction.Miminize;
                    break;
                default:
                    break;
            }
        }
        let result = false;
        switch (titleBarDoubleClickAction) {
            case TitleBarDoubleClickAction.Miminize:
                win.minimize();
                result = true;
                break;
            case TitleBarDoubleClickAction.Default:
                // Toggling maximization otherwise
                // Under macOS this should actually trigger the "zoom" action, but I believe that's identical to toggling maximization for Electron apps, so we'll just do that for simplicity here
                // In case you want to trigger the zoom action for some reason: Menu.sendActionToFirstResponder ( 'zoom:' );
                if (win.isMaximized()) {
                    win.unmaximize();
                    result = true;
                } else {
                    win.maximize();
                    result = true;
                }
                break;
        }
        // This doesn't have to be intercepted in the main code, but it can be in future.
        ipcRenderer.send("atoll-titlebar-doubleclick");
        return result;
    }
};

const providerElt = (
    <Provider store={store}>
        <ConnectedRouter history={history}>{buildRoutesForElectron(window)}</ConnectedRouter>
    </Provider>
);

ReactDOM.render(providerElt, mountElt);

const reload = () => {
    try {
        const url = remote.getCurrentWindow().webContents.getURL();
        console.log(`RELOADING: ${url}`);
    } catch (err) {
        console.log("SOME ERROR");
    }
    remote.getCurrentWindow().reload();
};

let f5Registered = false;
if (isPlatformWindows()) {
    remote.globalShortcut.register("F5", reload);
    f5Registered = true;
}

let ctrlRRegistered = false;
if (isPlatformMacOSX()) {
    remote.globalShortcut.register("CommandOrControl+R", reload);
    ctrlRRegistered = true;
}

window.addEventListener("beforeunload", () => {
    console.log("beforeunload triggered");
    if (f5Registered) {
        remote.globalShortcut.unregister("F5");
    }
    if (ctrlRRegistered) {
        remote.globalShortcut.unregister("CommandOrControl+R");
    }
    console.log("beforeunload completed");
    return true;
});
