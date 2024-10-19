function searchGames() {
    // Get the search input value
    let input = document.getElementById('search-bar').value.toLowerCase();
    
    // Get all game cards
    let gameCards = document.getElementsByClassName('game-card');

    // Loop through each game card and check if it matches the search input
    for (let i = 0; i < gameCards.length; i++) {
        let gameTitle = gameCards[i].getAttribute('data-title').toLowerCase();

        if (gameTitle.includes(input)) {
            gameCards[i].style.display = ''; // Show game card if it matches
        } else {
            gameCards[i].style.display = 'none'; // Hide game card if it doesn't match
        }
    }
}
