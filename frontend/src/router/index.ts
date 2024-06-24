import { createRouter, createWebHistory } from 'vue-router';
import MainMenu from '../components/MainMenu.vue';
import Game from '../components/Game.vue';

const routes = [
    { path: '/', component: MainMenu },
    { path: '/game', component: Game }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
