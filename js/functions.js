//The purpose of this file is to define functions to perform the actual workload of the scripting on the page
const weatherApiKey = '6364ff8c9b0798ae55417a9e7d6eba48';
const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?appid=${weatherApiKey}`;
const googleApiKey = 'AIzaSyCCGMhhzz1pUJwb1-QP5lJQpll7SGi8wM8';
const googleURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${googleApiKey}`;
const weatherInfoTable = {};

async function getWeatherInfo(cityName){
    const googRes = await fetch(`${googleURL}&address=${encodeURIComponent(cityName)}`);
    if(!googRes.ok){
        alert('Error: ' + googRes.status);
        throw 'Google API NO WORK'
    }
    const googObj = await googRes.json();
    const location = googObj.results[0].geometry.location;
    //location == {lat, lng}, can use weather api
    const weatherRes = await fetch(`${weatherURL}&lat=${location.lat}&lon=${location.lng}`);
    if(!weatherRes.ok){
        alert('Error: ' + weatherRes.status);
        throw 'Weather API NO WORK';
    }
    const weatherInfo = await weatherRes.json();
    const weatherOut = {
        name: googObj.results[0].formatted_address,
        days: [
            {
                temp: weatherInfo.current.temp,
                wind: weatherInfo.current.wind_speed,
                humidity: weatherInfo.current.humidity,
                uvi: weatherInfo.current.uvi,
                iconURL: `http://openweathermap.org/img/wn/${weatherInfo.current.weather[0].icon}@2x.png`
            }
        ]
    }
    for(let i = 1; i < 6; i++){
        weatherOut.days[i] = {
            temp: weatherInfo.daily[i-1].temp.day,
            wind: weatherInfo.daily[i-1].wind_speed,
            humidity: weatherInfo.daily[i-1].humidity,
            iconURL: `http://openweathermap.org/img/wn/${weatherInfo.daily[i-1].weather[0].icon}@1x.png`
        };
    }
    return weatherOut;
}

async function searchForCity(cityName){
    const weatherInfo = await getWeatherInfo(cityName);
    weatherInfoTable[weatherInfo.name] = weatherInfo;
    renderCityButtons();
    renderWeatherReadout(weatherInfo);
}

function renderCityButtons(){
    $('#city-list').empty();
    for(let cityName of Object.keys(weatherInfoTable)){
        $('#city-list').append(`<button class='btn btn-secondary'>${cityName}</button>`);
    }
    $('#city-list').find('button').click((e) => {
        renderWeatherReadout(weatherInfoTable[$(e.target).text()]);
    });
}

function renderWeatherReadout(cityData){
    const today = cityData.days[0];
    $('#city-name').text(cityData.name);
    $('#curr-temp').text(today.temp);
    $('#curr-wind').text(today.wind);
    $('#curr-humidity').text(today.humidity);
    $('#curr-UV').text(today.uvi);
}

function dateToString(date){
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
}

function renderDates(){
    const todayAndOtherDays = new Date();
    $('#date-today').text(dateToString(todayAndOtherDays));
    for(let i = 1; i < 6; i++){
        todayAndOtherDays.setDate(todayAndOtherDays.getDate()+1);
        $('#day-'+i).find('h4').text(dateToString(todayAndOtherDays));
    }
}