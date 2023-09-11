// object with properties for each "scene"
const sceneList = [
  {
    id: "zoomIn",
    function: () => {},
    camera: {
      "": {
        duration: 3000,
        center: [-79.4208, 43.8059],
        zoom: 11.35,
      },
      lg: {
        duration: 4000,
        center: [-79.4364, 43.8048],
        zoom: 12.7,
      },
    },
  },
  {
    id: "turnNorth",
    function: () => {},
    camera: {
      "": {
        center: [-79.4237, 43.8282],
        duration: 3000,
        zoom: 12.7,
      },
      lg: {
        center: [-79.4316, 43.8283],
        duration: 4000,
        zoom: 14.13,
      },
    },
  },
  {
    id: "resetView",
    function: () => {
      ["bus-routes", "richmond-line", "yonge-ext-lines"].forEach((l) => {
        module.map.setPaintProperty(l, "line-opacity", 0.9);
      });
    },
    camera: {
      "": {
        duration: 10000,
        ...module.initialView(),
      },
    },
  },
];

function addScenes() {
  // create a scene handler
  const scenes = module.newSceneList("yonge-north-extension");
  // add each scene to the handler
  sceneList.forEach((s) => {
    scenes.add(s.id, s.camera);
    // add a scroll trigger for each scene
    module.addScrollTrigger(`#${s.id}`, 0, () => {
      scenes.goTo(s.id);
      s.function();
    });
  });
  // add buttons to move between scenes
  module.addButtonsForList(scenes);
}

// create a legened element based on it's type and properties
function buildLegendLi(properties) {
  const { label, image, colour } = properties;
  const li = document.createElement("li");

  const container = document.createElement("div");
  container.className = "flex h-9 items-center justify-center pb-3 w-12";
  const icon = document.createElement("div");
  container.appendChild(icon);

  switch (image) {
    case "line":
      icon.className = "h-[5px] w-10";
      break;
    case "smallCircle":
      icon.className =
        "bg-[#F0F2F4] border-[3px] h-[15px] rounded-full w-[15px]";
      break;
    case "largeCircle":
      icon.className =
        "bg-transparent border-[5px] h-[30px] rounded-full w-[30px]";
      break;
    default:
      break;
  }

  icon.classList.add(colour);
  li.className = "flex items-center";
  li.appendChild(container);

  const p = document.createElement("p");
  p.innerText += label;
  li.appendChild(p);

  return li;
}

function addLegend() {
  // set the legend title
  module.setLegendTitle("Yonge North Subway Extension");
  // establish the legend categories and colours for each
  const categories = [
    {
      label: "Tunneled Line (approximate)",
      image: "line",
      colour: "bg-[#FFD515]",
    },
    {
      label: "At-Grade Line (approximate)",
      image: "line",
      colour: "bg-[#E2871F]",
    },
    {
      label: "Confirmed Station",
      image: "smallCircle",
      colour: "border-[#1D1E23]",
    },
    {
      label: "Potential Station",
      image: "smallCircle",
      colour: "border-[#A3A8AC]",
    },
    {
      label: "Transit Hub",
      image: "largeCircle",
      colour: "border-[#00A168]",
    },
    {
      label: "Tunnel Portal",
      image: "largeCircle",
      colour: "border-[#E2871F]",
    },
    {
      label: "Richmond Hill Go Line",
      image: "line",
      colour: "bg-[#00A168]",
    },
    {
      label: "Viva BRT Lines",
      image: "line",
      colour: "bg-[#108DF6]",
    },
  ];
  // create a container and add each element
  const ul = document.createElement("ul");
  categories.forEach((c) => ul.appendChild(buildLegendLi(c)));
  module.addToLegend(ul);
  // create an element to credit the source
  const source = document.createElement("p");
  source.className = "mt-3";
  source.innerHTML = `Source: <a href="https://www.metrolinx.com/en/projects-and-programs/yonge-north-subway-extension" target="_blank">Metrolinx Project Page</a>`;
  module.addToLegend(source);
  // load the legend with all elements added
  module.initLegend();
}

// establish consistent line width and starting opacity
const lineWidth = ["interpolate", ["linear"], ["zoom"], 14, 5, 20, 10];
const opacity = [
  "case",
  [
    "any",
    ["==", ["get", "LINE"], "1-ext"],
    ["==", ["get", "STATION"], "Finch"],
  ],
  0.9,
  0.25,
];

