import { ref } from "vue";

let backgroundAudio = new Audio();
let isMuted: any = ref(false);

export const playSound = (src: string) => {
    if (isMuted.value) return;
    const audio = new Audio(src);
    audio.play().catch((error) => console.error('Error playing sound:', error));
};

export const playBackgroundSound = (src: string) => {
    if (isMuted.value) return;
    stopBackgroundSound();
    backgroundAudio.src = src;
    backgroundAudio.loop = true;
    backgroundAudio.load();
    backgroundAudio.addEventListener('canplaythrough', () => {
        backgroundAudio.play().catch((error) => console.error('Error playing background audio:', error));
    }, { once: true });
};

export const stopBackgroundSound = () => {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;
};

export const toggleMuteSound = () => {
    isMuted.value = !isMuted.value;
    if (isMuted.value) {
        stopBackgroundSound();
    } else {
        playBackgroundSound(backgroundAudio.src);
    }
};

export { isMuted };
