import { createSignal, createEffect } from "solid-js";
import QRCode from "qrcode";

export default function QRComponent(props) {
  const [qrUrl, setQrUrl] = createSignal("");

  createEffect(() => {
    if (props.urlQr) {
      QRCode.toDataURL(props.urlQr)
        .then((url) => setQrUrl(url))
        .catch((err) => console.error("QR Encode Error:", err));
    }
  });

  return (
    <div class="flex justify-center items-center p-3">
      {qrUrl() ? (
        <img
          src={qrUrl()}
          alt="QR Code"
          class="w-[150px] h-[150px] object-contain rounded-xl"
        />
      ) : (
        <p class="w-full">Loading QR...</p>
      )}
    </div>
  );
}
