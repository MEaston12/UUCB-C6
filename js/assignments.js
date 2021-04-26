//The purpose of this file is to make the final JQuery assignments to the document

$('#search').click((e) => { //Binding for search button
    searchForCity($('#search-input').val() || 'Salt Lake City');
});

$(document).keypress((e) =>{ //Binding enter key to act as search button click
    if(e.which == 13){
        $('#search').click();
    }
});

//Run at start functions
loadFromStorage();
renderDates();
renderCityButtons();