import { createSignal, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import logoJudul from "../../assets/img/logoByd.png";
import styles from "../../App.module.css";
import sfxCamera from "../../assets/sfx/sfxcamera.wav";
import sfxButton from "../../assets/sfx/sfxbtn.wav";
import sfxCountdown from "../../assets/sfx/sfxcountdown.wav";
import QRComponent from "../helper/QRComponent";

export default function TakePhoto() {
  const [photoUrl, setPhotoUrl] = createSignal(null);
  const [isCaptured, setIsCaptured] = createSignal(false);
  const [countdown, setCountdown] = createSignal(null);
  const [isCounting, setIsCounting] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [photoPreview, setPhotoPreview] = createSignal(null);
  const [qrUrl, setQrUrl] = createSignal(null);
  const [isPrinting, setIsPrinting] = createSignal(false);
  const [showQrPopup, setShowQrPopup] = createSignal(false);

  const openQrPopup = () => setShowQrPopup(true);
  const closeQrPopup = () => setShowQrPopup(false);

  const navigate = useNavigate();
  const cameraSound = new Audio(sfxCamera);
  const countdownSound = new Audio(sfxCountdown);
  const buttonSound = new Audio(sfxButton);

  const handleCapture = async () => {
    setIsCounting(true);
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      countdownSound.play();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setCountdown(null);
    cameraSound.play();

    try {
      await fetch("http://localhost:8000/takephoto-portrait");
      const res = await fetch(
        "http://localhost:8000/getpreviewpath"
      );
      const data = await res.json();
      console.log("Data:", data);
      if (data?.photo) {
        const timestamp = new Date().getTime();
        setPhotoUrl(
          `http://localhost:8000/${data.photo}?t=${timestamp}`
        );
        setIsCaptured(true);
      } else {
        alert("Gagal mendapatkan foto.");
      }
    } catch (err) {
      console.error("Error taking photo:", err);
      alert("Terjadi kesalahan saat mengambil foto.");
    } finally {
      setIsCounting(false);
    }
  };

  const handleRetake = () => {
    buttonSound.play();
    setPhotoUrl(null);
    setIsCaptured(false);
  };

  const handleConfirm = async () => {
    buttonSound.play();
    setIsLoading(true);

    try {
      // Jalankan konfirmasi berurutan
      await fetch("http://localhost:8000/confirmphoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ option: 2 }),
      });
      await fetch("http://localhost:8000/changebackground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: 3 }),
      });
      await fetch("http://localhost:8000/framing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ option: 3 }),
      });
      await fetch("http://localhost:8000/uploadconfirmphoto");

      // Ambil hasil foto dan QR code secara paralel
      const [photoResponse, qrResponse] = await Promise.all([
        fetch("http://localhost:8000/getresultpath"),
        fetch("http://localhost:8000/getqrurl"),
      ]);

      const photoData = await photoResponse.json();
      const qrData = await qrResponse.json();

      if (photoData?.photo) {
        const timestamp = new Date().getTime(); // Hindari cache
        setPhotoPreview(
          `http://localhost:8000/${photoData.photo}?t=${timestamp}`
        );
      } else {
        console.error("Foto belum tersedia.");
        alert("Hasil foto belum tersedia. Mohon tunggu sebentar.");
        return;
      }

      if (qrData?.download_url) {
        setQrUrl(qrData.download_url);
      } else {
        console.error("QR URL tidak ditemukan.");
      }
    } catch (err) {
      console.error("Gagal dalam salah satu proses:", err);
      alert("Terjadi kesalahan saat konfirmasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      const printResponse = await fetch(
        "http://localhost:8000/printphoto-portrait",
        {
          method: "GET",
        }
      );

      if (!printResponse.ok) {
        console.error("Failed to print the photo.");
        alert("Gagal mencetak foto.");
      }

      buttonSound.play();

      setTimeout(() => {
        setIsPrinting(false);
      }, 15000);
    } catch (err) {
      console.error("Error printing photo:", err);
      alert("Terjadi kesalahan saat mencetak foto.");
      setIsPrinting(false);
    }
  };

  const takeNewPhoto = () => {
    buttonSound.play();
    setPhotoPreview(null);
    setIsCaptured(false);
    setPhotoUrl(null);
  };

  // tem : 000511
  // biru : 132b6f
  // cyan : 32f1fe
  // ijo : e9ff17
  // pink : ff28d3
  return (
    <div class="w-full flex flex-col items-center justify-center text-[#000511]">
      <div
        class={`flex flex-col items-center shadow-none px-5 ${styles.fadeIn}`}
        style={{ "font-family": "Conthrax" }}
      >
        {/* <div class="absolute inset-0 bg-[length:4px_4px] bg-[repeating-linear-gradient(45deg,#32f1fe_0px,#32f1fe_2px,#000511_2px,#000511_6px),repeating-linear-gradient(135deg,#e9ff17_0px,#e9ff17_2px,#000511_2px,#000511_6px),repeating-linear-gradient(90deg,#ff28d3_0px,#ff28d3_1px,#000511_1px,#000511_4px)] opacity-20 z-[-50] pointer-events-none"></div> */}
        <img
          src={logoJudul}
          alt="Logo"
          class="w-[600px] my-[-100px] opacity-0"
        />
        <p class="text-center text-[40px] bg-gradient-to-r from-[#e9ff17] to-[#32f1fe] bg-clip-text text-transparent px-5 py-4">
          Photobooth
        </p>
        <h1 class="text-[40px] uppercase bg-gradient-to-r from-[#32f1fe] to-[#e9ff17] bg-clip-text text-transparent">
          {!isCaptured() ? "Be Ready" : "Continue?"}
        </h1>

        <div class="w-[350px] h-auto flex justify-center">
          {!isCaptured() ? (
            <img
              id="camera-stream"
              src="http://localhost:8000/stream-portrait"
              alt="Camera Preview"
              class="w-[350px] h-full object-cover rounded-lg border-4 border-[#32f1fe]"
            />
          ) : (
            <img
              src={photoPreview() || photoUrl()}
              alt="Captured"
              class={`w-[350px] h-auto object-cover rounded-md border-4 border-[#32f1fe] ${
                isLoading() ? "blur-sm" : ""
              }`}
            />
          )}

          {countdown() && (
            <div class="absolute text-white text-[250px] font-bold z-10 mt-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg">
              {countdown()}
            </div>
          )}
          {isLoading() && (
            <div class="absolute top-1/2 flex flex-col items-center justify-center w-full gap-2 text-white">
              <span class="loader absolute"></span>
              <span class="animate-pulse">Loading...</span>
            </div>
          )}
        </div>

        {isPrinting() && (
          <div class="absolute w-screen min-h-screen z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div class="text-white text-center space-y-4">
              <div class="w-20 h-20 border-4 border-white border-dashed rounded-full animate-spin mx-auto"></div>
              <p class="text-3xl animate-bounce">Print Photo</p>
              <p class="text-3xl animate-bounce">Please wait...</p>
            </div>
          </div>
        )}
        <div class="flex w-full gap-4 mt-5">
          {!isCaptured() ? (
            <div class="flex flex-col items-center gap-4 w-full">
              <button
                onClick={handleCapture}
                disabled={isCounting()}
                class={`w-full bg-gradient-to-r from-[#e9ff17] to-[#ff28d3] px-10 py-3 text-3xl rounded-full shadow-lg transition-all duration-500 active:scale-75 active:bg-indigo-800 border border-purple-300 uppercase ${
                  isCounting() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Take Photo
              </button>
              <button
                onClick={() => {
                  navigate("/");
                  buttonSound.play();
                }}
                disabled={isCounting()}
                class={`w-fit bg-gradient-to-r from-[#32f1fe] to-[#ff28d3] bg-clip-text text-transparent px-5 py-2 text-xl rounded-full shadow-lg transition-all duration-500 active:scale-75 active:bg-indigo-800 border border-purple-300 uppercase ${
                  isCounting() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Back to Home
              </button>
            </div>
          ) : photoPreview() ? (
            <div class="flex flex-col gap-4 w-full">
              {/* QR Button Section */}
              <button
                class="bg-gradient-to-r from-[#32f1fe] to-[#e9ff17] text-black text-2xl px-3 py-2 rounded-full shadow-md transition-all duration-500 active:scale-75 uppercase"
                onClick={openQrPopup}
              >
                Show QR
              </button>
              <div class="flex gap-4 w-full">
                <button
                  onClick={takeNewPhoto}
                  class="w-full bg-gradient-to-r from-[#32f1fe] to-[#e9ff17] px-3 py-2 text-2xl rounded-full uppercase shadow-md transition-all duration-500 active:scale-75"
                >
                  Take New Photo
                </button>
                <button
                  onClick={handlePrint}
                  class="w-full bg-gradient-to-r from-[#e9ff17] to-[#ff28d3] px-2 py-2 text-2xl rounded-full uppercase shadow-md transition-all duration-500 active:scale-75"
                >
                  Print
                </button>
              </div>
            </div>
          ) : (
            <div class="flex flex-col items-center gap-4 w-full">
              <div class="flex gap-4 w-full">
                <button
                  onClick={handleRetake}
                  class="w-full bg-gradient-to-r from-[#32f1fe] to-[#e9ff17] px-3 py-2 text-2xl rounded-full uppercase shadow-md transition-all duration-500 active:scale-75"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handleConfirm}
                  class="w-full bg-gradient-to-r from-[#e9ff17] to-[#ff28d3] px-3 py-2 text-2xl rounded-full uppercase shadow-md transition-all duration-500 active:scale-75"
                >
                  Generate
                </button>
              </div>
            </div>
          )}
        </div>
        {/* QR Pop-up */}
        {showQrPopup() && (
          <div class="fixed inset-0 z-50 flex flex-col items-center justify-center">
            <div class="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center">
              <QRComponent urlQr={qrUrl()} />
              <p class="text-xl mt-4 font-bold text-center">
                Scan Here to Download
              </p>
              <button
                onClick={closeQrPopup}
                class="mt-6 bg-gradient-to-r from-[#ff28d3] to-[#32f1fe] px-3 py-2 rounded-full uppercase shadow-md transition-all duration-500 active:scale-75"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
