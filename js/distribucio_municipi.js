// ==========================================================
// DISTRIBUCIÓ DE LA SUPERFÍCIE PER MUNICIPI
// ==========================================================

function initDistribucioMunicipi() {

  const chartDiv = d3.select("#chart");

  // Dimensions
  const width = 1200;
  const height = 600;
  const margin = { top: 40, right: 20, bottom: 120, left: 80 };

  // Crear SVG
  const svg = chartDiv.append("svg")
    .attr("width", width)
    .attr("height", height);

  const select = document.getElementById("campanya-barres");

  // Carregar dades
  d3.csv("data/agg_campanya_municipi_cultiu.csv").then(data => {

    // Convertir valors
    data.forEach(d => {
      d.campanya = d.campanya.trim();
      d.ha = +d.ha;
    });

    // Campanyes úniques
    const campanyes = [...new Set(data.map(d => d.campanya))].sort();

    // Omplir selector
    campanyes.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });

    function update(campanya) {

      const filtered = data.filter(d => d.campanya === campanya);
      const nested = d3.group(filtered, d => d.municipi);
      const cultius = [...new Set(filtered.map(d => d.cultiu))].sort();

      const stackedData = d3.stack()
        .keys(cultius)
        .value(([, values], key) => {
          const found = values.find(v => v.cultiu === key);
          return found ? found.ha : 0;
        })(nested);

      const x = d3.scaleBand()
        .domain([...nested.keys()])
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const color = d3.scaleOrdinal()
        .domain(cultius)
        .range(d3.schemeSet2);


      svg.selectAll("*").remove();

      // Dibuixar barres apilades
      svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());

      // Eix X
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-65)")
        .style("text-anchor", "end");

      // Eix Y
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      // Llegenda
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);

      cultius.forEach((c, i) => {
        legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", color(c));

        legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 10)
          .text(c)
          .style("font-size", "12px");
      });
    }

    // Inicialitzar amb la primera campanya
    update(campanyes[0]);

    // Actualitzar quan l’usuari canvia la campanya
    select.addEventListener("change", e => update(e.target.value));
  });
}
