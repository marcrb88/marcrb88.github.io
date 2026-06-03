# Evolució i distribució de cultius de fruits secs al Baix Camp (2020–2024)

## 📘 Descripció del projecte
Aquest projecte analitza la **distribució i evolució dels cultius de fruits secs al Baix Camp** entre els anys 2020 i 2024, utilitzant dades de la **Declaració Única Agrària (DUN)**.  
L’objectiu és comprendre com han evolucionat els principals cultius —olivera, avellaner, ametller, garrofer, noguera i pistatxer— en termes de superfície, tipus de reg i presència territorial.


---

## 🧭 Estructura del projecte

projecte/
│
├── index.html                # Pàgina principal amb totes les visualitzacions
├── README.md                 # Documentació del projecte
│
├── /js
│   ├── main.js               # Inicialització global de totes les visualitzacions
│   ├── mapa.js               # Mapa interactiu amb filtres dinàmics (Leaflet)
│   ├── heatmap_dominancia.js # Heatmap de cultiu dominant per municipi i campanya
│   ├── regadiu_seca.js       # Gràfic apilat Regadiu vs Secà per cultiu
│   ├── serie_temporal.js     # Sèrie temporal d’hectàrees per cultiu
│   └── distribucio_municipi.js # Distribució territorial per municipi
│
└── /data
    ├── parceles_simplificat.json
    ├── campanya_cultiu_ha.csv
    ├── regadiu_seca_per_cultiu.csv
    ├── agg_campanya_municipi_cultiu.csv
    └── ha_dominant_per_municipi_campanya.csv


## 🗺️ Visualitzacions principals

1. Mapa interactiu de cultius  
Permet explorar la distribució espacial de les parcel·les agrícoles del Baix Camp amb filtres per campanya, cultiu, varietat, tipus (secà/regadiu) i municipi.

2. Heatmap de dominància  
Mostra el cultiu predominant per municipi i campanya, facilitant la detecció de canvis temporals i patrons territorials.

3. Gràfic regadiu vs secà  
Compara la superfície total de regadiu i secà per cultiu, evidenciant la dependència hídrica de cada espècie.

4. Sèrie temporal d’hectàrees  
Representa l’evolució de la superfície cultivada per cada cultiu entre 2020 i 2024.

5. Distribució per municipi  
Gràfic apilat que mostra la proporció de cada cultiu dins de cada municipi, destacant zones de concentració agrícola.


## 🗺️ Visualitzacions principals

El projecte utilitza les següents llibreries externes:

- Leaflet — per al mapa interactiu.

- D3.js — per a la creació de gràfics dinàmics.

- Bootstrap 5 — per a l’estil.


## 🚀 Com executar el projecte

1. Clonar o descarregar el repositori.
2. Obrir una terminal dins la carpeta del projecte.
3. Executar: python -m http.server 8000
4. Obrir al navegador: http://localhost:8000
