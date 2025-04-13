import { EntryProps, Link } from "contentful-management";

export async function loadEntriesWithResolvedLinks(
    sdk: any,
    contentTypeId: string,
): Promise<EntryProps[]> {
    const contentType = await sdk.cma.contentType.get({ contentTypeId });

    const result = await sdk.cma.entry.getMany({
        query: {
            content_type: contentTypeId,
            order: `fields.${contentType.displayField}`,
            limit: 1000,
        },
    });

    const entries = result.items;

    // 1. Extract all linked entry IDs
    const linkIds = new Set<string>();

    for (const entry of entries) {
        for (const field of Object.values(entry.fields)) {
            for (const val of Object.values(field as { [key: string]: any })) {
                collectLinkIds(val, linkIds);
            }
        }
    }

    // 2. Fetch all referenced entries
    const linkedEntries = await Promise.all(
        Array.from(linkIds).map((id) => sdk.cma.entry.get({ entryId: id })),
    );

    const entryMap = new Map(linkedEntries.map((e) => [e.sys.id, e]));

    // 3. Replace links with full entries
    const resolveLinks = (value: any): any => {
        if (Array.isArray(value)) {
            return value.map(resolveLinks);
        }

        if (
            value &&
            value.sys?.type === "Link" &&
            value.sys.linkType === "Entry"
        ) {
            return entryMap.get(value.sys.id) ?? value;
        }

        return value;
    };

    interface LocalizedField {
        [locale: string]: any;
    }

    interface ResolvedEntry extends EntryProps {
        fields: {
            [key: string]: LocalizedField;
        };
    }

    const resolved: ResolvedEntry[] = entries.map(
        (entry: any): ResolvedEntry => {
            const fields: ResolvedEntry["fields"] = Object.fromEntries(
                Object.entries(entry.fields).map(([key, localizedValue]) => [
                    key,
                    Object.fromEntries(
                        Object.entries(localizedValue as LocalizedField).map(
                            ([locale, val]) => [locale, resolveLinks(val)],
                        ),
                    ),
                ]),
            );

            return { ...entry, fields };
        },
    );

    return resolved;
}

function collectLinkIds(value: any, set: Set<string>) {
    if (Array.isArray(value)) {
        value.forEach((v) => collectLinkIds(v, set));
    } else if (
        value &&
        value.sys?.type === "Link" &&
        value.sys.linkType === "Entry"
    ) {
        set.add(value.sys.id);
    }
}
