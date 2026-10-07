// Keep the API addresses in one place so they are easy to find and understand.
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

// Store the HTML elements that the app needs to read from or update.
const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");
const message = document.querySelector("#message");
const weatherCard = document.querySelector("#weather-card");

const cityName = document.querySelector("#city-name");
const weatherIcon = document.querySelector("#weather-icon");
const weatherCondition = document.querySelector("#weather-condition");
const temperature = document.querySelector("#temperature");
const temperatureUnit = document.querySelector("#temperature-unit");
const feelsLike = document.querySelector("#feels-like");
const feelsLikeUnit = document.querySelector("#feels-like-unit");
const humidity = document.querySelector("#humidity");
const humidityUnit = document.querySelector("#humidity-unit");
const windSpeed = document.querySelector("#wind-speed");
const windUnit = document.querySelector("#wind-unit");

// Open-Meteo returns a WMO weather code instead of a written description.
// This object turns each code into text and a simple icon for the page.
const weatherCodes = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Fog", icon: "🌫️" },
  48: { description: "Rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Drizzle", icon: "🌦️" },
  55: { description: "Heavy drizzle", icon: "🌧️" },
  56: { description: "Light freezing drizzle", icon: "🌧️" },
  57: { description: "Freezing drizzle", icon: "🌧️" },
  61: { description: "Light rain", icon: "🌦️" },
  63: { description: "Rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌨️" },
  67: { description: "Freezing rain", icon: "🌨️" },
  71: { description: "Light snow", icon: "🌨️" },
  73: { description: "Snow", icon: "❄️" },
  75: { description: "Heavy snow", icon: "❄️" },
  77: { description: "Snow grains", icon: "❄️" },
  80: { description: "Light rain showers", icon: "🌦️" },
  81: { description: "Rain showers", icon: "🌧️" },
  82: { description: "Heavy rain showers", icon: "⛈️" },
  85: { description: "Light snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "❄️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with hail", icon: "⛈️" },
  99: { description: "Severe thunderstorm with hail", icon: "⛈️" },
};

// fetch() sends a request to a URL and returns a Promise. A Promise represents
// a result that will arrive later. "await" pauses this async function until the
// response arrives, without freezing the rest of the browser page.
async function getCoordinates(city) {
  const url = `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("The city search service is unavailable. Please try again.");
  }

  // response.json() reads the response body and converts its JSON into a
  // regular JavaScript object. It is asynchronous, so we await it too.
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Check the spelling and try again.");
  }

  // The first result includes the coordinates needed by the weather API.
  return data.results[0];
}

// Open-Meteo's forecast endpoint accepts latitude and longitude. The "current"
// parameter lists only the current weather values this app needs.
async function getCurrentWeather(latitude, longitude) {
  const currentFields = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "weather_code",
    "wind_speed_10m",
  ].join(",");

  const url = `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=${currentFields}&timezone=auto`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather data is unavailable right now. Please try again.");
  }

  return response.json();
}

// Update the visible HTML with values extracted from the API response.
function displayWeather(location, weatherData) {
  const current = weatherData.current;
  const units = weatherData.current_units;
  const condition = weatherCodes[current.weather_code] || {
    description: "Current conditions",
    icon: "🌡️",
  };

  const locationParts = [location.name, location.admin1, location.country].filter(Boolean);
  cityName.textContent = locationParts.join(", ");
  weatherCondition.textContent = condition.description;
  weatherIcon.textContent = condition.icon;
  weatherIcon.setAttribute("aria-label", condition.description);

  temperature.textContent = Math.round(current.temperature_2m);
  temperatureUnit.textContent = units.temperature_2m;
  feelsLike.textContent = Math.round(current.apparent_temperature);
  feelsLikeUnit.textContent = units.apparent_temperature;
  humidity.textContent = current.relative_humidity_2m;
  humidityUnit.textContent = units.relative_humidity_2m;
  windSpeed.textContent = Math.round(current.wind_speed_10m);
  windUnit.textContent = units.wind_speed_10m;

  weatherCard.hidden = false;
  message.textContent = `Updated with current weather for ${location.name}.`;
  message.classList.remove("message--error");
}

function showError(errorText) {
  weatherCard.hidden = true;
  message.textContent = errorText;
  message.classList.add("message--error");
}

function setLoading(isLoading) {
  searchButton.disabled = isLoading;
  searchButton.textContent = isLoading ? "Searching…" : "Search";
}

// Submitting the form starts the full request flow:
// city name -> coordinates -> current weather -> updated page.
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) return;

  setLoading(true);
  message.textContent = `Looking up weather for ${city}…`;
  message.classList.remove("message--error");

  try {
    // await lets these two dependent requests run in a clear, top-to-bottom order.
    const location = await getCoordinates(city);
    const weatherData = await getCurrentWeather(location.latitude, location.longitude);

    displayWeather(location, weatherData);
  } catch (error) {
    // A failed network request or unknown city ends up here.
    showError(error.message || "Something went wrong. Please try again.");
  } finally {
    // finally runs after either success or failure, so the button always resets.
    setLoading(false);
  }
});
