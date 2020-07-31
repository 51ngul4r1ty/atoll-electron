// externals
import * as React from "react";
import * as ReactDOM from "react-dom";
import { remote } from "electron";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

// redux related
import {
    configureStore,
    createElectronClientHistory,
    storeHistoryInstance,
    initConfig,
    FeatureTogglesState,
    StateTree,
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
    toggles: FEATURE_TOGGLE_LIST
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
    remote.globalShortcut.unregister("F5");
    remote.globalShortcut.unregister("CommandOrControl+R");
});
