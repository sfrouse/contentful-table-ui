import { Flex } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { APP_BORDER } from "../../utils/styles";
import { useContentful } from "../../../contexts/ContentfulContext";
import { useState } from "react";
import RenderCell from "./RenderCell";
import RenderEditCell from "./RenderEditCell";
import styles from "./SpreadsheetCell.module.css";

type SpreadsheetCellProps = {
    col: number;
    row: number;
    isDisplayTitle?: boolean;
    style?: React.CSSProperties;
};

const SpreadsheetCell = ({
    col,
    row,
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
        setMultiSelects,
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

    let finalVal = entryField?.["en-US"];
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
    return (
        <Flex
            alignItems="flex-start"
            justifyContent="center"
            className={isMultiSelected ? styles.multiSelected : ""}
            tabIndex={0}
            style={{
                cursor: "hand",
                boxSizing: "border-box",
                maxHeight: "100%",
                width: "100%",
                borderRight: APP_BORDER,
                borderBottom: APP_BORDER,
                position: "relative",
                backgroundColor: isMultiSelected
                    ? tokens.orange100
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
            onClick={(e) => {
                e.preventDefault(); // prevent browser default
                window.getSelection()?.removeAllRanges(); // clear any text selection
                const shiftHeld = e.shiftKey;
                if (shiftHeld) {
                    addToMultiSelects(col, row);
                } else {
                    setMultiSelects([]);
                    if (
                        ["Symbol", "Text", "Integer", "Number"].includes(
                            `${ctypeField?.type}`,
                        )
                    ) {
                        !isEditing && setIsEditing((prev) => !prev);
                    }
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
                />
            ) : (
                <RenderCell
                    value={finalVal}
                    fieldType={ctypeField?.type}
                    setIsEditing={setIsEditing}
                ></RenderCell>
            )}
        </Flex>
    );
};

export default SpreadsheetCell;
