// =======================================
// SÈRIE TEMPORAL D'HECTÀREES PER CULTIU
// =======================================

function initSerieTemporal() {

  d3.csv("data/campanya_cultiu_ha.csv").then(data => {
    // Agrupar per cultiu
    const nested = d3.group(data, d => d.cultiu);

    const svgTime = d3.select("#svg-time-series");
    const width = +svgTime.attr("width");
    const height = +svgTime.attr("height");
    const margin = { top: 40, right: 100, bottom: 40, left: 60 };

    // Escales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.campanya))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.ha)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain([...nested.keys()])
      .range(d3.schemeSet2);

    // Eix X
    svgTime.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .tickValues([2020, 2021, 2022, 2023, 2024])
          .tickFormat(d3.format("d"))
      );

    // Eix Y
    svgTime.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Línies per cultiu
    nested.forEach((values, cultiu) => {

      // Ordenar per campanya
      values.sort((a, b) => d3.ascending(a.campanya, b.campanya));

      // Dibuixar línia
      svgTime.append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", color(cultiu))
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(d => x(d.campanya))
          .y(d => y(d.ha))
        );

      // Etiqueta final
      const last = values[values.length - 1];
      svgTime.append("text")
        .attr("x", x(last.campanya) + 5)
        .attr("y", y(last.ha))
        .attr("fill", color(cultiu))
        .text(cultiu)
        .style("font-size", "12px");
    });

  });
}
