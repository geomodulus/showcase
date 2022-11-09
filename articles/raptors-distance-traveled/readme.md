# How to update this article

1. Get distances from [NBA stats](https://www.nba.com/stats/players/speed-distance?TeamID=1610612761&LastNGames=1&Location=Home) ("Dist. Miles" by player)

2. Download [distance.json](https://storage.googleapis.com/media.geomodul.us/articles/raptors-distance-travelled/distances.json) and update for each player (the code will convert miles in metric values as needed)

3. If adding a new player, be sure to add their display name ("name") and an image id ("image") that matches a png file on [the server](https://console.cloud.google.com/storage/browser/media.geomodul.us/img/raptor-heads) as an object in the "data" array.

4. Upload the new data to [our servers](https://console.cloud.google.com/storage/browser/media.geomodul.us/articles/raptors-distance-travelled), being sure to overwrite the old file.

---

# How to update POI routes

1. Run the following code:

```
const token = "pk.eyJ1IjoiZ2VvbW9kdWx1cyIsImEiOiJja2hubHI2eG0wMW1jMnJxcTk1OWVycjF1In0.kKg7JGdOkhKk_tiS-Wh-Rw";

const destinations = [];

const poi = module.map.getSource("places-of-interest");

function getDestinations(features) {
  const fetches = [];
  features.forEach((f) => {
    const { coordinates } = f.geometry;
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${arena.lng},${arena.lat};${coordinates[0]},${coordinates[1]}?geometries=geojson&access_token=${token}`;
    const p = fetch(url)
      .then((r) => r.json())
      .then((d) => {
        const pair = {
          poi: f,
          route: d,
        };
        destinations.push(pair);
      })
      .catch((e) => console.log("error:", e));
    fetches.push(p);
  });
  Promise.all(fetches).then(() => {
    console.log(destinations);
  });
}

setTimeout(() => {
  if (poi._data.features.length) getDestinations(poi._data.features);
  else
    setTimeout(() => {
      getDestinations(poi._data.features);
    }, 1000);
}, 500);
```

2. Copy the resulting object for the console log and replace the data in [poi-routes.json]("https://media.geomodul.us/articles/raptors-distance-travelled/poi-routes.json")

3. Update the "last updated" field below.

> Last Updated: 9 November 2022
