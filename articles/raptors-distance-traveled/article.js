// arena center
const arena = {
  lng: -79.37908202254908,
  lat: 43.64344005465493,
};

const token =
  "pk.eyJ1IjoiZ2VvbW9kdWx1cyIsImEiOiJja2hubHI2eG0wMW1jMnJxcTk1OWVycjF1In0.kKg7JGdOkhKk_tiS-Wh-Rw";

const routes = {};

function addRoutePoint(id) {
  const next = routes[id].coordinates.shift();
  routes[id].geometry.coordinates.push(next);
  module.map.getSource(`${id}-symbol`).setData({
    type: "Point",
    coordinates: next,
  });
  return routes[id].geometry;
}

function animateRoute(id) {
  if (routes[id].coordinates.length > 0) {
    module.map.getSource(id).setData(addRoutePoint(id));
    requestAnimationFrame(() => animateRoute(id));
  }
}

function showDestinationPopup(e) {
  const id = e.features[0].layer.id.slice(0, -12);
  const { destination, kilometers, player } = routes[id];
  const poi = destination.poi.properties.name;
  const content = document.createElement("div");
  content.innerHTML = `
    <h2 class="text-center">${`${player} ran ${kilometers}km to ${poi}`}</h2>
  `;
  module.clearPopups();
  module.showPopup(
    new mapboxgl.Popup({
      anchor: window.innerWidth < 1024 ? "center" : "bottom",
      closeButton: false,
      focusAfterOpen: false,
      offset: 10,
    })
      .setLngLat(e.lngLat)
      .setHTML(module.defaultPopupHTML(content.innerHTML))
  );
  if (window.innerWidth < 1024) {
    module.map.easeTo({
      center: e.lngLat,
    });
  }
}

function addDestinations() {
  // group into once source/layer?
  // use border box to establish zoom
  for (const player in routes) {
    module.addSource(`${player}-destination`, {
      data: routes[player].destination.poi,
      type: "geojson",
    });
    module.addFeatureLayer({
      id: `${player}-destination`,
      source: `${player}-destination`,
      type: "circle",
      paint: {
        "circle-opacity": 0,
        "circle-radius": 10,
        "circle-stroke-color": "#FFF",
        "circle-stroke-opacity": 0.75,
        "circle-stroke-width": 3,
      },
    });
    const trigger = window.innerWidth < 1024 ? "click" : "mouseover";
    module.on(trigger, `${player}-destination`, showDestinationPopup);
  }
}

function mapRoutes() {
  for (const player in routes) {
    module.addSource(player, {
      data: routes[player].geometry,
      type: "geojson",
    });
    module.addFeatureLayer({
      id: player,
      source: player,
      type: "line",
      paint: {
        "line-color": "#ED3242",
        "line-opacity": 0.25,
        "line-width": 2,
      },
    });
    module.addSource(`${player}-symbol`, {
      type: "geojson",
      data: {
        type: "Point",
        coordinates: [arena.lng, arena.lat],
      },
    });
    module.addFeatureLayer({
      id: `${player}-symbol`,
      source: `${player}-symbol`,
      type: "symbol",
      layout: {
        "icon-allow-overlap": true,
        "icon-image": "orange-bball",
        "icon-size": 0.5,
      },
    });
    // module.on("mouseover", player, (e) => console.log(e.features[0]));
    animateRoute(player);
  }
}

function smooth(array) {
  const smoothed = [...array];
  for (let i = 0; i + 1 < smoothed.length; i++) {
    function addMidpoint() {
      const midpoint = turf.midpoint(
        turf.point(smoothed[i]),
        turf.point(smoothed[i + 1])
      );
      smoothed.splice(i + 1, 0, midpoint.geometry.coordinates);
      checkDistance();
    }
    function checkDistance() {
      const d = turf.distance(
        turf.point(smoothed[i]),
        turf.point(smoothed[i + 1])
      );
      if (d > 0.1) addMidpoint();
    }
    checkDistance();
  }
  return smoothed;
}

function addPoints() {
  for (const player in routes) {
    const smoothed = smooth(routes[player].coordinates);
    routes[player].coordinates = smoothed;
  }
}

const destinations = [];

function findMatches(distances) {
  destinations.sort((a, b) => {
    return a.route.routes[0].distance - b.route.routes[0].distance;
  });
  distances.data.forEach((player) => {
    const meters = player.distance * 1609.344;
    const destination = destinations.find(
      (poi) => poi.route.routes[0].distance > meters
    );
    const id = player.name.replaceAll(" ", "-");
    const km = (meters / 1000).toFixed(2);
    // console.log(id, "ran", km, "km to", destination.poi.properties.name);
    routes[id] = {
      coordinates: [...destination.route.routes[0].geometry.coordinates],
      destination: destination,
      geometry: { ...destination.route.routes[0].geometry },
      kilometers: km,
      player: player.name,
    };
    routes[id].geometry.coordinates = [];
  });
  for (const player in routes) {
    const smoothed = smooth(routes[player].coordinates);
    routes[player].coordinates = smoothed;
  }
  addDestinations();
  setTimeout(() => {
    module.map.once("idle", mapRoutes);
  }, 500);
}

function getDistances() {
  fetch(
    "https://media.geomodul.us/articles/raptors-distance-travelled/distances.json"
  )
    .then((r) => r.json())
    .then((d) => {
      findMatches(d);
    })
    .catch((e) => console.log("error:", e));
}

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
    getDistances();
  });
}

if (!module.map.hasImage("orange-bball")) {
  module.map.loadImage("/kduncan/basketball-fill.png", (error, image) => {
    if (error) console.log("Error loading image", error);
    module.map.addImage("orange-bball", image);
  });
}

const poi = module.map.getSource("places-of-interest");
setTimeout(() => {
  if (poi._data.features.length) getDestinations(poi._data.features);
  else
    setTimeout(() => {
      getDestinations(poi._data.features);
    }, 1000);
}, 500);

if (window.innerWidth > 1023) {
  module.map.once("idle", () => {
    module.map.easeTo({
      zoom: 12.5,
    });
  });
}
