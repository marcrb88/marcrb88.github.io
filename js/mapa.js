// ===============================
// MAPA INTERACTIU DE CULTIUS
// ===============================

function initMapa() {
  // Crear mapa
  const map = L.map('map').setView([41.18, 1.05], 10);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Colors per cultiu
  const colors = {
    "OLIVERA": "#4CAF50",
    "AVELLANER": "#8BC34A",
    "GARROFER": "#795548",
    "AMETLLER": "#FFC107",
    "NOGUERA": "#9E9E9E",
    "PISTATXER O FESTUC": "#FF5722"
  };

  // Llegenda
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<b>Cultius</b><br>';
    for (const [cultiu, color] of Object.entries(colors)) {
      div.innerHTML +=
        `<i style="background:${color};width:12px;height:12px;display:inline-block;margin-right:4px;"></i>${cultiu}<br>`;
    }
    return div;
  };
  legend.addTo(map);

  let layer;
  let allData;

  // Carregar dades
  fetch('data/parceles_simplificat.json')
    .then(r => r.json())
    .then(data => {

      allData = data;

      // Omplir Selects
      // Campanyes
      const campanyes = [...new Set(data.features.map(f => f.properties.campanya))].sort((a, b) => a - b);
      const selectCampanya = document.getElementById('campanya');
      selectCampanya.innerHTML = '<option value="">Totes</option>';
      campanyes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        selectCampanya.appendChild(opt);
      });

      // Cultius
      const cultius = [...new Set(data.features.map(f => f.properties.cultiu))].filter(Boolean).sort();
      const selectCultiu = document.getElementById('cultiu');
      cultius.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        selectCultiu.appendChild(opt);
      });

      // Municipis
      const municipis = [...new Set(data.features.map(f => f.properties.municipi))].filter(Boolean).sort();
      const selectMunicipi = document.getElementById('municipi');
      municipis.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        selectMunicipi.appendChild(opt);
      });

      // Pintar capa inicial
      layer = L.geoJSON(data, {
        style: f => ({
          color: colors[f.properties.cultiu] || "#CCCCCC",
          weight: 0.3
        }),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <b>Municipi:</b> ${feature.properties.municipi}<br>
            <b>Cultiu:</b> ${feature.properties.cultiu}<br>
            <b>Campanya:</b> ${feature.properties.campanya}<br>
            <b>Hectàrees:</b> ${feature.properties.ha}
          `);
        }
      }).addTo(map);

      // Aplicar filtres
      document.getElementById('applyFilters').addEventListener('click', () => {

        const campanya = document.getElementById('campanya').value;
        const cultiu = document.getElementById('cultiu').value;
        const secaRegad = document.getElementById('seca_regad').value;
        const municipi = document.getElementById('municipi').value;
        const varietat = document.getElementById('varietat').value;
        const haMin = parseFloat(document.getElementById('haMin').value) || 0;
        const haMax = parseFloat(document.getElementById('haMax').value) || Infinity;

        if (layer) map.removeLayer(layer);

        const filtered = {
          ...data,
          features: data.features.filter(f => {
            const p = f.properties;
            const haValue = parseFloat(p.ha.replace(',', '.')) || 0;

            return (!campanya || p.campanya == campanya) &&
                   (!cultiu || p.cultiu == cultiu) &&
                   (!secaRegad || p.seca_Regad == secaRegad) &&
                   (!municipi || p.municipi == municipi) &&
                   (!varietat || p.varietat == varietat) &&
                   (haValue >= haMin && haValue <= haMax);
          })
        };

        layer = L.geoJSON(filtered, {
          style: f => ({
            color: colors[f.properties.cultiu] || "#CCCCCC",
            weight: 0.3
          }),
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`
              <b>Municipi:</b> ${feature.properties.municipi}<br>
              <b>Cultiu:</b> ${feature.properties.cultiu}<br>
              <b>Campanya:</b> ${feature.properties.campanya}<br>
              <b>Hectàrees:</b> ${feature.properties.ha}
            `);
          }
        }).addTo(map);
      });

      // Filtre de varietat
      document.getElementById('cultiu').addEventListener('change', () => {

        const cultiu = document.getElementById('cultiu').value;
        const selectVarietat = document.getElementById('varietat');
        const containerVarietat = document.getElementById('varietat-container');

        if (!cultiu) {
          containerVarietat.style.display = "none";
          selectVarietat.innerHTML = '<option value="">Totes</option>';
          return;
        }

        const varietats = [...new Set(
          allData.features
            .filter(f => f.properties.cultiu === cultiu)
            .map(f => f.properties.varietat)
        )].filter(Boolean).sort();

        containerVarietat.style.display = "block";

        selectVarietat.innerHTML = '<option value="">Totes</option>';
        varietats.forEach(v => {
          const opt = document.createElement('option');
          opt.value = v;
          opt.textContent = v;
          selectVarietat.appendChild(opt);
        });
      });
    });
}
