<!DOCTYPE html>
<html>
<head>
  <script type="text/javascript" src="js/rhill-voronoi-core.min.js"></script>

  <script id="script" type="text/javascript">
    /***********************************************************************************************
    * Config options
    ***********************************************************************************************/
    var numSites = 100;
    var bboxWidth = 800;
    var bboxHeight = 600;

    var landChance = 0.75;
    var waterChance = 1-landChance;

    var numLandSeeds = 1;
    var numWaterSeeds = 1;

    /***********************************************************************************************
    * Core Functionality
    ***********************************************************************************************/
    var generateVoronoi = {
      voronoi: new Voronoi(),
      sites: [],
      diagram: null,
      margin: 0.11,
      canvas: null,
      bbox: {xl:0,xr:bboxWidth,yt:0,yb:bboxHeight},

      init: function() {
        this.canvas = document.getElementById('voronoiCanvas');
        this.randomSites(numSites,true);
        this.renderVoronoi();
        this.colorCellsTraversal(this.diagram.cells);
      },

      /**
       * Create a number of random sites to use as seeds for the voronoi diagram
       */
      randomSites: function(n,clear) {
        if (clear) {this.sites = [];}
        // create vertices
        var xmargin = this.canvas.width*this.margin,
          ymargin = this.canvas.height*this.margin,
          xo = xmargin,
          dx = this.canvas.width-xmargin*2,
          yo = ymargin,
          dy = this.canvas.height-ymargin*2;
        for (var i=0; i<n; i++) {
          this.sites.push({
            x: xo + Math.random()*dx + Math.random()/dx,
            y: yo + Math.random()*dy + Math.random()/dy
          });
        }
        this.voronoi.recycle(this.diagram);
        this.diagram = this.voronoi.compute(this.sites, this.bbox);
      },

      /**
       * Render the voronoi diagram given a list of random sites
       */
      renderVoronoi: function() {
        var ctx = this.canvas.getContext('2d');

        // Render background
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.stroke();

        // Make sure we're got seed points
        if (!this.diagram) {return;}

        // Render edges
        ctx.beginPath();
        ctx.strokeStyle = '#eeeeee';
        var edges = this.diagram.edges,
        iEdge = edges.length,
        edge, v;
        while (iEdge--) {
          edge = edges[iEdge];
          v = edge.va;
          ctx.moveTo(v.x, v.y);
          v = edge.vb;
          ctx.lineTo(v.x, v.y);
        }
        ctx.stroke();

        // Render vertices
        ctx.beginPath();
        ctx.fillStyle = 'black';
        var vertices = this.diagram.vertices,
        iVertex = vertices.length;
        while (iVertex--) {
          v = vertices[iVertex];
          ctx.rect(v.x-1, v.y-1, 3, 3);
        }
        ctx.fill();

        // Render the seed sites
        ctx.beginPath();
        ctx.fillStyle = '#44f';
        var sites = this.sites,
        iSite = sites.length;
        while (iSite--) {
          v = sites[iSite];
          ctx.rect(v.x-2/3, v.y-2/3, 3, 3);
          ctx.font = "10px Arial";
          ctx.fillText(v.voronoiId,v.x,v.y);
        }
        ctx.fill();

      },

    /***********************************************************************************************
    * Cell Coloring Algorithms
    ***********************************************************************************************/

      /**
       * Randomly assign each voronoi cell a land or water value
       */
      colorCellsNaive: function(cells) {
        var ctx = this.canvas.getContext('2d');
        var numCells = cells.length;

        while(numCells--) {
          var cell = cells[numCells];
          var halfedges = cell.halfedges;
          var nHalfEdges = halfedges.length;

          if(nHalfEdges) {
            var v = halfedges[0].getStartpoint();
            ctx.beginPath();
            ctx.moveTo(v.x,v.y);

            for(iHalfedge=0; iHalfedge<nHalfEdges; iHalfedge++) {
              v = halfedges[iHalfedge].getEndpoint();
              ctx.lineTo(v.x, v.y);
            }

            if(Math.random() <= waterChance ) {
              ctx.fillStyle = 'blue';
            }else {
              ctx.fillStyle = 'brown';
            }
            ctx.fill();
          }
        }
      },

      /**
       * Now we're going to get a little fancier
       * We're going to randomly pick n land seed sites, m water seed sites
       * Then radiate outwards from each site, assigning land/water
       * Hopefully this makes our water/land patches more clumpy :D
       */
      colorCellsTraversal: function(cells) {
        var ctx = this.canvas.getContext('2d');
        var numCells = cells.length;

        // Pick n,m random seed cells for land and water
        var landSeed = Math.floor(Math.random() * numCells);
        //var waterSeed = Math.floor(Math.random() * numCells );

        var landCell = cells[landSeed];

        var cellsToVisit = cells;

        // Keep track of all the cells we've visited, starting with the seed cells.
        var cellsVisited = [];
        cellsVisited.push(landSeed);

        // And cells on the 'edge', which will just be our seed cells for now
        var cellsEdge = [];
        cellsEdge.push(landSeed);

        var newOuterEdge = [];
        var cellShaderLevel = 1;

        // While we still have cells to visit along the edge, visit them
        while(cellsEdge.length > 0 ) {
          // Track the new outer edge as we discover cells
          newOuterEdge.length = 0;
          // And a counter to shade cells
          // For every current neighbor, explore all of its neighbors
          for (var i = 0; i < cellsEdge.length; i++) {
            // Store the cell we're at
            var cellSite = cellsEdge[i];
            // And all the edges along it
            var edges = cells[cellSite].halfedges;
            for(var j=0; j<edges.length; j++) {
              // Keep track of the left and right cell of the edge
              var lSite = edges[j].edge.lSite != null ? edges[j].edge.lSite.voronoiId : null;
              var rSite = edges[j].edge.rSite != null ? edges[j].edge.rSite.voronoiId : null;
              // If the edge isn't a border along the outside
              if (lSite != null && rSite != null) {
                // Keep track of the new cell
                var otherSite = lSite == cellSite ? rSite : lSite;
                if(newOuterEdge.indexOf(otherSite) == -1 && cellsVisited.indexOf(otherSite) == -1 ) {
                  newOuterEdge.push(otherSite);
                  cellsVisited.push(otherSite);
                }
                  // Fill in neighbor cells
                  var cell = cells[otherSite];
                  var halfedges = cell.halfedges;
                  var nHalfEdges = halfedges.length;
                  if(nHalfEdges) {
                    var v = halfedges[0].getStartpoint();
                    ctx.beginPath();
                    ctx.moveTo(v.x,v.y);
                    for(iHalfedge=0; iHalfedge<nHalfEdges; iHalfedge++) {
                      v = halfedges[iHalfedge].getEndpoint();
                      ctx.lineTo(v.x, v.y);
                    }
                  var amountGrey = 255-(255/(3*Math.ceil(Math.log(numSites))))*cellShaderLevel;
                  ctx.fillStyle = 'rgba('+amountGrey+','+amountGrey+','+amountGrey+',1)';
                  ctx.fill();
                }
              }
            }
          }
          cellsEdge = newOuterEdge.slice();
          cellShaderLevel += 1;
        }
      },
    };
  </script>
</head>
<body onload="generateVoronoi.init()">
  <canvas id="voronoiCanvas" width="800" height="600"></canvas>
</body>
</html>
