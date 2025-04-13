import tokens from "@contentful/f36-tokens";
import styles from "./SpreadsheetCell.module.css";

type RenderCellProps = {
    value: any;
    fieldType: string | undefined;
    setIsEditing: (val: boolean) => void;
    children?: React.ReactNode;
};

export default function RenderCell({
    value, // = "not found",
    fieldType = "none",
    setIsEditing = () => {},
    children,
}: RenderCellProps): React.ReactNode {
    const baseStyles: React.CSSProperties = {
        padding: `0 ${tokens.spacingS}`,
        fontSize: tokens.fontSizeS,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 4,
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

    const nullValue = <span style={{ color: tokens.gray400 }}>--</span>;

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
                    title={value ? String(value) : ""}
                >
                    <ValueSpan>{value ? String(value) : nullValue}</ValueSpan>
                    {children}
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
                        {isNaN(Number(value)) || undefined
                            ? nullValue
                            : new Intl.NumberFormat(undefined, {
                                  maximumFractionDigits: 2,
                              }).format(Number(value))}
                    </ValueSpan>
                    {children}
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
                    {children}
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
                    {children}
                </div>
            );

        case "Location":
            return (
                <div
                    className={styles.spreadsheetCell}
                    style={{ ...baseStyles }}
                >
                    {value
                        ? value.lat && (
                              <ValueSpan style={{ textAlign: "right" }}>
                                  {`Lat: ${value.lat}, Lon: ${value.lon}`}
                              </ValueSpan>
                          )
                        : nullValue}
                    {children}
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
                    {value
                        ? value?.sys?.id && <ValueSpan>{output}</ValueSpan>
                        : nullValue}
                    {children}
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
                    {value
                        ? Array.isArray(value) && (
                              <ValueSpan>
                                  {(value || [])
                                      .map((item: any, i: number) => item)
                                      .join(", ")}
                              </ValueSpan>
                          )
                        : nullValue}
                    {children}
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
                    {children}
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
                    {children}
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
                    <ValueSpan>{value ? String(value) : nullValue}</ValueSpan>
                    {children}
                </div>
            );
    }
}
