function showPopup(e) {
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
  const defaultHTML = module.defaultPopupHTML(`
    <div class="space-y-1 text-sm lg:text:base">
      <p class="font-bold">${NEIGHBOURHOOD_158}</p>
      <p>${PREMISES_TYPE}: ${LOCATION_TYPE}</p>
      <p>${OCC_MONTH} ${OCC_DAY} ${OCC_YEAR}</p>
    </div>
  `);
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

const mappable = {
  type: "FeatureCollection",
  features: [],
};
const noGood = [];

fetch(
  "https://media.geomodul.us/articles/auto-thefts-2022/Auto_Theft_Open_Data.geojson"
)
  .then((r) => r.json())
  .then((d) => {
    // countData(d, "NEIGHBOURHOOD_158");
    // countData(d, "PREMISES_TYPE", "LOCATION_TYPE");
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
      clusterMaxZoom: 17, // Max zoom to cluster points on
      clusterRadius: 35, // Radius of each cluster when clustering points (defaults to 50)
      data: mappable,
      filter: ["==", ["get", "OCC_YEAR"], 2022],
      type: "geojson",
    });
    displayData();
  })
  .catch((e) => console.error(e));

function createBarGraph(data, id) {
  // Set the dimensions and margins of the graph
  const parentElement = document.getElementById(id);
  const width = parentElement.offsetWidth;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  // Append the SVG element to the parent element
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("font-family", "monospace");

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
    .call(d3.axisBottom(x))
    .style("font-family", "monospace");

  // Create the y-axis
  chart.append("g").call(d3.axisLeft(y)).style("font-family", "monospace");

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
  const height = 400 - margin.top - margin.bottom;

  // Create the SVG element
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", "100%") // Set width to 100% of parent element
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("font-family", "monospace");

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
  const customColors = [
    "#E2871F",
    "#FFD515",
    "#00A168",
    "#00B1C1",
    "#108DF6",
    "#7035E6",
    "#D32360",
    "#ED3242",
  ];
  const color = d3.scaleOrdinal().range(customColors);

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
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .style("font-family", "monospace"); // Use d3.format("d") to format the tick labels as plain numbers

  // Add the y axis
  svg.append("g").call(d3.axisLeft(y)).style("font-family", "monospace");

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
        .attr("fill", module.isDarkMode() ? "#FFF" : "#000")
        .text(key);
    }
  });
}

function createTop10BarGraph(data, id, color, fontColor) {
  // Set the dimensions and margins of the graph
  const parentElement = document.getElementById(id);
  const width = parentElement.offsetWidth;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  // Append the SVG element to the parent element
  const svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("font-family", "monospace");

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
    .attr("fill", color); // Set the fill color of the bars

  // Create the x-axis
  chart
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x));

  // Create the y-axis
  chart.append("g").call(d3.axisLeft(y)).style("font-family", "monospace");

  // Select the x-axis labels
  const xLabels = chart.selectAll(".x-axis .tick text");

  // Apply the necessary CSS style
  xLabels
    .style("text-anchor", "start")
    .attr("transform", "rotate(-90)")
    .attr("x", 20)
    .attr("y", 0)
    .attr("dy", ".35em")
    .style("color", fontColor)
    .style("font-size", "14px")
    .style("font-family", "monospace");
}

fetch("https://media.geomodul.us/articles/auto-thefts-2022/graph-data.json")
  .then((r) => r.json())
  .then((d) => {
    // setTimeout(() => {
    createBarGraph(d["thefts-by-year"], "thefts-by-year");
    createLineGraph(d["premises-type-by-year"], "premises-type-by-year");
    createTop10BarGraph(
      d["thefts-top-10-neighbourhoods-2022"],
      "thefts-top-10-neighbourhoods-2022",
      "#ED3242",
      module.isDarkMode() ? "#FFF" : "#000"
    );
    createTop10BarGraph(
      d["thefts-bottom-10-neighbourhoods-2022"],
      "thefts-bottom-10-neighbourhoods-2022",
      "#FFD515",
      "#000"
    );
    // }, 0);
  })
  .catch((e) => console.error(e));
