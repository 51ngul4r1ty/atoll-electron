// externals
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ipcRenderer, remote } from "electron";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

// libraries
import {
    storeHistoryInstance,
    initConfig,
    createElectronClientHistory,
    configureStore,
    buildFeatureTogglesList,
    StateTree,
    FeatureTogglesState,
    FEATURE_TOGGLE_LIST
} from "@atoll/shared";

// shared code
import { buildRoutesForElectron } from "common/routeBuilder";
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
const oldState: StateTree = { app: { executingOnClient: true } as AppState } as StateTree;
const newApp = { ...oldState.app /*, locale */ };
const newState: StateTree = { ...oldState, app: newApp, featureToggles };

const store = configureStore({
    initialState: newState, // { app: { executingOnClient: true } },
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

remote.globalShortcut.register("F5", reload);
remote.globalShortcut.register("CommandOrControl+R", reload);
window.addEventListener("beforeunload", () => {
    console.log("beforeunload triggered");
    remote.globalShortcut.unregister("F5");
    remote.globalShortcut.unregister("CommandOrControl+R");
    console.log("beforeunload completed");
    return true;
});
