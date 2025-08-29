import { useNavigate } from "@solidjs/router";
import styles from "../App.module.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-5">
      <div
        class={`flex flex-col items-center ${styles.fadeIn}`}
        style={{ fontFamily: "NormProRegular" }}
      >
        <div class="flex flex-row items-center mb-8 gap-4 p-2 shadow-lg border-4 border-white rounded-lg">
          <p class="text-xl text-center font-semibold">
            Kamu salah alamat, klik tombol di bawah untuk kembali ke menu utama
          </p>
        </div>

        {/* Tombol Aksi */}
        <div class="flex gap-5 mt-4">
          <button
            onClick={handleBackHome}
            class="bg-gradient-to-r from-[#7f6bc6] to-[#be72c2] text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 active:scale-95 uppercase"
          >
            Kembali ke menu utama
          </button>
        </div>
      </div>
    </div>
  );
}
