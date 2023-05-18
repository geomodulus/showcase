const neighbourhoods = [
  "Victoria Village",
  "Cliffcrest",
  "Etobicoke City Centre",
  "Edenbridge-Humber Valley",
  "Mount Olive-Silverstone-Jamestown",
  "Agincourt North",
  "Woodbine-Lumsden",
  "Glenfield-Jane Heights",
  "Bendale-Glen Andrew",
  "O'Connor-Parkview",
  "Bendale South",
  "Banbury-Don Mills",
  "East Willowdale",
  "Thorncliffe Park",
  "York University Heights",
  "Humber Summit",
  "Bedford Park-Nortown",
  "Avondale",
  "Brookhaven-Amesbury",
  "Briar Hill-Belgravia",
  "Rustic",
  "Junction Area",
  "Keelesdale-Eglinton West",
  "Kingsview Village-The Westway",
  "Cabbagetown-South St.James Town",
  "Wexford/Maryvale",
  "NSA",
  "Eglinton East",
  "West Rouge",
  "Dorset Park",
  "Steeles",
  "Bayview Woods-Steeles",
  "Agincourt South-Malvern West",
  "Fenside-Parkwoods",
  "Humbermede",
  "Newtonbrook East",
  "Morningside Heights",
  "Long Branch",
  "Kennedy Park",
  "South Riverdale",
  "Don Valley Village",
  "West Humber-Clairville",
  "Trinity-Bellwoods",
  "Taylor-Massey",
  "Oakdale-Beverley Heights",
  "Pelmo Park-Humberlea",
  "Tam O'Shanter-Sullivan",
  "Rockcliffe-Smythe",
  "Regent Park",
  "Yorkdale-Glen Park",
  "Centennial Scarborough",
  "Stonegate-Queensway",
  "Oakridge",
  "Wellington Place",
  "Junction-Wallace Emerson",
  "Hillcrest Village",
  "St.Andrew-Windfields",
  "Church-Wellesley",
  "Forest Hill North",
  "Humewood-Cedarvale",
  "New Toronto",
  "Weston",
  "Clairlea-Birchmount",
  "Bathurst Manor",
  "Willowridge-Martingrove-Richview",
  "Milliken",
  "Islington",
  "Corso Italia-Davenport",
  "Kensington-Chinatown",
  "Palmerston-Little Italy",
  "Woburn North",
  "Lambton Baby Point",
  "High Park-Swansea",
  "Weston-Pelham Park",
  "Humber Heights-Westmount",
  "Eringate-Centennial-West Deane",
  "Bridle Path-Sunnybrook-York Mills",
  "Downsview",
  "Highland Creek",
  "East End-Danforth",
  "Mount Dennis",
  "Lawrence Park North",
  "North St.James Town",
  "East L'Amoreaux",
  "Westminster-Branson",
  "Leaside-Bennington",
  "Fort York-Liberty Village",
  "Roncesvalles",
  "West Hill",
  "Lansing-Westgate",
  "Harbourfront-CityPlace",
  "Downtown Yonge East",
  "Casa Loma",
  "L'Amoreaux West",
  "Dovercourt Village",
  "Malvern West",
  "South Parkdale",
  "Thistletown-Beaumond Heights",
  "Bayview Village",
  "Clanton Park",
  "Newtonbrook West",
  "Princess-Rosethorn",
  "Etobicoke West Mall",
  "Dufferin Grove",
  "West Queen West",
  "Morningside",
  "Maple Leaf",
  "Flemingdon Park",
  "Little Portugal",
  "Ionview",
  "Yonge-Bay Corridor",
  "Englemount-Lawrence",
  "Runnymede-Bloor West Village",
  "Kingsway South",
  "Playter Estates-Danforth",
  "Scarborough Village",
  "Moss Park",
  "Mimico-Queensway",
  "Rexdale-Kipling",
  "Lawrence Park South",
  "Elms-Old Rexdale",
  "Annex",
  "Malvern East",
  "Yonge-Doris",
  "Markland Wood",
  "North Riverdale",
  "Greenwood-Coxwell",
  "Alderwood",
  "Black Creek",
  "Pleasant View",
  "Golfdale-Cedarbrae-Woburn",
  "University",
  "Yonge-Eglinton",
  "Henry Farm",
  "Beechborough-Greenbrook",
  "Caledonia-Fairbank",
  "Bay-Cloverhill",
  "Oakwood Village",
  "Mount Pleasant East",
  "High Park North",
  "North Toronto",
  "Parkwoods-O'Connor Hills",
  "Humber Bay Shores",
  "Yonge-St.Clair",
  "South Eglinton-Davisville",
  "St Lawrence-East Bayfront-The Islands",
  "Blake-Jones",
  "Birchcliffe-Cliffside",
  "Old East York",
  "Danforth East York",
  "The Beaches",
  "Guildwood",
  "Forest Hill South",
  "Woodbine Corridor",
  "Rosedale-Moore Park",
  "Danforth",
  "Willowdale West",
  "Broadview North",
  "Wychwood",
];

