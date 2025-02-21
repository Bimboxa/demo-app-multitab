import {useSelector} from "react-redux";

import {Box} from "@mui/material";
import BoxAlignH from "./BoxAlignH";

import BlockProjectName from "Features/projects/components/BlockProjectName";

import IconButtonInitiateConnection from "Features/webrtc/components/IconButtonInitiateConnection";
import IconButtonPopperSettings from "Features/settings/components/IconButtonPopperSettings";
import IconButtonReceivingConnection from "Features/webrtc/components/IconButtonReceivingConnection";

export default function TopBar() {
  const deviceType = useSelector((s) => s.layout.deviceType);

  return (
    <Box
      sx={{
        width: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <BoxAlignH gap={1}>
        <BlockProjectName />
        <IconButtonPopperSettings />
      </BoxAlignH>
      {deviceType === "MOBILE" ? (
        <IconButtonReceivingConnection />
      ) : (
        <IconButtonInitiateConnection />
      )}
    </Box>
  );
}
