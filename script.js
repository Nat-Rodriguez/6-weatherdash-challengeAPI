// Variables
var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'b3f18d73949d71fcf80598e24bc5e4ad';

var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayWeather = document.querySelector('#today-weather');
var forecastWeather = document.querySelector('#forecast-weather');
var searchHistoryContainer = document.querySelector('.search-history');

function renderSearchHistory() {
  searchHistoryContainer.innerHTML = '';

  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement('button');
    btn.textContent = searchHistory[i];
    searchHistoryContainer.appendChild(btn);
  }
}

function appendToHistory(search) {
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);
  localStorage.setItem('search-history', JSON.stringify(searchHistory));
  renderSearchHistory();
}

function initSearchHistory() {
  var storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
}

function renderCurrentWeather(city, weather) {
  todayWeather.innerHTML = '';
  
  var card = document.createElement('div');
  var heading = document.createElement('h3');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  card.classList.add('weather-card');
  heading.textContent = `${city}`;
  tempEl.textContent = `Temperature: ${weather.main.temp}°F`;
  windEl.textContent = `Wind: ${weather.wind.speed} MPH`;
  humidityEl.textContent = `Humidity: ${weather.main.humidity}%`;
  card.append(heading, tempEl, windEl, humidityEl);

  todayWeather.appendChild(card);
}

// function renderForecast(dailyForecast) {
//   forecastWeather.innerHTML = '';

//   // Loop through the daily forecast data, considering only the data at noon for each day.
//   for (var i = 0; i < dailyForecast.length; i++) {
//     var forecast = dailyForecast[i];

//     // Check if the data corresponds to noon (12:00 PM) for each day.
//     if (forecast.dt_txt.includes('12:00:00')) {
//       var card = document.createElement('div');
//       var date = dayjs(forecast.dt_txt).format('MMMM D, YYYY');
//       var tempEl = document.createElement('p');
//       var windEl = document.createElement('p');
//       var humidityEl = document.createElement('p');

//       card.classList.add('forecast-card');
//       tempEl.textContent = `Temperature: ${forecast.main.temp}°F`;
//       windEl.textContent = `Wind: ${forecast.wind.speed} MPH`;
//       humidityEl.textContent = `Humidity: ${forecast.main.humidity}%`;
//       card.append(date, tempEl, windEl, humidityEl);

//       forecastWeather.appendChild(card);
//     }
//   }
// }

function renderForecast(dailyForecast) {
  forecastWeather.innerHTML = '';

  // Filter the daily forecast data to retrieve only the forecasts at 12:00 PM (noon)
  var filteredForecast = dailyForecast.filter(function (forecast) {
    return forecast.dt_txt.includes('12:00:00');
  });

  // Create cards for each day's noon forecast
  filteredForecast.forEach(function (forecast) {
    var card = document.createElement('div');
    card.classList.add('forecast-card');

    var date = dayjs(forecast.dt_txt).format('MMMM D, YYYY');
    var time = dayjs(forecast.dt_txt).format('h:mm A');

    var heading = document.createElement('h3');
    heading.textContent = date;
    card.appendChild(heading);

    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    tempEl.textContent = `${time} - Temperature: ${forecast.main.temp}°F`;
    windEl.textContent = `Wind: ${forecast.wind.speed} MPH`;
    humidityEl.textContent = `Humidity: ${forecast.main.humidity}%`;

    card.appendChild(tempEl);
    card.appendChild(windEl);
    card.appendChild(humidityEl);

    forecastWeather.appendChild(card);
  });
}


function fetchWeather(location) {
  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderCurrentWeather(location.name, data.list[0]);
      renderForecast(data.list);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchCoords(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchFormSubmit(e) {
  if (!searchInput.value) {
    return;
  }

  e.preventDefault();
  var search = searchInput.value.trim();
  fetchCoords(search);
  searchInput.value = '';
}

function handleSearchHistoryClick(e) {
  if (!e.target.matches('button')) {
    return;
  }

  var btn = e.target;
  var search = btn.textContent;
  fetchCoords(search);
}

initSearchHistory();
searchForm.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);
