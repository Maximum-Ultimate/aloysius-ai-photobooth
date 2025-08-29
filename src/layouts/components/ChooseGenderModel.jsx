import { onCleanup, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Swiper from "swiper";
import { EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import male1 from "../../assets/models/male1.png";
import male2 from "../../assets/models/male2.png";
import male3 from "../../assets/models/male3.png";
import female1 from "../../assets/models/female1.png";
import female2 from "../../assets/models/female2.png";
import female3 from "../../assets/models/female3.png";

import { Mars, User, User2, Venus } from "lucide-solid";
import logoJudul from "../../assets/img/logoAcara.png";
import sfxButton from "../../assets/sfx/sfxbtn.wav";
import styles from "../../App.module.css";

export default function ChooseGenderModel() {
  const navigate = useNavigate();
  const buttonSound = new Audio(sfxButton);
  const [selectedGender, setSelectedGender] = createSignal(null);

  const maleModels = [
    { id: 1, src: male1, alt: "Male Model 1" },
    { id: 2, src: male2, alt: "Male Model 2" },
    { id: 3, src: male3, alt: "Male Model 3" },
  ];

  const femaleModels = [
    { id: 1, src: female1, alt: "Female Model 1" },
    { id: 2, src: female2, alt: "Female Model 2" },
    { id: 3, src: female3, alt: "Female Model 3" },
  ];

  const getModels = () => (selectedGender() === 1 ? maleModels : femaleModels);

  let swiperInstance;
  let swiperEl;

  createEffect(() => {
    if (selectedGender() && swiperEl) {
      setTimeout(() => {
        swiperInstance = new Swiper(swiperEl, {
          modules: [EffectCoverflow],
          effect: "coverflow",
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: "auto",
          coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          },
        });
      }, 100);
    }
  });

  onCleanup(() => {
    if (swiperInstance) swiperInstance.destroy();
  });

  const handleGenderClick = (gender) => {
    let sex;
    switch (gender) {
      case "male":
        sex = 1;
        break;

      default:
        sex = 2;
        break;
    }

    buttonSound.play();
    setTimeout(() => {
      setSelectedGender(sex);
    }, 800);
  };

  const handleModelSelect = (model) => {
    buttonSound.play();

    const gender = selectedGender();
    const modelId = model.id;

    setTimeout(() => {
      navigate(`/take-photo-ai?gender=${gender}&modelId=${modelId}`);
    }, 800);
  };

  return (
    <div class="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden text-white">
      <img src={logoJudul} alt="Logo" class="absolute top-32 w-[400px]" />
      <div
        class={`flex flex-col items-center px-5 gap-20 ${styles.fadeIn}`}
        style={{ "font-family": "Conthrax" }}
      >
        {selectedGender() === null ? (
          <div class="flex gap-24 text-center">
            <button
              onClick={() => handleGenderClick("male")}
              class="glow-gradient group flex flex-col items-center 
       bg-gradient-to-r from-[#b6b7be] via-[#212c4a] to-[#b6b7be] 
       p-10 rounded-2xl 
       shadow-lg hover:shadow-[0_0_30px_#ff28d3aa] 
       hover:scale-110 active:scale-90 
       duration-300 transition-all 
       border border-white/20"
            >
              {/* <div class="transition-all duration-300 group-active:text-transparent group-active:bg-clip-text group-active:bg-gradient-to-r group-active:from-[#32f1fe] group-active:to-[#ff28d3]"> */}
              <Mars size={300} />
              {/* </div> */}
              <span
                class="mt-2 text-[40px] font-semibold transition-all duration-300 
         group-active:text-transparent 
         group-active:bg-clip-text 
         group-active:bg-gradient-to-r 
         group-active:from-[#ffffff] 
         group-active:via-[#b6b7be] 
         group-active:to-[#777a88]"
              >
                Laki-Laki
              </span>
            </button>

            <button
              onClick={() => handleGenderClick("female")}
              class="glow-gradient group flex flex-col items-center 
       bg-gradient-to-r from-[#b6b7be] via-[#212c4a] to-[#b6b7be] 
       p-10 rounded-2xl 
       shadow-lg hover:shadow-[0_0_30px_#ff28d3aa] 
       hover:scale-110 active:scale-90 
       duration-300 transition-all 
       border border-white/20"
            >
              {/* <div class="transition-all duration-300 group-active:text-transparent group-active:bg-clip-text group-active:bg-gradient-to-r group-active:from-[#32f1fe] group-active:to-[#ff28d3]"> */}
              <Venus size={300} />
              {/* </div> */}
              <span
                class="mt-2 text-[40px] font-semibold transition-all duration-300 
         group-active:text-transparent 
         group-active:bg-clip-text 
         group-active:bg-gradient-to-r 
         group-active:from-[#ffffff] 
         group-active:via-[#b6b7be] 
         group-active:to-[#777a88]"
              >
                Wanita
              </span>
            </button>
          </div>
        ) : (
          <div class={`w-full max-w-[1500px] px-5 ${styles.fadeIn}`}>
            <div class="swiper" ref={(el) => (swiperEl = el)}>
              <div class="swiper-wrapper p-4">
                {getModels().map((model, index) => (
                  <button
                    type="button"
                    onClick={() => handleModelSelect(model)}
                    class="swiper-slide cursor-pointer active:scale-95 duration-300 transition-all"
                    style={{
                      width: "650px",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                    }}
                  >
                    <div
                      class="p-2 rounded-2xl 
         bg-gradient-to-r from-[#ffffff] via-[#b6b7be] to-[#777a88] 
         transition-transform duration-300 hover:scale-105 
         shadow-md hover:shadow-xl swiper-slide-inner"
                    >
                      <img
                        src={model.src}
                        alt={model.alt}
                        class="rounded-xl w-full h-auto object-contain bg-black"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
