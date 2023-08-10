module.addSource("mapbox-dem", {
  type: "raster-dem",
  url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  tileSize: 256,
  maxzoom: 15,
});
// add the DEM source as a terrain layer with exaggerated height
module.map.setTerrain({
  source: "mapbox-dem",
  exaggeration: 2,
});

module.brightenSpriteLayer("vehicles-streetcars");
module.brightenSpriteLayer("vehicles-buses");

module.hideLayer("road-rail");
module.hideLayer("settlement-subdivision-label");

module.carousel();
