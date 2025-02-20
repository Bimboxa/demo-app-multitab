import QRCode from "qrcode";

let peerConnection;
let dataChannel;
let iceCandidatesQueue = [];

const iceServers = [
  {urls: "stun:stun.l.google.com:19302"},
  {urls: "stun:stun1.l.google.com:19302"},
  {urls: "stun:stun2.l.google.com:19302"},
];

const webrtcMiddleware = (store) => (next) => (action) => {
  if (action.type === "webrtc/initiateConnection") {
    initiateConnection(store);
  } else if (action.type === "webrtc/receiveSignal") {
    receiveSignal(store, action.payload);
  } else if (action.type === "shapes/setSelectedShapeId") {
    console.log("[webrtc] dispatch selected shape id", action.payload);
    console.log("[webrtc] dataChannel", dataChannel);
    if (dataChannel && dataChannel.readyState === "open") {
      console.log("[webrtc] dataChannel ready");
      dataChannel.send(JSON.stringify(action));
    }
  }
  return next(action);
};

const initiateConnection = async (store) => {
  peerConnection = new RTCPeerConnection({iceServers});
  dataChannel = peerConnection.createDataChannel("shapes");

  dataChannel.onmessage = (event) => {
    const action = JSON.parse(event.data);
    store.dispatch(action);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const qrCodeData = JSON.stringify({candidate: event.candidate});
      QRCode.toDataURL(qrCodeData).then((qrCodeUrl) => {
        store.dispatch({type: "webrtc/setQrCodeDataURL", payload: qrCodeUrl});
      });
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const qrCodeData = JSON.stringify({sdp: offer});
  const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
  store.dispatch({type: "webrtc/setQrCodeDataURL", payload: qrCodeUrl});
};

const receiveSignal = async (store, signal) => {
  try {
    console.log("[webrtc] receiveSignal", signal);

    if (!peerConnection) {
      console.log("Initializing peerConnection in receiveSignal");
      peerConnection = new RTCPeerConnection({iceServers});

      // dataChannel = peerConnection.createDataChannel("shapes");
      // dataChannel.onmessage = (event) => {
      //   const action = JSON.parse(event.data);
      //   store.dispatch(action);
      // };

      peerConnection.ondatachannel = (event) => {
        console.log("[webrtc] ondatachannel", event);
        dataChannel = event.channel;

        dataChannel.onmessage = (event) => {
          const action = JSON.parse(event.data);
          store.dispatch(action);
        };
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const qrCodeData = JSON.stringify({candidate: event.candidate});
          QRCode.toDataURL(qrCodeData).then((qrCodeUrl) => {
            store.dispatch({
              type: "webrtc/setQrCodeDataURL",
              payload: qrCodeUrl,
            });
          });
        }
      };
    }

    if (signal.sdp) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(signal.sdp)
      );
      if (signal.sdp.type === "offer") {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        const qrCodeData = JSON.stringify({sdp: answer});
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
        store.dispatch({type: "webrtc/setQrCodeDataURL", payload: qrCodeUrl});
      }

      // Add queued ICE candidates
      iceCandidatesQueue.forEach(async (candidate) => {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });
      iceCandidatesQueue = [];
    } else if (signal.candidate) {
      if (peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(signal.candidate)
        );
      } else {
        iceCandidatesQueue.push(signal.candidate);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export default webrtcMiddleware;
