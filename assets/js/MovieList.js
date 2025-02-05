export class MovieList {
    constructor(movies = []) {
        this.movies = movies;
        this.validateMovies();
    }

    validateMovies() {
        // Ensure all movies have required properties
        this.movies.forEach(movie => {
            if (!movie.id || !movie.title || !movie.poster) {
                throw new Error(`Invalid movie data: Each movie must have id, title, and poster properties`);
            }
            
            // Ensure IDs are unique
            const idCount = this.movies.filter(m => m.id === movie.id).length;
            if (idCount > 1) {
                throw new Error(`Duplicate movie ID found: ${movie.id}`);
            }
        });
    }

    getMovies() {
        return [...this.movies]; // Return a copy to prevent direct modification
    }

    getMovieById(id) {
        const movie = this.movies.find(movie => movie.id === id);
        if (!movie) {
            throw new Error(`Movie with ID ${id} not found`);
        }
        return { ...movie }; // Return a copy to prevent direct modification
    }

    addMovie(movie) {
        if (!movie.id || !movie.title || !movie.poster) {
            throw new Error('Invalid movie data: id, title, and poster are required');
        }

        // Check for duplicate ID
        if (this.movies.some(m => m.id === movie.id)) {
            throw new Error(`Movie with ID ${movie.id} already exists`);
        }

        this.movies.push(movie);
    }

    removeMovie(id) {
        const index = this.movies.findIndex(movie => movie.id === id);
        if (index === -1) {
            throw new Error(`Movie with ID ${id} not found`);
        }
        this.movies.splice(index, 1);
    }

    updateMovie(id, updates) {
        const index = this.movies.findIndex(movie => movie.id === id);
        if (index === -1) {
            throw new Error(`Movie with ID ${id} not found`);
        }

        // Ensure ID cannot be changed
        if (updates.id && updates.id !== id) {
            throw new Error('Movie ID cannot be changed');
        }

        this.movies[index] = {
            ...this.movies[index],
            ...updates
        };
    }

    clear() {
        this.movies = [];
    }

    size() {
        return this.movies.length;
    }

    // Helper method to check if we have enough movies for comparison
    hasEnoughMovies() {
        return this.movies.length >= 2;
    }
}
