import QRCode from "qrcode";

let peerConnection;
let dataChannel;

const webrtcMiddleware = (store) => (next) => (action) => {
  if (action.type === "webrtc/initiateConnection") {
    initiateConnection(store);
  } else if (action.type === "webrtc/receiveSignal") {
    receiveSignal(store, action.payload);
  } else if (action.type === "shapes/update") {
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(JSON.stringify(action));
    }
  }
  return next(action);
};

const initiateConnection = async (store) => {
  peerConnection = new RTCPeerConnection();
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
  store.dispatch({type: "webrtc/setQrCode", payload: qrCodeUrl});
};

const receiveSignal = async (store, signal) => {
  if (signal.sdp) {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(signal.sdp)
    );
    if (signal.sdp.type === "offer") {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      const qrCodeData = JSON.stringify({sdp: answer});
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
      store.dispatch({type: "webrtc/setQrCode", payload: qrCodeUrl});
    }
  } else if (signal.candidate) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
  }
};

export default webrtcMiddleware;