const premisesTypes = [
  "Apartment",
  "Outside",
  "House",
  "Other",
  "Commercial",
  "Transit",
  "Educational",
];

const locationTypes = [
  "Apartment (Rooming House, Condo)",
  "Streets, Roads, Highways (Bicycle Path, Private Road)",
  "Parking Lots (Apt., Commercial Or Non-Commercial)",
  "Single Home, House (Attach Garage, Cottage, Mobile)",
  "Private Property Structure (Pool, Shed, Detached Garage)",
  "Other Commercial / Corporate Places (For Profit, Warehouse, Corp. Bldg",
  "Dealership (Car, Motorcycle, Marine, Trailer, Etc.)",
  "Other Non Commercial / Corporate Places (Non-Profit, Gov'T, Firehall)",
  "Go Station",
  "Bank And Other Financial Institutions (Money Mart, Tsx)",
  "Gas Station (Self, Full, Attached Convenience)",
  "Ttc Subway Station",
  "Commercial Dwelling Unit (Hotel, Motel, B & B, Short Term Rental)",
  "Bar / Restaurant",
  "Convenience Stores",
  "Hospital / Institutions / Medical Facilities (Clinic, Dentist, Morgue)",
  "Group Homes (Non-Profit, Halfway House, Social Agency)",
  "Open Areas (Lakes, Parks, Rivers)",
  "Unknown",
  "Construction Site (Warehouse, Trailer, Shed)",
  "Go Train",
  "Police / Courts (Parole Board, Probation Office)",
  "Schools During Supervised Activity",
  "Religious Facilities (Synagogue, Church, Convent, Mosque)",
  "Universities / Colleges",
  "Homeless Shelter / Mission",
  "Schools During Un-Supervised Activity",
  "Cargo Train",
  "Ttc Admin Or Support Facility",
  "Retirement Home",
  "Other Passenger Train Station",
  "Nursing Home",
  "Other Train Yard",
  "Ttc Subway Tunnel / Outdoor Tracks",
  "Ttc Bus Garage",
  "Ttc Light Rail Transit Station",
  "Community Group Home",
];

const premiseByLocations = {
  Apartment: ["Apartment (Rooming House, Condo)"],
  Outside: [
    "Streets, Roads, Highways (Bicycle Path, Private Road)",
    "Parking Lots (Apt., Commercial Or Non-Commercial)",
    "Open Areas (Lakes, Parks, Rivers)",
    "Other Train Yard",
  ],
  House: ["Single Home, House (Attach Garage, Cottage, Mobile)"],
  Other: [
    "Private Property Structure (Pool, Shed, Detached Garage)",
    "Other Non Commercial / Corporate Places (Non-Profit, Gov'T, Firehall)",
    "Hospital / Institutions / Medical Facilities (Clinic, Dentist, Morgue)",
    "Group Homes (Non-Profit, Halfway House, Social Agency)",
    "Unknown",
    "Police / Courts (Parole Board, Probation Office)",
    "Religious Facilities (Synagogue, Church, Convent, Mosque)",
    "Homeless Shelter / Mission",
    "Cargo Train",
    "Retirement Home",
    "Nursing Home",
    "Community Group Home",
  ],
  Commercial: [
    "Other Commercial / Corporate Places (For Profit, Warehouse, Corp. Bldg",
    "Dealership (Car, Motorcycle, Marine, Trailer, Etc.)",
    "Bank And Other Financial Institutions (Money Mart, Tsx)",
    "Gas Station (Self, Full, Attached Convenience)",
    "Commercial Dwelling Unit (Hotel, Motel, B & B, Short Term Rental)",
    "Bar / Restaurant",
    "Convenience Stores",
    "Construction Site (Warehouse, Trailer, Shed)",
  ],
  Transit: [
    "Go Station",
    "Ttc Subway Station",
    "Go Train",
    "Ttc Admin Or Support Facility",
    "Other Passenger Train Station",
    "Ttc Subway Tunnel / Outdoor Tracks",
    "Ttc Bus Garage",
    "Ttc Light Rail Transit Station",
  ],
  Educational: [
    "Schools During Supervised Activity",
    "Universities / Colleges",
    "Schools During Un-Supervised Activity",
  ],
};

