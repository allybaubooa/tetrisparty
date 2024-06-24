<template>
  <div class="menu-container">
    <div class="menu-content">
      <img src="@/assets/logo.png" alt="Logo" class="logo">
      <button class="btn" @click="startGame"><i class="ri-play-line"></i> PLAY</button>
      <h2>Leaderboard Top 10</h2>
      <div class="leaderboard">
        <ul>
          <li v-for="(score, index) in topScores" :key="index">{{index + 1}}. {{ score }} Points</li>
        </ul>
      </div>
      <div class="contacts">
        <a href="https://github.com/your-github-profile" target="_blank" aria-label="GitHub">
          <i class="ri-github-fill"></i>
        </a>
        <a href="https://www.linkedin.com/in/allyhusseinbaubooa/" target="_blank" aria-label="LinkedIn">
          <i class="ri-linkedin-fill"></i>
        </a>
        <a href="mailto:allyhusseinbaubooa@gmail.com" aria-label="Email">
          <i class="ri-mail-fill"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();

const scores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
const topScores = scores.sort((a: any, b: any) => b - a).slice(0, 10); // Get top 10 scores

const startGame = () => {
  router.push('/game');
};
</script>

<style scoped>
.menu-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: radial-gradient(circle, rgba(147, 68, 103, 1) 20%, rgba(0, 0, 0, 1) 100%);
  position: relative;
}

.menu-content {
  text-align: center;
  color: white;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  width: 250px;
  max-height: 550px;
}

.logo {
  width: 100%;
  height: auto;
  margin-bottom: 20px;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #555;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #777;
}

.leaderboard {
  margin-top: 20px;
  max-height: 270px;
  overflow-y: auto;
}

.leaderboard ul {
  list-style: none;
  padding: 0;
}

.leaderboard li {
  background: #222;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  color: #fff;
}

.contacts {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.contacts a {
  color: white;
  font-size: 24px;
  transition: color 0.3s ease;
  text-decoration: none;
}

.contacts a:hover {
  color: #777;
}

/* button animation */
.btn {
 padding: 0.9em 1.6em;
 border: none;
 outline: none;
 color: #FFF;
 font-family: inherit;
 font-weight: 500;
 font-size: 17px;
 cursor: pointer;
 position: relative;
 z-index: 0;
 border-radius: 12px;
}

.btn::after {
 content: "";
 z-index: -1;
 position: absolute;
 width: 100%;
 height: 100%;
 background-color: rgb(46, 46, 46);
 left: 0;
 top: 0;
 border-radius: 10px;
}
/* glow */
.btn::before {
 content: "";
 background: linear-gradient(
    45deg,
    #FF0000, #002BFF, #FF00C8, #002BFF,
      #FF0000, #002BFF, #FF00C8, #002BFF
);
 position: absolute;
 top: -2px;
 left: -2px;
 background-size: 600%;
 z-index: -1;
 width: calc(100% + 4px);
 height: calc(100% + 4px);
 filter: blur(8px);
 animation: glowing 20s linear infinite;
 transition: opacity .3s ease-in-out;
 border-radius: 10px;
 opacity: 0;
}

@keyframes glowing {
 0% {
  background-position: 0 0;
 }

 50% {
  background-position: 400% 0;
 }

 100% {
  background-position: 0 0;
 }
}

/* hover */
.btn:hover::before {
 opacity: 1;
}

.btn:active:after {
 background: transparent;
}

.btn:active {
 color: #000;
 font-weight: bold;
}
</style>
