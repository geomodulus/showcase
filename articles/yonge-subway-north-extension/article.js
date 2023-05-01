function addLegend() {
  module.setLegendTitle("Yonge North subway extension");

  const categories = [
    {
      label: "Tunneled Line",
      image: "line",
      colour: "bg-[#FFD515]",
    },
    {
      label: "At-Grade Line",
      image: "line",
      colour: "bg-[#E2871F]",
    },
    {
      label: "Confirmed Station",
      image: "smallCircle",
      colour: "border-[#141516]",
    },
    {
      label: "Potential Station",
      image: "smallCircle",
      colour: "border-[#A3A8AC]",
    },
    {
      label: "Transit Hub ",
      image: "largeCircle",
      colour: "border-[#00A168]",
    },
    {
      label: "Tunnel Portal",
      image: "largeCircle",
      colour: "border-[#E2871F]",
    },
  ];

  const ul = document.createElement("ul");
  ul.className = "space-y-1";

  categories.forEach((c) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    li.appendChild(span);
    li.className = "border-2";
    li.classList.add(c.colour);
    li.innerHTML += c.label;
    ul.appendChild(li);
  });
  module.addToLegend(ul);
  module.initLegend();
}

const lineWidth = ["interpolate", ["linear"], ["zoom"], 14, 5, 20, 10];

const opacity = [
  "case",
  ["all", ["==", ["get", "LINE"], 1], ["!=", ["get", "STATION"], "Finch"]],
  0.25,
  0.9,
];

function addLines() {
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
      "line-opacity": ["case", ["==", ["get", "RID"], 1], 0.25, 0.9],
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
      ["!=", ["get", "TYPE"], "tunnel-portal"], // add tunnel portal separately?
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
        "#141516",
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

fetch(
  "https://media.geomodul.us/articles/yonge-north-subway-extension/yonge-north-extension.geojson"
)
  .then((r) => r.json())
  .then((d) => {
    module.addSource("yonge-north-extension", {
      data: d,
      type: "geojson",
    });
    addLines();
    addLegend();
  })
  .catch((e) => console.error(e));
