// ContentfulContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import { ContentTypeProps, EntryProps } from "contentful-management";
import { loadEntriesWithResolvedLinks } from "./utils/loadEntriesWithResolvedLinks";

type ContentfulFieldLookup = {
    ctypeIndex: number;
    id: any;
    filter: boolean;
};

export type ContentfulEntryFilter = {
    fieldId: string;
    entryId: string;
    title: string;
};

type ContentfulFieldInfo = {
    displayField: ContentfulFieldLookup;
    fieldsLookup: ContentfulFieldLookup[];
};

export type EntryFilterLookup = {
    [propId: string]: ContentfulEntryFilter[];
};

export type ContentfulEntryChanges = {
    [entryId: string]: { [fieldId: string]: any };
};

interface ContentfulContextType {
    contentTypes: ContentTypeProps[];
    entries: EntryProps[];
    filteredEntries: EntryProps[];
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    focusedContentType: ContentTypeProps | null;
    setFocusedContentType: (ct: ContentTypeProps | null) => void;
    loadEntriesForContentType: (
        contentTypeId: string,
        resetFilters: boolean,
    ) => Promise<void>;
    fieldsLookup: ContentfulFieldInfo;
    setFieldsLookup: (fieldsLookup: ContentfulFieldInfo) => void;
    entryChanges: ContentfulEntryChanges;
    setEntryChanges: React.Dispatch<
        React.SetStateAction<ContentfulEntryChanges>
    >;
    filterLookup: EntryFilterLookup;
    filters: ContentfulEntryFilter[];
    setFilters: React.Dispatch<React.SetStateAction<ContentfulEntryFilter[]>>;
    multiSelects: { col: number; row: number }[];
    setMultiSelects: React.Dispatch<
        React.SetStateAction<
            {
                col: number;
                row: number;
            }[]
        >
    >;
    addToMultiSelects: (col: number, row: number, reset?: boolean) => void;
}

const ContentfulContext = createContext<ContentfulContextType | undefined>(
    undefined,
);

export const ContentfulProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const sdk = useSDK<PageAppSDK>();
    const [contentTypes, setContentTypes] = useState<ContentTypeProps[]>([]);
    const [entries, setEntries] = useState<EntryProps[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<EntryProps[]>([]);
    const [filterLookup, setFilterLookup] = useState<EntryFilterLookup>({});
    const [multiSelects, setMultiSelects] = useState<
        { col: number; row: number }[]
    >([]);
    const [filters, setFilters] = useState<ContentfulEntryFilter[]>([]);
    const [loading, setLoading] = useState(true);
    const [focusedContentType, setFocusedContentType] =
        useState<ContentTypeProps | null>(null);
    const [fieldsLookup, setFieldsLookup] = useState<ContentfulFieldInfo>({
        displayField: { id: "title", ctypeIndex: 0, filter: false },
        fieldsLookup: [],
    });
    const [entryChanges, setEntryChanges] = useState<ContentfulEntryChanges>(
        {},
    );

    useEffect(() => {
        (async () => {
            setLoading(true);
            const ctypes = await sdk.cma.contentType.getMany({});
            const sorted = ctypes.items.sort((a, b) =>
                a.name.localeCompare(b.name),
            );
            const filteredCTypes = sorted.filter(
                (ctype) => ctype.sys.id.indexOf("demai-") !== 0,
            );
            setContentTypes(filteredCTypes);
            setLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (filters.length === 0) {
            setFilteredEntries(entries);
            return;
        }
        const filteredEntries = entries.filter((entry) => {
            return filters?.find((filter) => {
                const refId =
                    entry.fields?.[filter.fieldId]?.["en-US"]?.sys?.id;
                return refId === filter.entryId;
            });
        });
        setFilteredEntries(filteredEntries);
    }, [filters, entries]);

    const loadEntriesForContentType = async (
        contentTypeId: string,
        resetFilters: boolean,
    ) => {
        const contentType =
            contentTypes.find((ct) => ct.sys.id === contentTypeId) ?? null;
        const result = await loadEntriesWithResolvedLinks(sdk, contentTypeId);

        if (resetFilters) {
            setFilters([]);
        }

        setMultiSelects([]);
        setEntries([]);
        setFocusedContentType(contentType);
        setEntries(result);
        setFilteredEntries(result);

        const newFilterLookup: EntryFilterLookup = {};
        result.map((entry) => {
            Object.entries(entry.fields).map(([fieldId, field]) => {
                if (field["en-US"]?.sys?.id) {
                    if (!newFilterLookup[fieldId]) {
                        newFilterLookup[fieldId] = [];
                    }
                    const exists = newFilterLookup[fieldId].find(
                        (filter) => filter.entryId === field["en-US"]?.sys?.id,
                    );
                    if (!exists) {
                        newFilterLookup[fieldId].push({
                            fieldId,
                            entryId: field["en-US"]?.sys?.id,
                            title:
                                field["en-US"]?.fields?.name?.["en-US"] ||
                                field["en-US"]?.fields?.title?.["en-US"] ||
                                field["en-US"]?.sys?.id,
                        });
                        newFilterLookup[fieldId].sort((a, b) =>
                            a.title.localeCompare(b.title),
                        );
                    }
                }
            });
        });
        setFilterLookup(newFilterLookup);

        // PUT TOGETHER FIELD LOOKUP
        const displayTitle = contentType?.displayField;
        let displayTitleCTypeId = 0;
        const newSortedFields: ContentfulFieldLookup[] = [];
        contentType?.fields.map((field, index) => {
            if (field.id === displayTitle) {
                displayTitleCTypeId = index;
            }
            newSortedFields.push({
                ctypeIndex: index,
                id: field.id,
                filter: field.type === "Link",
            });
        });

        setFieldsLookup({
            displayField: {
                ctypeIndex: displayTitleCTypeId,
                id: displayTitle,
                filter: false,
            },
            fieldsLookup: newSortedFields ?? [],
        });
    };

    const addToMultiSelects = (
        col: number,
        row: number,
        reset: boolean = false,
    ) => {
        if (reset) {
            setMultiSelects([{ row, col }]);
            return;
        }
        const otherColSelected = multiSelects.find(
            (select) => select.col !== col,
        );
        if (!otherColSelected) {
            const selectExists = multiSelects.find(
                (select) => select.col === col && select.row === row,
            );
            if (!selectExists) {
                setMultiSelects([...multiSelects, { row, col }]);
            } else {
                setMultiSelects(
                    multiSelects.filter(
                        (filter) => filter.row !== row || filter.col !== col,
                    ),
                );
            }
        } else {
            setMultiSelects([{ row, col }]);
        }
    };

    return (
        <ContentfulContext.Provider
            value={{
                contentTypes,
                entries,
                filteredEntries,
                loading,
                setLoading,
                focusedContentType,
                setFocusedContentType,
                loadEntriesForContentType,
                setFieldsLookup,
                fieldsLookup,
                entryChanges,
                setEntryChanges,
                filterLookup,
                filters,
                setFilters,
                multiSelects,
                setMultiSelects,
                addToMultiSelects,
            }}
        >
            {children}
        </ContentfulContext.Provider>
    );
};

export const useContentful = () => {
    const context = useContext(ContentfulContext);
    if (!context)
        throw new Error("useContentful must be used within ContentfulProvider");
    return context;
};
