var seedCount = 500;
var canvasWidth = 1000;
var canvasHeight = 500;

var canvas = document.getElementById('mapCanvas');
var c =  canvas.getContext('2d');

var seed = new Array(seedCount);
for (var i = 0; i < seedCount; i++)
{
  seed[i] = new Array(2);
  seed[i][0] = canvasWidth*Math.random();
  seed[i][1] = canvasHeight*Math.random();

  c.beginPath();
  c.arc(seed[i][0],seed[i][1],1.5,0,2*Math.PI);
  c.stroke();
}
