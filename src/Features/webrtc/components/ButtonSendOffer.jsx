import {useEffect, useState} from "react";
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

  // data

  const servicesConfigIsReady = useSelector(
    (s) => s.settings.servicesConfigIsReady
  );

  // state

  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    if (servicesConfigIsReady) {
      const {peerConnection, dataChannel} = createPeerConnection();
      setPeerConnection(peerConnection);

      listenForAnswer(peerConnection);

      listenForIceCandidates(peerConnection, "mobile");

      dataChannel.onopen = () => {
        console.log("dataChannel opened");
        // dispatch here the initial update.
        // dataChannel.send(JSON.stringify({type: "shapes/INITIAL_UPDATE"}));
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ice candidate to mobile");
          sendIceCandidate(event.candidate, "desktop");
        }
      };
    }
  }, [servicesConfigIsReady]);

  // handler

  function handleClick() {
    sendOffer(peerConnection);
  }

  return (
    <Button
      onClick={handleClick}
      variant="contained"
      disabled={!servicesConfigIsReady}
    >
      {label}
    </Button>
  );
}
