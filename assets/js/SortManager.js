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
        
        // Create groups of movies to reduce total comparisons
        const n = this.movies.length;
        const groupSize = Math.ceil(Math.sqrt(n));
        const groups = [];
        
        // Split movies into sqrt(n) groups
        for (let i = 0; i < n; i += groupSize) {
            groups.push(this.movies.slice(i, Math.min(i + groupSize, n)));
        }
        
        // Generate comparisons within each group
        groups.forEach(group => {
            for (let i = 0; i < group.length - 1; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const key = this.getComparisonKey(group[i], group[j]);
                    if (!this.comparisons.has(key)) {
                        this.comparisonQueue.push({
                            movie1: group[i],
                            movie2: group[j]
                        });
                    }
                }
            }
        });
        
        // Generate comparisons between group winners
        for (let i = 0; i < groups.length - 1; i++) {
            for (let j = i + 1; j < groups.length; j++) {
                const movie1 = groups[i][0];
                const movie2 = groups[j][0];
                const key = this.getComparisonKey(movie1, movie2);
                if (!this.comparisons.has(key)) {
                    this.comparisonQueue.push({
                        movie1: movie1,
                        movie2: movie2
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

    recordComparison(winner, loser) {
        const key = this.getComparisonKey(winner, loser);
        this.comparisons.set(key, {
            winner: winner.id,
            loser: loser.id
        });

        // If queue is empty and we have enough comparisons, we can end early
        if (this.comparisonQueue.length === 0) {
            const records = new Map();
            this.movies.forEach(movie => {
                records.set(movie.id, { wins: 0, losses: 0 });
            });
            
            this.comparisons.forEach((result) => {
                records.get(result.winner).wins++;
                records.get(result.loser).losses++;
            });

            // Calculate win percentages for all movies
            const movieScores = this.movies.map(movie => {
                const record = records.get(movie.id);
                const totalGames = record.wins + record.losses;
                const winPercentage = totalGames > 0 ? record.wins / totalGames : 0;
                return { movie, winPercentage, totalGames };
            });

            // Sort by win percentage to find close matches
            movieScores.sort((a, b) => b.winPercentage - a.winPercentage);

            // Generate additional comparisons for movies with similar win percentages
            for (let i = 0; i < movieScores.length - 1; i++) {
                const current = movieScores[i];
                const next = movieScores[i + 1];
                
                // If win percentages are close (within 8%) and they haven't had many games
                if (Math.abs(current.winPercentage - next.winPercentage) < 0.08 &&
                    (current.totalGames < Math.ceil(Math.log2(this.movies.length)) ||
                     next.totalGames < Math.ceil(Math.log2(this.movies.length)))) {
                    
                    const key = this.getComparisonKey(current.movie, next.movie);
                    if (!this.comparisons.has(key)) {
                        this.comparisonQueue.push({
                            movie1: current.movie,
                            movie2: next.movie
                        });
                    }
                }
            }

            // Add a limited number of comparisons for very close non-adjacent movies
            const maxAdditionalComparisons = Math.ceil(this.movies.length / 2);
            let additionalComparisons = 0;
            
            for (let i = 0; i < movieScores.length && additionalComparisons < maxAdditionalComparisons; i++) {
                // Only look at movies within 3 positions of each other
                for (let j = i + 2; j < Math.min(i + 4, movieScores.length); j++) {
                    const movie1 = movieScores[i];
                    const movie2 = movieScores[j];
                    
                    // If win percentages are very close (within 5%)
                    if (Math.abs(movie1.winPercentage - movie2.winPercentage) < 0.05) {
                        const key = this.getComparisonKey(movie1.movie, movie2.movie);
                        if (!this.comparisons.has(key)) {
                            this.comparisonQueue.push({
                                movie1: movie1.movie,
                                movie2: movie2.movie
                            });
                            additionalComparisons++;
                            if (additionalComparisons >= maxAdditionalComparisons) break;
                        }
                    }
                }
            }
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

    isSortingComplete() {
        return this.comparisonQueue.length === 0;
    }

    getFinalRanking() {
        // First pass: Calculate basic win/loss records
        const records = new Map();
        this.movies.forEach(movie => {
            records.set(movie.id, {
                wins: 0,
                losses: 0,
                opponents: new Map(), // Track results against each opponent
                score: 0 // Will be calculated in second pass
            });
        });

        // Record all comparisons and track opponents
        this.comparisons.forEach((result, key) => {
            const winnerRecord = records.get(result.winner);
            const loserRecord = records.get(result.loser);
            
            winnerRecord.wins++;
            loserRecord.losses++;
            
            // Track head-to-head results
            winnerRecord.opponents.set(result.loser, (winnerRecord.opponents.get(result.loser) || 0) + 1);
            loserRecord.opponents.set(result.winner, (loserRecord.opponents.get(result.winner) || 0) - 1);
        });

        // Calculate initial rankings based on win percentage
        const movieScores = this.movies.map(movie => {
            const record = records.get(movie.id);
            const totalGames = record.wins + record.losses;
            const winPercentage = totalGames > 0 ? record.wins / totalGames : 0;
            return { movie, winPercentage, record };
        });

        // Sort by win percentage to establish initial ranking
        movieScores.sort((a, b) => b.winPercentage - a.winPercentage);

        // Second pass: Calculate weighted scores based on opponent strength
        movieScores.forEach((movieScore, rank) => {
            // Base score components
            const winPercentageScore = movieScore.winPercentage * 100; // 0-100 points
            let qualityWinsScore = 0;
            let strengthOfScheduleScore = 0;
            let consistencyScore = 0;
            
            // Track quality wins and strength of schedule
            let totalOpponentStrength = 0;
            let qualityWins = 0;
            let topTierWins = 0;
            
            movieScore.record.opponents.forEach((result, opponentId) => {
                const opponentRank = movieScores.findIndex(m => m.movie.id === opponentId);
                const opponentPercentile = 1 - (opponentRank / movieScores.length);
                
                if (result > 0) { // Won against this opponent
                    totalOpponentStrength += opponentPercentile;
                    
                    // Quality wins scoring
                    if (opponentPercentile > 0.5) { // Top 50%
                        qualityWins++;
                        if (opponentPercentile > 0.75) { // Top 25%
                            topTierWins++;
                        }
                    }
                    
                    // Bonus for beating higher ranked opponents
                    if (rank > opponentRank) {
                        const rankDiff = rank - opponentRank;
                        qualityWinsScore += (rankDiff / movieScores.length) * 25;
                    }
                }
            });
            
            // Calculate strength of schedule score
            if (movieScore.record.wins > 0) {
                const avgOpponentStrength = totalOpponentStrength / movieScore.record.wins;
                strengthOfScheduleScore = avgOpponentStrength * 40;
            }
            
            // Calculate consistency score
            const winLossRatio = movieScore.record.wins / (movieScore.record.wins + movieScore.record.losses);
            const qualityWinRatio = qualityWins / movieScore.record.wins || 0;
            const topTierWinRatio = topTierWins / movieScore.record.wins || 0;
            
            consistencyScore = (winLossRatio * 20) + // Up to 20 points for overall consistency
                             (qualityWinRatio * 15) + // Up to 15 points for quality wins
                             (topTierWinRatio * 25); // Up to 25 points for top-tier wins
            
            // Combine all scores with weights
            const score = winPercentageScore * 0.35 + // 35% weight for win percentage
                         qualityWinsScore * 0.25 + // 25% weight for quality wins
                         strengthOfScheduleScore * 0.20 + // 20% weight for strength of schedule
                         consistencyScore * 0.20; // 20% weight for consistency

            movieScore.record.score = score;
        });

        // Final sort based on total score
        movieScores.sort((a, b) => b.record.score - a.record.score);

        return movieScores.map(score => score.movie);
    }

    getProgress() {
        // Estimate total comparisons needed based on group structure
        const n = this.movies.length;
        const groupSize = Math.ceil(Math.sqrt(n));
        const numGroups = Math.ceil(n / groupSize);
        
        // Comparisons within groups + comparisons between group winners
        const withinGroupComparisons = numGroups * (groupSize * (groupSize - 1)) / 2;
        const betweenGroupComparisons = (numGroups * (numGroups - 1)) / 2;
        const totalComparisons = Math.min(
            withinGroupComparisons + betweenGroupComparisons,
            Math.ceil(n * Math.log2(n))
        );
        
        const completedComparisons = this.comparisons.size;
        return {
            completed: completedComparisons,
            total: totalComparisons,
            percentage: (completedComparisons / totalComparisons) * 100
        };
    }
}
