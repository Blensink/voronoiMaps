<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Voronoi Map Generator</title>
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <link href="https://fonts.googleapis.com/css?family=Baloo+Tamma|Cabin" rel="stylesheet">
  <link rel="stylesheet" href="css/foundation.min.css" />
  <link rel="stylesheet/less" type="text/css" href="css/styles.less" />

  <script src="js/less.min.js" type="text/javascript"></script>
  <script type="text/javascript" src="js/rhill-voronoi-core.min.js"></script>
  <script type="text/javascript" src="js/mapGenerator.js"></script>
  <script src="js/vendor/jquery.js"></script>
  <script src="js/vendor/foundation.min.js"></script>
  <script>
    $(document).foundation();
  </script>
</head>
<body onload="generateVoronoi.init()">
  <div class="row header">
    <div class="small-12 columns">
      <h1>Voronoi Maps</h1>
    </div>
  </div>
  <div class="row basic">
    <div class="small-4 columns">
    </div>
    <div class="small-8 columns">
        <canvas id="basicCanvas" width="800" height="600"></canvas>
    </div>
  </div>
  <div class="row traversal">
    <div class="small-4 columns">
    </div>
    <div class="small-8 columns">
        <canvas id="voronoiCanvas" width="800" height="600"></canvas>
    </div>
  </div>
</body>
</html>
