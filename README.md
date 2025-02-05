# Movie Ranker  

A simple web app to rank movies by comparing them in pairs.

# Movie Ranker

An interactive web application for ranking movies through pairwise comparisons.

## Quick Start (No Installation Required)

## Getting an OMDB API Key

This app uses the [OMDb API](http://www.omdbapi.com/) to fetch movie data. To use the app, you'll need to get a free API key from their website:

1. Go to http://www.omdbapi.com/apikey.aspx
2. Enter your email address and click "Subscribe"
3. You'll receive an API key via email 
4. Enter this API key in the input field on the app's homepage

With a valid API key, the app will be able to fetch movie data like titles, posters, and more from the OMDb database.

### Using Python's Built-in Server (Recommended)

1. Download and unzip the movie-ranker.zip file
2. Open a terminal/command prompt in the unzipped directory
3. Run one of these commands based on your Python version:

   Python 3.x:
   ```bash
   python -m http.server 8080
   ```

   Python 2.x:
   ```bash
   python -m SimpleHTTPServer 8080
   ```

4. Open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

### Using Any Web Server

Since this is a static web application, you can use any web server to host it:

- Visual Studio Code's Live Server extension
- XAMPP
- Any other web server of your choice

Simply point your web server to the unzipped directory.

### Running Directly

You can also open the index.html file directly in your browser, though this is not recommended as some browsers restrict certain features when running files directly from the filesystem.

## Features

- Interactive movie comparison interface
- Efficient sorting algorithm to minimize comparisons
- Clean and intuitive user interface
- Final ranked list generation
- Works completely in the browser with no external dependencies

## Technical Details

- Built with vanilla JavaScript
- Uses HTML5 and CSS3 for modern web features
- Responsive design that works on both desktop and mobile browsers
- No build process or installation required
- No external dependencies

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+


