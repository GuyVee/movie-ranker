import { config } from './config.js';

export class MovieService {
    constructor() {
        this.apiKey = config.OMDB_API_KEY;
        this.baseUrl = 'https://www.omdbapi.com';
    }

    async searchMovie(title) {
        try {
            const url = `${this.baseUrl}/?i=tt3896198&apikey=${this.apiKey}&t=${encodeURIComponent(title)}`;
            console.log('Fetching movie:', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch movie data');
            }
            
            const data = await response.json();
            if (data.Response === 'False') {
                throw new Error(data.Error || 'Movie not found');
            }

            return {
                title: data.Title,
                poster: data.Poster !== 'N/A' ? data.Poster : 
                    `https://placehold.co/300x450/2c3e50/ffffff?text=${encodeURIComponent(data.Title)}`,
                year: data.Year,
                id: Date.now() // Use timestamp as unique ID
            };
        } catch (error) {
            console.error('Error fetching movie:', error);
            // Return a basic movie object with placeholder image if API fails
            return {
                title,
                poster: `https://placehold.co/300x450/2c3e50/ffffff?text=${encodeURIComponent(title)}`,
                id: Date.now()
            };
        }
    }

    async bulkSearch(titles) {
        const uniqueTitles = [...new Set(titles.map(title => title.trim()))];
        const movies = [];
        const errors = [];

        for (const title of uniqueTitles) {
            if (!title) continue;
            
            try {
                const movie = await this.searchMovie(title);
                movies.push(movie);
            } catch (error) {
                errors.push({ title, error: error.message });
            }

            // Add a small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        return { movies, errors };
    }
}
