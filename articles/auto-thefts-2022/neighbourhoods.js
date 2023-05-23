module.hideLayer("settlement-subdivision-label");
module.hideLayer("settlement-minor-label");
module.hideLayer("settlement-major-label");

const egObj = {
  2014: 29,
  2015: 22,
  2016: 15,
  2017: 24,
  2018: 37,
  2019: 49,
  2020: 36,
  2021: 72,
  2022: 116,
  totalArea: 28971290.225709677,
  _id: 19,
  AREA_ID: 2502348,
  AREA_ATTR_ID: 26022863,
  PARENT_AREA_ID: 0,
  AREA_SHORT_CODE: "144",
  AREA_LONG_CODE: "144",
  AREA_NAME: "Morningside Heights",
  AREA_DESC: "Morningside Heights (144)",
  CLASSIFICATION: "Not an NIA or Emerging Neighbourhood",
  CLASSIFICATION_CODE: "NA",
  OBJECTID: 17825025,
  "perKm2-2014": 0.001000990973272735,
  "perKm2-2015": 0.0007593724624827645,
  "perKm2-2016": 0.0005177539516927939,
  "perKm2-2017": 0.0008284063227084703,
  "perKm2-2018": 0.0012771264141755584,
  "perKm2-2019": 0.0016913295755297934,
  "perKm2-2020": 0.0012426094840627055,
  "perKm2-2021": 0.002485218968125411,
  "perKm2-2022": 0.00400396389309094,
};

