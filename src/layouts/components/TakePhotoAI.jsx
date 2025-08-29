import { createSignal, onCleanup, onMount } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import logoJudul from "../../assets/img/logoByd.png";
import styles from "../../App.module.css";
import sfxCamera from "../../assets/sfx/sfxcamera.wav";
import sfxButton from "../../assets/sfx/sfxbtn.wav";
import sfxCountdown from "../../assets/sfx/sfxcountdown.wav";
import QRComponent from "../helper/QRComponent";

export default function TakePhotoAI() {
  // photoUrl dan photoPreview sekarang akan menyimpan Blob URL (mis. blob:http://localhost:3000/...)
  const [photoUrl, setPhotoUrl] = createSignal(null);
  const [isCaptured, setIsCaptured] = createSignal(false);
  const [countdown, setCountdown] = createSignal(null);
  const [isCounting, setIsCounting] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [photoPreview, setPhotoPreview] = createSignal(null);
  const [qrUrl, setQrUrl] = createSignal(null);
  const [isPrinting, setIsPrinting] = createSignal(false);
  const [gender, setGender] = createSignal(1);
  const [showQrPopup, setShowQrPopup] = createSignal(false);
  const [params] = useSearchParams();

  const genderId = params.gender;
  const modelId = params.modelId;

  onMount(() => {
    console.log(genderId);
    console.log(modelId);
  });

  const openQrPopup = () => setShowQrPopup(true);
  const closeQrPopup = () => setShowQrPopup(false);

  const navigate = useNavigate();
  const cameraSound = new Audio(sfxCamera);
  const countdownSound = new Audio(sfxCountdown);
  const buttonSound = new Audio(sfxButton);

  // Header untuk melewati peringatan browser ngrok
  const NGROK_HEADERS = {
    "ngrok-skip-browser-warning": "true",
  };

  /**
   * Mengambil gambar dari URL dengan header ngrok bypass dan mengembalikan Blob URL.
   * Ini digunakan untuk menampilkan gambar yang diambil atau hasil proses.
   * @param {string} url - URL gambar ngrok.
   * @returns {Promise<string|null>} Blob URL atau null jika gagal.
   */
  const fetchImageAsBlobUrl = async (url) => {
    try {
      const response = await fetch(url, { headers: NGROK_HEADERS });
      if (!response.ok) {
        // Jika respons tidak OK, coba log lebih detail
        const errorText = await response.text();
        console.error(
          `HTTP error! Status: ${response.status}, Body: ${errorText}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching image as Blob:", error);
      return null;
    }
  };

  // Membersihkan Blob URLs saat komponen tidak lagi digunakan
  onCleanup(() => {
    if (photoUrl()) URL.revokeObjectURL(photoUrl());
    if (photoPreview()) URL.revokeObjectURL(photoPreview());
  });

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
      // Trigger pengambilan foto di backend
      await fetch("http://localhost:8000/takephoto-portrait", {
        headers: NGROK_HEADERS,
      });

      // Ambil path ke foto preview dari backend
      const res = await fetch("http://localhost:8000/getpreviewpath", {
        headers: NGROK_HEADERS,
      });
      const data = await res.json();
      console.log("Data:", data);

      if (data?.photo) {
        const ngrokPhotoPath = `http://localhost:8000/${data.photo}`;
        // Ambil foto sebagai blob untuk melewati interstitial ngrok saat menampilkan gambar
        const blobUrl = await fetchImageAsBlobUrl(ngrokPhotoPath);
        if (blobUrl) {
          setPhotoUrl(blobUrl);
          setIsCaptured(true);
        } else {
          // Menggunakan alert kustom sebagai pengganti window.alert
          // Anda perlu mengimplementasikan komponen modal kustom untuk ini
          console.error("Gagal memuat foto preview.");
          // alert("Gagal memuat foto preview."); // Ganti dengan modal kustom
        }
      } else {
        console.error("Gagal mendapatkan foto.");
        // alert("Gagal mendapatkan foto."); // Ganti dengan modal kustom
      }
    } catch (err) {
      console.error("Error taking photo:", err);
      // alert("Terjadi kesalahan saat mengambil foto."); // Ganti dengan modal kustom
    } finally {
      setIsCounting(false);
    }
  };

  const handleRetake = () => {
    buttonSound.play();
    if (photoUrl()) URL.revokeObjectURL(photoUrl()); // Bersihkan Blob URL lama
    setPhotoUrl(null);
    setIsCaptured(false);
  };

  const handleConfirm = async () => {
    buttonSound.play();
    setIsLoading(true);

    try {
      await fetch("http://localhost:8000/confirmphoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_HEADERS,
        },
        body: JSON.stringify({ option: 2 }),
      });
      await fetch("http://localhost:8000/swapface", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_HEADERS,
        },
        body: JSON.stringify({ option: modelId, gender: genderId }),
      });
      await fetch("http://localhost:8000/framing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_HEADERS,
        },
        body: JSON.stringify({ option: 3 }),
      });
      await fetch("http://localhost:8000/uploadconfirmphoto", {
        headers: NGROK_HEADERS,
      });

      // Ambil hasil foto dan QR code secara paralel
      const [photoResponse, qrResponse] = await Promise.all([
        fetch("http://localhost:8000/getresultpath", {
          headers: NGROK_HEADERS,
        }),
        fetch("http://localhost:8000/getqrurl", {
          headers: NGROK_HEADERS,
        }),
      ]);

      const photoData = await photoResponse.json();
      const qrData = await qrResponse.json();

      if (photoData?.photo) {
        const ngrokResultPhotoPath = `http://localhost:8000/${photoData.photo}`;
        // Ambil foto hasil sebagai blob untuk melewati interstitial ngrok saat menampilkan gambar
        const blobUrl = await fetchImageAsBlobUrl(ngrokResultPhotoPath);
        if (blobUrl) {
          setPhotoPreview(blobUrl);
        } else {
          console.error("Foto hasil belum tersedia.");
          // alert("Hasil foto belum tersedia. Mohon tunggu sebentar."); // Ganti dengan modal kustom
          return;
        }
      } else {
        console.error("Foto hasil belum tersedia.");
        // alert("Hasil foto belum tersedia. Mohon tunggu sebentar."); // Ganti dengan modal kustom
        return;
      }

      if (qrData?.download_url) {
        setQrUrl(qrData.download_url);
      } else {
        console.error("QR URL tidak ditemukan.");
      }
    } catch (err) {
      console.error("Gagal dalam salah satu proses:", err);
      // alert("Terjadi kesalahan saat konfirmasi."); // Ganti dengan modal kustom
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
          headers: NGROK_HEADERS,
        }
      );

      if (!printResponse.ok) {
        console.error("Failed to print the photo.");
        // alert("Gagal mencetak foto."); // Ganti dengan modal kustom
      }

      buttonSound.play();

      setTimeout(() => {
        setIsPrinting(false);
      }, 15000);
    } catch (err) {
      console.error("Error printing photo:", err);
      // alert("Terjadi kesalahan saat mencetak foto."); // Ganti dengan modal kustom
      setIsPrinting(false);
    }
  };

  const takeNewPhoto = () => {
    buttonSound.play();
    if (photoPreview()) URL.revokeObjectURL(photoPreview()); // Bersihkan Blob URL lama
    setPhotoPreview(null);
    setIsCaptured(false);
    if (photoUrl()) URL.revokeObjectURL(photoUrl()); // Bersihkan Blob URL lama
    setPhotoUrl(null);
  };

  return (
    <div class="w-full flex flex-col items-center justify-center text-[#000511]">
      <div
        class={`flex flex-col items-center shadow-none px-5 ${styles.fadeIn}`}
        style={{ "font-family": "Conthrax" }}
      >
        <img
          src={logoJudul}
          alt="Logo"
          class="w-[600px] my-[-100px] opacity-0"
        />
        {/* <p class="text-center text-[40px] bg-gradient-to-r from-[#e9ff17] to-[#32f1fe] bg-clip-text text-transparent px-5 py-4">
          AI Photobooth
        </p> */}

        <div class="w-[350px] h-auto flex justify-center">
          {!isCaptured() ? (
            <img
              id="camera-stream"
              // PENTING: Untuk live camera stream ini, kamu HARUS membuat proxy di backend kamu.
              // Ganti URL ini dengan endpoint proxy di backend kamu.
              // Contoh: src="http://localhost:5000/api/stream-portrait"
              // Backend kamu akan mengambil stream dari ngrok dengan header bypass
              // dan meneruskannya ke frontend.
              src="http://localhost:8000/stream-portrait" // <-- GANTI INI DENGAN URL PROXY BACKEND KAMU
              alt="Camera Preview"
              class="w-[350px] h-full object-cover rounded-lg border-4 border-[#32f1fe]"
            />
          ) : (
            <img
              src={photoPreview() || photoUrl()} // photoUrl dan photoPreview sekarang adalah Blob URLs
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
              <div class="w-20 h-20 border-4 border-white border-dashed rounded-lg animate-spin mx-auto"></div>
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
                class={`w-full bg-[#212c4a] text-white px-10 py-3 text-3xl rounded-lg shadow-lg transition-all duration-500 active:scale-75 active:bg-indigo-800 border border-purple-300 uppercase ${
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
                class={`w-fit bg-[#212c4a] text-white bg-clip-text px-5 py-2 text-xl rounded-lg shadow-lg transition-all duration-500 active:scale-75 active:bg-indigo-800 border border-purple-300 uppercase ${
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
                class="bg-[#212c4a] text-white text-black text-2xl px-3 py-2 rounded-lg shadow-md transition-all duration-500 active:scale-75 uppercase"
                onClick={openQrPopup}
              >
                Show QR
              </button>
              <div class="flex gap-4 w-full">
                <button
                  onClick={takeNewPhoto}
                  class="w-full bg-[#212c4a] text-white px-3 py-2 text-2xl rounded-lg uppercase shadow-md transition-all duration-500 active:scale-75"
                >
                  Take New Photo
                </button>
                <button
                  onClick={handlePrint}
                  class="w-full bg-[#212c4a] text-white px-2 py-2 text-2xl rounded-lg uppercase shadow-md transition-all duration-500 active:scale-75"
                >
                  Print
                </button>
              </div>
            </div>
          ) : (
            <div class="flex flex-col items-center gap-4 w-full">
              {/* <div class="flex gap-4">
                <button
                  class={`px-6 py-2 rounded-lg border-2 font-bold transition ${
                    gender() === 1
                      ? "bg-blue-500 text-white border-blue-500"
                      : "text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                  }`}
                  onClick={() => setGender(1)}
                >
                  Male
                </button>

                <button
                  class={`px-6 py-2 rounded-lg border-2 font-bold transition ${
                    gender() === 2
                      ? "bg-pink-500 text-white border-pink-500"
                      : "text-pink-500 border-pink-500 hover:bg-pink-500 hover:text-white"
                  }`}
                  onClick={() => setGender(2)}
                >
                  Female
                </button>
              </div> */}
              <div class="flex gap-4 w-full">
                <button
                  onClick={handleRetake}
                  class="w-full bg-[#212c4a] text-white px-3 py-2 text-2xl rounded-lg uppercase shadow-md transition-all duration-500 active:scale-75"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handleConfirm}
                  class="w-full bg-[#212c4a] text-white px-3 py-2 text-2xl rounded-lg uppercase shadow-md transition-all duration-500 active:scale-75"
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
                class="mt-6 bg-[#212c4a] text-white px-3 py-2 rounded-lg uppercase shadow-md transition-all duration-500 active:scale-75"
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
