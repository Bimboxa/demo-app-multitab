import {setDataChannel, handleWebRTCMessage} from "../webrtcMiddleware";
import store from "App/store";

import {db, ref, set, onValue} from "Features/firebase/firebaseConfig";

const configuration = {
  iceServers: [{urls: "stun:stun.l.google.com:19302"}],
};

export const createPeerConnection = (onIceCandidate, onTrack) => {
  const peerConnection = new RTCPeerConnection(configuration);
  const dataChannel = peerConnection.createDataChannel("shapesSync");

  dataChannel.onopen = () => {
    console.log("Data channel is open and ready to be used.");
    setDataChannel(dataChannel);
  };

  dataChannel.onmessage = handleWebRTCMessage(store);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    if (onTrack) {
      onTrack(event.streams[0]);
    }
  };

  peerConnection.ondatachannel = (event) => {
    event.channel.onmessage = handleWebRTCMessage(store);
  };

  return {peerConnection, dataChannel};
};

export const listenForAnswer = async (peerConnection) => {
  if (db) {
    onValue(ref(db, "webrtc/answer"), (snapshot) => {
      if (snapshot.exists()) {
        const answer = snapshot.val();
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
  } else {
    console.log("db not found");
  }
};

export const listenForIceCandidates = async (peerConnection, role) => {
  if (db) {
    onValue(ref(db, `webrtc/${role}/iceCandidates`), (snapshot) => {
      snapshot.forEach((child) => {
        const candidate = child.val();
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });
    });
  } else {
    console.log("db not found");
  }
};

export const listenForOffer = async (peerConnection, setAnswerCallback) => {
  if (db) {
    onValue(ref(db, "webrtc/offer"), async (snapshot) => {
      if (snapshot.exists()) {
        const offer = snapshot.val();
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        setAnswerCallback(answer);
      }
    });
  } else {
    console.log("db not found");
  }
};

export const sendAnswer = async (answer) => {
  if (db) await set(ref(db, "webrtc/answer"), answer);
};

export const sendIceCandidate = async (candidate, role) => {
  if (db) await push(ref(db, `webrtc/${role}/iceCandidates`), candidate);
};

export const sendOffer = async (peerConnection) => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  if (db) await set(ref(db, "webrtc/offer"), offer);
};
