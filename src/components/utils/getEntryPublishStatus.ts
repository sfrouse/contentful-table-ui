import { EntryProps } from "contentful-management";

type EntryStatus = "draft" | "changed" | "published";

export default function getEntryStatus(entry: EntryProps): EntryStatus {
    const { publishedAt, updatedAt } = entry.sys;

    if (!publishedAt) {
        return "draft";
    }

    if (updatedAt > publishedAt) {
        return "changed";
    }

    return "published";
}
