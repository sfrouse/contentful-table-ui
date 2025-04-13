import { Text } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";

const SectionHeader = ({
    title,
    extraPadding = "0",
}: {
    title: string | undefined;
    extraPadding?: string;
}) => {
    return (
        <Text
            fontSize="fontSizeM"
            fontWeight="fontWeightMedium"
            style={{
                padding: `${tokens.spacingM} ${tokens.spacingM} ${tokens.spacingM} ${tokens.spacingM}`,
                marginBottom: tokens.spacing2Xs,
            }}
        >
            <span style={{ paddingLeft: extraPadding }}>{title}</span>
        </Text>
    );
};

export default SectionHeader;
