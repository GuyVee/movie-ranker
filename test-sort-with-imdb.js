import { SortManager } from './assets/js/SortManager.js';
import http from 'http';

// IMDb ratings from OMDb API
const imdbRatings = new Map([
  ['Iron Man', 7.9],
  ['The Incredible Hulk', 6.7],
  ['Iron Man 2', 7],
  ['Thor', 7],
  ['Captain America: The First Avenger', 6.9],
  ['The Avengers', 8.1],
  ['Iron Man 3', 7.2],
  ['Thor: The Dark World', 7],
  ['Captain America: The Winter Soldier', 7.8],
  ['Guardians of the Galaxy', 8.1],
  ['Avengers: Age of Ultron', 7.3],
  ['Ant-Man', 7.3],
  ['Captain America: Civil War', 7.8],
  ['Doctor Strange', 7.5],
  ['Guardians of the Galaxy Vol. 2', 7.6],
  ['Spider-Man: Homecoming', 7.4],
  ['Thor: Ragnarok', 7.9],
  ['Black Panther', 7.3],
  ['Avengers: Infinity War', 8.5],
  ['Ant-Man and the Wasp', 7],
  ['Captain Marvel', 6.8],
  ['Avengers: Endgame', 8.4],
  ['Spider-Man: Far From Home', 7.5],
  ['Black Widow', 6.7],
  ['Shang-Chi and the Legend of the Ten Rings', 7.4],
  ['Eternals', 6.3],
  ['Spider-Man: No Way Home', 8.3],
  ['Doctor Strange in the Multiverse of Madness', 7],
  ['Thor: Love and Thunder', 6.8],
  ['Black Panther: Wakanda Forever', 6.5],
  ['Ant-Man and the Wasp: Quantumania', 6.3],
  ['Guardians of the Galaxy Vol. 3', 0],
  ['The Marvels', 0],
  ['Spider-Man', 7.3],
  ['Spider-Man 2', 7.3],
  ['Spider-Man 3', 6.2],
  ['The Amazing Spider-Man', 6.9],
  ['The Amazing Spider-Man 2', 6.6],
  ['Venom', 6.7],
  ['Venom: Let There Be Carnage', 5.9],
  ['Morbius', 5.2],
  ['Madame Web', 0],
  ['Daredevil', 7.5],
  ['Elektra', 4.7],
  ['Fantastic Four', 5.7],
  ['Fantastic Four: Rise of the Silver Surfer', 5.6],
  ['X-Men', 7.4],
  ['X2: X-Men United', 7.5],
  ['X-Men: The Last Stand', 6.8],
  ['X-Men Origins: Wolverine', 6.6],
  ['X-Men: First Class', 7.7],
  ['The Wolverine', 6.7],
  ['X-Men: Days of Future Past', 8],
  ['Deadpool', 8],
  ['X-Men: Apocalypse', 6.9],
  ['Logan', 8.1],
  ['Deadpool 2', 7.7],
  ['Dark Phoenix', 5.8],
  ['The New Mutants', 5.3]
]);

// Read and parse movies from the list
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

// Create expected ranking based on IMDb ratings
const expectedRanking = Array.from(imdbRatings.entries())
  .filter(([_, rating]) => rating > 0) // Exclude movies without ratings
  .sort((a, b) => b[1] - a[1]) // Sort by rating descending
  .map(([title, rating]) => ({ title, rating }));

const runTest = async () => {
  const { imdbRatings, expectedRanking } = await fetchIMDbRatings();

  // Create test movies with IDs and IMDb ratings
  const testMovies = movieTitles.map((title, index) => ({
    id: index + 1,
    title: title,
    imdbRating: imdbRatings.get(title)
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
  console.log('\nExpected Ranking (IMDb):');
  expectedRanking.forEach((movie, index) => {
    console.log(`${index + 1}. ${movie.title} (${movie.rating})`);
  });

  console.log('\nFinal Ranking:');
  finalRanking.forEach((movie, index) => {
    console.log(`${index + 1}. ${movie.title} (${movie.imdbRating})`);
  });

  // Calculate Spearman's rank correlation
  const n = finalRanking.length;
  let rankDiffs = 0;
  for (let i = 0; i < n; i++) {
    const expectedRank = expectedRanking.findIndex(m => m.title === finalRanking[i].title) + 1;
    const finalRank = i + 1;
    rankDiffs += (expectedRank - finalRank) ** 2;
  }
  const rho = 1 - (6 * rankDiffs) / (n * (n ** 2 - 1));

  // Print statistics
  const progress = sortManager.getProgress();
  console.log('\nStatistics:');
  console.log('Total movies:', testMovies.length);
  console.log('Total comparisons made:', progress.completed);
  console.log('Comparisons per movie (average):', (progress.completed / testMovies.length).toFixed(2));
  console.log('Theoretical minimum comparisons needed:', Math.ceil(testMovies.length * Math.log2(testMovies.length)));
  console.log('Actual vs. theoretical ratio:', (progress.completed / Math.ceil(testMovies.length * Math.log2(testMovies.length))).toFixed(2));
  console.log(`Spearman's rank correlation with IMDb: ${rho.toFixed(4)}`);
};

runTest();
