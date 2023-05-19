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
      <div class="flex mb-2">
        <div class="flex items-center">
          <div class="bg-[#D32360] h-3 mr-2 rounded-full shrink-0 w-3">
          </div>
          <span>Parking Infraction</span>
        </div>
        <div class="flex items-center">
          <div class="bg-gradient-to-r from-cyan-500/50 via-blue-500/50 via-purple-500/50 to-yellow-500/50 flex justify-center items-center h-10 mr-2 rounded-full shrink-0 w-10">#
          </div>
          <span>Multiple Infractions</span>
        </div>
      </div>
      <div class="flex items-center">
        <div class="bg-[#00A168] h-2 mr-2 w-10">
        </div>
        <span>Bike Lanes & Cycle Tracks</span>
      </div>
      <div class="flex items-center">
        <div class="bg-[#E2871F] h-2 mr-2 w-10">
        </div>
        <span>"Sharrows"</span>
      </div>
      <div class="flex items-center">
        <div class="bg-[#ED3242] h-2 mr-2 w-10">
        </div>
        <span>Signed & Unmarked Routes</span>
      </div>
      <div class="flex items-center">
        <div class="bg-[#7035E6]/50 h-2 mr-2 w-10">
        </div>
        <span>Multi-Use & Park Trails</span>
      </div>
    </div>
  `;

  // module.addToLegend(content);
  module.initLegend();
  const selector = document.getElementById("year-selector");
  selector.addEventListener("change", (e) => updateViz(e.target.value));
}

function showPopup(e) {
  console.log(e.features);
  const {
    // occurene
    OCC_DATE,
    OCC_YEAR,
    OCC_MONTH,
    OCC_DAY,
    OCC_DOY,
    OCC_DOW,
    OCC_HOUR,
    // location
    DIVISION,
    LOCATION_TYPE,
    PREMISES_TYPE,
    NEIGHBOURHOOD_158,
    LONG_WGS84,
    LAT_WGS84,
  } = e.features[0].properties;

  const content = document.createElement("div");
  content.className = "space-y-1 text-sm lg:text:base";
  content.innerHTML = `
    <p class="font-bold">${NEIGHBOURHOOD_158}</p>
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
    zoom: z < 17.5 ? z * 1.05 : z,
  });
}

function displayData() {
  module.addFeatureLayer({
    id: "clusters",
    filter: ["has", "point_count"],
    source: "auto-theft",
    type: "circle",
    paint: {
      "circle-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        0.75,
        15,
        0.5,
      ],
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#FCE513", // "#EAA136",
        25,
        "#FEBD0B", // "#E69222",
        50,
        "#E69222", // "#E2871F",
        100,
        "#DC791C", // "#DC791C",
        250,
        "#FC3C43", // "#D56B19",
        500,
        "#DB283B", // "#CA5416",
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        25,
        25,
        50,
        30,
        100,
        35,
        250,
        40,
        500,
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
    },
  });
  module.addFeatureLayer({
    id: "auto-theft",
    filter: ["!", ["has", "point_count"]],
    source: "auto-theft",
    type: "circle",
    paint: {
      "circle-color": "#D32360",
      "circle-opacity": 0.9,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 20, 10],
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

function countData(data, countBy, property) {
  const output = {};
  data.features.forEach((f) => {
    // filter
    // if (f.properties.OCC_YEAR != 2022) return;
    // if (f.properties.OCC_YEAR < 2014 || f.properties.OCC_YEAR == null) return;
    if (!property) {
      // tally all thefts
      if (!output[f.properties[countBy]]) output[f.properties[countBy]] = 0;
      output[f.properties[countBy]]++;
    } else {
      // tally by property
      if (!output[f.properties[countBy]]) output[f.properties[countBy]] = {};
      if (!output[f.properties[countBy]][f.properties[property]])
        output[f.properties[countBy]][f.properties[property]] = 0;
      output[f.properties[countBy]][f.properties[property]]++;
    }
  });
  console.log(output);
}

fetch(
  url
  // "/kduncan/auto-thefts-2022/auto-theft-2014-2022--no-doubles.geojson"
)
  .then((r) => r.json())
  .then((d) => {
    // countData(d, "NEIGHBOURHOOD_158", "OCC_YEAR");
    // countData(d, "OCC_YEAR", "PREMISES_TYPE");
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
      clusterRadius: 35, // Radius of each cluster when clustering points (defaults to 50)
      data: mappable,
      // filter: ["==", ["get", "OCC_YEAR"], 2022],
      type: "geojson",
    });
    updateViz(2022);
    displayData();
  })
  .catch((e) => console.error(e));
