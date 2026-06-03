// ==========================================================
// HEATMAP DE DOMINÀNCIA PER MUNICIPI I CAMPANYA (AMB FILTRE)
// ==========================================================

function initHeatmapDominancia() {

  d3.csv("data/ha_dominant_per_municipi_campanya.csv").then(raw => {
    // Normalitzar dades
    raw.forEach(d => {
      d.campanya = d.campanya.trim();
      d.municipi = d.municipi.trim();
      d.cultiu_dominant = d.cultiu_dominant.trim();
    });

    const municipis = [...new Set(raw.map(d => d.municipi))].sort();
    const campanyes = [...new Set(raw.map(d => d.campanya))].sort();
    const cultius = [...new Set(raw.map(d => d.cultiu_dominant))].sort();

    const svg = d3.select("#svg-heatmap");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 80, right: 20, bottom: 20, left: 150 };

    const colors = {
      "OLIVERA": "#4CAF50",
      "AVELLANER": "#8BC34A",
      "GARROFER": "#795548",
      "AMETLLER": "#FFC107",
      "NOGUERA": "#9E9E9E",
      "PISTATXER O FESTUC": "#FF5722"
    };

    const x = d3.scaleBand()
      .domain(campanyes)
      .range([margin.left, width - margin.right])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(municipis)
      .range([margin.top, height - margin.bottom])
      .padding(0.05);

    // Estat global: cultius actius
    let activeCultius = new Set(cultius);

    function update() {

      svg.selectAll("*").remove();

      // Filtrar dades segons cultius actius
      const filtered = raw.filter(d => activeCultius.has(d.cultiu_dominant));

      // Dibuixar cel·les
      svg.append("g")
        .selectAll("rect")
        .data(filtered)
        .join("rect")
        .attr("x", d => x(d.campanya))
        .attr("y", d => y(d.municipi))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colors[d.cultiu_dominant] || "#ccc")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.3)
        .append("title")
        .text(d => `${d.municipi} (${d.campanya}): ${d.cultiu_dominant}`);

      // Eix X
      svg.append("g")
        .attr("transform", `translate(0,${margin.top - 10})`)
        .call(d3.axisTop(x))
        .selectAll("text")
        .style("font-size", "12px");

      // Eix Y
      svg.append("g")
        .attr("transform", `translate(${margin.left - 5},0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px");

      // Llegenda filtrable
      const legendDiv = d3.select("#legend-dominancia");
      legendDiv.html(""); 

      Object.entries(colors).forEach(([cultiu, color]) => {

        const item = legendDiv.append("div")
          .style("display", "inline-flex")
          .style("align-items", "center")
          .style("margin-right", "12px")
          .style("cursor", "pointer")
          .on("click", () => {
            if (activeCultius.has(cultiu)) activeCultius.delete(cultiu);
            else activeCultius.add(cultiu);
            update();
          });

        item.append("div")
          .style("width", "14px")
          .style("height", "14px")
          .style("background-color", color)
          .style("opacity", activeCultius.has(cultiu) ? 1 : 0.3)
          .style("margin-right", "6px");

        item.append("span")
          .text(cultiu)
          .style("font-size", "13px")
          .style("opacity", activeCultius.has(cultiu) ? 1 : 0.3);
      });
    }

    update();
  });
}
