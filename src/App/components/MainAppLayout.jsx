import React from "react";

import {useSelector} from "react-redux";

import useInitDeviceType from "Features/layout/hooks/useInitDeviceType";
import useInitSelectProject from "Features/projects/hooks/useInitSelectProject";

import {Box, Paper} from "@mui/material";

import LayoutDesktop from "Features/layout/components/LayoutDesktop";
import LayoutMobile from "Features/layout/components/LayoutMobile";

export default function MainAppLayout() {
  // init

  useInitDeviceType();
  useInitSelectProject();

  // data

  const deviceType = useSelector((s) => s.layout.deviceType);

  return (
    <Box
      sx={{
        position: "fixed",
        width: 1,
        height: 1,
        top: 0,
        left: 0,
        display: "flex",
      }}
    >
      {deviceType === "DESKTOP" && <LayoutDesktop />}
      {deviceType === "MOBILE" && <LayoutMobile />}
    </Box>
  );
}
