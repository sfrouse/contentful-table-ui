import { Flex, Text } from "@contentful/f36-components";
import { useContentful } from "../../contexts/ContentfulContext";
import tokens from "@contentful/f36-tokens";
import { ContentTypeProps } from "contentful-management";
import { NavList } from "@contentful/f36-navlist";
import { useAppState } from "../../contexts/AppStateContext";
import scrollBarStyles from "../utils/ScrollBarMinimal.module.css";
import { APP_BORDER } from "../utils/styles";
import SectionHeader from "../SectionHeader/SectionHeadter";

const MainNav = () => {
    const { contentTypes } = useContentful();
    const { setRoute, route } = useAppState();

    const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname.startsWith("192.168.") || // local network
            window.location.hostname === "[::1]"); // IPv6 localhost

    return (
        <Flex
            flexDirection="column"
            style={{
                padding: `0`,
                width: 250,
                gap: tokens.spacing2Xs,
                borderRight: APP_BORDER,
            }}
        >
            <SectionHeader
                title={"Content Types"}
                extraPadding={tokens.spacing2Xs}
            />
            <Flex
                className={scrollBarStyles["scrollbar-minimal"]}
                flexDirection="column"
                style={{
                    flex: 1,
                    overflow: "auto",
                    padding: `0 ${tokens.spacingM}`,
                    gap: tokens.spacing2Xs,
                }}
            >
                {contentTypes.map((ctype: ContentTypeProps) => (
                    <NavList.Item
                        key={`nav-item-${ctype.sys.id}`}
                        isActive={ctype.sys.id === route.contentTypeId}
                        onClick={() => {
                            setRoute({ contentTypeId: ctype.sys.id });
                        }}
                    >
                        {ctype.name}
                    </NavList.Item>
                ))}
            </Flex>
            <div
                style={{
                    fontSize: tokens.fontSizeS,
                    padding: tokens.spacingS,
                    color: tokens.gray400,
                    textAlign: "center",
                }}
            >
                {isLocalhost ? "localhost" : "beta"}
            </div>
        </Flex>
    );
};

export default MainNav;
