url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then((data,err) => {
    if (err) throw err;
    console.log(data);
})