//The purpose of this file is to make the final JQuery assignments to the document

$('#search').click((e) => {
    searchForCity($('#search-input').val());
});

renderDates();