const egObj = {
  OBJECTID: 42069,
  EVENT_UNIQUE_ID: "GO-20221621018",
  REPORT_DATE: "2022-08-22T04:00:00Z",
  OCC_DATE: "2022-08-22T04:00:00Z",
  REPORT_YEAR: 2022,
  REPORT_MONTH: "August",
  REPORT_DAY: 22,
  REPORT_DOY: 234,
  REPORT_DOW: "Monday    ",
  REPORT_HOUR: 10,
  OCC_YEAR: 2022,
  OCC_MONTH: "August",
  OCC_DAY: 22,
  OCC_DOY: 234,
  OCC_DOW: "Monday    ",
  OCC_HOUR: 4,
  DIVISION: "D52",
  LOCATION_TYPE: "Streets, Roads, Highways (Bicycle Path, Private Road)",
  PREMISES_TYPE: "Outside",
  UCR_CODE: 2135,
  UCR_EXT: 210,
  OFFENCE: "Theft Of Motor Vehicle",
  MCI_CATEGORY: "Auto Theft",
  HOOD_158: "165",
  NEIGHBOURHOOD_158: "Harbourfront-CityPlace",
  HOOD_140: "77",
  NEIGHBOURHOOD_140: "Waterfront Communities-The Island (77)",
  LONG_WGS84: -79.3848090608592,
  LAT_WGS84: 43.6442736720865,
};

const properties = [
  "OBJECTID",
  "EVENT_UNIQUE_ID",
  // reporting
  "REPORT_DATE",
  "REPORT_YEAR",
  "REPORT_MONTH",
  "REPORT_DAY",
  "REPORT_DOY",
  "REPORT_DOW",
  "REPORT_HOUR",
  // occurence
  "OCC_DATE",
  "OCC_YEAR",
  "OCC_MONTH",
  "OCC_DAY",
  "OCC_DOY",
  "OCC_DOW",
  "OCC_HOUR",
  // location
  "DIVISION",
  "LOCATION_TYPE",
  "PREMISES_TYPE",
  "UCR_CODE",
  "UCR_EXT",
  "OFFENCE",
  "MCI_CATEGORY",
  "HOOD_158",
  "NEIGHBOURHOOD_158",
  "HOOD_140",
  "NEIGHBOURHOOD_140",
  "LONG_WGS84",
  "LAT_WGS84",
];

function getPropertyRange(data, property) {
  const values = [];
  data.features.forEach((f) => {
    if (values.includes(f.properties[property])) return;
    values.push(f.properties[property]);
  });
  console.log(property, values);
  if (property == "PREMISES_TYPE") {
    const premisesSubCat = {};
    values.forEach((v) => {
      premisesSubCat[v] = [];
    });
    data.features.forEach((f) => {
      if (
        premisesSubCat[f.properties[property]].includes(
          f.properties["LOCATION_TYPE"]
        )
      )
        return;
      premisesSubCat[f.properties[property]].push(
        f.properties["LOCATION_TYPE"]
      );
    });
    console.log(premisesSubCat);
  }
}

function showPopup(e) {
  console.log(e.features[0].properties);
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
      "circle-color": "#E2871F",
      "circle-opacity": 0.9,
      "circle-radius": 10,
    },
  });
  module.handleCursor("auto-theft", showPopup);
}

