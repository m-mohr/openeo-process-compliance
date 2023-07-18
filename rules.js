module.exports = {
  rules: {
    labels: "Supports labelled arrays",
    options: "Custom parameters are provided via the `options` parameter",
  },
  processes: {
    aggregate_spatial: [
      "Updated to new definition in v2.0.0-rc.1"
    ],
    aggregate_temporal: [
      "All temporal formats are supported (date-time, date and time)"
    ],
    anomaly: [
      "Parameter `data`: All listed label types supported. Missing: ",
      "Parameter `normals`: All listed label types supported. Missing: "
    ],
    apply_neighborhood : [
      "Parameter `data`: All listed label types supported. Missing: ",
      "Parameter `size` / `overlap`: Units `m`, `px` and `null` are supported"
    ],
    ard_normalized_radar_backscatter: [
      "options"
    ],
    ard_surface_reflectance: [
      "Custom parameters are provided via the `atmospheric_correction_options` and/or `cloud_detection_options` parameters"
    ],
    array_append: [
      "labels"
    ],
    array_apply: [
      "labels"
    ],
    array_concat: [
      "labels"
    ],
    array_element: [
      "labels"
    ],
    array_filter: [
      "labels"
    ],
    array_interpolate_linear: [
      "labels"
    ],
    array_modify: [
      "labels"
    ],
    atmospheric_correction: [
      "options"
    ],
    cloud_detection: [
      "options"
    ],
    filter_bands: [
      "Supports filtering by band name",
      "Supports filtering by common name",
      "Supports filtering by wavelength or schema has been adapted",
    ],
    filter_temporal: [
      "All temporal formats are supported (date-time and date)"
    ],
    load_collection: [
      "Parameter `temporal_extent`: All temporal formats are supported (date-time and date)",
      "Parameter `bands`: Supports filtering by band name and common name"
    ],
    load_stac: [
      "Supports loading from STAC API - Features. Requirements: ",
      "Supports loading from STAC API - Item Search. Requirements: ",
      "Supports loading from static STAC. Requirements: ",
      "Parameter `temporal_extent`: All temporal formats are supported (date-time and date)",
      "Parameter `bands`: Supports filtering by band name and common name"
    ],
    ndvi: [
      "Supports common names as band names"
    ],
    sar_backscatter: [
      "options"
    ],
  }
};