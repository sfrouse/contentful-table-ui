import { PageAppSDK } from "@contentful/app-sdk";
import { ContentfulEntryChanges } from "../../../contexts/ContentfulContext";
import { ContentTypeProps } from "contentful-management";

export default async function saveEntries(
    sdk: PageAppSDK,
    entryChanges: ContentfulEntryChanges,
    contentType: ContentTypeProps | null,
) {
    try {
        const entryIds = Object.keys(entryChanges);
        const entries = await Promise.all(
            entryIds.map((id) => sdk.cma.entry.get({ entryId: id })),
        );

        await Promise.all(
            entries.map(async (entry) => {
                const changes = entryChanges[entry.sys.id];
                if (!changes) return;

                const localized = Object.fromEntries(
                    Object.entries(changes).map(([key, value]) => {
                        const fieldDef = contentType?.fields.find(
                            (f) => f.id === key,
                        );
                        const isNumberField =
                            fieldDef?.type === "Number" ||
                            fieldDef?.type === "Integer";

                        const parsedValue =
                            isNumberField && value !== ""
                                ? Number(value)
                                : value;

                        return [
                            key,
                            {
                                "en-US": parsedValue,
                            },
                        ];
                    }),
                );

                entry.fields = {
                    ...entry.fields,
                    ...localized,
                };

                return sdk.cma.entry.update({ entryId: entry.sys.id }, entry);
            }),
        );
    } catch (err) {
        console.error(err);
    }
}
