# Wikipedia API Documentation

The Wikipedia API provides various endpoints to search articles and retrieve article content. This documentation covers the main endpoints and their usage.

## Base URL

```
https://en.wikipedia.org/w/api.php
```

## Common Parameters

These parameters are frequently used across different endpoints:

- `format=json`: Returns results in JSON format
- `origin=*`: Enables CORS support for browser requests
- `action=query`: Specifies that we're querying the Wikipedia API

## 1. Article Retrieval

### Get Full Article

Retrieves a complete article with images and metadata.

**Endpoint:**

```
?action=query&titles={TITLE}&prop=extracts|pageimages|info&pithumbsize=400&inprop=url&redirects=&format=json&origin=*
```

**Parameters:**

- `titles`: The title of the article to retrieve
- `prop`: Properties to fetch
  - `extracts`: Gets article content
  - `pageimages`: Gets article images
  - `info`: Gets article metadata
- `pithumbsize`: Thumbnail size in pixels
- `inprop=url`: Includes the article URL
- `redirects`: Follows redirects if necessary

**Example:**

```
https://en.wikipedia.org/w/api.php?action=query&titles=JavaScript&prop=extracts|pageimages|info&pithumbsize=400&inprop=url&redirects=&format=json&origin=*
```

### Get First Paragraph

Retrieves only the introduction paragraph of an article.

**Endpoint:**

```
?action=query&titles={TITLE}&prop=extracts&format=json&exintro=1&origin=*
```

**Parameters:**

- `exintro=1`: Limits the extract to the introduction

## 2. Search Functionality

### Basic Search

Searches for articles with extracts and images.

**Endpoint:**

```
?action=query&generator=search&gsrsearch={QUERY}&gsrlimit=20&prop=pageimages|extracts&exintro&explaintext&exlimit=max&format=json&origin=*
```

**Parameters:**

- `generator=search`: Enables search functionality
- `gsrsearch`: The search query
- `gsrlimit`: Number of results to return (max 20)
- `prop`: Properties to fetch
  - `pageimages`: Gets thumbnail images
  - `extracts`: Gets article extracts
- `explaintext`: Returns plain text instead of HTML
- `exintro`: Only returns the introduction
- `exlimit=max`: Maximum length for extracts

**Example:**

```
https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=20&prop=pageimages|extracts&exintro&explaintext&exlimit=max&format=json&origin=*&gsrsearch=javascript
```

## 3. Response Format

### Article Response

```json
{
  "query": {
    "pages": {
      "pageId": {
        "pageid": number,
        "title": string,
        "extract": string,
        "thumbnail": {
          "source": string,
          "width": number,
          "height": number
        },
        "fullurl": string
      }
    }
  }
}
```

### Search Response

```json
{
  "query": {
    "pages": {
      "pageId": {
        "pageid": number,
        "title": string,
        "extract": string,
        "thumbnail": {
          "source": string,
          "width": number,
          "height": number
        }
      }
    }
  }
}
```