function countData(data, countBy, property) {
  const output = {};
  data.features.forEach((f) => {
    // filter
    if (f.properties.OCC_YEAR != 2022) return;
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
  "https://media.geomodul.us/articles/auto-thefts-2022/Auto_Theft_Open_Data.geojson"
)
  .then((r) => r.json())
  .then((d) => {
    // countData(d, "OCC_YEAR");
    // countData(d, "PREMISES_TYPE", "LOCATION_TYPE");

    const mappable = {
      type: "FeatureCollection",
      features: [],
    };
    const noGood = [];
    d.features.forEach((f) => {
      if (
        f.properties.OCC_YEAR < 2014 ||
        f.properties.OCC_YEAR == null ||
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
      clusterMaxZoom: 15, // Max zoom to cluster points on
      clusterRadius: 35, // Radius of each cluster when clustering points (defaults to 50)
      // clusterRadius: window.innerWidth < 1024 ? 20 : 50,
      data: mappable,
      filter: ["==", ["get", "OCC_YEAR"], 2022],
      type: "geojson",
    });
    displayData();
  })
  .catch((e) => console.error(e));

function createBarGraph(data) {
  // Set the dimensions and margins of the graph
  const parentElement = document.getElementById("thefts-by-year");
  const width = parentElement.offsetWidth;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  // Append the SVG element to the parent element
  const svg = d3
    .select("#thefts-by-year")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Calculate the chart width and height
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create a scale for the x-axis
  const x = d3
    .scaleBand()
    .range([0, chartWidth])
    .padding(0.1)
    .domain(Object.keys(data));

  // Create a scale for the y-axis
  const y = d3
    .scaleLinear()
    .range([chartHeight, 0])
    .domain([0, d3.max(Object.values(data))]);

  // Create the chart group and move it to the appropriate margin
  const chart = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Create the x-axis
  chart
    .append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x));

  // Create the y-axis
  chart.append("g").call(d3.axisLeft(y));

  // Create the bars
  chart
    .selectAll(".bar")
    .data(Object.entries(data))
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return x(d[0]);
    })
    .attr("y", function (d) {
      return y(d[1]);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return chartHeight - y(d[1]);
    })
    .attr("fill", "#E2871F"); // Set the fill color of the bars
}

function createLineGraph(data, id) {
  // Convert the data object into an array of objects
  const dataArray = Object.entries(data).map(([year, locations]) => ({
    year,
    ...locations,
  }));

  // Set up the dimensions and margins of the graph
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const parentWidth = document.getElementById(id).getBoundingClientRect().width;
  const width = parentWidth - margin.left - margin.right;
  // const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create the SVG element
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", "100%") // Set width to 100% of parent element
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set up the scales for x and y axes
  const x = d3
    .scaleLinear()
    .domain(d3.extent(dataArray, (d) => parseInt(d.year)))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataArray, (d) =>
        d3.max(Object.values(d).filter((val) => typeof val === "number"))
      ),
    ])
    .range([height, 0]);

  // Define the line function
  const line = d3
    .line()
    .x((d) => x(parseInt(d.year)))
    .y((d) => y(d.value))
    .curve(d3.curveMonotoneX);

  // Create a color scale for the different locations
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Draw the line for each location
  Object.keys(dataArray[0]).forEach((key) => {
    if (key !== "year") {
      svg
        .append("path")
        .datum(dataArray)
        .attr("fill", "none")
        .attr("stroke", color(key))
        .attr("stroke-width", 2)
        .attr("d", (d) =>
          line(d.map((obj) => ({ year: obj.year, value: obj[key] })))
        );
    }
  });

  // Add the x axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Use d3.format("d") to format the tick labels as plain numbers

  // Add the y axis
  svg.append("g").call(d3.axisLeft(y));

  // Add a legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(20, 20)");

  Object.keys(dataArray[0]).forEach((key, i) => {
    if (key !== "year") {
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(key));

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 10)
        .attr("dy", "0.35em")
        .attr("fill", "#FFF")
        .text(key);
    }
  });
}

fetch("https://media.geomodul.us/articles/auto-thefts-2022/graph-data.json")
  .then((r) => r.json())
  .then((d) => {
    console.log(d);
    setTimeout(() => {
      createBarGraph(d["thefts-by-year"]);
      createLineGraph(d["premises-type-by-year"], "premises-type-by-year");
    }, 0);
  })
  .catch((e) => console.error(e));
