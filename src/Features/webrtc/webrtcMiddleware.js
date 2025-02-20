let dataChannel = null;

const webrtcMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (dataChannel && dataChannel.readyState === "open") {
    if (action.type.startsWith("shapes/")) {
      dataChannel.send(JSON.stringify(action));
    }
  }
  return result;
};

export const setDataChannel = (channel) => {
  dataChannel = channel;
};

export const handleWebRTCMessage = (store) => (event) => {
  const action = JSON.parse(event.data);
  console.log("Received message", action);
  if (action.type.startsWith("shapes/")) {
    store.dispatch(action); // Update Redux state
  }
};

export default webrtcMiddleware;
