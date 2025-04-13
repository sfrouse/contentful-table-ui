// AppStateContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useContentful } from "./ContentfulContext";

type AppStateRoute = {
    contentTypeId?: string;
};

type AppState = {
    route: AppStateRoute;
    setRoute: (route: AppStateRoute) => void;
    // Add more state fields here as needed
};

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [route, setRoute] = useState<AppStateRoute>({});
    const { contentTypes, loadEntriesForContentType } = useContentful();

    useEffect(() => {
        if (!route.contentTypeId && contentTypes?.length > 0) {
            setRoute({ contentTypeId: contentTypes[0].sys.id });
        }
    }, [contentTypes]);

    useEffect(() => {
        if (route.contentTypeId) {
            loadEntriesForContentType(route.contentTypeId);
        }
    }, [route]);

    return (
        <AppStateContext.Provider value={{ route, setRoute }}>
            {children}
        </AppStateContext.Provider>
    );
};

export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (!context)
        throw new Error("useAppState must be used within AppStateProvider");
    return context;
};
