# How to update this article

1. Get distances from [NBA stats](https://www.nba.com/stats/players/speed-distance?TeamID=1610612761&LastNGames=1&Location=Home) ("Dist. Miles" by player)

2. Download [distance.json](https://storage.googleapis.com/media.geomodul.us/articles/raptors-distance-travelled/distances.json) and update for each player

3. If adding a new player, be sure to add their display name ("name") and an image id ("image") that matches a png file on [the server](https://console.cloud.google.com/storage/browser/media.geomodul.us/img/raptor-heads) as an object in the "data" array.

4. Upload the new data to [our servers](https://console.cloud.google.com/storage/browser/media.geomodul.us/articles/raptors-distance-travelled), being sure to overwrite the old file.
