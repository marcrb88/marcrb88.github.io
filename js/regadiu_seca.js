// ==========================================================
// GRÀFIC APILAT REGADIU vs SECÀ PER CULTIU (AMB FILTRE)
// ==========================================================

function initRegadiuSeca() {
  d3.csv("data/regadiu_seca_per_cultiu.csv").then(raw => {

    raw.forEach(d => {
      d.ha = +d.ha;
      d.seca_regad = d.seca_regad.trim();
      d.cultiu = d.cultiu.trim();
    });

    const data = Array.from(
      d3.group(raw, d => d.cultiu),
      ([cultiu, rows]) => ({
        cultiu,
        Seca: d3.sum(rows.filter(r => r.seca_regad === "S"), r => r.ha),
        Regadiu: d3.sum(rows.filter(r => r.seca_regad === "R"), r => r.ha)
      })
    );

    const svg = d3.select("#svg-regadiu-seca");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 40, right: 150, bottom: 80, left: 80 };

    const x = d3.scaleBand()
      .domain(data.map(d => d.cultiu))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Seca + d.Regadiu)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain(["Seca", "Regadiu"])
      .range(["#c49c6b", "#4fa3ff"]);

    // Estat inicial: tot actiu
    let activeKeys = new Set(["Seca", "Regadiu"]);

    // Funció per actualitzar el gràfic
    function update() {

      const keys = Array.from(activeKeys);

      const stacked = d3.stack().keys(keys)(data);

      svg.selectAll("*").remove();

      // Barres
      svg.append("g")
        .selectAll("g")
        .data(stacked)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.cultiu))
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
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      // Eix Y
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      // Llegenda
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 120}, ${margin.top})`);

      ["Seca", "Regadiu"].forEach((key, i) => {

        const g = legend.append("g")
          .attr("transform", `translate(0, ${i * 22})`)
          .style("cursor", "pointer")
          .on("click", () => {
            if (activeKeys.has(key)) activeKeys.delete(key);
            else activeKeys.add(key);
            update();
          });

        g.append("rect")
          .attr("width", 14)
          .attr("height", 14)
          .attr("fill", color(key))
          .attr("opacity", activeKeys.has(key) ? 1 : 0.3);

        g.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .text(key)
          .style("font-size", "12px")
          .attr("opacity", activeKeys.has(key) ? 1 : 0.3);
      });
    }

    update();
  });
}
