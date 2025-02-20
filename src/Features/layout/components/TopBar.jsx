import {Box} from "@mui/material";
import BlockProjectName from "Features/projects/components/BlockProjectName";
import ButtonQrCodeReader from "Features/qrcode/components/ButtonQrCodeReader";
import IconButtonInitiateConnection from "Features/webrtc/components/IconButtonInitiateConnection";
import {useSelector} from "react-redux";

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
      <BlockProjectName />
      {deviceType === "MOBILE" ? (
        <ButtonQrCodeReader />
      ) : (
        <IconButtonInitiateConnection />
      )}
    </Box>
  );
}
