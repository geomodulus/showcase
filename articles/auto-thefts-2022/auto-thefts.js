let yearTimer;
function updateDataLabel(year) {
  if (["", "sm", "md"].includes(module.currentBreakpoint())) {
    if (!document.getElementById("data-year-label")) {
      const label = document.createElement("h3");
      label.id = "data-year-label";
      label.classList.add(
        "bg-map-100/75",
        "dark:bg-map-700/50",
        "mb-2",
        "px-2",
        "py-1",
        "rounded-sm",
        "text-base"
      );
      label.innerText = `${year} data`;
      module.ctx.fullscreenControls.useFeatureLabel(label);
    } else {
      document.getElementById("data-year-label").innerText = `${year} data`;
    }
    clearTimeout(yearTimer);
    yearTimer = setTimeout(() => {
      document.getElementById("data-year-label").remove();
    }, 3000);
  }
}

const mappable = {
  type: "FeatureCollection",
  features: [],
};
const noGood = [];

function filterData(year) {
  const thefts = mappable.features.filter((f) => f.properties.OCC_YEAR == year);
  return {
    type: "FeatureCollection",
    features: thefts,
  };
}

function updateViz(year) {
  const src = module.map.getSource("auto-theft");
  src.setData(filterData(year));
  updateDataLabel(year);
}

const radioYears = document.createElement("div");
radioYears.innerHTML = `
  <fieldset class="mb-3" id="year-selector">
    <legend class="mb-1 text-sm">Click to see auto thefts by year:</legend>
    <div class="flex justify-between">
      <div class="flex justify-center w-1/5">
        <input class="absolute opacity-0 peer" id="data-2018" name="yearSelect" type="radio" value="2018">
        <label class="bg-map-100 dark:bg-map-600 peer-checked:bg-purple-100 dark:peer-checked:bg-map-400 cursor-pointer hover:bg-pink-500/50 px-3 py-1 shadow-emboss" for="data-2018">2018</label>
      </div>
      <div class="flex justify-center w-1/5">
        <input class="absolute opacity-0 peer" id="data-2019" name="yearSelect" type="radio" value="2019">
        <label class="bg-map-100 dark:bg-map-600 peer-checked:bg-purple-100 dark:peer-checked:bg-map-400 cursor-pointer hover:bg-pink-500/50 px-3 py-1 shadow-emboss" for="data-2019">2019</label>
      </div>
      <div class="flex justify-center w-1/5">
        <input class="absolute opacity-0 peer" id="data-2020" name="yearSelect" type="radio" value="2020">
        <label class="bg-map-100 dark:bg-map-600 peer-checked:bg-purple-100 dark:peer-checked:bg-map-400 cursor-pointer hover:bg-pink-500/50 px-3 py-1 shadow-emboss" for="data-2020">2020</label>
      </div>
      <div class="flex justify-center w-1/5">
        <input class="absolute opacity-0 peer" id="data-2021" name="yearSelect" type="radio" value="2021">
        <label class="bg-map-100 dark:bg-map-600 peer-checked:bg-purple-100 dark:peer-checked:bg-map-400 cursor-pointer hover:bg-pink-500/50 px-3 py-1 shadow-emboss" for="data-2021">2021</label>
      </div>
      <div class="flex justify-center w-1/5">
        <input class="absolute opacity-0 peer" id="data-2022" checked name="yearSelect" type="radio" value="2022">
        <label class="bg-map-100 dark:bg-map-600 peer-checked:bg-purple-100 dark:peer-checked:bg-map-400 cursor-pointer hover:bg-pink-500/50 px-3 py-1 shadow-emboss" for="data-2022">2022</label>
      </div>
    </div>
  </fieldset>
`;
function addLegend() {
  module.setLegendTitle("Toronto Auto Thefts");
  module.addToLegend(radioYears);

  const content = document.createElement("div");
  content.innerHTML = `
    <div class="space-y-1">
      
      <div class=" bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 h-6 rounded-sm shrink-0 w-full"></div>
      <div class="flex items-center justify-between text-sm">
        <span>Less</span>
        <span class="font-bold">Thefts/km<sup>2</sup></span>
        <span>More</span>
      </div>

      <p class="mt-2 text-sm">Height indicates total number of thefts in that neighbourhood. Click to see more details.</p>

      <div class="flex justify-between">
        <div class="flex items-center">
          <div class="bg-[#D32360] border-2 border-[#E5E8EB] dark:border-[#F9FAFB] h-5 mr-2 rounded-full shrink-0 w-5">
          </div>
          <span>Theft</span>
        </div>
        <div class="flex items-center">
          <div class="bg-gradient-to-r from-pink-500/50 via-cyan-500/50 via-blue-500/50 to-purple-500/50 flex justify-center items-center h-10 mr-2 rounded-full shrink-0 w-10">#
          </div>
          <span>Multiple Thefts</span>
        </div>
      </div>

    </div>
  `;
  module.addToLegend(content);

  module.initLegend();
  const selector = document.getElementById("year-selector");
  selector.addEventListener("change", (e) => updateViz(e.target.value));
}

