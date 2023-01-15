
   const searchBtn = $('#searchBtn');
   const searchInput = $('#searchInput');
   const weatherContainer = $('#forecast-container');
   const historyContainer = $('#history-container');
   
   const fiveDay = [];
   let currentDate;
   let history = [];
   
   
   
   const fetchBoxes = () => {
       const cityName = searchInput.val();
       let cityURL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=ac55089ffb39347b9420983d370ea66f`
       let lat;
       let lon;
   
       fetch(cityURL)
       .then(response => response.json())
   
       .then(data => {
           lat = data[0].lat;
           lon = data[0].lon;
           if (history.length > 0) {
               const index = history.findIndex(element => element.name === cityName);
               if (index !== -1) {
                   history.splice(index, 1);
               }
           }
           const currentCity = {
               name: cityName,
               lon: lon,
               lat: lat
           };
           history.unshift(currentCity);
           localStorage.setItem('history', JSON.stringify(history));
           history = JSON.parse(localStorage.getItem('history'));
           setHistory();
           fetchWeather(lon, lat);
       })
   };
   
   
   const fetchWeather = (x, y) => {
       weatherContainer.empty();
       let weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${y}&lon=${x}&appid=ac55089ffb39347b9420983d370ea66f&units=imperial`
       
       fetch(weatherURL)
       .then(response => response.json())
       
       .then(data => {
           currentDate = dayjs(data.list[0].dt_txt).format('M/D/YYYY');
           fiveDayForecast(data);
   
           // Row 1 Info Box
           weatherContainer.append($('<div>').addClass('row'), $('<div>').addClass('row my-3'), $('<div>').addClass('row justify-content-between'));
           weatherContainer.children().eq(0).append($('<div>').addClass('container bg-dark text-light mt-2').attr('id', 'info-box'));
           for (let i = 0; i < 4; i++) {
               $('#info-box').append($('<div>').addClass('row align-items-center'));
           };
   
           const infoHead = '<h2>' + data.city.name + " (" + dayjs(data.list[0].dt_txt).format('M/D/YYYY') + ")<img src='http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + ".png'>";
           $('#info-box').children().eq(0).append(infoHead);
           $('#info-box').children().eq(1).append($('<p>').text(`Temp: ${data.list[0].main.temp}°F`));
           $('#info-box').children().eq(2).append($('<p>').text(`Wind: ${data.list[0].wind.speed} MPH`));
           $('#info-box').children().eq(3).append($('<p>').text(`Humidity: ${data.list[0].main.humidity}%`))
   
           // Row 2 Info Box
           weatherContainer.children().eq(1).append($('<h4>').text('5-Day Forecast:'));
           
           // Row 3 Info Box
           for (let i = 0; i < 5; i++) {
               weatherContainer.children().eq(2).append($('<div>').addClass('card col-2 text-light bg-dark').append($('<div>').addClass('card-body')));
               weatherContainer.children().eq(2).children().eq(i).attr('id', `card-${i}`);
               $(`#card-${i}`).children().eq(0).append($('<h5>').addClass('card-title').text(fiveDay[i].date));
               $(`#card-${i}`).children().eq(0).append($('<img>').attr('src', `http://openweathermap.org/img/wn/${fiveDay[i].icon}.png`));
               $(`#card-${i}`).children().eq(0).append($('<p>').addClass('card-text').text(`Temp: ${fiveDay[i].temp}°F`));
               $(`#card-${i}`).children().eq(0).append($('<p>').addClass('card-text').text(`Wind: ${fiveDay[i].wind} MPH`));
               $(`#card-${i}`).children().eq(0).append($('<p>').addClass('card-text').text(`Humidity: ${fiveDay[i].humidity}%`));
           };
       })
   };
   
   const fiveDayForecast = (data) => {
       for (let i = 0; i < data.list.length; i++) {
           const objectDate = new dayjs(data.list[i].dt_txt);
           const day = objectDate.format('M/D/YYYY');
   
           if (currentDate !== day && fiveDay.length < 5 && !fiveDay.find((day, i) => day.dt_txt === data.list[i].dt_txt)) {
               currentDate = day;
               const weatherObject = {
                   date: currentDate,
                   temp: data.list[i].main.temp,
                   wind: data.list[i].wind.speed,
                   humidity: data.list[i].main.humidity,
                   icon: data.list[i].weather[0].icon
               };
               fiveDay.push(weatherObject);
           }
       }
   };
   
   const setHistory = () => {
       historyContainer.empty();
       const newRow = '<div class="row py-2"></div>';
       // Display 6 recent searches
       if (history.length > 6) {
           for (let i = 0; i < 6; i++) {
               const buttonTag = $('<button>').addClass('btn btn-two btn-hist').text(history[i].name);
               historyContainer.append(newRow);
               historyContainer.children().eq(i).append(buttonTag);
           }
       } else {
           history.forEach((element, i) => {
               const buttonTag = $('<button>').addClass('btn btn-two btn-hist').text(element.name);
               historyContainer.append(newRow);
               historyContainer.children().eq(i).append(buttonTag);
           });
       }
   };
   
   const History = (e) => {
       e.stopPropagation();
       history.find((element, i) => {
           if (element.name === e.target.textContent) {
               fetchWeather(element.lon, element.lat);
           }
       });
   };
   
   
   
   searchBtn.on('click', fetchBoxes);
   historyContainer.on('click', History);