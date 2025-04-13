import { Flex } from "@contentful/f36-components";
import LoadingIcon from "./LoadingIcon";
import tokens from "@contentful/f36-tokens";

export default function LoadingPage() {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: tokens.gray100,
        flex: 1,
        width: "100%",
        zIndex: 10000,
      }}
    >
      <LoadingIcon />
    </Flex>
  );
}