function showPopup(e) {
  module.clearPopups();
  const { LOCATION_TYPE, PREMISES_TYPE, NEIGHBOURHOOD_158 } =
    e.features[0].properties;

  const content = document.createElement("div");
  content.className =
    "max-h-[200px] lg:max-h-[400px] space-y-1 text-sm lg:text:base";
  content.innerHTML = `
    <p class="font-bold">${
      NEIGHBOURHOOD_158 != "NSA" ? NEIGHBOURHOOD_158 : "Other Municipality"
    }</p>
    <p>${PREMISES_TYPE}: ${LOCATION_TYPE}</p>
  `;

  const eventList = document.createElement("ul");
  const added = [];
  e.features.forEach((f) => {
    if (added.includes(f.properties.EVENT_UNIQUE_ID)) return;
    const event = document.createElement("li");
    event.innerText = `${f.properties.OCC_MONTH} ${f.properties.OCC_DAY} ${f.properties.OCC_YEAR}`;
    eventList.appendChild(event);
    added.push(f.properties.EVENT_UNIQUE_ID);
  });
  content.appendChild(eventList);

  const container = document.createElement("div");
  container.appendChild(content);

  const defaultHTML = module.defaultPopupHTML(container.innerHTML);
  module.showPopup(
    new mapboxgl.Popup({
      anchor: "left",
      closeButton: false,
      focusAfterOpen: false,
      maxWidth: window.innerWidth < 1024 ? "250px" : "300px",
      offset: 15,
    })
      .setLngLat(e.lngLat)
      .setHTML(defaultHTML)
  );
  const z = module.map.getZoom();
  module.map.easeTo({
    center: e.lngLat,
    duration: 2500,
    offset: window.innerWidth < 1024 ? [-100, 0] : [-30, 0],
    zoom: z < 15 ? z * 1.05 : z,
  });
}

const opacity = [
  "interpolate",
  ["linear"],
  ["zoom"],
  10.5,
  0,
  11,
  0.5,
  14,
  0.75,
  20,
  0.5,
];

function displayData() {
  module.addVizLayer({
    id: "clusters",
    filter: ["has", "point_count"],
    source: "auto-theft",
    type: "circle",
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#00B1C1", // cyan
        25,
        "#108DF6", // blue
        50,
        "#7035E6", // purple
        100,
        "#D32360", // pink,
      ],
      "circle-opacity": opacity,
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        25,
        30,
        50,
        40,
        100,
        50,
      ],
    },
  });
  module.handleCursor("clusters", (e) => {
    const features = module.map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    module.map
      .getSource("auto-theft")
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        if (module.map.getZoom() > zoom) return;
        module.map.easeTo({
          center: features[0].geometry.coordinates,
          duration: 2500,
          zoom: zoom,
        });
      });
  });
  module.addVizLayer({
    id: "labels",
    filter: ["has", "point_count"],
    source: "auto-theft",
    type: "symbol",
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["JetBrains Mono Regular", "Arial Unicode MS Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 10, 14, 20, 18],
    },
    paint: {
      "text-color": module.isDarkMode() ? "#F0F2F4" : "#141516",
      "text-opacity": opacity,
    },
  });
  module.addVizLayer({
    id: "auto-theft",
    filter: ["!", ["has", "point_count"]],
    source: "auto-theft",
    type: "circle",
    paint: {
      "circle-color": "#D32360",
      "circle-opacity": opacity,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 20, 10],
      "circle-stroke-opacity": opacity,
      "circle-stroke-color": module.isDarkMode() ? "#F9FAFB" : "#E5E8EB",
      "circle-stroke-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        2,
        20,
        3,
      ],
    },
  });
  module.handleCursor("auto-theft", showPopup);
  addLegend();
}

fetch(url)
  .then((r) => r.json())
  .then((d) => {
    d.features.forEach((f) => {
      if (
        f.geometry.coordinates[0] < -79.9 ||
        f.geometry.coordinates[0] > -79 ||
        f.geometry.coordinates[1] > 43.9 ||
        f.geometry.coordinates[1] < 43
      ) {
        noGood.push(f);
        return;
      }
      mappable.features.push(f);
    });
    module.addSource("auto-theft", {
      cluster: true,
      clusterMaxZoom: 17, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      data: mappable,
      type: "geojson",
    });
    updateViz(2022);
    displayData();
  })
  .catch((e) => console.error(e));
