export function generateQuotes() {
  const famousQuotes = [
    { quote: "I'm going to make him an offer he can't refuse.", movie: "The Godfather", year: 1972, character: "Vito Corleone" },
    { quote: "May the Force be with you.", movie: "Star Wars", year: 1977, character: "Han Solo" },
    { quote: "You talkin' to me?", movie: "Taxi Driver", year: 1976, character: "Travis Bickle" },
    { quote: "I'll be back.", movie: "The Terminator", year: 1984, character: "The Terminator" },
    { quote: "E.T. phone home.", movie: "E.T. the Extra-Terrestrial", year: 1982, character: "E.T." },
    { quote: "Keep your friends close, but your enemies closer.", movie: "The Godfather Part II", year: 1974, character: "Michael Corleone" },
    { quote: "Bond. James Bond.", movie: "Dr. No", year: 1962, character: "James Bond" },
    { quote: "There's no place like home.", movie: "The Wizard of Oz", year: 1939, character: "Dorothy Gale" },
    { quote: "I'm the king of the world!", movie: "Titanic", year: 1997, character: "Jack Dawson" },
    { quote: "Here's looking at you, kid.", movie: "Casablanca", year: 1942, character: "Rick Blaine" },
    { quote: "Wait a minute, wait a minute. You ain't heard nothin' yet!", movie: "The Jazz Singer", year: 1927, character: "Jakie Rabinowitz" },
    { quote: "All right, Mr. DeMille, I'm ready for my close-up.", movie: "Sunset Boulevard", year: 1950, character: "Norma Desmond" },
    { quote: "Fasten your seatbelts. It's going to be a bumpy night.", movie: "All About Eve", year: 1950, character: "Margo Channing" },
    { quote: "What we've got here is failure to communicate.", movie: "Cool Hand Luke", year: 1967, character: "Captain" },
    { quote: "I love the smell of napalm in the morning.", movie: "Apocalypse Now", year: 1979, character: "Lt. Col. Bill Kilgore" },
    { quote: "Love means never having to say you're sorry.", movie: "Love Story", year: 1970, character: "Oliver Barrett IV" },
    { quote: "The stuff that dreams are made of.", movie: "The Maltese Falcon", year: 1941, character: "Sam Spade" },
    { quote: "Louis, I think this is the beginning of a beautiful friendship.", movie: "Casablanca", year: 1942, character: "Rick Blaine" },
    { quote: "A census taker once tried to test me. I ate his liver with some fava beans and a nice Chianti.", movie: "The Silence of the Lambs", year: 1991, character: "Hannibal Lecter" },
    { quote: "Show me the money!", movie: "Jerry Maguire", year: 1996, character: "Rod Tidwell" }
  ];

  const quotes = [];
  for (let i = 1; i <= 1000; i++) {
    const base = famousQuotes[i % famousQuotes.length];
    quotes.push({
      id: i,
      quote: `${base.quote} (Instance #${i})`,
      movie: base.movie,
      year: base.year,
      character: base.character
    });
  }
  return quotes;
}
