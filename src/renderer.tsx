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
