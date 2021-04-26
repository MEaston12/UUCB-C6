//The purpose of this file is to make the final JQuery assignments to the document

$('#search').click((e) => {
    searchForCity($('#search-input').val() || 'Salt Lake City');
});

$(document).keypress((e) =>{
    if(e.which == 13){
        $('#search').click();
    }
});

loadFromStorage();
renderDates();
renderCityButtons();