Add your audio files here and list them in playlist.json.

Example playlist.json format:

[
  { "title": "White Noise", "file": "white-noise.mp3" },
  { "title": "Rain", "file": "rain.mp3" },
  { "title": "Waves", "src": "/sound/ocean-waves.mp3" }
]

Notes:
- Use either "file" (relative to /sound) or full "src".
- Files are served from /sound/... and never uploaded to a server.
