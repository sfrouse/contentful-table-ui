import { Badge, Flex } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { APP_BORDER } from "../../utils/styles";
import { useContentful } from "../../../contexts/ContentfulContext";
import { useState } from "react";
import RenderCell from "./RenderCell";
import RenderEditCell from "./RenderEditCell";
import styles from "./SpreadsheetCell.module.css";
import getEntryStatus from "../../utils/getEntryPublishStatus";

type SpreadsheetCellProps = {
    col: number;
    row: number;
    isSticky?: boolean;
    isDisplayTitle?: boolean;
    style?: React.CSSProperties;
};

const SpreadsheetCell = ({
    col,
    row,
    isSticky = false,
    isDisplayTitle = false,
    style,
}: SpreadsheetCellProps) => {
    const {
        filteredEntries,
        fieldsLookup,
        focusedContentType,
        entryChanges,
        setEntryChanges,
        addToMultiSelects,
        multiSelects,
    } = useContentful();
    const [isEditing, setIsEditing] = useState<Boolean>(false);

    const entry = filteredEntries[row];

    // let value: ReactNode = <span>not found</span>;
    let entryField, ctypeField, fieldId;
    if (isDisplayTitle) {
        fieldId = fieldsLookup.displayField.id;
        entryField = entry.fields[fieldsLookup.displayField.id];
        ctypeField =
            focusedContentType?.fields[fieldsLookup.displayField.ctypeIndex];
    } else {
        const field = fieldsLookup.fieldsLookup[col];
        if (!field) {
            console.error(
                "FIELD MISSING",
                fieldsLookup,
                fieldsLookup.fieldsLookup,
                col,
            );
            return null;
        }
        fieldId = field?.id;
        entryField = entry.fields[field?.id];
        ctypeField = focusedContentType?.fields[field.ctypeIndex];
    }

    const selectables = ["Symbol", "Text", "Integer", "Number"];
    const isSelectable = selectables.includes(`${ctypeField?.type}`);

    let finalVal = entryField?.["en-US"];
    let rawVal = entryField?.["en-US"];
    const changeVal = entryChanges[entry.sys.id]?.[fieldId];
    let isEdited = false;
    if (changeVal) {
        isEdited = true;
        finalVal = changeVal;
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setIsEditing(true);
        }
    };

    const isMultiSelected = multiSelects.find(
        (select) => select.row === row && select.col === col,
    );

    const cls = [];
    let child = null;
    let isInteractive = isSelectable ? true : false;
    if (col === 0 && isSticky) {
        isInteractive = false;
        const status = getEntryStatus(entry);
        child = (
            <Badge
                style={{ marginRight: -4 }}
                variant={
                    status === "changed"
                        ? "primary"
                        : status === "published"
                        ? "positive"
                        : "warning"
                }
                // endIcon={<icons.AssetIcon />}
            >
                {status.substring(0, 1)}
            </Badge>
        );
    }

    if (isInteractive) {
        cls.push(styles.hover);
    }
    if (isMultiSelected) {
        cls.push(styles.multiSelected);
    }

    const onClick = () => {};

    return (
        <Flex
            alignItems="flex-start"
            justifyContent="center"
            className={cls.join(" ")}
            tabIndex={isInteractive ? 0 : -1}
            style={{
                cursor: "hand",
                boxSizing: "border-box",
                maxHeight: "100%",
                width: "100%",
                borderRight: APP_BORDER,
                borderBottom: APP_BORDER,
                position: "relative",
                backgroundColor: isMultiSelected
                    ? tokens.blue100
                    : isEditing
                    ? tokens.blue100
                    : isEdited
                    ? tokens.yellow100
                    : tokens.colorWhite,
                ...style,
                fontWeight: isDisplayTitle
                    ? tokens.fontWeightDemiBold
                    : tokens.fontWeightNormal,
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                if (col === 0 && isSticky) {
                    return;
                }
                addToMultiSelects(col, row);
            }}
            onClick={(e) => {
                if (col === 0 && isSticky) {
                    return;
                }
                if (isSelectable) {
                    addToMultiSelects(col, row, true);
                    !isEditing && setIsEditing((prev) => !prev);
                }
            }}
            onKeyDown={handleKeyDown}
        >
            {/* <span
                style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    fontSize: 9,
                    color: tokens.gray400,
                    lineHeight: "9px",
                }}
            >
                {col}-{row}
            </span> */}
            {isEditing ? (
                <RenderEditCell
                    value={finalVal}
                    rawVal={rawVal}
                    fieldType={ctypeField?.type}
                    setIsEditing={setIsEditing}
                    saveValue={(newValue: string) => {
                        setEntryChanges((prev) => ({
                            ...prev,
                            [entry.sys.id]: {
                                ...(prev[entry.sys.id] || {}),
                                [fieldId]: newValue,
                            },
                        }));
                    }}
                    clearSaveValue={() => {
                        if (entryChanges[entry.sys.id]) {
                            const newEntryChanges = JSON.parse(
                                JSON.stringify(entryChanges),
                            );
                            delete newEntryChanges[entry.sys.id][fieldId];
                            if (
                                Object.keys(newEntryChanges[entry.sys.id])
                                    .length === 0
                            ) {
                                delete newEntryChanges[entry.sys.id];
                            }
                            setEntryChanges(newEntryChanges);
                        }
                    }}
                />
            ) : (
                <RenderCell
                    value={finalVal}
                    fieldType={ctypeField?.type}
                    setIsEditing={setIsEditing}
                >
                    {child}
                </RenderCell>
            )}
        </Flex>
    );
};

export default SpreadsheetCell;
