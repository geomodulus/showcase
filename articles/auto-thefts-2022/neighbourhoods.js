// hide selected mapbox layers to reduce visual clutter
module.hideLayer("settlement-subdivision-label");
module.hideLayer("settlement-minor-label");
module.hideLayer("settlement-major-label");

let currentYear = 2022;

// update the visualisation based on the selected year
function updateViz(year) {
  module.clearPopups();
  currentYear = year;
  const perKm2 = `perKm2-${year}`;
  module.map.setPaintProperty("neighbourhoods-trigger", "fill-color", [
    "case",
    [">", ["get", perKm2], limits.highestPerKm * 0.5],
    "#ED3242",
    [">", ["get", perKm2], limits.highestPerKm * 0.25],
    "#E2871F",
    [">", ["get", perKm2], limits.highestPerKm * 0.125],
    "#FFD515",
    "#108DF6",
  ]);
  module.map.setPaintProperty("neighbourhoods-fill", "fill-extrusion-color", [
    "case",
    [">", ["get", perKm2], limits.highestPerKm * 0.5],
    "#ED3242",
    [">", ["get", perKm2], limits.highestPerKm * 0.25],
    "#E2871F",
    [">", ["get", perKm2], limits.highestPerKm * 0.125],
    "#FFD515",
    "#108DF6",
  ]);
  module.map.setPaintProperty("neighbourhoods-fill", "fill-extrusion-height", [
    "interpolate",
    ["linear"],
    ["zoom"],
    10,
    ["*", ["get", year], 10],
    20,
    ["*", ["get", year], 1],
  ]);
}

// listen for the initial year selector to be added to the DOM and then add an event listener
const interval = setInterval(() => {
  const selector = document.getElementById("year-selector");
  if (selector) {
    selector.addEventListener("change", (e) => updateViz(e.target.value));
    clearInterval(interval);
  }
}, 1000);

// establish consistent text colours
const textColour = {
  red: "text-red-700 dark:text-red-500",
  orange: "text-orange-700 dark:text-orange-500",
  yellow: "text-yellow-700 dark:text-yellow-500",
  blue: "text-blue-700 dark:text-blue-500",
};

// show the popup with the neighbourhood details
function showDetails(e) {
  if (module.map.getLayer("clusters")) {
    const clusters = module.map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    if (clusters.length) return;
  }

  let colour;
  if (
    e.features[0].properties[`perKm2-${currentYear}`] >
    limits.highestPerKm * 0.5
  )
    colour = textColour.red;
  else if (
    e.features[0].properties[`perKm2-${currentYear}`] >
    limits.highestPerKm * 0.25
  )
    colour = textColour.orange;
  else if (
    e.features[0].properties[`perKm2-${currentYear}`] >
    limits.highestPerKm * 0.125
  )
    colour = textColour.yellow;
  else colour = textColour.blue;

  const content = document.createElement("div");
  content.className = "space-y-1 text-sm lg:text:base";
  content.innerHTML = `
    <h3 class="font-bold">${
      e.features[0].properties.AREA_NAME
    } (${currentYear})</h3>
    <p>Thefts/km<sup>2</sup>: <span class=${colour}>${e.features[0].properties[
      `perKm2-${currentYear}`
    ].toFixed(4)}</span></p>
    <p>Total Thefts: ${e.features[0].properties[`${currentYear}`]}</p>
  `;

  const container = document.createElement("div");
  container.appendChild(content);

  const bbox = JSON.parse(e.features[0].properties.bbox);
  const center = turf.centerOfMass(turf.bboxPolygon(bbox));
  const defaultHTML = module.defaultPopupHTML(container.innerHTML);

  module.showPopup(
    new mapboxgl.Popup({
      anchor: "bottom",
      closeButton: false,
      focusAfterOpen: false,
      maxWidth: window.innerWidth < 1024 ? "250px" : "300px",
      offset: 30,
    })
      .setLngLat(center.geometry.coordinates)
      .setHTML(defaultHTML),
  );
  // zoom to the neighbourhood
  module.map.fitBounds(bbox, {
    bearing: module.map.getBearing(),
    duration: 2500,
    offset: window.innerWidth < 1024 ? [0, 30] : [0, 0],
    padding: window.innerWidth < 1024 ? 0 : 50,
    pitch: module.map.getPitch(),
  });
}

// initialise an object to store upper limits
const limits = {
  highestTotal: 0,
  highestPerKm: 0,
};

// build the neighbourhood visual and add it to the map
let hoveredStateId = null;
function addNeighbourhoods() {
  module.addUnderglowLayer({
    id: "neighbourhoods-trigger",
    source: "neighbourhoods",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.5],
        "#ED3242",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.25],
        "#E2871F",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.125],
        "#FFD515",
        "#108DF6",
      ],
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 14, 0.25],
    },
  });
  module.addFeatureLayer({
    id: "neighbourhoods-line",
    source: "neighbourhoods",
    type: "line",
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#D32360",
        "#108DF6",
      ],
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ],
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        ["case", ["boolean", ["feature-state", "hover"], false], 4, 2],
        20,
        ["case", ["boolean", ["feature-state", "hover"], false], 6, 4],
      ],
    },
  });
  module.addFeatureLayer({
    id: "neighbourhoods-fill",
    source: "neighbourhoods",
    type: "fill-extrusion",
    paint: {
      "fill-extrusion-color": [
        "case",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.5],
        "#ED3242",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.25],
        "#E2871F",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.125],
        "#FFD515",
        "#00A168",
      ],
      "fill-extrusion-height": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        ["*", ["get", "2022"], 10],
        20,
        ["*", ["get", "2022"], 1],
      ],
      "fill-extrusion-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10.5,
        0.75,
        11,
        0,
      ],
    },
  });
  // show a popup on click
  module.handleCursor("neighbourhoods-trigger", showDetails);
  // highlight the neighbourhood boundary on hover
  module.map.on("mousemove", "neighbourhoods-trigger", (e) => {
    if (e.features.length > 0) {
      if (hoveredStateId !== null) {
        module.map.setFeatureState(
          { source: "neighbourhoods", id: hoveredStateId },
          { hover: false },
        );
      }
      hoveredStateId = e.features[0].id;
      module.map.setFeatureState(
        { source: "neighbourhoods", id: hoveredStateId },
        { hover: true },
      );
    }
  });
  module.map.on("mouseleave", "neighbourhoods-trigger", () => {
    if (hoveredStateId !== null) {
      module.map.setFeatureState(
        { source: "neighbourhoods", id: hoveredStateId },
        { hover: false },
      );
    }
    hoveredStateId = null;
  });
}

// get the upper limits for the data
function getLimits(features) {
  features.forEach((f) => {
    [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].forEach((year) => {
      if (f.properties[year] > limits.highestTotal) {
        limits.highestTotal = f.properties[year];
      }
      if (f.properties[`perKm2-${year}`] > limits.highestPerKm) {
        limits.highestPerKm = f.properties[`perKm2-${year}`];
      }
    });
  });
}

// fetch the neighbourhood data and begin building the visualisation
fetch(url)
  .then((r) => r.json())
  .then((d) => {
    getLimits(d.features);
    module.addSource("neighbourhoods", {
      data: d,
      type: "geojson",
    });
    addNeighbourhoods();
  })
  .catch((e) => console.error(e));
