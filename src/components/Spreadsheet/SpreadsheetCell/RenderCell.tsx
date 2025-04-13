import tokens from "@contentful/f36-tokens";
import styles from "./SpreadsheetCell.module.css";

type RenderCellProps = {
    value: any;
    fieldType: string | undefined;
    setIsEditing: (val: boolean) => void;
};

export default function RenderCell({
    value = "not found",
    fieldType = "none",
    setIsEditing = () => {},
}: RenderCellProps): React.ReactNode {
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

    type ValueSpanProps = {
        children: React.ReactNode;
        style?: React.CSSProperties;
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setIsEditing(true);
        }
    };

    switch (fieldType) {
        case "Symbol":
        case "Text":
            return (
                <div
                    onKeyDown={handleKeyDown}
                    className={styles.spreadsheetCell}
                    style={{
                        ...baseStyles,
                    }}
                >
                    <ValueSpan>{String(value)}</ValueSpan>
                </div>
            );

        case "Integer":
        case "Number":
            // return <div>{Number(value)}</div>;
            return (
                <div
                    onKeyDown={handleKeyDown}
                    className={styles.spreadsheetCell}
                    style={{ ...baseStyles }}
                >
                    <ValueSpan style={{ textAlign: "right" }}>
                        {new Intl.NumberFormat(undefined, {
                            maximumFractionDigits: 2,
                        }).format(Number(value))}
                    </ValueSpan>
                </div>
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
                    {value.lat && (
                        <ValueSpan
                            style={{ textAlign: "right" }}
                        >{`Lat: ${value.lat}, Lon: ${value.lon}`}</ValueSpan>
                    )}
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
                    {Array.isArray(value) && (
                        <ValueSpan>
                            {(value || [])
                                .map((item: any, i: number) => item)
                                .join(", ")}
                        </ValueSpan>
                    )}
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
