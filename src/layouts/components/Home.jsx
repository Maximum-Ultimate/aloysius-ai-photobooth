import { useNavigate } from "@solidjs/router";
import styles from "../../App.module.css";
import logoJudul from "../../assets/img/logoAcara.png";
import sfxButton from "../../assets/sfx/sfxbtn.wav";

export default function Home() {
  const navigate = useNavigate();
  const buttonSound = new Audio(sfxButton);

  const takePhotoBackground = () => {
    buttonSound.play();
    setTimeout(() => {
      navigate("/take-photo");
    }, 1000);
  };

  const takePhotoAI = () => {
    buttonSound.play();
    setTimeout(() => {
      navigate("/choose-gender-model");
    }, 1000);
  };

  return (
    <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <div
        class={`flex flex-col items-center shadow-none px-5 gap-52 ${styles.fadeIn}`}
        style={{ "font-family": "Conthrax" }}
      >
        <img src={logoJudul} alt="Logo" class="w-[700px] " />
        {/* <p class="text-4xl text-center uppercase text-white mt-5 mb-52">
          Photobooth
        </p> */}
{/* ffffff
b6b7be
777a88
212c4a */}
        <div class="flex flex-col gap-4 w-full">
          <button
            onClick={takePhotoAI}
            class="w-full font-bold bg-[#212c4a] px-10 py-6 text-[32px] text-white rounded-xl shadow-md transition-all duration-300 hover:bg-[#777a88] hover:shadow-xl active:scale-95 active:bg-[#777a88] border border-[#b6b7be] uppercase tracking-wide"
          >
            Mulai
          </button>
        </div>
      </div>
    </div>
  );
}
