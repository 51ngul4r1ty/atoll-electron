// externals
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

// redux related
import { configureStore, createClientHistory, storeHistoryInstance, initConfig } from "@atoll/shared";

// shared code
import { buildRoutesForElectron } from "common/routeBuilder";

const history = createClientHistory();
storeHistoryInstance(history);

// TODO: Allow this to be configured - for now it is hard-coded to local development
initConfig({ getDocumentLocHref: () => "http://localhost:8500/" });

const store = configureStore({
    initialState: { app: { executingOnClient: true } },
    history,
    middleware: []
});

const mountElt = document.getElementById("appMountElt");
console.log(`SET UP MOUNT ELT: ${!!mountElt}`);

const providerElt = (
    <Provider store={store}>
        <ConnectedRouter history={history}>{buildRoutesForElectron(window)}</ConnectedRouter>
    </Provider>
);

ReactDOM.render(providerElt, mountElt);
