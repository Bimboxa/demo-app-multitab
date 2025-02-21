import {setDataChannel, handleWebRTCMessage} from "../webrtcMiddleware";
import store from "App/store";

import {
  dbPromise,
  ref,
  set,
  push,
  onValue,
} from "Features/firebase/firebaseConfig";

const configuration = {
  iceServers: [{urls: "stun:stun.l.google.com:19302"}],
};

export const createPeerConnection = (createDataChannel = false) => {
  const peerConnection = new RTCPeerConnection(configuration);
  let dataChannel = null;

  if (createDataChannel) {
    // Only the caller (Desktop) should create a DataChannel
    dataChannel = peerConnection.createDataChannel("shapesSync");
    console.log("📡 Created DataChannel on Caller");

    dataChannel.onopen = () => {
      console.log("✅ DataChannel is open and ready to use.");
      setDataChannel(dataChannel);
    };

    dataChannel.onerror = (error) =>
      console.error("❌ DataChannel error:", error);

    dataChannel.onmessage = (event) => {
      console.log("📩 Received message:", event.data);
      handleWebRTCMessage(store)(event);
    };
  }

  // Handle incoming DataChannel (Only on Mobile)
  peerConnection.ondatachannel = (event) => {
    console.log("📡 Received DataChannel from caller.");
    const receivedChannel = event.channel;

    receivedChannel.onopen = () => {
      console.log("✅ Received DataChannel is open!");
      setDataChannel(receivedChannel);
    };

    receivedChannel.onerror = (error) =>
      console.error("❌ Received DataChannel error:", error);

    receivedChannel.onmessage = (event) => {
      console.log("📩 Received message:", event.data);
      handleWebRTCMessage(store)(event);
    };
  };

  return {peerConnection, dataChannel};
};

export const listenForAnswer = async (peerConnection, setAnswerCallback) => {
  const db = await dbPromise;
  if (db) {
    onValue(ref(db, "webrtc/answer"), async (snapshot) => {
      if (snapshot.exists()) {
        const answer = snapshot.val();
        console.log(
          "[listenForAnswer] answer",
          answer,
          peerConnection,
          peerConnection?.signalingState,
          peerConnection?.remoteDescription
        );
        if (peerConnection.signalingState !== "stable") {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("✅ Remote answer set successfully!");
        } else {
          console.warn(
            "⚠️ Remote description already in 'stable' state, skipping."
          );
        }
        setAnswerCallback(answer);
      } else {
        console.warn("⚠️ No answer found in database.");
      }
    });
  } else {
    console.log("db not found");
  }
};

export const listenForIceCandidates = async (peerConnection, role) => {
  const db = await dbPromise;
  if (db) {
    onValue(ref(db, `webrtc/${role}/iceCandidates`), (snapshot) => {
      snapshot.forEach(async (child) => {
        const candidate = child.val();
        if (
          peerConnection.remoteDescription &&
          peerConnection.signalingState !== "stable"
        ) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`✅ ICE candidate added for ${role}`);
        } else {
          console.warn(
            "⚠️ ICE candidate received before remoteDescription, waiting..."
          );
        }
      });
    });
  } else {
    console.log("db not found");
  }
};

export const listenForOffer = async (peerConnection, setAnswerCallback) => {
  const db = await dbPromise;
  if (db) {
    onValue(ref(db, "webrtc/offer"), async (snapshot) => {
      if (snapshot.exists()) {
        const offer = snapshot.val();
        console.log(
          "[listenForOffer] Received offer:",
          offer,
          peerConnection.signalingState,
          peerConnection.remoteDescription,
          peerConnection
        );

        if (peerConnection.signalingState === "stable") {
          console.warn(
            "⚠️ Offer received but already in 'stable' state. Ignoring."
          );
          return;
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        console.log("✅ Remote offer set successfully.");

        const answer = await peerConnection.createAnswer();

        if (peerConnection.signalingState !== "stable") {
          await peerConnection.setLocalDescription(answer);
          console.log("✅ Local answer set successfully.");
        } else {
          console.warn(
            "⚠️ Local answer was not set because the state is already 'stable'."
          );
        }

        setAnswerCallback(answer);
      } else {
        console.warn("⚠️ No offer found in database.");
      }
    });
  } else {
    console.log("db not found");
  }
};

export const sendAnswer = async (answer) => {
  const db = await dbPromise;
  if (db) await set(ref(db, "webrtc/answer"), answer);
};

export const sendIceCandidate = async (candidate, role) => {
  const db = await dbPromise;
  if (db) {
    console.log("Sending ice candidate", role, candidate);
    await push(ref(db, `webrtc/${role}/iceCandidates`), candidate);
  }
};

export const sendOffer = async (peerConnection) => {
  const db = await dbPromise;

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  if (db) await set(ref(db, "webrtc/offer"), offer);
};
