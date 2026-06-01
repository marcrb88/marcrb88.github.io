const width = 900;
const height = 700;

const svg = d3.select("#mapa");
const g = svg.append("g");

// Escala de color per valors quantitatius
const color = d3.scaleQuantize()
  .range(d3.schemeBlues[7]);   // paleta de blau per coroplètic

Promise.all([
  d3.json("data/municipis_simplificats.geojson"),
  d3.csv("data/agg_campanya_municipi_cultiu.csv")
]).then(([geo, agg]) => {

  // Convertir ha a número
  agg.forEach(d => d.ha = +d.ha);

  // Llistes de campanyes
  const campanyes = [...new Set(agg.map(d => d.campanya))];

  // Omplir selector
  d3.select("#campanyaSelect")
    .selectAll("option")
    .data(campanyes)
    .enter()
    .append("option")
    .text(d => d);

  // Projecció
  const projection = d3.geoMercator()
    .fitSize([width, height], geo);

  const path = d3.geoPath().projection(projection);

  // Funció d'actualització
  function update() {
    const campanya = d3.select("#campanyaSelect").node().value;

    // Filtrar agregat per campanya
    const filt = agg.filter(d => d.campanya === campanya);

    // Crear diccionari municipi → ha
    const haMap = {};
    filt.forEach(d => haMap[d.municipi] = d.ha);

    // Domini de l’escala de color
    const values = filt.map(d => d.ha);
    color.domain([d3.min(values), d3.max(values)]);

    // Dibuixar mapa
    g.selectAll("path")
      .data(geo.features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const m = d.properties.municipi;
        return haMap[m] ? color(haMap[m]) : "#ccc";
      })
      .attr("stroke", "#333")
      .on("mouseover", (event, d) => {
        const m = d.properties.municipi;
        const ha = haMap[m] || 0;

        d3.select("#tooltip").remove();
        d3.select("body")
          .append("div")
          .attr("id", "tooltip")
          .style("position", "absolute")
          .style("background", "white")
          .style("padding", "6px")
          .style("border", "1px solid #999")
          .html(`<b>${m}</b><br>Hectàrees: ${ha.toFixed(2)}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", () => d3.select("#tooltip").remove());
  }

  update();
  d3.select("#campanyaSelect").on("change", update);
});
