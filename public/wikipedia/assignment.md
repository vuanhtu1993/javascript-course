# Wikipedia Search Application Assignment

## Overview

Create a Wikipedia search application using vanilla JavaScript that allows users to search for articles and view their content. The application should use the Wikipedia API to fetch data and provide a clean, responsive user interface.

## Requirements

### Core Features

1. Search Functionality
   - Implement a search form with input validation
   - Display search results in a grid layout
   - Show article thumbnails when available
   - Display article excerpts in search results
   - Minimum 3 characters required for search

2. Article Display
   - Show full article content when clicked
   - Display article images
   - Implement a "Back to results" feature
   - Maintain search results state when going back

3. User Interface
   - Loading states during API calls
   - Error handling and user feedback
   - Responsive design for all screen sizes
   - Smooth transitions between views

### Technical Requirements

1. API Integration
   - Use the Wikipedia API endpoints provided
   - Implement proper error handling for API calls
   - Handle API rate limiting and network errors
   - Properly format API requests with required parameters

2. Code Structure
   - Use ES6+ features
   - Implement class-based architecture
   - Separate API logic from UI logic
   - Use async/await for API calls
   - Implement proper event handling

3. CSS Requirements
   - Use CSS Grid for search results layout
   - Implement responsive design
   - Create loading animations
   - Style card-based interface for results
   - Add hover effects and transitions

### Bonus Features

1. Advanced search options
   - Filter by title only
   - Search with prefixes
   - Implement category filtering

2. UI Enhancements
   - Infinite scroll for search results
   - Image gallery for articles with multiple images
   - Save recent searches
   - Dark mode toggle

## Evaluation Criteria

1. Code Quality (40%)
   - Clean, readable code
   - Proper error handling
   - Efficient API usage
   - Modern JavaScript practices

2. User Interface (30%)
   - Responsive design
   - Loading states
   - Error messages
   - Visual appeal

3. Functionality (30%)
   - Search works correctly
   - Article display works properly
   - Navigation functions correctly
   - Performance optimization

## API Documentation

The Wikipedia API endpoints and their parameters are documented in the `wikipedia.api.md` file. Key endpoints:

1. Search Articles:

```
/w/api.php?action=query&generator=search&gsrlimit=20&prop=pageimages|extracts&exintro&explaintext&exlimit=max&format=json&gsrsearch=[QUERY]
```

2. Get Article:

```
/w/api.php?action=query&titles=[TITLE]&prop=extracts|pageimages|info&pithumbsize=400&inprop=url&redirects=&format=json
```

## Submission Guidelines

1. Code should be well-commented and formatted
2. Include a README with setup instructions
3. Document any known issues or limitations
4. List any additional features implemented
