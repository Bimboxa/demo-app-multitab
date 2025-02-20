import {useDispatch} from "react-redux";
import {receiveSignal} from "../webrtcSlice";

import ButtonQrCodeReader from "Features/qrcode/components/ButtonQrCodeReader";

export default function ButtonReceiveSignal() {
  const dispatch = useDispatch();

  function handleScan(data) {
    if (data) {
      const signal = JSON.parse(data);
      console.log("[webrtc] receive signal", signal);
      dispatch(receiveSignal(signal));
    }
  }
  return <ButtonQrCodeReader onScan={handleScan} />;
}
