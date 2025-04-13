import React from "react";
import scrollBarStyles from "../../utils/ScrollBarMinimal.module.css";
import { APP_BORDER } from "../../utils/styles";
import tokens from "@contentful/f36-tokens";
import SpreadsheetCell from "../SpreadsheetCell/SpreadsheetCell";
import { IconButton, Menu } from "@contentful/f36-components";
import * as icons from "@contentful/f36-icons";
import {
    ContentfulEntryFilter,
    EntryFilterLookup,
    useContentful,
} from "../../../contexts/ContentfulContext";
import { forwardRef } from "react";

type SpreadsheetGridProps = {
    numCols: number;
    numRows: number;
    colHeaders: { id: string; name: string; filters: any }[];
    colHeaderFilters: boolean[];
    cornerTitle?: string;
    style?: React.CSSProperties;
    onFilter?: (filter: ContentfulEntryFilter) => void;
    filterLookup?: EntryFilterLookup;
};

const SpreadsheetGrid = forwardRef<HTMLDivElement, SpreadsheetGridProps>(
    (
        {
            numCols,
            numRows,
            colHeaders,
            cornerTitle = "",
            onFilter = (colIndex: number) => {},
            style,
        },
        ref,
    ) => {
        const { loading } = useContentful();

        const colHeadersMinium = Array.from({ length: numCols }, (_, i) =>
            String.fromCharCode(65 + i),
        );

        const colWidths = ["230px"];
        const rowHeights: string[] = [];
        const gridStyle: React.CSSProperties = {
            gridTemplateColumns: Array.from(
                { length: numCols + 1 },
                (_, i) => colWidths?.[i] ?? "180px",
            ).join(" "),
            gridTemplateRows: Array.from(
                { length: numRows + 1 },
                (_, i) => rowHeights?.[i] ?? "46px",
            ).join(" "),
        };

        const cells = [];

        const cellStyles: React.CSSProperties = {
            borderRight: APP_BORDER,
            borderBottom: APP_BORDER,
            padding: tokens.spacingS,
            backgroundColor: tokens.colorWhite,
            boxSizing: "border-box",
            whiteSpace: "nowrap",
        };

        const headerStyles: React.CSSProperties = {
            ...cellStyles,
            backgroundColor: tokens.gray100,
            position: "sticky",
            top: 0,
            zIndex: 2,
            fontSize: 12,
            textAlign: "center",
        };

        const stickyCol: React.CSSProperties = {
            position: "sticky",
            left: 0,
            backgroundColor: tokens.colorWhite,
            zIndex: 1,
        };

        // CORNER
        cells.push(
            <div
                style={{ ...headerStyles, ...stickyCol, zIndex: 3 }}
                key="header-#"
            >
                {cornerTitle}
            </div>,
        );

        // HEADERS - STICKY ROW
        colHeadersMinium.map((_, index) => {
            const headerInfo = colHeaders[index] || colHeadersMinium[index];
            cells.push(
                <div
                    style={{ ...headerStyles }}
                    key={`header-${headerInfo.id}`}
                >
                    <div
                        style={{
                            boxSizing: "border-box",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: tokens.fontSizeS,
                        }}
                    >
                        {headerInfo.name}
                    </div>
                    {headerInfo.filters && (
                        <div style={{ position: "absolute", right: 2, top: 6 }}>
                            <Menu>
                                <Menu.Trigger>
                                    <IconButton
                                        variant="transparent"
                                        size="small"
                                        aria-label="Select the date"
                                        icon={<icons.FilterIcon />}
                                    />
                                </Menu.Trigger>
                                <Menu.List>
                                    {headerInfo.filters.map((filter: any) => (
                                        <Menu.Item
                                            key={filter.entryId}
                                            onClick={() => {
                                                onFilter(filter);
                                            }}
                                        >
                                            {`${filter.title}`}
                                        </Menu.Item>
                                    ))}
                                </Menu.List>
                            </Menu>
                        </div>
                    )}
                </div>,
            );
        });

        // DATA
        for (let row = 1; row <= numRows; row++) {
            cells.push(
                <SpreadsheetCell
                    style={{ ...stickyCol }}
                    key={`row-label-${0}-${row}`}
                    col={0}
                    row={row - 1}
                    isSticky={true}
                    isDisplayTitle={true}
                />,
            );
            for (let col = 0; col < numCols; col++) {
                cells.push(
                    <SpreadsheetCell
                        key={`row-label-${col + 1}-${row}`}
                        col={col}
                        row={row - 1}
                    />,
                );
            }
        }

        return (
            <div
                className={scrollBarStyles["scrollbar-minimal"]}
                style={{
                    overflow: "auto",
                    opacity: loading ? 0.7 : 1,
                    ...style,
                }}
            >
                <div
                    ref={ref}
                    style={{
                        display: "grid",
                        width: "max-content",
                        ...gridStyle,
                    }}
                >
                    {cells}
                </div>
            </div>
        );
    },
);

export default SpreadsheetGrid;
