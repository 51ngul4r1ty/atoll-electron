// externals
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";

// redux related
import { configureStore } from "@atoll/shared";

// main app
import { App } from "@atoll/shared";

// shared code
// import { IntlProvider } from "@atoll/shared";
import { layouts } from "@atoll/shared";
const { MainLayout } = layouts;

const store = configureStore({});

// document.getElementById("app");

// if (process.env.NODE_ENV === "development") {
//     if (module.hot) {
//         module.hot.accept();
//     }

//     if (!window.store) {
//         window.store = store;
//     }
// }

// Imports - External
// import * as React from "react";
// import { Provider } from "react-redux";
// import { Router } from "react-router";
// import { syncHistoryWithStore, routerReducer } from "react-router-redux";

// Imports - Internal
// import LocalHistory from "../app-local/LocalHistory";
// import routes from "./routes";
// import store from "./store";

const mountElt = document.getElementById("appMountElt");

const providerElt = (
    <Provider store={store}>
        <Router>
            {/* <IntlProvider> */}
                <MainLayout>
                    <Switch>
                        <Route path="/" component={App} />
                    </Switch>
                </MainLayout>
            {/* </IntlProvider> */}
        </Router>
    </Provider>
);

ReactDOM.render(providerElt, mountElt);
