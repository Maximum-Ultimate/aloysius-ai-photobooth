import { createSignal, onMount } from "solid-js";
import logo from "../assets/img/logoAcara.png";
import styles from "../App.module.css";

function Loading(background) {
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  });

  return (
    <div
      class="min-h-screen w-full flex flex-col items-center justify-center relative text-[#000511]"
      style={{ "font-family": "Conthrax" }}
    >
      <div class={`flex flex-col items-center shadow-none ${styles.fadeIn}`}>
        <img
          src={logo}
          alt="Logo"
          class="w-[600px] md:w-[700px] my-[-100px] rounded-lg mb-24"
        />
        <p class="text-4xl md:text-5xl font-extrabold uppercase text-white tracking-wide animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default Loading;
