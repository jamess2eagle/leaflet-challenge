//calculates the radius size
function radiusCalc (mag) {
  return (mag+1) *2;
}

//determine the color of the circle
function setColor(depth) {
  if (depth <= 10) {
      return "	#bfff00";
  } else if (depth <= 30) {
      return "#ffff00";
  } else if (depth <= 50) {
      return "	#ffbf00";
  } else if (depth <= 70) {
      return "#ff8000";
  } else if (depth <= 90) {
      return "#ff4000";
  } else {
      return "#FF0000";
  };
}

//function to insert the map
function insertMap(geojsonLayer, tectonicLayer) {
  //set background layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });
  var outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
  });
  //set base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Light Map": lightmap,
    "Satellite Map": satellite,
    "Outdoor Map": outdoor
  };
  //set overlay maps
  var overlayMaps = {
    "Earthquakes": geojsonLayer,
    "Tectonic Plates": tectonicLayer
  };
  //initial map settings
  var myMap = L.map("mapid", {
      center: [37.09, -75.71],
      zoom: 3,
      layers: [darkmap,tectonicLayer,geojsonLayer]
  });
  //add clickable layers
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //add legends at the bottom
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    var depth = ["<10", "10-30", "30-50", "50-70", "70-90", ">90"];
    var colors = ["#bfff00", "#ffff00", "#ffbf00", "#ff8000", "#ff4000", "#FF0000"]
    var labels = [];
    //insert div and modify html for the legend
    div.innerHTML += "<h1>Depth</h1>" +
    "<div class=\"labels\">" +
      "<div class=\"min\">" + depth[0] + "</div>" +
      "<div class=\"max\">" + depth[depth.length - 1] + "</div>" +
    "</div>";
    //update push depth information to labels and join them to html
    depth.forEach(function(depth, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  legend.addTo(myMap);
}

//call url using d3
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
d3.json(url).then((data,err) => {
  if (err) throw err;
  //add geojson layer
  var geojsonLayer = L.geoJson(data, {
    style: function(feature) {
        return {
          color: setColor(feature.geometry.coordinates[2])
        };
    },
    pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
          radius: radiusCalc(feature.properties.mag),
          fillOpacity: 0.85
        });
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  });
  console.log(data);
  
  //add tectonic layer
  var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
  d3.json(url2).then((data,err) => {
    if (err) throw err;
    console.log(data);
    var tectData = L.geoJson(data, {
      style: function(feature) {
        return {
          color: "orange",
          fillOpacity: 0
        };
      }
    });
    insertMap(geojsonLayer,tectData)
  });
});

  



// earthquake data
// Your data markers should reflect the magnitude of the earthquake by their size and and depth of the earth quake by color. 
// Earthquakes with higher magnitudes should appear larger and earthquakes with greater depth should appear darker in color.
// HINT the depth of the earth can be found as the third coordinate for each earthquake.

// Include popups that provide additional information about the earthquake when a marker is clicked.

// Create a legend that will provide context for your map data.



// tectonic plates
// earthquakes