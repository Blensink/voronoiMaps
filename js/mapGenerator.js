
  /***********************************************************************************************
  * Config options
  ***********************************************************************************************/
  var numSites = 600;
  var bboxWidth = 800;
  var bboxHeight = 600;

  var landChance = 0.7;
  var waterChance = 1-landChance;

  var numLandSeeds = 4;
  var numWaterSeeds = 4;

  /***********************************************************************************************
  * Core Functionality
  ***********************************************************************************************/
  var generateVoronoi = {
    voronoi: new Voronoi(),
    sites: [],
    diagram: null,
    margin: 0,
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
      this.relaxSites();
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
    * Lloyd's Algorithm
    ***********************************************************************************************/
    relaxSites: function() {
		  if (!this.diagram) {return;}
		    var cells = this.diagram.cells,
			    iCell = cells.length,
			      cell,
			      site,
            sites = [],
			      again = false,
			      rn,
            dist;
		  var p = 1 / iCell * 0.1;
		  while (iCell--) {
			  cell = cells[iCell];
			  rn = Math.random();
  			// probability of apoptosis
  			if (rn < p) {
  				continue;
  				}
  			site = this.cellCentroid(cell);
  			dist = this.distance(site, cell.site);
  			again = again || dist > 1;
  			// don't relax too fast
  			if (dist > 2) {
  				site.x = (site.x+cell.site.x)/2;
  				site.y = (site.y+cell.site.y)/2;
  				}
  			// probability of mytosis
  			if (rn > (1-p)) {
  				dist /= 2;
  				sites.push({
  					x: site.x+(site.x-cell.site.x)/dist,
  					y: site.y+(site.y-cell.site.y)/dist,
  					});
  				}
  			sites.push(site);
  			}
  		this.compute(sites);
  		// if (again) {
  		// 	var me = this;
  		// 	this.timeout = setTimeout(function(){
  		// 		me.relaxSites();
  		// 		}, this.timeoutDelay);
  		// 	}
		},

    cellArea: function(cell) {
		var area = 0,
			halfedges = cell.halfedges,
			iHalfedge = halfedges.length,
			halfedge,
			p1, p2;
		while (iHalfedge--) {
			halfedge = halfedges[iHalfedge];
			p1 = halfedge.getStartpoint();
			p2 = halfedge.getEndpoint();
			area += p1.x * p2.y;
			area -= p1.y * p2.x;
			}
		area /= 2;
		return area;
		},

	cellCentroid: function(cell) {
		var x = 0, y = 0,
			halfedges = cell.halfedges,
			iHalfedge = halfedges.length,
			halfedge,
			v, p1, p2;
		while (iHalfedge--) {
			halfedge = halfedges[iHalfedge];
			p1 = halfedge.getStartpoint();
			p2 = halfedge.getEndpoint();
			v = p1.x*p2.y - p2.x*p1.y;
			x += (p1.x+p2.x) * v;
			y += (p1.y+p2.y) * v;
			}
		v = this.cellArea(cell) * 6;
		return {x:x/v,y:y/v};
		},

    distance: function(a, b) {
      var dx = a.x-b.x, dy = a.y-b.y;
      return
    },

	compute: function(sites) {
		this.sites = sites;
		this.voronoi.recycle(this.diagram);
		this.diagram = this.voronoi.compute(sites, this.bbox);
		this.render();
		},

    render: function() {
		var ctx = this.canvas.getContext('2d');
		// background
		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.rect(0,0,this.canvas.width,this.canvas.height);
		ctx.fillStyle = 'white';
		ctx.fill();
		ctx.strokeStyle = '#888';
		ctx.stroke();
		// voronoi
		if (!this.diagram) {return;}
		// edges
		ctx.beginPath();
		ctx.strokeStyle = '#000';
		var edges = this.diagram.edges,
			iEdge = edges.length,
			edge, v;
		while (iEdge--) {
			edge = edges[iEdge];
			v = edge.va;
			ctx.moveTo(v.x,v.y);
			v = edge.vb;
			ctx.lineTo(v.x,v.y);
			}
		ctx.stroke();
		// sites
		ctx.beginPath();
		ctx.fillStyle = '#44f';
		var sites = this.sites,
			iSite = sites.length;
		while (iSite--) {
			v = sites[iSite];
			ctx.rect(v.x-2/3,v.y-2/3,2,2);
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

      console.log(this.colorCell(0.25));

      // Pick n,m random seed cells for land and water
      var seeds = this.generateSeeds(numLandSeeds+numWaterSeeds);
      var landSeeds = seeds.slice(0,numLandSeeds);
      var waterSeeds = seeds.slice(numLandSeeds,seeds.length);
      var landCells = landSeeds.splice();
      var waterCells = waterSeeds.splice();

      // Keep a running tab of all the cells we still have to visit
      var cellsToVisit = [];
      for (var i = 0; i <= numSites-1; i++) {
        if(seeds.indexOf(i) == -1) {
          cellsToVisit.push(i);
        }
      }

      // And cells on the 'edge', which will just be our seed cells for now
      var cellsEdge = [];
      var newOuterEdge = [];
      var cellShaderLevel = 1;
      for (var i = 0; i < seeds.length; i++) {
        cellsEdge.push(seeds[i]);
      }

      // While we've still got cells to visit, do all of things
    while(cellsToVisit.length > 0) {
      // For each cell in the edge, visit the neighbors and keep track of the new edges
        for (var i = 0; i < cellsEdge.length; i++) {
          var cellSite = cellsEdge[i];
          var edges = cells[cellSite].halfedges;
          // Visit each neighbor.
          for(var j=0; j<edges.length; j++) {
            var lSite = edges[j].edge.lSite != null ? edges[j].edge.lSite.voronoiId : null;
            var rSite = edges[j].edge.rSite != null ? edges[j].edge.rSite.voronoiId : null;
            // If the edge isn't a border along the outside
            if (lSite != null && rSite != null) {
              // If we haven't visited the cell already, add it to our edge,
              //  then remove it from our todo
              var otherSite = lSite == cellSite ? rSite : lSite;
              if(cellsToVisit.indexOf(otherSite) != -1) {
                newOuterEdge.push(otherSite);
                cellsToVisit.splice(cellsToVisit.indexOf(otherSite),1);
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

                  if(this.contains(landSeeds, cellSite)) {
                    if(this.colorCell(landChance)) {
                      landSeeds.push(otherSite);
                      ctx.fillStyle = 'rgba(204,0,0,1)';//'+0.2*cellShaderLevel+')';
                    } else {
                      waterSeeds.push(otherSite);
                      ctx.fillStyle = 'rgba(0,76,153,1)';
                    }
                  } else {
                    if(this.colorCell(waterChance)) {
                      waterSeeds.push(otherSite);
                     ctx.fillStyle = 'rgba(0,76,153,1)';
                    } else {
                      landSeeds.push(otherSite);
                      ctx.fillStyle = 'rgba(204,0,0,1)';
                    }
                  }
                  ctx.fill();
                }
              }
            }
          }
        }
        // Copy our newOuterEdge to cellsEdge and clear cellsEdge
        cellsEdge.length = 0;
        cellsEdge = newOuterEdge.slice();
        cellShaderLevel += 1;
        newOuterEdge.length = 0;
     }
    },

    colorCell: function(chance) {
      return Math.random() < chance;
    },

    contains: function(array,element) {
      return array.indexOf(element) != 1;
    },

    /**
     * Generate n random seeds to use
     */
    generateSeeds: function(n) {
      var arr = []
      while(arr.length < n) {
        var randomnumber=Math.ceil(Math.random()*numSites);
        var found=false;
        for(var i=0;i<arr.length;i++){
           if(arr[i]==randomnumber){found=true;break}
         }
         if(!found)arr[arr.length]=randomnumber;
       }
       return arr;
    },
  };
