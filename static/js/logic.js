// Define satellite image data
var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Light": light, 
  "Satellite": satellite
};

// Create our map, giving it the satellite image to load
var myMap = L.map("map", {
  center: [
      35.05, -29.17
  ],
  zoom: 3,
  layers: light
});

function getColor(d) {
  return d > 9 ? '#FF0000' :
         d > 8 ? '#FF3300' :
         d > 7  ? '#ff6600' :
         d > 6  ? '#ff9900' :
         d > 5   ? '#FFCC00' :
         d > 4   ? '#7FFF00' :
         d > 3   ? '#ccff00' :
         d > 2   ? '#99ff00' :
         d > 1   ? '#66ff00' :
                    '#33ff00';
};

//USGS url for all earthquakes from the last 7 days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Create a layer for the circle group
var circlesLayer = L.layerGroup();

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.log(data.features);
  circlesLayer.addLayer(L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circle(latlng, 
        { radius: (Math.pow(2, feature.properties.mag / 2)* 15000),
          fillColor: getColor(feature.properties.mag),
          color: '#eeeeee',
          weight: 0.5,
          opacity: 0.5,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>" );
      }
  })); 

  //Add the layer to the map
  myMap.addLayer(circlesLayer);

  // Create overlay object to hold our overlay layer
  var overlayMaps = { 
  "Magnitude": circlesLayer 
  };

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);

  var legend = L.control({position: 'bottomleft'});
  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      categories = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      labels = ['<strong>Magnitude</strong>'],
      from , to; 
        
    for (var i = 0; i < categories.length; i++) {
      from = categories [i];
      to = categories[i+1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
        from + (to ? '&ndash;' + to : '+'));
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);
  });

