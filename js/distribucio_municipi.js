// ==========================================================
// DISTRIBUCIÓ DE LA SUPERFÍCIE PER MUNICIPI (AMB FILTRE)
// ==========================================================

function initDistribucioMunicipi() {

  const chartDiv = d3.select("#chart");

  const width = 1200;
  const height = 600;
  const margin = { top: 40, right: 20, bottom: 120, left: 80 };

  const svg = chartDiv.append("svg")
    .attr("width", width)
    .attr("height", height);

  const select = document.getElementById("campanya-barres");

  d3.csv("data/agg_campanya_municipi_cultiu.csv").then(data => {

    data.forEach(d => {
      d.campanya = d.campanya.trim();
      d.ha = +d.ha;
    });

    const campanyes = [...new Set(data.map(d => d.campanya))].sort();

    campanyes.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });

    // Estat global: cultius actius
    let activeCultius = new Set();

    function update(campanya) {

      const filtered = data.filter(d => d.campanya === campanya);
      const nested = d3.group(filtered, d => d.municipi);
      const cultius = [...new Set(filtered.map(d => d.cultiu))].sort();

      // Si és la primera vegada, activem tots els cultius
      if (activeCultius.size === 0) {
        cultius.forEach(c => activeCultius.add(c));
      }

      const keys = Array.from(activeCultius);

      const stackedData = d3.stack()
        .keys(keys)
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

      // Barres apilades
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
        .attr("width", x.bandwidth())
        .transition()
        .duration(400);

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

      // Llegenda filtrable
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);

      cultius.forEach((c, i) => {

        const g = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`)
          .style("cursor", "pointer")
          .on("click", () => {
            if (activeCultius.has(c)) activeCultius.delete(c);
            else activeCultius.add(c);
            update(campanya);
          });

        g.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", color(c))
          .attr("opacity", activeCultius.has(c) ? 1 : 0.3);

        g.append("text")
          .attr("x", 20)
          .attr("y", 10)
          .text(c)
          .style("font-size", "12px")
          .attr("opacity", activeCultius.has(c) ? 1 : 0.3);
      });
    }

    update(campanyes[0]);

    select.addEventListener("change", e => {
      activeCultius.clear(); // reiniciar estat per nova campanya
      update(e.target.value);
    });
  });
}
