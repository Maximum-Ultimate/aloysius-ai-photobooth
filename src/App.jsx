import { createSignal, onCleanup, onMount } from "solid-js";
import { Router, Route } from "@solidjs/router";
import Home from "./layouts/components/Home";
import Loading from "./layouts/Loading";
import NotFoundPage from "./layouts/NotFoundPage";
import backgroundPhotobooth from "./assets/img/bgPhotobooth.jpg";
import TakePhoto from "./layouts/components/TakePhoto";
import bgmPhotobooth from "./assets/sfx/bgmbyd.wav";
import TakePhotoAI from "./layouts/components/TakePhotoAI";
import ChooseGenderModel from "./layouts/components/ChooseGenderModel";
import iconByd from "./assets/img/bydLogo.webp";
import iconNo1 from "./assets/img/no1Icon.webp";

let bgmAudio;

function App() {
  const [loading, setLoading] = createSignal(true);
  const [hasPlayed, setHasPlayed] = createSignal(false);

  const handleUserInteraction = () => {
    if (!hasPlayed()) {
      bgmAudio = new Audio(bgmPhotobooth);
      bgmAudio.loop = true;
      bgmAudio.volume = 0.5;

      bgmAudio
        .play()
        .then(() => {
          console.log("BGM started after user interaction");
          setHasPlayed(true);
        })
        .catch((err) => {
          console.warn("Play failed after interaction:", err);
        });

      document.removeEventListener("click", handleUserInteraction);
    }
  };

  // Pasang event listener 1x aja
  document.addEventListener("click", handleUserInteraction);

  // Cleanup biar gak double listener kalau komponen re-mount
  onCleanup(() => {
    document.removeEventListener("click", handleUserInteraction);
  });

  setTimeout(() => {
    setLoading(false);
  }, 1500);

  return (
    <div
      class="flex flex-col items-center min-h-screen bg-cover bg-center"
      style={{
        "background-image": `url(${backgroundPhotobooth})`,
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      {/* <div class="absolute top-7 flex justify-between items-center w-full px-3">
        <img
          src={iconByd}
          alt="BYD Logo"
          class="max-w-[80px] h-auto object-contain"
        />
        <img
          src={iconNo1}
          alt="No 1 Logo"
          class="max-w-[60px] h-auto object-contain"
        />
      </div> */}
      {loading() ? (
        <Loading />
      ) : (
        <Router>
          <Route path="/" component={Home} />
          <Route path="/take-photo" component={TakePhoto} />
          <Route path="/take-photo-ai" component={TakePhotoAI} />
          <Route path="/choose-gender-model" component={ChooseGenderModel} />
          <Route path="/loading" component={Loading} />
          <Route path="/*" component={NotFoundPage} />
        </Router>
      )}
    </div>
  );
}

export default App;
