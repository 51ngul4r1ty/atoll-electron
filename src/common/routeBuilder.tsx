// externals
import React from "react";
import { Switch, Route } from "react-router-dom";
import { ConfigureFlopFlip } from "@flopflip/react-broadcast";
import adapter from "@flopflip/memory-adapter";

// libraries
import { buildFeatureTogglesList, FEATURE_TOGGLE_LIST } from "@atoll/shared";

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

const wrapViewContainer = (Container: any, props: any, appProps?: any): any => {
    return (
        <AppContainer {...appProps}>
            <Container {...props} />
        </AppContainer>
    );
};

const renderLoginView = (props) => wrapViewContainer(LoginViewContainer, props, { allowTitleBarWindowDragging: true });

const buildAppRoutes = () => {
    const appRoutes = (
        <layouts.MainLayout>
            <Switch>
                <Route path="/" exact render={renderLoginView} />
                <Route path="/plan" exact render={(props) => wrapViewContainer(PlanViewContainer, props)} />
                <Route path="/sprint" exact render={(props) => wrapViewContainer(SprintViewContainer, props)} />
                <Route path="/review" exact render={(props) => wrapViewContainer(ReviewViewContainer, props)} />
                <Route render={renderLoginView} />
            </Switch>
        </layouts.MainLayout>
    );
    return appRoutes;
};

const getDefaultFlags = (windowObj: any, forSsr: boolean) => {
    if (forSsr) {
        return { showEditButton: false };
    }
    const toggles = (windowObj as any).__TOGGLES__ || buildFeatureTogglesList(FEATURE_TOGGLE_LIST);
    return toggles;
};

export const buildRoutes = (windowObj: any, forSsr: boolean) => (
    <IntlProvider>
        <ConfigureFlopFlip
            adapter={adapter as any}
            adapterArgs={{ clientSideId: null, user: null }}
            defaultFlags={getDefaultFlags(windowObj, forSsr)}
        >
            {({ isAdapterReady }) => {
                return isAdapterReady ? buildAppRoutes() : <div>LOADING...</div>;
            }}
        </ConfigureFlopFlip>
    </IntlProvider>
);

export const buildRoutesForElectron = (windowObj: any) => buildRoutes(windowObj, false);
