class WikipediaAPI {
  constructor() {
    this.baseUrl = 'https://en.wikipedia.org/w/api.php';
  }

  async searchArticles(query) {
    const params = {
      action: 'query',
      generator: 'search',
      gsrlimit: 20,
      prop: 'pageimages|extracts',
      exintro: true,
      explaintext: true,
      exlimit: 'max',
      format: 'json',
      gsrsearch: query,
      origin: '*'
    };

    const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch search results');
    return response.json();
  }

  async getArticle(title) {
    const params = {
      action: 'query',
      titles: title,
      prop: 'extracts|pageimages|info',
      pithumbsize: 400,
      inprop: 'url',
      redirects: '',
      format: 'json',
      origin: '*'
    };

    const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch article');
    return response.json();
  }

  async searchSuggestions(query) {
    const params = {
      action: 'query',
      generator: 'search',
      gsrlimit: 5,
      prop: 'extracts',
      exintro: true,
      explaintext: true,
      exlimit: 'max',
      format: 'json',
      gsrsearch: query,
      origin: '*'
    };

    const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    return response.json();
  }
}

class WikipediaUI {
  constructor() {
    this.api = new WikipediaAPI();
    this.initElements();
    this.initEventListeners();
    this.suggestionBox = document.querySelector('.suggestion-box');
    this.searchDebounceTimer = null;
    this.setupSearchInput();
  }

  initElements() {
    this.form = document.querySelector('.search-form');
    this.searchInput = document.querySelector('.search-input');
    this.searchResults = document.querySelector('.search-results');
    this.resultsContainer = document.querySelector('.results-container');
    this.articleDetail = document.querySelector('.article-detail');
    this.articleContent = document.querySelector('.article-content');
    this.loading = document.querySelector('.loading');
    this.error = document.querySelector('.error');
    this.backBtn = document.querySelector('.back-btn');
  }

  initEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSearch(e));
    this.backBtn.addEventListener('click', () => this.showSearchResults());
  }

  setupSearchInput() {
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      // Clear previous timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      // Hide suggestion box if query is too short
      if (query.length < 3) {
        this.hideSuggestions();
        return;
      }

      // Debounce search suggestions (300ms)
      this.searchDebounceTimer = setTimeout(() => {
        this.fetchSuggestions(query);
      }, 300);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && !this.suggestionBox.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  showLoading() {
    this.loading.classList.remove('hide');
    this.error.classList.add('hide');
  }

  hideLoading() {
    this.loading.classList.add('hide');
  }

  showError(message) {
    this.error.textContent = message;
    this.error.classList.remove('hide');
    this.hideLoading();
  }

  async handleSearch(e) {
    e.preventDefault();
    this.hideSuggestions();
    const query = this.searchInput.value.trim();
    if (query.length < 3) {
      this.showError('Please enter at least 3 characters');
      return;
    }

    this.showLoading();
    try {
      const data = await this.api.searchArticles(query);
      if (!data.query) {
        this.showError('No results found');
        return;
      }
      this.displaySearchResults(data.query.pages);
    } catch (error) {
      this.showError('Failed to fetch results. Please try again.');
    }
  }

  async fetchSuggestions(query) {
    try {
      const data = await this.api.searchSuggestions(query);
      if (!data.query) {
        this.hideSuggestions();
        return;
      }
      this.displaySuggestions(data.query.pages);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      this.hideSuggestions();
    }
  }

  displaySearchResults(results) {
    this.hideLoading();
    this.searchResults.classList.remove('hide');
    this.articleDetail.classList.add('hide');

    this.resultsContainer.innerHTML = '';
    Object.values(results)
      .sort((a, b) => b.index - a.index)
      .forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
                    ${result.thumbnail ?
            `<img src="${result.thumbnail.source}" alt="${result.title}">`
            : ''}
                    <h3>${result.title}</h3>
                    <p>${result.extract.substring(0, 150)}...</p>
                `;
        card.addEventListener('click', () => this.handleArticleClick(result.title));
        this.resultsContainer.appendChild(card);
      });
  }

  displaySuggestions(results) {
    if (!results || Object.keys(results).length === 0) {
      this.hideSuggestions();
      return;
    }

    this.suggestionBox.innerHTML = '';
    Object.values(results)
      .sort((a, b) => b.index - a.index)
      .forEach(result => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
                    <div class="title">${result.title}</div>
                    ${result.extract ? `<div class="excerpt">${result.extract.substring(0, 100)}...</div>` : ''}
                `;

        item.addEventListener('click', () => {
          this.searchInput.value = result.title;
          this.hideSuggestions();
          this.handleArticleClick(result.title);
        });

        this.suggestionBox.appendChild(item);
      });

    this.suggestionBox.classList.remove('hide');
  }

  hideSuggestions() {
    this.suggestionBox.classList.add('hide');
    this.suggestionBox.innerHTML = '';
  }

  async handleArticleClick(title) {
    this.showLoading();
    try {
      const data = await this.api.getArticle(title);
      const page = Object.values(data.query.pages)[0];
      this.displayArticle(page);
    } catch (error) {
      this.showError('Failed to fetch article. Please try again.');
    }
  }

  displayArticle(article) {
    this.hideLoading();
    this.searchResults.classList.add('hide');
    this.articleDetail.classList.remove('hide');

    this.articleContent.innerHTML = `
            <h2>${article.title}</h2>
            ${article.thumbnail ?
        `<img src="${article.thumbnail.source}" alt="${article.title}">`
        : ''}
            ${article.extract}
        `;
  }

  showSearchResults() {
    this.articleDetail.classList.add('hide');
    this.searchResults.classList.remove('hide');
  }
}

// Initialize the application
new WikipediaUI();
