import { MovieList } from './MovieList.js';
import { SortManager } from './SortManager.js';
import { UIManager } from './UIManager.js';
import { MovieService } from './MovieService.js';

class App {
    constructor() {
        this.movieList = new MovieList([]);
        this.sortManager = new SortManager();
        this.uiManager = new UIManager();
        this.movieService = new MovieService();
        
        this.comparisonCount = 0;
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.showMovieInput();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });

        // Single movie form
        document.getElementById('add-movie-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMovie();
        });

        // Bulk upload form
        document.getElementById('bulk-upload-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleBulkUpload();
        });

        // Start ranking button
        document.getElementById('start-ranking').addEventListener('click', () => {
            this.startRanking();
        });

        // Restart button
        document.getElementById('restart-button').addEventListener('click', () => {
            this.restart();
        });
    }

    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-input`).classList.add('active');
    }

    async handleBulkUpload() {
        const textarea = document.getElementById('movie-titles');
        const titles = textarea.value.split('\n').filter(title => title.trim());

        if (titles.length === 0) {
            alert('Please enter at least one movie title');
            return;
        }

        const progress = document.getElementById('upload-progress');
        const progressFill = progress.querySelector('.progress-fill');
        const progressText = document.getElementById('progress-text');

        progress.classList.remove('hidden');
        progressFill.style.width = '0%';

        try {
            const { movies, errors } = await this.movieService.bulkSearch(titles);
            
            // Add successfully found movies
            movies.forEach(movie => {
                try {
                    this.movieList.addMovie(movie);
                } catch (error) {
                    console.error('Error adding movie:', error);
                }
            });

            // Update UI
            this.updateMovieList();
            this.updateStartButton();
            textarea.value = '';

            // Show results
            if (errors.length > 0) {
                const errorMessage = `Added ${movies.length} movies.\nFailed to find ${errors.length} movies:\n${
                    errors.map(e => `- ${e.title}: ${e.error}`).join('\n')
                }`;
                alert(errorMessage);
            } else {
                alert(`Successfully added ${movies.length} movies!`);
            }
        } catch (error) {
            alert('Error during bulk upload: ' + error.message);
        } finally {
            progress.classList.add('hidden');
        }
    }

    async addMovie() {
        const titleInput = document.getElementById('movie-title');
        const posterInput = document.getElementById('movie-poster-url');
        
        const title = titleInput.value.trim();
        if (!title) {
            alert('Please enter a movie title');
            return;
        }

        try {
            // If a custom poster URL is provided, use it instead of searching OMDB
            if (posterInput.value.trim()) {
                const movie = {
                    id: Date.now(),
                    title,
                    poster: posterInput.value.trim()
                };
                this.movieList.addMovie(movie);
            } else {
                // Search OMDB for movie data
                const movie = await this.movieService.searchMovie(title);
                this.movieList.addMovie(movie);
            }

            // Update UI
            this.updateMovieList();
            titleInput.value = '';
            posterInput.value = '';
            this.updateStartButton();
        } catch (error) {
            alert(error.message);
        }
    }

    removeMovie(id) {
        this.movieList.removeMovie(id);
        this.updateMovieList();
        this.updateStartButton();
    }

    updateMovieList() {
        const moviesList = document.getElementById('added-movies');
        moviesList.innerHTML = '';
        
        this.movieList.getMovies().forEach(movie => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${movie.title}</span>
                <button class="remove-movie" data-id="${movie.id}">Remove</button>
            `;
            
            li.querySelector('.remove-movie').addEventListener('click', () => {
                this.removeMovie(movie.id);
            });
            
            moviesList.appendChild(li);
        });
    }

    updateStartButton() {
        const startButton = document.getElementById('start-ranking');
        startButton.disabled = this.movieList.getMovies().length < 2;
    }

    showMovieInput() {
        document.getElementById('movie-input-container').classList.add('active');
        document.getElementById('movie-input-container').classList.remove('hidden');
        document.getElementById('comparison-container').classList.add('hidden');
        document.getElementById('comparison-container').classList.remove('active');
        document.getElementById('results-container').classList.add('hidden');
        document.getElementById('results-container').classList.remove('active');
    }

    startRanking() {
        if (this.movieList.getMovies().length < 2) {
            alert('Please add at least 2 movies to start ranking');
            return;
        }

        document.getElementById('movie-input-container').classList.add('hidden');
        document.getElementById('movie-input-container').classList.remove('active');
        document.getElementById('comparison-container').classList.add('active');
        document.getElementById('comparison-container').classList.remove('hidden');

        this.sortManager.initialize(this.movieList.getMovies());
        this.setupChooseButtonListeners();
        this.showNextComparison();
    }

    setupChooseButtonListeners() {
        console.log('Setting up choose button listeners');
        const leftButton = document.querySelector('#movie-left .choose-button');
        const rightButton = document.querySelector('#movie-right .choose-button');
        
        // Clear existing listeners
        const newLeftButton = leftButton.cloneNode(true);
        const newRightButton = rightButton.cloneNode(true);
        
        leftButton.parentNode.replaceChild(newLeftButton, leftButton);
        rightButton.parentNode.replaceChild(newRightButton, rightButton);
        
        // Add new listeners
        newLeftButton.addEventListener('click', () => {
            console.log('Left button clicked');
            const leftCard = document.getElementById('movie-left');
            const movieId = parseInt(leftCard.getAttribute('data-movie-id'));
            console.log('Left movie ID:', movieId);
            this.handleChoice(movieId);
        });
        
        newRightButton.addEventListener('click', () => {
            console.log('Right button clicked');
            const rightCard = document.getElementById('movie-right');
            const movieId = parseInt(rightCard.getAttribute('data-movie-id'));
            console.log('Right movie ID:', movieId);
            this.handleChoice(movieId);
        });
    }

    handleChoice(chosenMovieId) {
        console.log('Handling choice for movie ID:', chosenMovieId);
        const comparison = this.sortManager.getCurrentComparison();
        console.log('Current comparison:', comparison);
        
        if (!comparison) {
            console.error('No current comparison found');
            return;
        }
        
        if (chosenMovieId === comparison.movie1.id) {
            console.log('Chose movie1:', comparison.movie1.title);
            this.sortManager.recordComparison(comparison.movie1, comparison.movie2);
        } else if (chosenMovieId === comparison.movie2.id) {
            console.log('Chose movie2:', comparison.movie2.title);
            this.sortManager.recordComparison(comparison.movie2, comparison.movie1);
        } else {
            console.error('Chosen movie ID does not match either comparison movie');
            return;
        }

        this.comparisonCount++;
        this.updateProgress();

        if (this.sortManager.isSortingComplete()) {
            this.showResults();
        } else {
            this.showNextComparison();
        }
    }

    showNextComparison() {
        const comparison = this.sortManager.getNextComparison();
        if (!comparison) {
            this.showResults();
            return;
        }

        this.uiManager.updateComparisonView(comparison.movie1, comparison.movie2);
        this.setupChooseButtonListeners(); // Re-attach listeners after updating view
    }

    updateProgress() {
        document.getElementById('comparisons-count').textContent = this.comparisonCount;
    }

    showResults() {
        const rankedMovies = this.sortManager.getFinalRanking();
        this.uiManager.showResults(rankedMovies);
    }

    restart() {
        this.comparisonCount = 0;
        this.updateProgress();
        this.showMovieInput();
        this.movieList = new MovieList([]);
        this.updateMovieList();
        this.updateStartButton();
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
