const HomePage = () => {
  const apps = [
    {
      id: 'kanban-board',
      name: 'Kanban Board',
      description: 'A drag and drop kanban board for task management',
      path: '/kanban-board/index.html'
    },
    {
      id: 'wikipedia-search',
      name: 'Wikipedia Search',
      description: 'A simple Wikipedia search application',
      path: '/wikipedia/index.html'
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'A portfolio theme from anhtus',
      path: '/portfolio/index.html'
    },
    {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'A landing page theme from anhtus',
      path: '/landing-page/index.html'
    },
    {
      id: 'name-generation',
      name: 'Name Generation',
      description: 'A name generation theme from anhtus',
      path: '/name-generation/index.html'
    },
    {
      id: 'white-noise',
      name: 'White Noise',
      description: 'A white noise theme from anhtus',
      path: '/white-noise/index.html'
    }
    // More apps will be added here in the future
  ]
  return `
    <div class="container">
      <h1>JavaScript Demo Applications</h1>
      <div class="apps-grid">
        ${apps.map(app => `
          <div class="app-card">
            <h2>${app.name}</h2>
            <p>${app.description}</p>
            <a href="${app.path}" class="app-link">View Demo</a>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

export default HomePage
