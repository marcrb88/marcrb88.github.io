// ==========================================================
// HEATMAP DE DOMINÀNCIA PER MUNICIPI I CAMPANYA
// ==========================================================

function initHeatmapDominancia() {
  
  d3.csv("data/ha_dominant_per_municipi_campanya.csv").then(raw => {

    // Llistes
    const municipis = [...new Set(raw.map(d => d.municipi))].sort();
    const campanyes = [...new Set(raw.map(d => d.campanya))].sort();

    // Dimensions
    const svg = d3.select("#svg-heatmap");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 80, right: 20, bottom: 20, left: 150 };

    // Colors
    const colors = {
      "OLIVERA": "#4CAF50",
      "AVELLANER": "#8BC34A",
      "GARROFER": "#795548",
      "AMETLLER": "#FFC107",
      "NOGUERA": "#9E9E9E",
      "PISTATXER O FESTUC": "#FF5722"
    };

    // Escales
    const x = d3.scaleBand()
      .domain(campanyes)
      .range([margin.left, width - margin.right])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(municipis)
      .range([margin.top, height - margin.bottom])
      .padding(0.05);

    // Dibuixem heatmap
    svg.append("g")
      .selectAll("rect")
      .data(raw)
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

    // Eix X (campanyes)
    svg.append("g")
      .attr("transform", `translate(0,${margin.top - 10})`)
      .call(d3.axisTop(x))
      .selectAll("text")
      .style("font-size", "12px");

    // Eix Y (municipis)
    svg.append("g")
      .attr("transform", `translate(${margin.left - 5},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");

    // Llegenda
    const legendDiv = d3.select("#legend-dominancia");

    Object.entries(colors).forEach(([cultiu, color]) => {
      const item = legendDiv.append("div")
        .style("display", "inline-flex")
        .style("align-items", "center")
        .style("margin-right", "12px");

      item.append("div")
        .style("width", "14px")
        .style("height", "14px")
        .style("background-color", color)
        .style("margin-right", "6px");

      item.append("span")
        .text(cultiu)
        .style("font-size", "13px");
    });

  });
}