function updateViz(year) {
  const perKm2 = `perKm2-${year}`;
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

const interval = setInterval(() => {
  const selector = document.getElementById("year-selector");
  if (selector) {
    selector.addEventListener("change", (e) => updateViz(e.target.value));
    clearInterval(interval);
  }
}, 1000);

function showDetails(e) {
  // console.log(e.features[0].properties);

  const {
    AREA_NAME,
    "perKm2-2022": perKm2_2022,
    2022: total2022,
  } = e.features[0].properties;

  const content = document.createElement("div");
  content.className = "space-y-1 text-sm lg:text:base";
  content.innerHTML = `
    <h3 class="font-bold">${AREA_NAME}</h3>
    <p>Thefts/km<sup>2</sup>: ${perKm2_2022.toFixed(4)}</p>
    <p>Total Thefts: ${total2022}</p>
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
      offset: 10,
    })
      .setLngLat(center.geometry.coordinates)
      .setHTML(defaultHTML)
  );
  // const z = module.map.getZoom();
  module.map.fitBounds(bbox, {
    bearing: module.map.getBearing(),
    duration: 2500,
    padding: window.innerWidth < 1024 ? 0 : 50,
    pitch: module.map.getPitch(),
  });
}

const limits = {
  highestTotal: 0,
  highestPerKm: 0,
};

function addNeighbourhoods() {
  module.addUnderglowLayer({
    id: "neighbourhoods-trigger",
    source: "neighbourhoods",
    type: "fill",
    paint: {
      "fill-color": "#108DF6",
      // "fill-opacity": ["/", ["get", "perKm2-2022"], limits.highestPerKm],
      "fill-opacity": 0,
    },
  });
  module.addFeatureLayer({
    id: "neighbourhoods-line",
    source: "neighbourhoods",
    type: "line",
    paint: {
      "line-color": "#108DF6",
      "line-opacity": 0.5,
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 20, 4],
    },
  });
  module.addFeatureLayer({
    id: "neighbourhoods-fill",
    source: "neighbourhoods",
    type: "fill-extrusion",
    paint: {
      "fill-extrusion-base": 0,
      "fill-extrusion-color": [
        "case",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.5],
        "#ED3242",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.25],
        "#E2871F",
        [">", ["get", "perKm2-2022"], limits.highestPerKm * 0.125],
        "#FFD515",
        "#108DF6",
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
        10,
        0.5,
        15,
        0,
      ],
    },
  });
  module.handleCursor("neighbourhoods-trigger", showDetails);
}

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

const theftsByYear = {
  Cliffcrest: {
    2014: 19,
    2015: 12,
    2016: 10,
    2017: 15,
    2018: 19,
    2019: 17,
    2020: 18,
    2021: 29,
    2022: 37,
  },
  "Edenbridge-Humber Valley": {
    2014: 27,
    2015: 22,
    2016: 27,
    2017: 18,
    2018: 16,
    2019: 22,
    2020: 32,
    2021: 27,
    2022: 71,
  },
  "Mount Olive-Silverstone-Jamestown": {
    2014: 59,
    2015: 52,
    2016: 41,
    2017: 50,
    2018: 74,
    2019: 79,
    2020: 80,
    2021: 72,
    2022: 106,
  },
  "Agincourt North": {
    2014: 17,
    2015: 26,
    2016: 17,
    2017: 32,
    2018: 41,
    2019: 36,
    2020: 56,
    2021: 46,
    2022: 46,
  },
  "Woodbine-Lumsden": {
    2014: 2,
    2015: 6,
    2016: 2,
    2017: 1,
    2018: 2,
    2019: 8,
    2020: 3,
    2021: 9,
    2022: 19,
  },
  "Glenfield-Jane Heights": {
    2014: 40,
    2015: 49,
    2016: 59,
    2017: 49,
    2018: 60,
    2019: 78,
    2020: 104,
    2021: 91,
    2022: 148,
  },
  "Bendale-Glen Andrew": {
    2014: 34,
    2015: 34,
    2016: 32,
    2017: 24,
    2018: 36,
    2019: 33,
    2020: 45,
    2021: 68,
    2022: 71,
  },
  "O'Connor-Parkview": {
    2014: 21,
    2015: 12,
    2016: 6,
    2017: 8,
    2018: 16,
    2019: 23,
    2020: 19,
    2021: 38,
    2022: 31,
  },
  "Banbury-Don Mills": {
    2014: 17,
    2015: 19,
    2016: 7,
    2017: 16,
    2018: 23,
    2019: 36,
    2020: 40,
    2021: 32,
    2022: 50,
  },
  "East Willowdale": {
    2014: 14,
    2015: 19,
    2016: 20,
    2017: 14,
    2018: 11,
    2019: 25,
    2020: 20,
    2021: 39,
    2022: 40,
  },
  "Thorncliffe Park": {
    2014: 12,
    2015: 11,
    2016: 5,
    2017: 9,
    2018: 12,
    2019: 15,
    2020: 19,
    2021: 16,
    2022: 24,
  },
  "York University Heights": {
    2014: 99,
    2015: 97,
    2016: 101,
    2017: 83,
    2018: 82,
    2019: 132,
    2020: 167,
    2021: 146,
    2022: 196,
  },
  "Humber Summit": {
    2014: 62,
    2015: 36,
    2016: 59,
    2017: 79,
    2018: 105,
    2019: 118,
    2020: 95,
    2021: 122,
    2022: 148,
  },
  "Bedford Park-Nortown": {
    2014: 37,
    2015: 37,
    2016: 29,
    2017: 40,
    2018: 44,
    2019: 53,
    2020: 70,
    2021: 94,
    2022: 152,
  },
  Avondale: {
    2014: 9,
    2015: 4,
    2016: 6,
    2017: 1,
    2018: 8,
    2019: 14,
    2020: 28,
    2021: 32,
    2022: 18,
  },
  "Brookhaven-Amesbury": {
    2014: 37,
    2015: 40,
    2016: 28,
    2017: 24,
    2018: 43,
    2019: 36,
    2020: 48,
    2021: 44,
    2022: 61,
  },
  "Briar Hill-Belgravia": {
    2014: 15,
    2015: 13,
    2016: 15,
    2017: 10,
    2018: 35,
    2019: 17,
    2020: 32,
    2021: 27,
    2022: 45,
  },
  Rustic: {
    2014: 8,
    2015: 16,
    2016: 10,
    2017: 11,
    2018: 14,
    2019: 31,
    2020: 21,
    2021: 15,
    2022: 32,
  },
  "Junction Area": {
    2014: 23,
    2015: 23,
    2016: 19,
    2017: 23,
    2018: 31,
    2019: 27,
    2020: 34,
    2021: 22,
    2022: 38,
  },
  "Keelesdale-Eglinton West": {
    2014: 17,
    2015: 14,
    2016: 13,
    2017: 25,
    2018: 20,
    2019: 29,
    2020: 21,
    2021: 22,
    2022: 25,
  },
  "Kingsview Village-The Westway": {
    2014: 55,
    2015: 49,
    2016: 38,
    2017: 33,
    2018: 48,
    2019: 37,
    2020: 54,
    2021: 74,
    2022: 99,
  },
  "Cabbagetown-South St.James Town": {
    2014: 8,
    2015: 7,
    2016: 8,
    2017: 8,
    2018: 20,
    2019: 21,
    2020: 11,
    2021: 4,
    2022: 18,
  },
  "Eglinton East": {
    2014: 19,
    2015: 18,
    2016: 19,
    2017: 27,
    2018: 12,
    2019: 25,
    2020: 29,
    2021: 35,
    2022: 41,
  },
  "Etobicoke City Centre": {
    2014: 62,
    2015: 70,
    2016: 92,
    2017: 68,
    2018: 106,
    2019: 105,
    2020: 87,
    2021: 101,
    2022: 162,
  },
  "West Rouge": {
    2014: 30,
    2015: 26,
    2016: 5,
    2017: 7,
    2018: 13,
    2019: 30,
    2020: 15,
    2021: 33,
    2022: 55,
  },
  "Dorset Park": {
    2014: 46,
    2015: 40,
    2016: 41,
    2017: 41,
    2018: 74,
    2019: 59,
    2020: 60,
    2021: 42,
    2022: 63,
  },
  Steeles: {
    2014: 17,
    2015: 15,
    2016: 28,
    2017: 31,
    2018: 21,
    2019: 31,
    2020: 24,
    2021: 40,
    2022: 35,
  },
  "Bayview Woods-Steeles": {
    2014: 14,
    2015: 7,
    2016: 15,
    2017: 21,
    2018: 7,
    2019: 17,
    2020: 14,
    2021: 24,
    2022: 15,
  },
  "Agincourt South-Malvern West": {
    2014: 34,
    2015: 26,
    2016: 25,
    2017: 34,
    2018: 34,
    2019: 51,
    2020: 49,
    2021: 33,
    2022: 71,
  },
  "Fenside-Parkwoods": {
    2014: 18,
    2015: 15,
    2016: 16,
    2017: 25,
    2018: 10,
    2019: 19,
    2020: 21,
    2021: 30,
    2022: 30,
  },
  Humbermede: {
    2014: 35,
    2015: 31,
    2016: 45,
    2017: 54,
    2018: 54,
    2019: 60,
    2020: 69,
    2021: 59,
    2022: 100,
  },
  "Newtonbrook East": {
    2014: 15,
    2015: 7,
    2016: 8,
    2017: 9,
    2018: 14,
    2019: 28,
    2020: 34,
    2021: 43,
    2022: 51,
  },
  "Morningside Heights": {
    2014: 29,
    2015: 22,
    2016: 15,
    2017: 24,
    2018: 37,
    2019: 49,
    2020: 36,
    2021: 72,
    2022: 116,
  },
  "Long Branch": {
    2014: 9,
    2015: 15,
    2016: 12,
    2017: 11,
    2018: 10,
    2019: 9,
    2020: 20,
    2021: 38,
    2022: 30,
  },
  "Kennedy Park": {
    2014: 25,
    2015: 12,
    2016: 12,
    2017: 27,
    2018: 27,
    2019: 19,
    2020: 26,
    2021: 27,
    2022: 41,
  },
  "South Riverdale": {
    2014: 20,
    2015: 22,
    2016: 27,
    2017: 33,
    2018: 35,
    2019: 37,
    2020: 35,
    2021: 41,
    2022: 71,
  },
  "Don Valley Village": {
    2014: 49,
    2015: 27,
    2016: 28,
    2017: 29,
    2018: 24,
    2019: 20,
    2020: 34,
    2021: 31,
    2022: 58,
  },
  "Wexford/Maryvale": {
    2014: 55,
    2015: 45,
    2016: 41,
    2017: 61,
    2018: 79,
    2019: 80,
    2020: 75,
    2021: 80,
    2022: 115,
  },
  "West Humber-Clairville": {
    2014: 298,
    2015: 256,
    2016: 287,
    2017: 295,
    2018: 436,
    2019: 445,
    2020: 339,
    2021: 438,
    2022: 672,
  },
  "Trinity-Bellwoods": {
    2014: 12,
    2015: 16,
    2016: 20,
    2017: 20,
    2018: 19,
    2019: 23,
    2020: 15,
    2021: 19,
    2022: 29,
  },
  "Taylor-Massey": {
    2014: 11,
    2015: 9,
    2016: 6,
    2017: 5,
    2018: 11,
    2019: 9,
    2020: 14,
    2021: 17,
    2022: 14,
  },
  "Oakdale-Beverley Heights": {
    2014: 66,
    2015: 66,
    2016: 48,
    2017: 49,
    2018: 73,
    2019: 84,
    2020: 88,
    2021: 103,
    2022: 100,
  },
  "Pelmo Park-Humberlea": {
    2014: 30,
    2015: 24,
    2016: 25,
    2017: 42,
    2018: 59,
    2019: 66,
    2020: 56,
    2021: 63,
    2022: 87,
  },
  "Tam O'Shanter-Sullivan": {
    2014: 21,
    2015: 19,
    2016: 18,
    2017: 14,
    2018: 28,
    2019: 25,
    2020: 33,
    2021: 54,
    2022: 73,
  },
  "Rockcliffe-Smythe": {
    2014: 43,
    2015: 40,
    2016: 33,
    2017: 45,
    2018: 48,
    2019: 34,
    2020: 55,
    2021: 42,
    2022: 52,
  },
  "Regent Park": {
    2014: 9,
    2015: 12,
    2016: 4,
    2017: 8,
    2018: 9,
    2019: 24,
    2020: 9,
    2021: 8,
    2022: 11,
  },
  "Yorkdale-Glen Park": {
    2014: 65,
    2015: 49,
    2016: 38,
    2017: 43,
    2018: 45,
    2019: 59,
    2020: 75,
    2021: 81,
    2022: 176,
  },
  "Centennial Scarborough": {
    2014: 8,
    2015: 7,
    2016: 3,
    2017: 8,
    2018: 10,
    2019: 19,
    2020: 9,
    2021: 20,
    2022: 24,
  },
  "Stonegate-Queensway": {
    2014: 39,
    2015: 31,
    2016: 14,
    2017: 34,
    2018: 34,
    2019: 34,
    2020: 46,
    2021: 59,
    2022: 126,
  },
  Oakridge: {
    2014: 20,
    2015: 14,
    2016: 11,
    2017: 12,
    2018: 13,
    2019: 7,
    2020: 16,
    2021: 17,
    2022: 21,
  },
  "Wellington Place": {
    2014: 27,
    2015: 18,
    2016: 24,
    2017: 28,
    2018: 35,
    2019: 31,
    2020: 40,
    2021: 36,
    2022: 62,
  },
  "Junction-Wallace Emerson": {
    2014: 21,
    2015: 14,
    2016: 12,
    2017: 16,
    2018: 28,
    2019: 21,
    2020: 39,
    2021: 31,
    2022: 40,
  },
  "Hillcrest Village": {
    2014: 9,
    2015: 10,
    2016: 21,
    2017: 17,
    2018: 22,
    2019: 24,
    2020: 22,
    2021: 35,
    2022: 14,
  },
  "St.Andrew-Windfields": {
    2014: 16,
    2015: 23,
    2016: 10,
    2017: 13,
    2018: 24,
    2019: 35,
    2020: 27,
    2021: 58,
    2022: 79,
  },
  "Church-Wellesley": {
    2014: 11,
    2015: 10,
    2016: 9,
    2017: 17,
    2018: 21,
    2019: 18,
    2020: 6,
    2021: 29,
    2022: 14,
  },
  "Forest Hill North": {
    2014: 12,
    2015: 13,
    2016: 8,
    2017: 11,
    2018: 16,
    2019: 27,
    2020: 33,
    2021: 31,
    2022: 36,
  },
  "Humewood-Cedarvale": {
    2014: 11,
    2015: 7,
    2016: 17,
    2017: 19,
    2018: 20,
    2019: 15,
    2020: 26,
    2021: 29,
    2022: 52,
  },
  "New Toronto": {
    2014: 9,
    2015: 13,
    2016: 10,
    2017: 12,
    2018: 10,
    2019: 19,
    2020: 20,
    2021: 15,
    2022: 33,
  },
  Weston: {
    2014: 51,
    2015: 36,
    2016: 36,
    2017: 40,
    2018: 50,
    2019: 44,
    2020: 69,
    2021: 55,
    2022: 88,
  },
  "Clairlea-Birchmount": {
    2014: 43,
    2015: 27,
    2016: 34,
    2017: 36,
    2018: 45,
    2019: 67,
    2020: 53,
    2021: 42,
    2022: 61,
  },
  "Bathurst Manor": {
    2014: 36,
    2015: 23,
    2016: 24,
    2017: 24,
    2018: 33,
    2019: 22,
    2020: 42,
    2021: 39,
    2022: 70,
  },
  "Willowridge-Martingrove-Richview": {
    2014: 43,
    2015: 35,
    2016: 46,
    2017: 40,
    2018: 48,
    2019: 38,
    2020: 68,
    2021: 53,
    2022: 99,
  },
  Milliken: {
    2014: 34,
    2015: 43,
    2016: 33,
    2017: 57,
    2018: 81,
    2019: 73,
    2020: 69,
    2021: 67,
    2022: 95,
  },
  Islington: {
    2014: 24,
    2015: 19,
    2016: 32,
    2017: 24,
    2018: 35,
    2019: 46,
    2020: 44,
    2021: 52,
    2022: 85,
  },
  "Corso Italia-Davenport": {
    2014: 15,
    2015: 9,
    2016: 6,
    2017: 11,
    2018: 11,
    2019: 16,
    2020: 12,
    2021: 22,
    2022: 33,
  },
  "Kensington-Chinatown": {
    2014: 24,
    2015: 25,
    2016: 25,
    2017: 25,
    2018: 20,
    2019: 39,
    2020: 52,
    2021: 23,
    2022: 32,
  },
  "Palmerston-Little Italy": {
    2014: 13,
    2015: 16,
    2016: 13,
    2017: 15,
    2018: 17,
    2019: 12,
    2020: 16,
    2021: 10,
    2022: 21,
  },
  "Woburn North": {
    2014: 25,
    2015: 13,
    2016: 21,
    2017: 19,
    2018: 18,
    2019: 37,
    2020: 46,
    2021: 47,
    2022: 92,
  },
  "Lambton Baby Point": {
    2014: 7,
    2015: 5,
    2016: 1,
    2017: 5,
    2018: 15,
    2019: 9,
    2020: 11,
    2021: 10,
    2022: 22,
  },
  "High Park-Swansea": {
    2014: 19,
    2015: 14,
    2016: 11,
    2017: 14,
    2018: 19,
    2019: 25,
    2020: 41,
    2021: 25,
    2022: 66,
  },
  "Weston-Pelham Park": {
    2014: 23,
    2015: 14,
    2016: 15,
    2017: 7,
    2018: 14,
    2019: 13,
    2020: 16,
    2021: 14,
    2022: 28,
  },
  "Humber Heights-Westmount": {
    2014: 27,
    2015: 25,
    2016: 14,
    2017: 23,
    2018: 15,
    2019: 17,
    2020: 21,
    2021: 21,
    2022: 27,
  },
  "Eringate-Centennial-West Deane": {
    2014: 27,
    2015: 25,
    2016: 27,
    2017: 28,
    2018: 23,
    2019: 35,
    2020: 45,
    2021: 56,
    2022: 85,
  },
  "Bridle Path-Sunnybrook-York Mills": {
    2014: 6,
    2015: 9,
    2016: 8,
    2017: 2,
    2018: 9,
    2019: 11,
    2020: 16,
    2021: 35,
    2022: 57,
  },
  Downsview: {
    2014: 37,
    2015: 31,
    2016: 36,
    2017: 27,
    2018: 27,
    2019: 67,
    2020: 51,
    2021: 53,
    2022: 109,
  },
  "Highland Creek": {
    2014: 24,
    2015: 10,
    2016: 8,
    2017: 13,
    2018: 14,
    2019: 25,
    2020: 14,
    2021: 27,
    2022: 38,
  },
  "East End-Danforth": {
    2014: 19,
    2015: 13,
    2016: 22,
    2017: 24,
    2018: 26,
    2019: 17,
    2020: 26,
    2021: 35,
    2022: 34,
  },
  "Mount Dennis": {
    2014: 27,
    2015: 15,
    2016: 17,
    2017: 16,
    2018: 16,
    2019: 21,
    2020: 23,
    2021: 23,
    2022: 38,
  },
  "Lawrence Park North": {
    2014: 21,
    2015: 19,
    2016: 12,
    2017: 25,
    2018: 38,
    2019: 16,
    2020: 21,
    2021: 40,
    2022: 75,
  },
  "North St.James Town": {
    2014: 23,
    2015: 10,
    2016: 15,
    2017: 14,
    2018: 8,
    2019: 15,
    2020: 23,
    2021: 14,
    2022: 14,
  },
  "East L'Amoreaux": {
    2014: 7,
    2015: 8,
    2016: 11,
    2017: 10,
    2018: 13,
    2019: 12,
    2020: 12,
    2021: 18,
    2022: 42,
  },
  "Westminster-Branson": {
    2014: 27,
    2015: 19,
    2016: 24,
    2017: 15,
    2018: 29,
    2019: 28,
    2020: 45,
    2021: 58,
    2022: 75,
  },
  "Leaside-Bennington": {
    2014: 11,
    2015: 14,
    2016: 3,
    2017: 4,
    2018: 32,
    2019: 26,
    2020: 37,
    2021: 78,
    2022: 70,
  },
  "Fort York-Liberty Village": {
    2014: 10,
    2015: 15,
    2016: 13,
    2017: 10,
    2018: 11,
    2019: 18,
    2020: 13,
    2021: 12,
    2022: 15,
  },
  Roncesvalles: {
    2014: 12,
    2015: 6,
    2016: 14,
    2017: 18,
    2018: 22,
    2019: 13,
    2020: 13,
    2021: 16,
    2022: 21,
  },
  "West Hill": {
    2014: 23,
    2015: 16,
    2016: 13,
    2017: 29,
    2018: 26,
    2019: 43,
    2020: 50,
    2021: 67,
    2022: 54,
  },
  "Lansing-Westgate": {
    2014: 18,
    2015: 19,
    2016: 24,
    2017: 26,
    2018: 16,
    2019: 24,
    2020: 44,
    2021: 55,
    2022: 60,
  },
  "Harbourfront-CityPlace": {
    2014: 14,
    2015: 14,
    2016: 10,
    2017: 20,
    2018: 7,
    2019: 13,
    2020: 23,
    2021: 22,
    2022: 25,
  },
  "Downtown Yonge East": {
    2014: 27,
    2015: 17,
    2016: 16,
    2017: 14,
    2018: 45,
    2019: 39,
    2020: 25,
    2021: 43,
    2022: 42,
  },
  "Casa Loma": {
    2014: 4,
    2015: 3,
    2016: 5,
    2017: 8,
    2018: 12,
    2019: 5,
    2020: 18,
    2021: 18,
    2022: 28,
  },
  "L'Amoreaux West": {
    2014: 11,
    2015: 12,
    2016: 15,
    2017: 14,
    2018: 17,
    2019: 20,
    2020: 16,
    2021: 18,
    2022: 27,
  },
  "Dovercourt Village": {
    2014: 8,
    2015: 11,
    2016: 14,
    2017: 11,
    2018: 11,
    2019: 10,
    2020: 18,
    2021: 8,
    2022: 25,
  },
  "Malvern West": {
    2014: 7,
    2015: 17,
    2016: 17,
    2017: 25,
    2018: 26,
    2019: 34,
    2020: 21,
    2021: 22,
    2022: 51,
  },
  "South Parkdale": {
    2014: 12,
    2015: 19,
    2016: 22,
    2017: 19,
    2018: 15,
    2019: 21,
    2020: 16,
    2021: 16,
    2022: 30,
  },
  "Thistletown-Beaumond Heights": {
    2014: 10,
    2015: 13,
    2016: 15,
    2017: 21,
    2018: 39,
    2019: 48,
    2020: 40,
    2021: 41,
    2022: 51,
  },
  "Bayview Village": {
    2014: 23,
    2015: 14,
    2016: 13,
    2017: 17,
    2018: 6,
    2019: 36,
    2020: 26,
    2021: 36,
    2022: 48,
  },
  "Clanton Park": {
    2014: 67,
    2015: 29,
    2016: 45,
    2017: 24,
    2018: 34,
    2019: 37,
    2020: 41,
    2021: 83,
    2022: 127,
  },
  "Newtonbrook West": {
    2014: 48,
    2015: 24,
    2016: 40,
    2017: 30,
    2018: 46,
    2019: 52,
    2020: 57,
    2021: 82,
    2022: 155,
  },
  "Princess-Rosethorn": {
    2014: 21,
    2015: 19,
    2016: 21,
    2017: 18,
    2018: 21,
    2019: 23,
    2020: 19,
    2021: 21,
    2022: 59,
  },
  "Etobicoke West Mall": {
    2014: 11,
    2015: 14,
    2016: 15,
    2017: 8,
    2018: 9,
    2019: 10,
    2020: 9,
    2021: 14,
    2022: 31,
  },
  "Dufferin Grove": {
    2014: 12,
    2015: 7,
    2016: 7,
    2017: 11,
    2018: 17,
    2019: 6,
    2020: 16,
    2021: 17,
    2022: 9,
  },
  "West Queen West": {
    2014: 13,
    2015: 6,
    2016: 6,
    2017: 6,
    2018: 6,
    2019: 14,
    2020: 12,
    2021: 14,
    2022: 19,
  },
  NSA: {
    2014: 52,
    2015: 18,
    2016: 35,
    2017: 44,
    2018: 46,
    2019: 70,
    2020: 52,
    2021: 57,
    2022: 110,
  },
  Morningside: {
    2014: 20,
    2015: 13,
    2016: 13,
    2017: 11,
    2018: 11,
    2019: 9,
    2020: 27,
    2021: 31,
    2022: 51,
  },
  "Victoria Village": {
    2014: 18,
    2015: 11,
    2016: 19,
    2017: 10,
    2018: 10,
    2019: 15,
    2020: 15,
    2021: 33,
    2022: 30,
  },
  "Maple Leaf": {
    2014: 7,
    2015: 17,
    2016: 14,
    2017: 8,
    2018: 13,
    2019: 19,
    2020: 18,
    2021: 12,
    2022: 42,
  },
  "Flemingdon Park": {
    2014: 8,
    2015: 7,
    2016: 6,
    2017: 12,
    2018: 8,
    2019: 9,
    2020: 17,
    2021: 19,
    2022: 17,
  },
  "Little Portugal": {
    2014: 11,
    2015: 11,
    2016: 11,
    2017: 17,
    2018: 11,
    2019: 11,
    2020: 27,
    2021: 7,
    2022: 23,
  },
  Ionview: {
    2014: 5,
    2015: 12,
    2016: 6,
    2017: 5,
    2018: 3,
    2019: 9,
    2020: 6,
    2021: 9,
    2022: 10,
  },
  "Englemount-Lawrence": {
    2014: 29,
    2015: 20,
    2016: 19,
    2017: 32,
    2018: 36,
    2019: 19,
    2020: 28,
    2021: 33,
    2022: 56,
  },
  "Runnymede-Bloor West Village": {
    2014: 15,
    2015: 12,
    2016: 9,
    2017: 16,
    2018: 24,
    2019: 23,
    2020: 16,
    2021: 20,
    2022: 25,
  },
  "Kingsway South": {
    2014: 16,
    2015: 14,
    2016: 9,
    2017: 18,
    2018: 10,
    2019: 27,
    2020: 16,
    2021: 33,
    2022: 56,
  },
  "Playter Estates-Danforth": {
    2014: 2,
    2015: 7,
    2016: 7,
    2017: 4,
    2018: 9,
    2019: 8,
    2020: 6,
    2021: 6,
    2022: 17,
  },
  "Scarborough Village": {
    2014: 20,
    2015: 14,
    2016: 9,
    2017: 22,
    2018: 19,
    2019: 18,
    2020: 19,
    2021: 25,
    2022: 23,
  },
  "Moss Park": {
    2014: 25,
    2015: 20,
    2016: 16,
    2017: 20,
    2018: 45,
    2019: 40,
    2020: 38,
    2021: 47,
    2022: 52,
  },
  "Mimico-Queensway": {
    2014: 28,
    2015: 23,
    2016: 26,
    2017: 19,
    2018: 13,
    2019: 37,
    2020: 27,
    2021: 30,
    2022: 54,
  },
  "Rexdale-Kipling": {
    2014: 13,
    2015: 10,
    2016: 21,
    2017: 21,
    2018: 53,
    2019: 50,
    2020: 37,
    2021: 38,
    2022: 52,
  },
  "Lawrence Park South": {
    2014: 15,
    2015: 26,
    2016: 18,
    2017: 15,
    2018: 28,
    2019: 23,
    2020: 26,
    2021: 55,
    2022: 92,
  },
  "Elms-Old Rexdale": {
    2014: 7,
    2015: 18,
    2016: 13,
    2017: 11,
    2018: 28,
    2019: 27,
    2020: 42,
    2021: 46,
    2022: 56,
  },
  Annex: {
    2014: 12,
    2015: 15,
    2016: 17,
    2017: 22,
    2018: 30,
    2019: 23,
    2020: 37,
    2021: 36,
    2022: 57,
  },
  "Malvern East": {
    2014: 16,
    2015: 13,
    2016: 17,
    2017: 24,
    2018: 29,
    2019: 38,
    2020: 37,
    2021: 43,
    2022: 40,
  },
  "Yonge-Doris": {
    2014: 7,
    2015: 5,
    2016: 4,
    2017: 8,
    2018: 16,
    2019: 29,
    2020: 19,
    2021: 36,
    2022: 35,
  },
  "Markland Wood": {
    2014: 8,
    2015: 12,
    2016: 12,
    2017: 10,
    2018: 16,
    2019: 9,
    2020: 25,
    2021: 21,
    2022: 26,
  },
  "North Riverdale": {
    2014: 11,
    2015: 10,
    2016: 7,
    2017: 10,
    2018: 9,
    2019: 19,
    2020: 14,
    2021: 16,
    2022: 24,
  },
  "Greenwood-Coxwell": {
    2014: 15,
    2015: 17,
    2016: 11,
    2017: 11,
    2018: 17,
    2019: 25,
    2020: 26,
    2021: 18,
    2022: 22,
  },
  Alderwood: {
    2014: 10,
    2015: 15,
    2016: 14,
    2017: 15,
    2018: 17,
    2019: 13,
    2020: 25,
    2021: 25,
    2022: 59,
  },
  "Black Creek": {
    2014: 42,
    2015: 44,
    2016: 49,
    2017: 29,
    2018: 49,
    2019: 63,
    2020: 70,
    2021: 60,
    2022: 65,
  },
  "Pleasant View": {
    2014: 11,
    2015: 6,
    2016: 7,
    2017: 16,
    2018: 11,
    2019: 21,
    2020: 26,
    2021: 12,
    2022: 26,
  },
  "Golfdale-Cedarbrae-Woburn": {
    2014: 17,
    2015: 18,
    2016: 10,
    2017: 26,
    2018: 30,
    2019: 21,
    2020: 32,
    2021: 42,
    2022: 71,
  },
  University: {
    2014: 8,
    2015: 7,
    2016: 13,
    2017: 7,
    2018: 10,
    2019: 10,
    2020: 6,
    2021: 6,
    2022: 13,
  },
  "Yonge-Eglinton": {
    2014: 6,
    2015: 8,
    2016: 3,
    2017: 2,
    2018: 10,
    2019: 9,
    2020: 16,
    2021: 23,
    2022: 33,
  },
  "Henry Farm": {
    2014: 14,
    2015: 11,
    2016: 10,
    2017: 15,
    2018: 13,
    2019: 19,
    2020: 18,
    2021: 25,
    2022: 27,
  },
  "Beechborough-Greenbrook": {
    2014: 10,
    2015: 8,
    2016: 6,
    2017: 9,
    2018: 10,
    2019: 11,
    2020: 12,
    2021: 17,
    2022: 20,
  },
  "Caledonia-Fairbank": {
    2014: 9,
    2015: 4,
    2016: 11,
    2017: 7,
    2018: 10,
    2019: 8,
    2020: 10,
    2021: 9,
    2022: 24,
  },
  "Bay-Cloverhill": {
    2014: 6,
    2015: 4,
    2016: 4,
    2017: 6,
    2018: 15,
    2019: 6,
    2020: 8,
    2021: 19,
    2022: 14,
  },
  "Bendale South": {
    2014: 9,
    2015: 12,
    2016: 7,
    2017: 10,
    2018: 13,
    2019: 17,
    2020: 8,
    2021: 14,
    2022: 19,
  },
  "Oakwood Village": {
    2014: 19,
    2015: 12,
    2016: 25,
    2017: 13,
    2018: 30,
    2019: 35,
    2020: 22,
    2021: 28,
    2022: 55,
  },
  "Mount Pleasant East": {
    2014: 7,
    2015: 4,
    2016: 8,
    2017: 10,
    2018: 12,
    2019: 17,
    2020: 18,
    2021: 36,
    2022: 54,
  },
  "High Park North": {
    2014: 8,
    2015: 14,
    2016: 7,
    2017: 9,
    2018: 15,
    2019: 22,
    2020: 18,
    2021: 20,
    2022: 33,
  },
  "North Toronto": {
    2014: 4,
    2015: 1,
    2016: 2,
    2017: 1,
    2018: 3,
    2019: 5,
    2020: 10,
    2021: 12,
    2022: 9,
  },
  "Parkwoods-O'Connor Hills": {
    2014: 14,
    2015: 16,
    2016: 10,
    2017: 16,
    2018: 10,
    2019: 7,
    2020: 23,
    2021: 16,
    2022: 36,
  },
  "Humber Bay Shores": {
    2014: 5,
    2015: 7,
    2016: 7,
    2017: 16,
    2018: 9,
    2019: 19,
    2020: 15,
    2021: 21,
    2022: 45,
  },
  "Yonge-Bay Corridor": {
    2014: 10,
    2015: 16,
    2016: 17,
    2017: 15,
    2018: 22,
    2019: 37,
    2020: 14,
    2021: 18,
    2022: 26,
  },
  "Yonge-St.Clair": {
    2014: 2,
    2015: 2,
    2016: 6,
    2017: 2,
    2018: 5,
    2019: 6,
    2020: 7,
    2021: 13,
    2022: 29,
  },
  "South Eglinton-Davisville": {
    2014: 5,
    2015: 4,
    2016: 3,
    2017: 6,
    2018: 12,
    2019: 7,
    2020: 13,
    2021: 13,
    2022: 10,
  },
  "St Lawrence-East Bayfront-The Islands": {
    2014: 19,
    2015: 11,
    2016: 8,
    2017: 14,
    2018: 18,
    2019: 16,
    2020: 12,
    2021: 27,
    2022: 33,
  },
  "Blake-Jones": {
    2014: 4,
    2015: 5,
    2016: 5,
    2017: 8,
    2018: 10,
    2019: 7,
    2020: 6,
    2021: 5,
    2022: 8,
  },
  "Birchcliffe-Cliffside": {
    2014: 12,
    2015: 17,
    2016: 14,
    2017: 13,
    2018: 23,
    2019: 25,
    2020: 17,
    2021: 28,
    2022: 43,
  },
  "Danforth East York": {
    2014: 6,
    2015: 10,
    2016: 12,
    2017: 8,
    2018: 12,
    2019: 9,
    2020: 15,
    2021: 13,
    2022: 45,
  },
  "The Beaches": {
    2014: 7,
    2015: 24,
    2016: 7,
    2017: 13,
    2018: 30,
    2019: 20,
    2020: 20,
    2021: 29,
    2022: 51,
  },
  Guildwood: {
    2014: 2,
    2016: 4,
    2017: 4,
    2018: 2,
    2019: 3,
    2020: 10,
    2021: 10,
    2022: 7,
  },
  "Forest Hill South": {
    2014: 5,
    2015: 13,
    2016: 7,
    2017: 11,
    2018: 23,
    2019: 19,
    2020: 29,
    2021: 63,
    2022: 73,
  },
  "Woodbine Corridor": {
    2014: 7,
    2015: 10,
    2016: 8,
    2017: 6,
    2018: 11,
    2019: 6,
    2020: 11,
    2021: 11,
    2022: 17,
  },
  "Rosedale-Moore Park": {
    2014: 10,
    2015: 22,
    2016: 12,
    2017: 5,
    2018: 27,
    2019: 31,
    2020: 49,
    2021: 68,
    2022: 91,
  },
  Danforth: {
    2014: 8,
    2015: 4,
    2016: 5,
    2017: 4,
    2018: 11,
    2019: 7,
    2020: 6,
    2021: 18,
    2022: 21,
  },
  "Willowdale West": {
    2014: 9,
    2015: 13,
    2016: 11,
    2017: 14,
    2018: 8,
    2019: 20,
    2020: 35,
    2021: 29,
    2022: 40,
  },
  "Broadview North": {
    2014: 2,
    2015: 4,
    2016: 7,
    2017: 5,
    2018: 4,
    2019: 3,
    2020: 6,
    2021: 8,
    2022: 12,
  },
  "Old East York": {
    2014: 2,
    2015: 5,
    2016: 5,
    2018: 8,
    2019: 4,
    2020: 8,
    2021: 18,
    2022: 19,
  },
  Wychwood: {
    2014: 5,
    2015: 15,
    2016: 16,
    2017: 11,
    2018: 18,
    2019: 8,
    2020: 22,
    2021: 13,
    2022: 30,
  },
};

const theftsPerSquareKm2022 = {
  "Yonge-Doris": 0.07414529567259211,
  "Wellington Place": 0.06324330253193557,
  "Downtown Yonge East": 0.05190945622345318,
  "Moss Park": 0.037199162467144505,
  Weston: 0.034273517327098726,
  "North St.James Town": 0.03300175727383338,
  "Newtonbrook West": 0.03298598496845304,
  "Lawrence Park North": 0.03272927070686709,
  "Clanton Park": 0.03046082333639183,
  "Forest Hill South": 0.02941586332137035,
  "Yorkdale-Glen Park": 0.02912588693044174,
  "Glenfield-Jane Heights": 0.028712336530217784,
  "Humber Bay Shores": 0.02849321367344324,
  "Lawrence Park South": 0.028354030828496322,
  "Humewood-Cedarvale": 0.027770009416858733,
  "Bedford Park-Nortown": 0.027525227371476033,
  "Church-Wellesley": 0.025153732411333573,
  "Yonge-St.Clair": 0.024952801551167202,
  "Oakwood Village": 0.024763700621075285,
  "Briar Hill-Belgravia": 0.024602741354969624,
  "Yonge-Bay Corridor": 0.02322428075314635,
  "Forest Hill North": 0.022888721214180084,
  "Mount Olive-Silverstone-Jamestown": 0.02283869452868104,
  Humbermede: 0.02259847671011485,
  "North Toronto": 0.022370639279747834,
  "West Humber-Clairville": 0.02227422532944491,
  "Harbourfront-CityPlace": 0.02194621804351077,
  "Kingsway South": 0.02121048260299226,
  "West Queen West": 0.021054882500157003,
  "Kensington-Chinatown": 0.020837081412616622,
  "Rexdale-Kipling": 0.020736828504587787,
  "Danforth East York": 0.02054714289112023,
  "Westminster-Branson": 0.02043343954921308,
  Annex: 0.020413313052362107,
  "Pelmo Park-Humberlea": 0.020329593562882324,
  "Bay-Cloverhill": 0.020259359391973077,
  "Yonge-Eglinton": 0.019981469184515172,
  "Kingsview Village-The Westway": 0.019537022380957985,
  "Rosedale-Moore Park": 0.01950765405041871,
  "Weston-Pelham Park": 0.019217933553271564,
  "Playter Estates-Danforth": 0.01913984689215286,
  "Elms-Old Rexdale": 0.01909077766151679,
  "Little Portugal": 0.01889541573657732,
  "Black Creek": 0.018805370624304867,
  Danforth: 0.01874281459869779,
  "Humber Summit": 0.018562544211417065,
  "Junction-Wallace Emerson": 0.017981513700720077,
  "Willowridge-Martingrove-Richview": 0.017928948767025464,
  "Mount Dennis": 0.017832209284552984,
  Wychwood: 0.017822525640611434,
  "High Park North": 0.017518967993174882,
  "Corso Italia-Davenport": 0.017453426401221224,
  "Mount Pleasant East": 0.017444490015659713,
  Avondale: 0.017435097992225337,
  "Brookhaven-Amesbury": 0.017379187223795087,
  "Etobicoke West Mall": 0.017242859308736733,
  "Regent Park": 0.016904108963245346,
  "Trinity-Bellwoods": 0.016754571749221826,
  "Dovercourt Village": 0.016621260350424022,
  "Maple Leaf": 0.016611459700587455,
  "Englemount-Lawrence": 0.016088999870499172,
  "Etobicoke City Centre": 0.01597207839501202,
  "Woodbine-Lumsden": 0.01587211337218565,
  "Stonegate-Queensway": 0.01584491063893611,
  "Runnymede-Bloor West Village": 0.015675726471045925,
  "Caledonia-Fairbank": 0.015526977185410816,
  "Thistletown-Beaumond Heights": 0.015259640827071062,
  Rustic: 0.015252929585818496,
  "Oakdale-Beverley Heights": 0.014947214963811285,
  "York University Heights": 0.014785498105874052,
  "Bathurst Manor": 0.014694135278125808,
  "Palmerston-Little Italy": 0.014620925386215577,
  "Leaside-Bennington": 0.01461903904150267,
  "Woburn North": 0.01459622839195272,
  "Casa Loma": 0.014554625640713336,
  "Bendale-Glen Andrew": 0.014441867533331525,
  "Junction Area": 0.014427262507235956,
  "Keelesdale-Eglinton West": 0.01426989544738672,
  "The Beaches": 0.01417416699947332,
  Roncesvalles: 0.013947759287215955,
  Islington: 0.013911514486091462,
  "Willowdale West": 0.013862568369339884,
  "Don Valley Village": 0.013759545514134764,
  "Tam O'Shanter-Sullivan": 0.013455299810473248,
  "North Riverdale": 0.013428133120465188,
  "Long Branch": 0.013252570734867089,
  "Taylor-Massey": 0.013163068196026934,
  Downsview: 0.013150068905811243,
  "Greenwood-Coxwell": 0.013124185977269567,
  "South Parkdale": 0.013107759111264152,
  "East End-Danforth": 0.01287529727122105,
  "Edenbridge-Humber Valley": 0.012871864771543855,
  "Eglinton East": 0.012712141017384859,
  "Cabbagetown-South St.James Town": 0.01268582057065184,
  "Malvern West": 0.012648208429720436,
  "Newtonbrook East": 0.012477102234774308,
  "Lambton Baby Point": 0.012335146026747125,
  "High Park-Swansea": 0.012309640027797773,
  Alderwood: 0.011841775260708821,
  "Golfdale-Cedarbrae-Woburn": 0.011757685201287945,
  "Kennedy Park": 0.011442638435018734,
  "Princess-Rosethorn": 0.011400034749398588,
  "East Willowdale": 0.011375842659987256,
  "East L'Amoreaux": 0.011361596846274287,
  "Lansing-Westgate": 0.011214828629584115,
  "Wexford/Maryvale": 0.011196870937789687,
  Oakridge: 0.011173691797718056,
  "Beechborough-Greenbrook": 0.010899452981824197,
  "St.Andrew-Windfields": 0.010747450255862732,
  "Woodbine Corridor": 0.010646756227598003,
  "South Eglinton-Davisville": 0.010582310976051286,
  "Dorset Park": 0.010472178846445615,
  "Henry Farm": 0.010403492317513427,
  "Rockcliffe-Smythe": 0.010246710495335085,
  Milliken: 0.010017014611350027,
  "Mimico-Queensway": 0.009845230316449509,
  "Eringate-Centennial-West Deane": 0.00982362693998635,
  "Humber Heights-Westmount": 0.00962609069042256,
  "New Toronto": 0.009465349617606332,
  "Bayview Village": 0.00929761232478701,
  University: 0.00924470073929668,
  "Fenside-Parkwoods": 0.009042419622452813,
  "Agincourt South-Malvern West": 0.009012523815817217,
  Morningside: 0.008879463992119873,
  "Markland Wood": 0.008794745874677564,
  "Pleasant View": 0.008755993841889168,
  "Parkwoods-O'Connor Hills": 0.008675300960718944,
  "Blake-Jones": 0.008493926142508018,
  "Malvern East": 0.008272803486156752,
  "Clairlea-Birchmount": 0.008240256413338129,
  "Old East York": 0.008080103751814484,
  "L'Amoreaux West": 0.007796650786814078,
  "Thorncliffe Park": 0.007671452249208985,
  Steeles: 0.007668667010387894,
  "Bendale South": 0.007465146810765363,
  "Scarborough Village": 0.007293624737988561,
  "Highland Creek": 0.007236544273389982,
  "Birchcliffe-Cliffside": 0.007151306339658929,
  "Flemingdon Park": 0.006868858158223495,
  "Broadview North": 0.006868222242837761,
  "Dufferin Grove": 0.006479709003483071,
  "Bridle Path-Sunnybrook-York Mills": 0.006443985199010534,
  "South Riverdale": 0.006432470497993722,
  "Fort York-Liberty Village": 0.006406848706581254,
  "West Rouge": 0.006404547557929329,
  "O'Connor-Parkview": 0.006352554019948548,
  "Agincourt North": 0.006330438841039867,
  "Victoria Village": 0.00630469270240434,
  "West Hill": 0.005606864412165097,
  Cliffcrest: 0.005142279960004932,
  Ionview: 0.0051173769314867045,
  "Banbury-Don Mills": 0.004976250044161179,
  "Centennial Scarborough": 0.004386416808327805,
  "Morningside Heights": 0.00400396389309094,
  "Bayview Woods-Steeles": 0.0036659508212956043,
  "St Lawrence-East Bayfront-The Islands": 0.002914621494451154,
  "Hillcrest Village": 0.002593002874024755,
  Guildwood: 0.001838088894242669,
};
