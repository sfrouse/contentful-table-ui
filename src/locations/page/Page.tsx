import {
    Button,
    Flex,
    Heading,
    Modal,
    Paragraph,
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import MainNav from "../../components/MainNav/MainNav";
import tokens from "@contentful/f36-tokens";
import Spreadsheet from "../../components/Spreadsheet/Spreadsheet";
import SectionHeader from "../../components/SectionHeader/SectionHeadter";
import { APP_BORDER } from "../../components/utils/styles";
import {
    ContentfulEntryChanges,
    useContentful,
} from "../../contexts/ContentfulContext";
import saveEntries from "./utils/saveEntries";
import { useState } from "react";
import { EntryProps } from "contentful-management";
import LoadingPage from "../../components/Loading/LoadingPage";

const Page = () => {
    const sdk = useSDK<PageAppSDK>();
    const {
        entryChanges,
        setEntryChanges,
        focusedContentType,
        loadEntriesForContentType,
        loading,
        setLoading,
        multiSelects,
        filteredEntries,
        fieldsLookup,
        filters,
        setFilters,
    } = useContentful();

    const [showBuldEdit, setShowBuldEditModal] = useState<boolean>(false);
    const [bulkEditType, setBulkEditType] = useState<"number" | "text">();
    const [bulkEditValue, setBulkEditValue] = useState<any>();

    return (
        <Flex
            flexDirection="row"
            style={{
                width: "100vw",
                height: "100vh",
                boxSizing: "border-box",
            }}
            alignItems="stretch"
        >
            <Flex
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    boxShadow:
                        "rgba(25, 37, 50, 0.1) 0px 6px 16px -2px, rgba(25, 37, 50, 0.15) 0px 3px 6px -3px",
                    boxSizing: "border-box",
                    backgroundColor: tokens.colorWhite,
                    marginLeft: tokens.spacingM,
                    marginRight: tokens.spacingL,
                }}
            >
                <MainNav />
                <Flex
                    flexDirection="column"
                    alignItems="stretch"
                    style={{ flex: 1 }}
                >
                    <Flex
                        flexDirection="row"
                        alignItems="center"
                        data-id="Header - Filters"
                        style={{
                            borderBottom: APP_BORDER,
                            paddingRight: tokens.spacingXs,
                        }}
                    >
                        <SectionHeader
                            title={`${focusedContentType?.name} Content Type`}
                        />
                        <div style={{ flex: 1 }} />
                        <Button
                            style={{ alignSelf: "auto", marginRight: 6 }}
                            variant="secondary"
                            isDisabled={multiSelects.length === 0}
                            isLoading={loading}
                            onClick={() => {
                                if (multiSelects.length > 0) {
                                    const firstSelect = multiSelects[0];
                                    const firstEntry =
                                        filteredEntries[firstSelect.row];
                                    const fieldInfo =
                                        fieldsLookup.fieldsLookup[
                                            firstSelect.col
                                        ];
                                    const fieldValue =
                                        firstEntry?.fields?.[fieldInfo.id]?.[
                                            "en-US"
                                        ];
                                    setBulkEditType(
                                        typeof fieldValue === "number"
                                            ? "number"
                                            : "text",
                                    );
                                    setBulkEditValue(fieldValue);
                                    setShowBuldEditModal(true);
                                }
                            }}
                        >
                            Bulk Edit
                        </Button>
                        <Modal
                            onClose={() => setShowBuldEditModal(false)}
                            isShown={showBuldEdit}
                        >
                            {() => (
                                <>
                                    <Modal.Header
                                        title="Bulk Edit"
                                        onClose={() =>
                                            setShowBuldEditModal(false)
                                        }
                                    />
                                    <Modal.Content>
                                        <Flex
                                            flexDirection="column"
                                            style={{ gap: tokens.spacingS }}
                                        >
                                            <input
                                                type={bulkEditType}
                                                value={`${bulkEditValue}`}
                                                tabIndex={0}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>,
                                                ) => {
                                                    console.log(
                                                        "event.target.value",
                                                        event.target.value,
                                                    );
                                                    setBulkEditValue(
                                                        event.target.value,
                                                    );
                                                }}
                                                style={{
                                                    padding: tokens.spacingS,
                                                    width: "100%",
                                                    border: `1px solid ${tokens.gray200}`,
                                                }}
                                            />
                                            <Flex
                                                justifyContent="flex-end"
                                                style={{ gap: tokens.spacingS }}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        setShowBuldEditModal(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    isLoading={loading}
                                                    onClick={() => {
                                                        (async () => {
                                                            console.log(
                                                                "SAVE",
                                                                bulkEditValue,
                                                                multiSelects,
                                                            );
                                                            const entries: EntryProps[] =
                                                                [];
                                                            const entryChanges: ContentfulEntryChanges =
                                                                {};
                                                            multiSelects.map(
                                                                (select) => {
                                                                    const entry =
                                                                        filteredEntries[
                                                                            select
                                                                                .row
                                                                        ];
                                                                    const propInfo =
                                                                        fieldsLookup
                                                                            .fieldsLookup[
                                                                            select
                                                                                .col
                                                                        ];
                                                                    entryChanges[
                                                                        entry.sys.id
                                                                    ] = {
                                                                        [propInfo.id]:
                                                                            bulkEditType ===
                                                                            "number"
                                                                                ? Number(
                                                                                      bulkEditValue,
                                                                                  )
                                                                                : `${bulkEditValue}`,
                                                                    };
                                                                },
                                                            );
                                                            setLoading(true);
                                                            const prevFilters =
                                                                filters;
                                                            await saveEntries(
                                                                sdk,
                                                                entryChanges,
                                                                focusedContentType,
                                                            );
                                                            if (
                                                                focusedContentType
                                                            ) {
                                                                await loadEntriesForContentType(
                                                                    focusedContentType
                                                                        ?.sys
                                                                        .id,
                                                                );
                                                            }
                                                            setFilters(
                                                                prevFilters,
                                                            );
                                                            setEntryChanges({});
                                                            setLoading(false);
                                                            setShowBuldEditModal(
                                                                false,
                                                            );
                                                        })();
                                                    }}
                                                >
                                                    Save
                                                </Button>
                                            </Flex>
                                        </Flex>
                                    </Modal.Content>
                                </>
                            )}
                        </Modal>
                        <Button
                            style={{ alignSelf: "auto" }}
                            variant="primary"
                            isLoading={loading}
                            isDisabled={Object.keys(entryChanges).length === 0}
                            onClick={() => {
                                (async () => {
                                    setLoading(true);
                                    await saveEntries(
                                        sdk,
                                        entryChanges,
                                        focusedContentType,
                                    );
                                    if (focusedContentType) {
                                        await loadEntriesForContentType(
                                            focusedContentType?.sys.id,
                                        );
                                    }
                                    setEntryChanges({});
                                    setLoading(false);
                                })();
                            }}
                        >
                            Save
                        </Button>
                    </Flex>
                    <Spreadsheet />
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Page;
