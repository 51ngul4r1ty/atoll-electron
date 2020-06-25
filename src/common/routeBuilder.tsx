// externals
import React from "react";
import { Switch, Route } from "react-router-dom";
import { ConfigureFlopFlip } from "@flopflip/react-broadcast";
import adapter from "@flopflip/memory-adapter";

// components
import {
    IntlProvider,
    AppContainer,
    LoginViewContainer,
    PlanViewContainer,
    SprintViewContainer,
    ReviewViewContainer,
    layouts
} from "@atoll/shared";

const appRoutes = (
    <layouts.MainLayout>
        <AppContainer>
            <Switch>
                <Route path="/" exact component={LoginViewContainer} />
                <Route path="/plan" exact component={PlanViewContainer} />
                <Route path="/sprint" exact component={SprintViewContainer} />
                <Route path="/review" exact component={ReviewViewContainer} />
            </Switch>
        </AppContainer>
    </layouts.MainLayout>
);

const getDefaultFlags = (windowObj: any, forSsr: boolean) => {
    if (forSsr) {
        return { showEditButton: false };
    }
    return (windowObj as any).__TOGGLES__;
};

export const buildRoutes = (windowObj: any, forSsr: boolean) => (
    <IntlProvider>
        <ConfigureFlopFlip
            adapter={adapter as any}
            adapterArgs={{ clientSideId: null, user: null }}
            defaultFlags={getDefaultFlags(windowObj, forSsr)}
        >
            {({ isAdapterReady }) => {
                if (isAdapterReady) {
                    console.log("isAdapterReady = true");
                } else {
                    console.log("isAdapterReady = false");
                }
                return isAdapterReady ? appRoutes : <div>LOADING...</div>;
            }}
        </ConfigureFlopFlip>
    </IntlProvider>
);

export const buildRoutesForElectron = (windowObj: any) => buildRoutes(windowObj, false);
