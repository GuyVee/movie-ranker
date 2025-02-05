import { UIManager } from './UIManager.js';

const BASE_URL = 'https://www.omdbapi.com/';

export class MovieService {
  constructor() {
    this.uiManager = new UIManager();
  }

  async fetchMovieData(title) {
    const apiKey = this.uiManager.apiKey;
    const url = `${BASE_URL}?apikey=${apiKey}&t=${encodeURIComponent(title)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  async bulkSearch(titles) {
    const apiKey = this.uiManager.apiKey;
    const uniqueTitles = [...new Set(titles.map(title => title.trim()))];
    const movies = [];
    const errors = [];

    for (const title of uniqueTitles) {
      if (!title) continue;
      
      try {
        const url = `${BASE_URL}?apikey=${apiKey}&t=${encodeURIComponent(title)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
          movies.push({
            title: data.Title,
            poster: data.Poster !== 'N/A' ? data.Poster : `https://placehold.co/300x450/2c3e50/ffffff?text=${encodeURIComponent(data.Title)}`,
            year: data.Year,
            id: Date.now() // Use timestamp as unique ID
          });
        } else {
          errors.push({ title, error: data.Error || 'Movie not found' });
        }
      } catch (error) {
        errors.push({ title, error: error.message });
      }

      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    return { movies, errors };
  }
}
