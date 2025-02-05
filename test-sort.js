import { SortManager } from './assets/js/SortManager.js';

// Read and parse movies from the list (excluding the first line which is a comment)
const movieTitles = `Iron Man
The Incredible Hulk
Iron Man 2
Thor
Captain America: The First Avenger
The Avengers
Iron Man 3
Thor: The Dark World
Captain America: The Winter Soldier
Guardians of the Galaxy
Avengers: Age of Ultron
Ant-Man
Captain America: Civil War
Doctor Strange
Guardians of the Galaxy Vol. 2
Spider-Man: Homecoming
Thor: Ragnarok
Black Panther
Avengers: Infinity War
Ant-Man and the Wasp
Captain Marvel
Avengers: Endgame
Spider-Man: Far From Home
Black Widow
Shang-Chi and the Legend of the Ten Rings
Eternals
Spider-Man: No Way Home
Doctor Strange in the Multiverse of Madness
Thor: Love and Thunder
Black Panther: Wakanda Forever
Ant-Man and the Wasp: Quantumania
Guardians of the Galaxy Vol. 3
The Marvels
Spider-Man
Spider-Man 2
Spider-Man 3
The Amazing Spider-Man
The Amazing Spider-Man 2
Venom
Venom: Let There Be Carnage
Morbius
Madame Web
Daredevil
Elektra
Fantastic Four
Fantastic Four: Rise of the Silver Surfer
X-Men
X2: X-Men United
X-Men: The Last Stand
X-Men Origins: Wolverine
X-Men: First Class
The Wolverine
X-Men: Days of Future Past
Deadpool
X-Men: Apocalypse
Logan
Deadpool 2
Dark Phoenix
The New Mutants`.split('\n');

// Create test movies with IDs
const testMovies = movieTitles.map((title, index) => ({
    id: index + 1,
    title: title
}));

// Initialize SortManager
const sortManager = new SortManager();
sortManager.initialize(testMovies);

console.log('Number of movies:', testMovies.length);
console.log('Initial number of comparisons needed:', sortManager.getProgress().total);

// Process all comparisons with random preferences
let comparisonCount = 0;
while (true) {
    const comparison = sortManager.getNextComparison();
    if (!comparison) break;

    // Randomly decide winner (for testing purposes)
    const randomPreference = Math.random() >= 0.5;
    if (randomPreference) {
        sortManager.recordComparison(comparison.movie1, comparison.movie2);
    } else {
        sortManager.recordComparison(comparison.movie2, comparison.movie1);
    }
    comparisonCount++;

    // Log progress every 50 comparisons
    if (comparisonCount % 50 === 0) {
        const progress = sortManager.getProgress();
        console.log(`Progress: ${progress.completed}/${progress.total} comparisons (${Math.round(progress.percentage)}%)`);
    }
}

// Get final ranking
const finalRanking = sortManager.getFinalRanking();

// Print results
console.log('\nFinal Ranking:');
finalRanking.forEach((movie, index) => {
    console.log(`${index + 1}. ${movie.title}`);
});

// Print statistics
const progress = sortManager.getProgress();
console.log('\nStatistics:');
console.log('Total movies:', testMovies.length);
console.log('Total comparisons made:', progress.completed);
console.log('Comparisons per movie (average):', (progress.completed / testMovies.length).toFixed(2));
console.log('Theoretical minimum comparisons needed:', Math.ceil(testMovies.length * Math.log2(testMovies.length)));
console.log('Actual vs. theoretical ratio:', (progress.completed / Math.ceil(testMovies.length * Math.log2(testMovies.length))).toFixed(2));
