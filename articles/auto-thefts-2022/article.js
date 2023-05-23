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

fetch(
  "https://media.geomodul.us/articles/auto-thefts-2022/updated-graph-data.json"
)
  .then((r) => r.json())
  .then((d) => {
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
    createTop10BarGraph(
      d["thefts-top-10-perSquareKm-2022"],
      "thefts-top-10-perSquareKm-2022",
      "#108DF6",
      module.isDarkMode() ? "#FFF" : "#000"
    );
    createTop10BarGraph(
      d["thefts-bottom-10-perSquareKm-2022"],
      "thefts-bottom-10-perSquareKm-2022",
      "#00A168",
      module.isDarkMode() ? "#FFF" : "#000"
    );
  })
  .catch((e) => console.error(e));

const theftsByNeighbourhood = {
  "West Humber-Clairville": 672,
  "York University Heights": 196,
  "Yorkdale-Glen Park": 176,
  "Etobicoke City Centre": 162,
  "Newtonbrook West": 155,
  "Bedford Park-Nortown": 152,
  "Humber Summit": 148,
  "Glenfield-Jane Heights": 148,
  "Clanton Park": 127,
  "Stonegate-Queensway": 126,
  "Morningside Heights": 116,
  "Wexford/Maryvale": 115,
  NSA: 110,
  Downsview: 109,
  "Mount Olive-Silverstone-Jamestown": 106,
  "Oakdale-Beverley Heights": 100,
  Humbermede: 100,
  "Kingsview Village-The Westway": 99,
  "Willowridge-Martingrove-Richview": 99,
  Milliken: 95,
  "Lawrence Park South": 92,
  "Woburn North": 92,
  "Rosedale-Moore Park": 91,
  Weston: 88,
  "Pelmo Park-Humberlea": 87,
  "Eringate-Centennial-West Deane": 85,
  Islington: 85,
  "St.Andrew-Windfields": 79,
  "Lawrence Park North": 75,
  "Westminster-Branson": 75,
  "Tam O'Shanter-Sullivan": 73,
  "Forest Hill South": 73,
  "South Riverdale": 71,
  "Golfdale-Cedarbrae-Woburn": 71,
  "Agincourt South-Malvern West": 71,
  "Bendale-Glen Andrew": 71,
  "Edenbridge-Humber Valley": 71,
  "Leaside-Bennington": 70,
  "Bathurst Manor": 70,
  "High Park-Swansea": 66,
  "Black Creek": 65,
  "Dorset Park": 63,
  "Wellington Place": 62,
  "Clairlea-Birchmount": 61,
  "Brookhaven-Amesbury": 61,
  "Lansing-Westgate": 60,
  Alderwood: 59,
  "Princess-Rosethorn": 59,
  "Don Valley Village": 58,
  Annex: 57,
  "Bridle Path-Sunnybrook-York Mills": 57,
  "Elms-Old Rexdale": 56,
  "Kingsway South": 56,
  "Englemount-Lawrence": 56,
  "Oakwood Village": 55,
  "West Rouge": 55,
  "Mount Pleasant East": 54,
  "Mimico-Queensway": 54,
  "West Hill": 54,
  "Moss Park": 52,
  "Rexdale-Kipling": 52,
  "Rockcliffe-Smythe": 52,
  "Humewood-Cedarvale": 52,
  "Newtonbrook East": 51,
  "Thistletown-Beaumond Heights": 51,
  "The Beaches": 51,
  "Malvern West": 51,
  Morningside: 51,
  "Banbury-Don Mills": 50,
  "Bayview Village": 48,
  "Agincourt North": 46,
  "Briar Hill-Belgravia": 45,
  "Danforth East York": 45,
  "Humber Bay Shores": 45,
  "Birchcliffe-Cliffside": 43,
  "Downtown Yonge East": 42,
  "Maple Leaf": 42,
  "East L'Amoreaux": 42,
  "Kennedy Park": 41,
  "Eglinton East": 41,
  "Willowdale West": 40,
  "Junction-Wallace Emerson": 40,
  "Malvern East": 40,
  "East Willowdale": 40,
  "Junction Area": 38,
  "Mount Dennis": 38,
  "Highland Creek": 38,
  Cliffcrest: 37,
  "Forest Hill North": 36,
  "Parkwoods-O'Connor Hills": 36,
  Steeles: 35,
  "Yonge-Doris": 35,
  "East End-Danforth": 34,
  "Yonge-Eglinton": 33,
  "St Lawrence-East Bayfront-The Islands": 33,
  "High Park North": 33,
  "New Toronto": 33,
  "Corso Italia-Davenport": 33,
  "Kensington-Chinatown": 32,
  Rustic: 32,
  "Etobicoke West Mall": 31,
  "O'Connor-Parkview": 31,
  "South Parkdale": 30,
  Wychwood: 30,
  "Victoria Village": 30,
  "Fenside-Parkwoods": 30,
  "Long Branch": 30,
  "Yonge-St.Clair": 29,
  "Trinity-Bellwoods": 29,
  "Weston-Pelham Park": 28,
  "Casa Loma": 28,
  "Humber Heights-Westmount": 27,
  "L'Amoreaux West": 27,
  "Henry Farm": 27,
  "Markland Wood": 26,
  "Pleasant View": 26,
  "Yonge-Bay Corridor": 26,
  "Keelesdale-Eglinton West": 25,
  "Dovercourt Village": 25,
  "Runnymede-Bloor West Village": 25,
  "Harbourfront-CityPlace": 25,
  "North Riverdale": 24,
  "Centennial Scarborough": 24,
  "Caledonia-Fairbank": 24,
  "Thorncliffe Park": 24,
  "Little Portugal": 23,
  "Scarborough Village": 23,
  "Lambton Baby Point": 22,
  "Greenwood-Coxwell": 22,
  Roncesvalles: 21,
  Danforth: 21,
  Oakridge: 21,
  "Palmerston-Little Italy": 21,
  "Beechborough-Greenbrook": 20,
  "West Queen West": 19,
  "Old East York": 19,
  "Bendale South": 19,
  "Woodbine-Lumsden": 19,
  Avondale: 18,
  "Cabbagetown-South St.James Town": 18,
  "Woodbine Corridor": 17,
  "Playter Estates-Danforth": 17,
  "Flemingdon Park": 17,
  "Bayview Woods-Steeles": 15,
  "Fort York-Liberty Village": 15,
  "Bay-Cloverhill": 14,
  "North St.James Town": 14,
  "Taylor-Massey": 14,
  "Church-Wellesley": 14,
  "Hillcrest Village": 14,
  University: 13,
  "Broadview North": 12,
  "Regent Park": 11,
  Ionview: 10,
  "South Eglinton-Davisville": 10,
  "North Toronto": 9,
  "Dufferin Grove": 9,
  "Blake-Jones": 8,
  Guildwood: 7,
};
