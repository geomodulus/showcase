// arena center coordinates
const arena = {
  lng: -79.3790169712448,
  lat: 43.64344921310201,
};

// initialize object to store routes
const routes = {};

// listen for article close to abandon animation
let abort = false;
window.addEventListener(
  "flexWindowReset",
  () => {
    abort = true;
    for (const player in routes) {
      if (module.map.getLayer(player)) {
        module.map.setLayoutProperty(player, "visibility", "none");
        module.map.setLayoutProperty(`${player}-symbol`, "visibility", "none");
      }
    }
  },
  { once: true },
);

// add new route point data and update map
function addRoutePoint(id) {
  const next = routes[id].coordinates.shift();
  routes[id].geometry.coordinates.push(next);
  module.map.getSource(`${id}-symbol`).setData({
    type: "Point",
    coordinates: next,
  });
  return routes[id].geometry;
}

// animate route by adding new point every frame
function animateRoute(id) {
  if (routes[id].coordinates.length > 0 && !abort) {
    module.map.getSource(id).setData(addRoutePoint(id));
    requestAnimationFrame(() => animateRoute(id));
  }
}

// Create and show player popup
function showPopup(e) {
  const id = e.features[0].layer.id.slice(0, -7);
  const { destination, kilometers, player } = routes[id];
  const poi = destination.poi.properties.name;
  const content = document.createElement("div");
  content.innerHTML = `
    <h2 class="text-center">${`${player} ran ${kilometers}km to ${poi}`}</h2>
  `;
  module.clearPopups();
  module.showPopup(
    new mapboxgl.Popup({
      anchor: window.innerWidth < 1024 ? "top" : "left",
      closeButton: false,
      focusAfterOpen: false,
      maxWidth: window.innerWidth < 1024 ? "200px" : "240px",
      offset: 10,
    })
      .setLngLat(e.lngLat)
      .setHTML(module.defaultPopupHTML(content.innerHTML)),
  );
  if (window.innerWidth < 1024) {
    module.map.easeTo({
      center: e.lngLat,
    });
  }
}

// build player routes and add to map for animation
function mapRoutes() {
  for (const player in routes) {
    const { geometry, image } = routes[player];
    if (module.map.getLayer(player)) {
      module.map.removeLayer(player);
      module.map.removeLayer(`${player}-symbol`);
    }
    module.addSource(player, {
      data: geometry,
      type: "geojson",
    });
    module.addFeatureLayer({
      id: player,
      source: player,
      type: "line",
      paint: {
        "line-color": "#ED3242",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.4, 15, 0.3],
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 15, 5],
      },
    });
    module.addSource(`${player}-symbol`, {
      type: "geojson",
      data: {
        type: "Point",
        coordinates: [arena.lng, arena.lat],
      },
    });
    module.addVizLayer({
      id: `${player}-symbol`,
      source: `${player}-symbol`,
      type: "symbol",
      layout: {
        "icon-allow-overlap": true,
        "icon-image": image ? image : "orange-bball",
        "icon-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          11.5,
          image ? 0.075 : 0.25,
          12.5,
          image ? 0.15 : 0.75,
          15,
          image ? 0.3 : 1.5,
        ],
      },
      paint: {
        "icon-opacity": image ? 0.9 : 0.8,
      },
    });
    if (window.innerWidth < 1024) {
      module.on("click", `${player}-symbol`, showPopup);
    } else {
      module.on("mouseenter", `${player}-symbol`, showPopup);
      module.on("mouseleave", `${player}-symbol`, () => module.clearPopups());
    }
    if (!abort) animateRoute(player);
  }
}

