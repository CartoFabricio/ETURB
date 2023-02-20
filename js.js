<<<<<<< HEAD
//Pegar a data local do computador
var today = new Date();
var dy = today.getDate();
var mt = today.getMonth()+1;
var yr = today.getFullYear();
document.getElementById('id_01').value= mt + "/" + dy +"/"+yr;

var transformRequest = (url, resourceType) => {
      var isMapboxRequest =
        url.slice(8, 22) === "api.mapbox.com" ||
        url.slice(10, 26) === "tiles.mapbox.com";
      return {
        url: isMapboxRequest
          ? url.replace("?", "?pluginName=sheetMapper&")
          : url
      };
    };

//Localização em tempo real
mapboxgl.accessToken = 'pk.eyJ1IjoiZmFicmljaW91ZnBpIiwiYSI6ImNsYjJodmQ1NTA0ajQ0MG9qaXMwZHp2bXAifQ.5knMPS6FF-K7P5Qhct2WiQ';
const coordinates = document.getElementById('coordinates');
navigator.geolocation.getCurrentPosition( function(position) {
    var lng = position.coords.longitude;
    var lat = position.coords.latitude;
mapboxgl.accessToken = mapboxgl.accessToken;
    sessionStorage.setItem("lng", lng);
    sessionStorage.setItem("lat", lat);


  const map = new mapboxgl.Map({
        container: 'map',                                         // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v11',              // style URL
        center: [lng, lat],                        // starting position [lng, lat]
        zoom: 15,                                                 // starting zoom
        transformRequest: transformRequest,
        antialias: false,
        attributionControl:false,
    });



map.addControl(new mapboxgl.NavigationControl(),'top-left');  // Ferramenta de zoom
map.addControl(new mapboxgl.FullscreenControl(), 'top-left'); // Ferramenta de expandir a tela
map.addControl(                                               // Add geolocate control to the map.
new mapboxgl.GeolocateControl({
      positionOptions: {
          enableHighAccuracy: true
      },
      trackUserLocation: true, // When active the map will receive updates to the device's location as it changes.
      showUserHeading: true // Draw an arrow next to the location dot to indicate which direction the device is heading.
      }), 'top-left'
    );

 //Barra de pesquisa
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
    language: 'pt-BR',
    mapboxgl: mapboxgl
});
map.addControl(geocoder);

var marker = new mapboxgl.Marker();
function add_marker (event) {
  var coordinates = event.lngLat;
  document.getElementById('Longitude').value= coordinates.lng;
  document.getElementById('Latitude').value= coordinates.lat;
  info.innerHTML = `${coordinates.lng}`;
  info2.innerHTML = `${coordinates.lat}`;

  marker.setLngLat(coordinates).addTo(map);
}
map.on('click', add_marker);

//Cadastro de Informações

//icone de caregando
const button =  document.querySelector('button[id=btn_rodar]');

const addloading = () => {

    button.innerHTML = '<img src="load-icon-png-27.png" class="loading">';
}

const removeloading = () => {
    button.innerHTML = 'Enviar';
}


//para inserir no banco de dados
const handleSubmit = (event) => {
    event.preventDefault();
    addloading();
    const Cadastrante = document.querySelector('input[name=Cadastrante]').value;
    const Data = document.querySelector('input[name=Data]').value;
    const Tamanho = document.querySelector('select[name=Tamanho]').value;
    const Revestimento = document.querySelector('select[name=Revestimento]').value;
    const Endereco = document.querySelector('input[name=Endereco]').value;
    const Longitude = document.querySelector('span[name=Longitude]').value;
    const Latitude = document.querySelector('span[name=Latitude]').value;
    const Imagem = document.querySelector('input[name=Imagem]').value;
    fetch('https://api.sheetmonkey.io/form/7bo1uLSK4P72PEmsUt1ww8', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cadastrante, Data, Tamanho, Revestimento, Endereco, Longitude, Latitude, Imagem}),
    }).then(() => removeloading()).then(() => alert('Dados Salvos'));
}

document.querySelector('form').addEventListener('submit', handleSubmit);



//Buscar os dados da Planilha Google e inserir os pontos no mapa
     $(document).ready(function () {
      $.ajax({
        type: "GET",
        url: 'https://docs.google.com/spreadsheets/d/1u0gpK0MStKsnVod6_mD0PGbgt_zlw65Fb0PQtE-S8SY/gviz/tq?tqx=out:csv&sheet=Sheet1',
        dataType: "text",
        success: function (csvData) { makeGeoJSON(csvData); }
      });

      function makeGeoJSON(csvData) {
        csv2geojson.csv2geojson(csvData, {
          latfield: 'Latitude',
          lonfield: 'Longitude',
          delimiter: ','
        }, function (err, data) {
          map.on('load', function () {
            //Add the the layer to the map
            map.addLayer({
              'id': 'csvData',
              'type': 'circle',
              'source': {
                'type': 'geojson',
                'data': data
              },
              'paint': {
                'circle-color': '#EF9A31',
                'circle-radius': 5,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff'
              }
            });

            // When a click event occurs on a feature in the csvData layer, open a popup at the
            // location of the feature, with description HTML from its properties.
            map.on('click', 'csvData', function (e) {
              var coordinates = e.features[0].geometry.coordinates.slice();

              //set popup text
              var description = `<h5>` + 'Informações' + `</h5>` +
                  `<h6>` + `<b>` + `Cadastrante: ` + `</b>` + e.features[0].properties.Cadastrante + `</h6>` +
                  `<h6>` + `<b>` + `Data: ` + `</b>` + e.features[0].properties.Data + `</h6>` +
                  `<h6>` + `<b>` + `Endereço: ` + `</b>` + e.features[0].properties.Endereco + `</h6>` +
                  `<h6>` + `<b>` + `Tamanho: ` + `</b>` + e.features[0].properties.Tamanho + `</h6>` +
                  `<h6>` + `<b>` + `Revestimento: ` + `</b>` + e.features[0].properties.Revestimento + `</h6>` +
                  `<h6>` + `<b>` + `Imagem: ` + `</b>` + e.features[0].properties.Imagem + `</h6>`;

              // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being pointed to.

              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }
              //add Popup to map
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
            });

            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', 'csvData', function () {
              map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'places', function () {
              map.getCanvas().style.cursor = '';
            });

            var bbox = turf.bbox(data);
            map.fitBounds(bbox, { padding: 50 });

          });

        });
      };
    });
  });
