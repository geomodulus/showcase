# How to update this article

1. Get distances from [NBA stats](https://www.nba.com/stats/players/speed-distance?TeamID=1610612761&LastNGames=1&Location=Home) ("Dist. Miles" by player)

2. Update the distance field for each player in [distance.json](https://console.cloud.google.com/storage/browser/media.geomodul.us/articles/raptors-distance-travelled)

3. If adding a new player, be sure to add their display name ("name") and an image id ("image") that matches a png file on [the server](https://console.cloud.google.com/storage/browser/media.geomodul.us/img/raptor-heads) as an object in the "data" array.
