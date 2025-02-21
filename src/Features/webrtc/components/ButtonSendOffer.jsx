import {useEffect, useState, useRef} from "react";
import {useSelector} from "react-redux";

import {
  createPeerConnection,
  sendOffer,
  listenForAnswer,
  sendIceCandidate,
  listenForIceCandidates,
} from "../services/webrtcService";

import {Button} from "@mui/material";

export default function ButtonSendOffer() {
  // strings

  const label = "Démarrer une connexion";

  // state

  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const setupConnection = async () => {
      if (peerConnectionRef.current) {
        console.log("✅ PeerConnection already exists, skipping creation.");
        return;
      }

      const {peerConnection, dataChannel} = createPeerConnection(true);
      peerConnectionRef.current = peerConnection;

      try {
        console.log("📡 Waiting for answer from mobile...");

        // 🔹 Wait for the answer before proceeding
        const answer = await new Promise((resolve) => {
          listenForAnswer(peerConnection, resolve); // This ensures answer is properly set before proceeding
        });

        console.log("✅ Received answer :", answer);
        console.log("Proceeding with ICE exchange...");

        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            console.log("📡 Sending ICE candidate to mobile...");
            await sendIceCandidate(event.candidate, "desktop");
          }
        };

        // 🔹 Ensure ICE Candidates are exchanged properly
        await listenForIceCandidates(peerConnection, "mobile");

        // 🔹 Ensure DataChannel works correctly
        dataChannel.onopen = () => {
          console.log("✅ DataChannel is open!");
          //dataChannel.send(JSON.stringify({type: "shapes/INITIAL_UPDATE"}));
        };
      } catch (error) {
        console.error("❌ WebRTC setup failed:", error);
      }
    };

    setupConnection();
  }, []);

  // handler

  function handleClick() {
    if (!peerConnectionRef.current) {
      console.error("❌ peerConnection is not initialized yet!");
      return;
    }
    sendOffer(peerConnectionRef.current);
  }

  return (
    <Button onClick={handleClick} variant="contained">
      {label}
    </Button>
  );
}
