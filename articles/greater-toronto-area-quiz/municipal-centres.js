const layout = {
  "symbol-placement": "point",
  "text-field": [
    "format",
    ["get", "MUNICIPAL_NAME_SHORTFORM"],
    { "font-scale": 2 },
  ],
  "text-font": ["JetBrains Mono Regular"],
  "text-size": [
    "interpolate",
    ["linear"],
    ["zoom"],
    8,
    9,
    10,
    12,
    12,
    15,
    14,
    18,
  ],
  // "text-allow-overlap": true,
};

function addLayers() {
  module.addFeatureLayer({
    id: "labels",
    type: "symbol",
    filter: ["==", ["get", "MUNICIPAL_NAME_SHORTFORM"], ""],
    source: "municipal-centres",
    layout: layout,
    paint: {
      "text-color": "#A77BF5", // purple
    },
  });
  module.addFeatureLayer({
    id: "missedLabels",
    type: "symbol",
    filter: ["==", ["get", "MUNICIPAL_NAME_SHORTFORM"], ""],
    source: "municipal-centres",
    layout: layout,
    paint: {
      "text-color": "#EA737C", // red
    },
  });
}

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    module.addSource("municipal-centres", {
      type: "geojson",
      data: data,
    });
    addLayers();
  })
  .catch((e) => console.error(e));
