// =======================================
// SÈRIE TEMPORAL D'HECTÀREES PER CULTIU (AMB FILTRE)
// =======================================

function initSerieTemporal() {

  d3.csv("data/campanya_cultiu_ha.csv").then(data => {

    // Convertir valors
    data.forEach(d => {
      d.campanya = +d.campanya;
      d.ha = +d.ha;
      d.cultiu = d.cultiu.trim();
    });

    // Agrupar per cultiu
    const nested = d3.group(data, d => d.cultiu);
    const cultius = [...nested.keys()].sort();

    // Estat global: cultius actius
    let activeCultius = new Set(cultius);

    const svgTime = d3.select("#svg-time-series");
    const width = +svgTime.attr("width");
    const height = +svgTime.attr("height");
    const margin = { top: 40, right: 120, bottom: 40, left: 60 };

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.campanya))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.ha)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain(cultius)
      .range(d3.schemeSet2);

    // Funció UPDATE
    function update() {

      svgTime.selectAll("*").remove();

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

      // Dibuixar línies
      nested.forEach((values, cultiu) => {

        if (!activeCultius.has(cultiu)) return; // saltar cultius desactivats

        values.sort((a, b) => d3.ascending(a.campanya, b.campanya));

        // Línia
        svgTime.append("path")
          .datum(values)
          .attr("fill", "none")
          .attr("stroke", color(cultiu))
          .attr("stroke-width", 2)
          .attr("d", d3.line()
            .x(d => x(d.campanya))
            .y(d => y(d.ha))
          )
          .attr("opacity", 1);

        // Etiqueta final
        const last = values[values.length - 1];
        svgTime.append("text")
          .attr("x", x(last.campanya) + 5)
          .attr("y", y(last.ha))
          .attr("fill", color(cultiu))
          .text(cultiu)
          .style("font-size", "12px");
      });

      // Llegenda filtrable (fora de l'SVG, sota el títol)
      const legendDiv = d3.select("#legend-serie-temporal");
      legendDiv.html(""); // netejar abans de redibuixar

      cultius.forEach(c => {
        const item = legendDiv.append("div")
          .style("display", "inline-flex")
          .style("align-items", "center")
          .style("margin-right", "12px")
          .style("cursor", "pointer")
          .on("click", () => {
            if (activeCultius.has(c)) activeCultius.delete(c);
            else activeCultius.add(c);
            update();
          });

        item.append("div")
          .style("width", "14px")
          .style("height", "14px")
          .style("background-color", color(c))
          .style("opacity", activeCultius.has(c) ? 1 : 0.3)
          .style("margin-right", "6px");

        item.append("span")
          .text(c)
          .style("font-size", "13px")
          .style("opacity", activeCultius.has(c) ? 1 : 0.3);
      });
    }

    update();
  });
}
