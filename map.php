<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Voronoi Map Generator</title>
  <link rel="stylesheet" href="css/foundation.css" />

  <script type="text/javascript" src="js/rhill-voronoi-core.min.js"></script>
  <script type="text/javascript" src="js/mapGenerator.js"></script>
  <script src="js/foundation.min.js"></script>
  <script>
    $(document).foundation();
  </script>
</head>
<body onload="generateVoronoi.init()">
  <div class="row">
    <div class="small-3 columns">
    </div>
    <div class="small-9 columns">
        <canvas id="voronoiCanvas" width="800" height="600"></canvas>
    </div>
  </div>




</body>
</html>
