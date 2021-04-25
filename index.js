const weatherApiKey = '6364ff8c9b0798ae55417a9e7d6eba48';
const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?appid=${weatherApiKey}`;
const googleApiKey = 'AIzaSyCCGMhhzz1pUJwb1-QP5lJQpll7SGi8wM8';
const googleURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${googleApiKey}`;

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
    const weatherObj = await weatherRes.json();
    //Might come back here and clean up the return object
    return weatherObj;
}