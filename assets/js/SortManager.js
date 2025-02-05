export class SortManager {
    constructor() {
        this.movies = [];
        this.comparisons = new Map(); // Store comparison results
        this.currentComparison = null;
        this.comparisonQueue = [];
    }

    initialize(movies) {
        if (movies.length < 2) {
            throw new Error('At least 2 movies are required for comparison');
        }
        this.movies = [...movies];
        this.comparisons.clear();
        this.currentComparison = null;
        this.generateInitialComparisons();
    }

    generateInitialComparisons() {
        this.comparisonQueue = [];
        // Generate all possible pairs for initial comparisons
        for (let i = 0; i < this.movies.length - 1; i++) {
            for (let j = i + 1; j < this.movies.length; j++) {
                // Only add pairs we haven't compared yet
                const key = this.getComparisonKey(this.movies[i], this.movies[j]);
                if (!this.comparisons.has(key)) {
                    this.comparisonQueue.push({
                        movie1: this.movies[i],
                        movie2: this.movies[j]
                    });
                }
            }
        }
        // Shuffle the queue to make comparisons more interesting
        this.shuffleQueue();
    }

    shuffleQueue() {
        for (let i = this.comparisonQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.comparisonQueue[i], this.comparisonQueue[j]] = 
            [this.comparisonQueue[j], this.comparisonQueue[i]];
        }
    }

    getNextComparison() {
        if (this.comparisonQueue.length === 0) {
            return null;
        }
        this.currentComparison = this.comparisonQueue.pop();
        return this.currentComparison;
    }

    getCurrentComparison() {
        return this.currentComparison;
    }

    getComparisonKey(movie1, movie2) {
        // Ensure consistent key regardless of movie order
        return [movie1.id, movie2.id].sort().join('-');
    }

    recordComparison(winner, loser) {
        const key = this.getComparisonKey(winner, loser);
        this.comparisons.set(key, {
            winner: winner.id,
            loser: loser.id
        });
    }

    isSortingComplete() {
        return this.comparisonQueue.length === 0;
    }

    getFinalRanking() {
        // Create a graph of wins/losses
        const graph = new Map();
        this.movies.forEach(movie => {
            graph.set(movie.id, { wins: 0, losses: 0 });
        });

        // Count wins and losses for each movie
        this.comparisons.forEach(result => {
            graph.get(result.winner).wins++;
            graph.get(result.loser).losses++;
        });

        // Sort movies by win count (primary) and loss count (secondary)
        return this.movies
            .slice()
            .sort((a, b) => {
                const aStats = graph.get(a.id);
                const bStats = graph.get(b.id);
                
                // First compare by number of wins
                if (aStats.wins !== bStats.wins) {
                    return bStats.wins - aStats.wins;
                }
                
                // If wins are equal, compare by losses (fewer losses ranks higher)
                return aStats.losses - bStats.losses;
            });
    }

    getProgress() {
        const totalComparisons = (this.movies.length * (this.movies.length - 1)) / 2;
        const completedComparisons = this.comparisons.size;
        return {
            completed: completedComparisons,
            total: totalComparisons,
            percentage: (completedComparisons / totalComparisons) * 100
        };
    }
}
