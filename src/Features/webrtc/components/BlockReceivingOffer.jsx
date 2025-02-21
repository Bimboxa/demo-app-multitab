import {useEffect, useState, useRef} from "react";
import {
  createPeerConnection,
  listenForOffer,
  sendAnswer,
  sendIceCandidate,
  listenForIceCandidates,
} from "Features/webrtc/services/webrtcService";

import {Typography, Box} from "@mui/material";

export default function BlockReceivingOffer() {
  console.log("[BlockReceivingOffer]");
  // strings

  const waitingS = "En attente...";
  const connectedS = "Connecté !";

  // state

  const [offerReceived, setOfferReceived] = useState(false);

  // helpers

  const label = offerReceived ? connectedS : waitingS;

  const peerConnectionRef = useRef(null);

  // effect

  useEffect(() => {
    const setupConnection = async () => {
      if (peerConnectionRef.current) {
        console.log("✅ PeerConnection already exists, skipping creation.");
        return;
      }
      // Create peer connection
      const {peerConnection} = createPeerConnection(false);

      try {
        // 📡 Wait for an offer and create an answer
        const answer = await new Promise((resolve) => {
          listenForOffer(peerConnection, resolve); // This ensures answer is properly set before proceeding
        });

        console.log("📡 Received offer, creating answer...", answer);

        // ✅ Only set remote description if needed
        if (
          peerConnection.signalingState !== "stable" &&
          !peerConnection.remoteDescription
        ) {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("✅ Remote offer set successfully.");
        } else {
          console.warn(
            "⚠️ Offer already set, skipping setRemoteDescription()."
          );
        }

        // ✅ Set local description before sending the answer
        if (peerConnection.signalingState !== "stable") {
          await peerConnection.setLocalDescription(answer);
          console.log("✅ Local answer set successfully.");
        } else {
          console.warn(
            "⚠️ Local answer already set, skipping setLocalDescription()."
          );
        }

        await sendAnswer(answer);
        setOfferReceived(true);

        // 🔹 Handle ICE candidates (only after receiving an offer)
        await listenForIceCandidates(peerConnection, "desktop");

        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            console.log("📡 Sending ICE candidate to Desktop...");
            await sendIceCandidate(event.candidate, "mobile");
          }
        };

        // ✅ Handle incoming data channel (callee receives it)
        peerConnection.ondatachannel = (event) => {
          const dataChannel = event.channel;
          console.log("✅ Received data channel from Desktop!");

          dataChannel.onopen = () => {
            console.log("📡 Data channel is open! Syncing Shapes...");
            //dataChannel.send(JSON.stringify({type: "REQUEST_SHAPES"}));
          };

          dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("📩 Received message:", message);
          };
        };
      } catch (error) {
        console.error("❌ WebRTC setup failed:", error);
      }
    };

    setupConnection();
  }, []);

  return (
    <Box>
      <Typography>{label}</Typography>
    </Box>
  );
}
