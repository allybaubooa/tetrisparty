<!-- src/components/Leaderboard.vue -->
<template>
    <div class="leaderboard">
        <h2>Leaderboard</h2>
        <ul>
            <li v-for="score in scores" :key="score.id">
                {{ score.name }}: {{ score.score }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Score {
    id: number;
    name: string;
    score: number;
}

const scores = ref<Score[]>([]);

onMounted(() => {
    // Fetch scores from an API or local storage
    scores.value = [
        { id: 1, name: 'Player1', score: 500 },
        { id: 2, name: 'Player2', score: 400 },
        // Add more scores
    ];
});
</script>

<style scoped>
.leaderboard {
    text-align: center;
    margin-top: 20px;
}
</style>