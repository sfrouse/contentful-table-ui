import tokens from "@contentful/f36-tokens";
import styles from "./SpreadsheetCell.module.css";
import { useEffect, useRef, useState } from "react";
import { useContentful } from "../../../contexts/ContentfulContext";

type RenderEditCellProps = {
    value: any;
    rawVal: any;
    fieldType: string | undefined;
    setIsEditing: (val: boolean) => void;
    saveValue: (val: any) => void;
    clearSaveValue: () => void;
};

export default function RenderEditCell({
    rawVal = "not found",
    value = "not found",
    fieldType = "none",
    setIsEditing = () => {},
    saveValue = (val: any) => {},
    clearSaveValue = () => {},
}: RenderEditCellProps): React.ReactNode {
    const { multiSelects, setMultiSelects } = useContentful();
    const [localValue, setLocalValue] = useState<string>(`${value}`);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const input = inputRef.current;
        if (input) {
            input.focus();
            input.select();
        }
    }, []);

    const baseStyles: React.CSSProperties = {
        padding: `0 ${tokens.spacingS}`,
        fontSize: tokens.fontSizeS,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
    };

    const baseInputStyles: React.CSSProperties = {
        padding: `0 ${tokens.spacingS}`,
        backgroundColor: tokens.blue200,
        fontSize: 12,
        boxSizing: "border-box",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "block",
        width: "100%",
        height: "100%",
        border: "none",
        background: "transparent",
        cursor: "default",
        outline: "none",
        boxShadow: `inset 0 0 0 2px ${tokens.blue300}`,
    };

    type ValueSpanProps = {
        children: React.ReactNode;
        style?: React.CSSProperties;
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            if (localValue !== `${rawVal}`) {
                saveValue(localValue);
            } else {
                clearSaveValue();
            }
            setIsEditing(false);
            // setMultiSelects([]);
        }
        if (localValue !== `${rawVal}`) {
            saveValue(localValue);
        } else {
            clearSaveValue();
        }
    };
    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsEditing(false);
        if (localValue !== `${rawVal}`) {
            saveValue(localValue);
        } else {
            clearSaveValue();
        }
        // setMultiSelects([]);
    };

    const ValueSpan: React.FC<ValueSpanProps> = ({ children, style }) => (
        <span
            style={{
                boxSizing: "border-box",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                width: "100%",
                ...style,
            }}
        >
            {children}
        </span>
    );

    switch (fieldType) {
        case "Symbol":
        case "Text":
            return (
                <input
                    ref={inputRef}
                    type="text"
                    value={localValue}
                    onKeyUp={handleKeyUp}
                    tabIndex={0}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setLocalValue(event.target.value);
                    }}
                    onBlur={handleOnBlur}
                    style={{ ...baseInputStyles }}
                />
            );

        case "Integer":
        case "Number":
            return (
                <input
                    ref={inputRef}
                    type="number"
                    value={localValue}
                    onKeyUp={handleKeyUp}
                    onBlur={handleOnBlur}
                    tabIndex={0}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setLocalValue(event.target.value);
                    }}
                    style={{ ...baseInputStyles, textAlign: "right" }}
                />
            );

        case "Boolean":
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{ ...baseStyles }}
                >
                    <ValueSpan style={{ textAlign: "right" }}>
                        {value ? "true" : "false"}
                    </ValueSpan>
                </div>
            );

        case "Date":
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{ ...baseStyles }}
                >
                    <ValueSpan style={{ textAlign: "right" }}>
                        {new Date(value).toLocaleDateString()}
                    </ValueSpan>
                </div>
            );

        case "Location":
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{ ...baseStyles }}
                >
                    <ValueSpan
                        style={{ textAlign: "right" }}
                    >{`Lat: ${value.lat}, Lon: ${value.lon}`}</ValueSpan>
                </div>
            );

        case "Link":
            let output = `Link: ${value?.sys?.id}`;
            if (value?.fields?.name) {
                output = value.fields.name["en-US"];
            }
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{ ...baseStyles }}
                >
                    {value?.sys?.id && <ValueSpan>{output}</ValueSpan>}
                </div>
            );

        case "Array":
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{
                        ...baseStyles,
                    }}
                >
                    <ValueSpan>
                        {" "}
                        {(value || [])
                            .map((item: any, i: number) => item)
                            .join(", ")}
                    </ValueSpan>
                </div>
            );

        case "RichText":
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{
                        ...baseStyles,
                    }}
                >
                    <ValueSpan>[Rich Text Field]</ValueSpan>
                </div>
            ); // Could render preview

        case "Object":
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{
                        ...baseStyles,
                    }}
                >
                    <ValueSpan style={{ fontSize: 9, margin: 0 }}>
                        {JSON.stringify(value, null, 2)}
                    </ValueSpan>
                </div>
            );

        default:
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{
                        ...baseStyles,
                    }}
                >
                    <ValueSpan>{String(value)}</ValueSpan>
                </div>
            );
    }
}