// caclucates and zooms to a bounding box from all route points
const bboxRaw = [[arena.lng, arena.lat]];
function zoomToBbox() {
  let minLng, minLat, maxLng, maxLat;
  bboxRaw.forEach((point) => {
    if (minLng === undefined || point[0] < minLng) minLng = point[0];
    if (minLat === undefined || point[1] < minLat) minLat = point[1];
    if (maxLng === undefined || point[0] > maxLng) maxLng = point[0];
    if (maxLat === undefined || point[1] > maxLat) maxLat = point[1];
  });
  const bearing = module.map.getBearing();
  const padding = {
    top: window.innerWidth < 1024 ? 75 : 100,
    bottom: 25,
    left: 25,
    right: 25,
  };
  module.map.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    {
      bearing: bearing,
      duration: 2000,
      linear: true,
      padding: padding,
    },
  );
  module.map.once("idle", mapRoutes);
}

// match players distances to a POI and store in routes object
const destinations = [];
function findMatches(distances) {
  destinations.sort((a, b) => {
    return a.route.routes[0].distance - b.route.routes[0].distance;
  });
  distances.data.sort((a, b) => {
    return a.distance - b.distance;
  });
  distances.data.forEach((player) => {
    if (player.distance > 0) {
      const meters = player.distance * 1609.344;
      const destIndex = destinations.findIndex(
        (poi) => poi.route.routes[0].distance > meters,
      );
      const destination = destIndex
        ? { ...destinations[destIndex] }
        : { ...destinations[destinations.length - 1] };
      destinations.splice(destIndex, 1);
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
      bboxRaw.push(destination.poi.geometry.coordinates);
      if (player.image) routes[id].image = player.image;
      routes[id].geometry.coordinates = [];
    }
  });
  for (const player in routes) {
    const smoothed = module.smoothRoute(routes[player].coordinates);
    routes[player].coordinates = smoothed;
  }
  setTimeout(zoomToBbox, 1000);
}

// load available player images
function addImages(data) {
  data.forEach((player) => {
    if (player.image && !module.map.hasImage(player.image)) {
      module.map.loadImage(
        `https://media.geomodul.us/img/raptor-heads/${player.image}.png`,
        (error, image) => {
          if (error) console.log("Error loading image", error);
          module.map.addImage(player.image, image);
        },
      );
    }
  });
}

// get updated distances data
function getDistances() {
  fetch(
    "https://media.geomodul.us/articles/raptors-distance-travelled/distances.json",
  )
    .then((r) => r.json())
    .then((d) => {
      addImages(d.data);
      findMatches(d);
    })
    .catch((e) => console.log("error:", e));
}

// add the arena graphic to the map
function addArena() {
  // add arena location as source
  module.addSource("scotiabank-arena", {
    data: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [arena.lng, arena.lat],
      },
      properties: {
        title: "Scotiabank Arena",
      },
    },
    type: "geojson",
  });
  // add symbol at arena location (rotate as needed)
  module.addVizLayer({
    id: "scotiabank-arena",
    source: "scotiabank-arena",
    type: "symbol",
    layout: {
      "icon-image": "scotiabank-arena",
      "icon-pitch-alignment": "map",
      "icon-rotate": 12.5,
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        9,
        0.05,
        16,
        0.125,
        18,
        0.5,
        20,
        0.75,
        22,
        1,
      ],
    },
    paint: {
      "icon-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        9,
        0,
        12,
        0.75,
        18,
        1,
      ],
    },
  });
}

// load arena graphic
if (!module.map.hasImage("scotiabank-arena")) {
  module.map.loadImage(
    "https://media.geomodul.us/img/scotiabank-arena-md.png",
    (error, image) => {
      if (error) console.log("Error loading image", error);
      module.map.addImage("scotiabank-arena", image);
      addArena();
    },
  );
} else addArena();

// load basketball graphic for missing player images
if (!module.map.hasImage("orange-bball")) {
  module.map.loadImage(
    "https://media.geomodul.us/img/raptor-heads/basketball-fill.png",
    (error, image) => {
      if (error) console.log("Error loading image", error);
      module.map.addImage("orange-bball", image);
    },
  );
}

// load route data
fetch(
  "https://media.geomodul.us/articles/raptors-distance-travelled/poi-routes.json",
)
  .then((r) => r.json())
  .then((d) => {
    d.forEach((l) => destinations.push(l));
    getDistances();
  })
  .catch((e) => console.log("error:", e));
