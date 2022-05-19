function addLayers() {
  module.addFeatureLayer({
    id: "labels",
    type: "symbol",
    filter: ["==", ["get", "MUNICIPAL_NAME_SHORTFORM"], ""],
    source: "municipal-centres",
    layout: {
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
        11,
        12,
        12.5,
        15,
        14,
        20,
      ],
      "text-ignore-placement": true,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#A77BF5", // purple
      "text-opacity": 0.8,
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
