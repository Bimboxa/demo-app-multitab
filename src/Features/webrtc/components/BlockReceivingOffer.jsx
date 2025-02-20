import {useEffect, useState} from "react";
import {
  createPeerConnection,
  listenForOffer,
  sendAnswer,
  sendIceCandidate,
  listenForIceCandidates,
} from "Features/webrtc/services/webrtcService";

import {Typography, Box} from "@mui/material";

export default function BlockReceivingOffer() {
  const label = "En attente d'une connexion ...";

  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const {peerConnection, dataChannel} = createPeerConnection(
      (candidate) => sendIceCandidate(candidate, "mobile"),
      null
    );
    setPeerConnection(peerConnection);
    listenForIceCandidates(peerConnection, "desktop");

    listenForOffer(peerConnection, async (answer) => {
      await sendAnswer(answer);
    });

    dataChannel.onopen = () => {
      console.log("Syncing initial Shapes state...");
      //dataChannel.send(JSON.stringify({type: "REQUEST_SHAPES"}));
    };

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message", message);
      // if (message.type === "SHAPES_UPDATE") {
      //   dispatch(updateShapes(message.data)); // Sync Redux store
      // }
    };
  }, []);

  return (
    <Box>
      <Typography>{label}</Typography>
    </Box>
  );
}
