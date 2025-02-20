import React from "react";

import {Box, Paper} from "@mui/material";

import MainListPanel from "Features/listPanel/components/MainListPanel";
import MainMapEditor from "Features/mapEditor/components/MainMapEditor";
import MainTreedEditor from "Features/threedEditor/components/MainTreedEditor";

export default function MainAppLayout() {
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
      <Box sx={{p: 4, width: 0.3, height: 1}}>
        <Paper
          sx={{width: 1, height: 1, display: "flex", flexDirection: "column"}}
        >
          <MainListPanel />
        </Paper>
      </Box>

      <Box sx={{width: 0.7, height: 1, display: "flex"}}>
        <Box sx={{width: 0.5, height: 1, p: 4}}>
          <Paper
            sx={{width: 1, height: 1, display: "flex", flexDirection: "column"}}
          >
            <MainMapEditor />
          </Paper>
        </Box>

        <Box sx={{p: 4, width: 0.5, height: 1}}>
          <Paper
            sx={{width: 1, height: 1, display: "flex", flexDirection: "column"}}
          >
            <MainTreedEditor />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
