import {
    ContentfulEntryFilter,
    useContentful,
} from "../../contexts/ContentfulContext";
import SpreadsheetCell from "./SpreadsheetCell/SpreadsheetCell";
import SpreadsheetGrid from "./SpreadsheetGrid/SpreadsheetGrid";

const Spreadsheet = () => {
    const {
        filteredEntries,
        focusedContentType,
        fieldsLookup,
        filterLookup,
        setFilters,
        filters,
    } = useContentful();

    const totalRows = filteredEntries.length;
    const totalCols = focusedContentType
        ? Object.entries(focusedContentType?.fields).length
        : 0;

    const colHeaders = focusedContentType
        ? Object.entries(focusedContentType?.fields).map(([key, field]) => {
              const filters = filterLookup[field.id];
              return {
                  id: key,
                  name: field.name,
                  filters,
              };
          })
        : [];

    const colHeaderFilters = focusedContentType
        ? Object.values(focusedContentType?.fields).map(
              (field, index) => fieldsLookup.fieldsLookup[index]?.filter,
          )
        : [];

    return (
        <div
            style={{
                flex: 1,
                position: "relative",
            }}
        >
            <SpreadsheetGrid
                numRows={totalRows}
                numCols={totalCols}
                colHeaders={colHeaders}
                colHeaderFilters={colHeaderFilters}
                filterLookup={filterLookup}
                cornerTitle="Display Title"
                onFilter={(newFilter: ContentfulEntryFilter) => {
                    const filterExists = filters.find(
                        (filter: ContentfulEntryFilter) =>
                            filter.entryId === newFilter.entryId,
                    );

                    if (filterExists) {
                        setFilters([]);
                    } else {
                        setFilters([newFilter]);
                    }
                }}
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
            />
        </div>
    );
};

Spreadsheet.Cell = SpreadsheetCell;

export default Spreadsheet;
