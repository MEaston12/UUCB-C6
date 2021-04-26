//The purpose of this file is to define functions to perform the actual workload of the scripting on the page
const weatherApiKey = '6364ff8c9b0798ae55417a9e7d6eba48';
const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?appid=${weatherApiKey}`;
const googleApiKey = 'AIzaSyCCGMhhzz1pUJwb1-QP5lJQpll7SGi8wM8';
const googleURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${googleApiKey}`;
let weatherInfoTable = {};

async function getWeatherInfo(cityName){
    //This function handles all of the API calls
    const googRes = await fetch(`${googleURL}&address=${encodeURIComponent(cityName)}`);
    if(!googRes.ok){
        alert('Error: ' + googRes.status);
        throw 'Google API NO WORK'
    }
    const googObj = await googRes.json();
    if(!googObj.results[0]){
        alert('Error: LOCATION NOT FOUND');
        throw 'a fit';
    }
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
            iconURL: `http://openweathermap.org/img/wn/${weatherInfo.daily[i-1].weather[0].icon}@2x.png`
        };
    }
    return weatherOut;
}

async function searchForCity(cityName){
    //This function handles the calling of the getWeatherInfo function and manipulates local data
    const weatherInfo = await getWeatherInfo(cityName);
    delete weatherInfoTable[weatherInfo.name];
    weatherInfoTable[weatherInfo.name] = weatherInfo;
    renderCityButtons();
    renderWeatherReadout(weatherInfo);
    saveToStorage();
}

function renderCityButtons(){
    //This deletes and rerenders city shortcut buttons
    $('#city-list').empty();
    for(let cityName of Object.keys(weatherInfoTable).reverse()){
        $('#city-list').append(`<button class='btn btn-secondary'>${cityName}</button>`);
    }
    $('#city-list').find('button').click((e) => {
        //Buttons use the key for their text, so we just pull the text for the key
        const targetCity = $(e.target).text();
        const tempObj = weatherInfoTable[targetCity];
        delete weatherInfoTable[targetCity];
        weatherInfoTable[targetCity] = tempObj;
        renderWeatherReadout(tempObj);
        renderCityButtons();
        saveToStorage();
    });
}

function renderWeatherReadout(cityData){
    //This function changes all on page weather related data elements via
    //  a given js object containing said weather data.
    const today = cityData.days[0];
    $('#city-name').text(cityData.name);
    $('#curr-temp').text(kToF(today.temp));
    $('#curr-wind').text(today.wind);
    $('#curr-humidity').text(today.humidity);
    $('#curr-UV').text(today.uvi);
    $('#today-icon').attr('src',today.iconURL);
    for(let i = 1; i < 6; i++){
        let card = $('#day-'+i);
        let days = cityData.days;
        card.find('img').attr('src',days[i].iconURL);
        card.find('.temp').text(kToF(days[i].temp));
        card.find('.wind').text(days[i].wind);
        card.find('.humidity').text(days[i].humidity);
    }
    let color = '';
    if(today.uvi < 3){ //green
        color = '#299501';
    } else if(today.uvi < 6) { //yellow
        color = '#f7e401';
    } else if(today.uvi < 8) { //orange
        color = '#f95901';
    } else { //red
        color = '#d90011';
    }
    $('#curr-UV').css('background-color',color);
}

function renderDates(){
    //Instead of having anything too fancy with moment or whatever, this just
    //   renders the dates on page load according to today's date plus 1-5 days
    const todayAndOtherDays = new Date();
    $('#date-today').text(dateToString(todayAndOtherDays));
    for(let i = 1; i < 6; i++){
        todayAndOtherDays.setDate(todayAndOtherDays.getDate()+1);
        $('#day-'+i).find('h4').text(dateToString(todayAndOtherDays));
    }
}

function saveToStorage(){
    //This function handles the localStorage saving process
    localStorage.setItem('weatherInfoTable',JSON.stringify(weatherInfoTable));
}

function loadFromStorage(){
    //This function handles the localStorage loading process
    if(!localStorage.getItem('weatherInfoTable')){
        searchForCity('slc');
        return;
    }
    weatherInfoTable = JSON.parse(localStorage.getItem('weatherInfoTable'));
    const tableVals = Object.values(weatherInfoTable);
    if(tableVals[0]){
        renderWeatherReadout(tableVals[tableVals.length - 1]);
        searchForCity(tableVals[tableVals.length - 1].name);
    }
}

//Helper functions using arrow notation
const dateToString = (date) => `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
const kToF = (kelv) => Math.round((kelv - 273.15) * 9 / 5 + 32);  //fancy arrows