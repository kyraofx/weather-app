# Weatherly

Weatherly is a clean, responsive weather app that shows current conditions for cities around the world. It uses Open-Meteo for location search and live weather data.

## Features

- Search for current weather by city
- View temperature, weather condition, humidity, wind speed, and feels-like temperature
- Clear loading and error states
- Responsive layout for desktop and mobile
- Accessible form labels and live status updates

## Run locally

No build step or dependencies are required. Open `index.html` directly in a browser, or serve the folder with a local web server:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Built with

- HTML
- CSS
- Vanilla JavaScript
- [Open-Meteo Weather API](https://open-meteo.com/)

## Project structure

```text
weather-app/
├── index.html
├── style.css
├── script.js
└── README.md
```
