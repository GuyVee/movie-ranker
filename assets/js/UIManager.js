export class UIManager {
  constructor() {
    this.comparisonContainer = document.getElementById('comparison-container');
    this.resultsContainer = document.getElementById('results-container');
    this.rankingsList = document.getElementById('rankings-list');
    this.movieCards = document.querySelectorAll('.movie-card');
    this.apiKey = '';
    this.bindApiKeyInput();
  }

  bindApiKeyInput() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    apiKeyInput.addEventListener('input', (event) => {
      this.apiKey = event.target.value;
    });
  }

  updateComparisonView(movie1, movie2) {
    console.log('Updating comparison view:', { movie1, movie2 });

    // Update left movie card
    const leftCard = document.getElementById('movie-left');
    leftCard.setAttribute('data-movie-id', movie1.id);
    const leftPoster = leftCard.querySelector('.movie-poster');
    leftPoster.src = movie1.poster;
    leftPoster.alt = `${movie1.title} Poster`;
    const leftTitle = leftCard.querySelector('.movie-title');
    leftTitle.textContent = movie1.title;
    const leftButton = leftCard.querySelector('.choose-button');
    leftButton.textContent = `Choose ${movie1.title}`;

    // Update right movie card
    const rightCard = document.getElementById('movie-right');
    rightCard.setAttribute('data-movie-id', movie2.id);
    const rightPoster = rightCard.querySelector('.movie-poster');
    rightPoster.src = movie2.poster;
    rightPoster.alt = `${movie2.title} Poster`;
    const rightTitle = rightCard.querySelector('.movie-title');
    rightTitle.textContent = movie2.title;
    const rightButton = rightCard.querySelector('.choose-button');
    rightButton.textContent = `Choose ${movie2.title}`;

    console.log('Updated movie cards:', {
      leftId: leftCard.getAttribute('data-movie-id'),
      rightId: rightCard.getAttribute('data-movie-id')
    });

    // Ensure comparison view is visible
    this.showComparisonView();
  }

  showComparisonView() {
    this.comparisonContainer.classList.add('active');
    this.comparisonContainer.classList.remove('hidden');
    this.resultsContainer.classList.add('hidden');
    this.resultsContainer.classList.remove('active');
  }

  showResults(rankedMovies) {
    // Clear previous results
    this.rankingsList.innerHTML = '';

    // Create and append ranked movie items
    rankedMovies.forEach((movie, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="ranked-movie">
          <span class="rank">#${index + 1}</span>
          <span class="title">${movie.title}</span>
        </div>
      `;
      this.rankingsList.appendChild(li);
    });

    // Show results view
    this.comparisonContainer.classList.add('hidden');
    this.comparisonContainer.classList.remove('active');
    this.resultsContainer.classList.add('active');
    this.resultsContainer.classList.remove('hidden');
  }

  // Add loading state to UI elements
  setLoading(isLoading) {
    this.movieCards.forEach(card => {
      const button = card.querySelector('.choose-button');
      if (isLoading) {
        button.disabled = true;
        button.textContent = 'Loading...';
      } else {
        button.disabled = false;
        button.textContent = 'Choose This Movie';
      }
    });
  }

  // Show error message to user
  showError(message) {
    // You could implement a more sophisticated error display system here
    alert(message);
  }

  // Update progress indicator with percentage  
  updateProgress(progress) {
    const progressIndicator = document.getElementById('progress-indicator');
    progressIndicator.textContent = `${progress.completed} of ${progress.total} comparisons (${Math.round(progress.percentage)}%)`;
  }

  // Enable/disable UI controls
  setControlsEnabled(enabled) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = !enabled;
    });
  }

  // Add animation when transitioning between movies
  animateTransition() {
    this.movieCards.forEach(card => {
      card.style.opacity = '0';
      setTimeout(() => {
        card.style.opacity = '1';
      }, 300);
    });
  }
}
