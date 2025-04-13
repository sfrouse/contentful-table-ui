import { Button, Flex, Modal } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { Dispatch, SetStateAction } from "react";
import {
    ContentfulEntryChanges,
    useContentful,
} from "../../contexts/ContentfulContext";
import saveEntries from "../../locations/page/utils/saveEntries";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";

type BulkEditModalProps = {
    showBulkEditModal: boolean;
    setShowBulkEditModal: Dispatch<SetStateAction<boolean>>;
    bulkEditValue: any;
    setBulkEditValue: Dispatch<any>;
    bulkEditType: "number" | "text" | undefined;
};

const BulkEditModal = ({
    showBulkEditModal,
    setShowBulkEditModal,
    bulkEditValue,
    setBulkEditValue,
    bulkEditType,
}: BulkEditModalProps) => {
    const sdk = useSDK<PageAppSDK>();

    const {
        setEntryChanges,
        focusedContentType,
        loadEntriesForContentType,
        loading,
        setLoading,
        multiSelects,
        filteredEntries,
        fieldsLookup,
    } = useContentful();

    return (
        <Modal
            onClose={() => setShowBulkEditModal(false)}
            isShown={showBulkEditModal}
        >
            {() => (
                <>
                    <Modal.Header
                        title="Bulk Edit"
                        onClose={() => setShowBulkEditModal(false)}
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
                                    setBulkEditValue(event.target.value);
                                }}
                                style={{
                                    padding: tokens.spacingS,
                                    width: "100%",
                                    border: `1px solid ${tokens.gray200}`,
                                }}
                            />
                            <Flex
                                justifyContent="flex-end"
                                style={{
                                    gap: tokens.spacingS,
                                }}
                            >
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowBulkEditModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    isLoading={loading}
                                    onClick={() => {
                                        (async () => {
                                            const entryChanges: ContentfulEntryChanges =
                                                {};
                                            multiSelects.map((select) => {
                                                const entry =
                                                    filteredEntries[select.row];
                                                const propInfo =
                                                    fieldsLookup.fieldsLookup[
                                                        select.col
                                                    ];
                                                entryChanges[entry.sys.id] = {
                                                    [propInfo.id]:
                                                        bulkEditType ===
                                                        "number"
                                                            ? Number(
                                                                  bulkEditValue,
                                                              )
                                                            : `${bulkEditValue}`,
                                                };
                                            });
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
                                            setShowBulkEditModal(false);
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
    );
};

export default BulkEditModal;
