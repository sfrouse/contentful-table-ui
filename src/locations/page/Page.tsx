import { Button, Flex, Modal } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import MainNav from "../../components/MainNav/MainNav";
import tokens from "@contentful/f36-tokens";
import Spreadsheet from "../../components/Spreadsheet/Spreadsheet";
import SectionHeader from "../../components/SectionHeader/SectionHeadter";
import { APP_BORDER } from "../../components/utils/styles";
import { useContentful } from "../../contexts/ContentfulContext";
import saveEntries from "./utils/saveEntries";
import { useEffect, useRef, useState } from "react";
import BulkEditModal from "../../components/BulkEditModal/BulkEditModal";
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
        setMultiSelects,
        filteredEntries,
        fieldsLookup,
    } = useContentful();

    const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);
    const [bulkEditType, setBulkEditType] = useState<"number" | "text">();
    const [bulkEditValue, setBulkEditValue] = useState<any>();
    const ref = useRef<HTMLDivElement>(null);
    const bulkEditButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                !showBulkEditModal &&
                ref.current &&
                !ref.current.contains(e.target as Node) &&
                bulkEditButtonRef.current &&
                !bulkEditButtonRef.current.contains(e.target as Node)
            ) {
                setMultiSelects([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [multiSelects, showBulkEditModal]);

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
                <BulkEditModal
                    showBulkEditModal={showBulkEditModal}
                    setShowBulkEditModal={setShowBulkEditModal}
                    bulkEditValue={bulkEditValue}
                    setBulkEditValue={setBulkEditValue}
                    bulkEditType={bulkEditType}
                />
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
                            title={`${
                                focusedContentType?.name
                                    ? `${focusedContentType?.name || ""}
                             Content Type`
                                    : "loading..."
                            }`}
                        />
                        <div style={{ flex: 1 }} />
                        <Flex
                            flexDirection="row"
                            style={{ gap: tokens.spacingXs }}
                        >
                            <Button
                                variant="transparent"
                                isDisabled={
                                    Object.keys(entryChanges).length === 0 &&
                                    multiSelects.length <= 1
                                }
                                onClick={() => {
                                    setEntryChanges({});
                                    setMultiSelects([]);
                                }}
                            >
                                Cancel
                            </Button>
                            <div ref={bulkEditButtonRef}>
                                <Button
                                    style={{ alignSelf: "auto" }}
                                    variant="secondary"
                                    isDisabled={multiSelects.length <= 1}
                                    isLoading={loading}
                                    onClick={() => {
                                        if (multiSelects.length > 0) {
                                            const firstSelect = multiSelects[0];
                                            const firstEntry =
                                                filteredEntries[
                                                    firstSelect.row
                                                ];
                                            const fieldInfo =
                                                fieldsLookup.fieldsLookup[
                                                    firstSelect.col
                                                ];
                                            const fieldValue =
                                                firstEntry?.fields?.[
                                                    fieldInfo.id
                                                ]?.["en-US"];
                                            setBulkEditType(
                                                typeof fieldValue === "number"
                                                    ? "number"
                                                    : "text",
                                            );
                                            setBulkEditValue(fieldValue);
                                            setShowBulkEditModal(true);
                                        }
                                    }}
                                >
                                    Bulk Edit
                                </Button>
                            </div>
                            <Button
                                style={{ alignSelf: "auto" }}
                                variant="primary"
                                isLoading={loading}
                                isDisabled={
                                    Object.keys(entryChanges).length === 0
                                }
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
                                                false,
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
                    </Flex>
                    {filteredEntries?.length > 0 ? (
                        <Spreadsheet ref={ref} />
                    ) : (
                        <div style={{ position: "relative", height: "100%" }}>
                            <LoadingPage />
                        </div>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Page;