// add the Yonge line and stops, including extension details to the map
function addLines() {
  module.addFeatureLayer({
    id: "yonge-ext-line-highlight",
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "RID"], "1x"],
    ],
    source: "yonge-north-extension",
    type: "line",
    paint: {
      "line-color": "#000",
      "line-opacity": 0.75,
      "line-width": ["interpolate", ["linear"], ["zoom"], 14, 10, 20, 20],
    },
    layout: {
      "line-cap": "round",
    },
  });
  module.addFeatureLayer({
    id: "yonge-ext-features",
    filter: [
      "any",
      ["==", ["get", "transit-hub"], true],
      ["==", ["get", "TYPE"], "tunnel-portal"],
    ],
    source: "yonge-north-extension",
    type: "circle",
    paint: {
      "circle-color": "#33373D",
      "circle-opacity": 0.1,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 10, 20, 30],
      "circle-stroke-color": [
        "case",
        ["==", ["get", "TYPE"], "tunnel-portal"],
        "#E2871F",
        "#00A168",
      ],
      "circle-stroke-opacity": 0.9,
      "circle-stroke-width": lineWidth,
    },
  });
  module.addFeatureLayer({
    id: "yonge-ext-lines",
    filter: ["==", ["geometry-type"], "LineString"],
    source: "yonge-north-extension",
    type: "line",
    paint: {
      "line-color": [
        "case",
        ["==", ["get", "level"], "at-grade"],
        "#E2871F",
        "#FFD515",
      ],
      "line-opacity": ["case", ["==", ["get", "RID"], 1], 0.2, 0.9],
      "line-width": lineWidth,
    },
    layout: {
      "line-cap": "round",
    },
  });
  module.addFeatureLayer({
    id: "yonge-ext-stops",
    filter: [
      "all",
      ["==", ["geometry-type"], "Point"],
      ["!=", ["get", "TYPE"], "tunnel-portal"],
    ],
    source: "yonge-north-extension",
    type: "circle",
    paint: {
      "circle-color": "#F0F2F4",
      "circle-opacity": opacity,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 5, 20, 15],
      "circle-stroke-color": [
        "case",
        ["any", ["get", "confirmed-station"], ["==", ["get", "LINE"], 1]],
        "#1D1E23",
        "#A3A8AC",
      ],
      "circle-stroke-opacity": opacity,
      "circle-stroke-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14,
        3,
        20,
        5,
      ],
    },
  });
  module.addVizLayer({
    id: "labels",
    filter: [
      "all",
      ["==", ["geometry-type"], "Point"],
      ["any", ["!=", ["get", "LINE"], 1], ["==", ["get", "STATION"], "Finch"]],
    ],
    source: "yonge-north-extension",
    type: "symbol",
    layout: {
      "text-anchor": "right",
      "text-field": ["get", "STATION"],
      "text-font": ["JetBrains Mono Regular"],
      "text-offset": [-1, 0],
      "text-size": ["interpolate", ["linear"], ["zoom"], 10, 16, 20, 22],
    },
    paint: {
      "text-color": "#FFF",
      "text-halo-color": "#7035E6",
      "text-halo-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 20, 2],
      "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.75, 20, 0.9],
    },
  });
}

// fetch the data for the Yonge line and stops and trigger main build
function addMainViz() {
  fetch(
    "https://media.geomodul.us/articles/yonge-north-subway-extension/yonge-north-extension.geojson",
  )
    .then((r) => r.json())
    .then((d) => {
      module.addSource("yonge-north-extension", {
        data: d,
        type: "geojson",
      });
      addLines();
      addLegend();
      addScenes();
    })
    .catch((e) => console.error(e));
}

// add the Richmond Hill Go line to the map
function addGoLine() {
  module.addFeatureLayer({
    id: "richmond-line",
    filter: ["==", ["geometry-type"], "LineString"],
    source: "richmond-hill",
    type: "line",
    paint: {
      "line-color": "#00A168",
      "line-opacity": module.isDarkMode() ? 0.25 : 0.2,
      "line-width": lineWidth,
    },
    layout: {
      "line-cap": "round",
    },
  });
  module.addFeatureLayer({
    id: "richmond-stops",
    filter: [
      "all",
      ["==", ["geometry-type"], "Point"],
      ["==", ["get", "STNTYPE"], "Passenger Station"],
    ],
    source: "richmond-hill",
    type: "circle",
    paint: {
      "circle-color": "#F0F2F4",
      "circle-opacity": opacity,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 5, 20, 15],
      "circle-stroke-color": "#1D1E23",
      "circle-stroke-opacity": opacity,
      "circle-stroke-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14,
        3,
        20,
        5,
      ],
    },
  });
  module.addVizLayer({
    id: "richmond-hill-label",
    filter: ["==", ["geometry-type"], "LineString"],
    source: "richmond-hill",
    type: "symbol",
    layout: {
      "symbol-placement": "line-center",
      "text-field": "Richmond Hill GO Line",
      "text-font": ["JetBrains Mono Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 10, 16, 20, 22],
    },
    paint: {
      "text-color": "#FFF",
      "text-halo-color": "#7035E6",
      "text-halo-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 20, 2],
      "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.25, 20, 0.5],
    },
  });
}

// fetch the data for the Richmond Hill Go line and trigger build
fetch(
  "https://media.geomodul.us/articles/yonge-north-subway-extension/richmondHill.geojson",
)
  .then((r) => r.json())
  .then((d) => {
    module.addSource("richmond-hill", {
      data: d,
      type: "geojson",
    });
    addGoLine();
    addMainViz();
  })
  .catch((e) => console.error(e));

// add the Viva BRT lines to the map
function addVivaLines() {
  module.addFeatureLayer({
    id: "bus-routes",
    source: "bus-routes",
    type: "line",
    paint: {
      "line-color": "#108DF6",
      "line-opacity": module.isDarkMode() ? 0.25 : 0.2,
      "line-width": lineWidth,
    },
    layout: {
      "line-cap": "round",
    },
  });
  module.addVizLayer({
    id: "bus-label",
    source: "bus-routes",
    type: "symbol",
    layout: {
      "symbol-placement": "line",
      "text-field": "Viva BRT Line",
      "text-font": ["JetBrains Mono Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 10, 16, 20, 22],
    },
    paint: {
      "text-color": "#FFF",
      "text-halo-color": "#7035E6",
      "text-halo-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 20, 2],
      "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.25, 20, 0.5],
    },
  });
}

// fetch the data for the Viva BRT lines and trigger build
fetch(
  "https://media.geomodul.us/articles/yonge-north-subway-extension/viva-brt-routes.geojson",
)
  .then((r) => r.json())
  .then((d) => {
    module.addSource("bus-routes", {
      data: d,
      type: "geojson",
    });
    addVivaLines();
  })
  .catch((e) => console.error(e));
