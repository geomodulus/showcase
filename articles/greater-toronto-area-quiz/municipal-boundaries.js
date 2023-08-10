// turn off mapbox labels on load
const layerList = module.map
  .getStyle()
  .layers.filter((layer) => layer.type === "symbol");
layerList.forEach((layer) => {
  if (layer["source-layer"] === "place_label") {
    module.map.setLayoutProperty(layer.id, "visibility", "none");
  }
});
// put labels back on article close
window.addEventListener(
  "flexWindowReset",
  () => {
    layerList.forEach((layer) => {
      if (layer["source-layer"] === "place_label") {
        module.map.setLayoutProperty(layer.id, "visibility", "visible");
      }
    });
  },
  { once: true },
);

function addLayers() {
  module.addFeatureLayer({
    id: "boundary-fills",
    type: "fill",
    source: "municipal-boundaries",
    paint: {
      "fill-color": module.isDarkMode() ? "#FFF" : "#000",
      "fill-opacity": 0.2,
    },
  });
  module.addFeatureLayer({
    id: "boundary-lines",
    type: "line",
    source: "municipal-boundaries",
    paint: {
      "line-color": module.isDarkMode() ? "#FFF" : "#7035E6",
      "line-width": 2,
      "line-opacity": 0.2,
    },
  });
}

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    module.addSource("municipal-boundaries", {
      type: "geojson",
      data: data,
    });
    addLayers();
  })
  .catch((e) => console.error(e));
