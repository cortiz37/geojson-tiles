# geojson tiles

### Configuration
All the possible configuration variables are located on source file `./api/util/constants.js`, and `.env` file.

### Notes

The input file is the result generated by [https://www.gdal.org/ogr2ogr.html]

### File content example (input format):

~~~
{
  "type": "FeatureCollection",
  "name": "entities",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "Layer": "LAYER_NAME",
        "SubClasses": "AcDbEntity:AcDbLine",
        "Linetype": "Continuous",
        "EntityHandle": "96C",
        "styles": "PEN(c:#dfff7f,w:0.026g)"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            27.94247095644975,
            62.745205562443893,
            0.0
          ],
          [
            27.943661581435361,
            62.745205562443893,
            0.0
          ]
        ]
      }
    },
    ...
  ]
}
  
~~~

#### Note: 

Inside feature.properties, `style` correspond to:

``ogr2ogr -f GeoJSON -sql 'select *,ogr_style as style from entities' out-file.json input-file.dxf``

#### geojson-vt:

Original lib from: https://github.com/mapbox/geojson-vt

Forked to support simple projections (xy based maps):

https://github.com/cortiz37/geojson-vt
