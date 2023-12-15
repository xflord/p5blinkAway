let faceapi;
const blinkThresh = 0.22
let detections = [];
let point_size = 10;
let points_num = 30;
let chaos = 100;
let chaosReached = false;
let prevBlinked = false;
let chaosAmp = 1;

let distValues = []



function setup() {
  createCanvas(640, 480);
  var myConfig = {
    hideCursor: true,
    pose: {
      upperBodyOnly: true
    }
  };
  myHandsfree = new Handsfree(myConfig);
  myHandsfree.start();
}


function draw() {
  background(220);
  if (myHandsfree.isTracking) {
    if (myHandsfree.pose.length > 0) {

      var face0 = myHandsfree.pose[0].face;
      var nPoints = face0.vertices.length;

      //fill(255, 0, 0);
      noFill()
      for (var i = 0; i < nPoints; i += 2) {
        var x = face0.vertices[i + 0];
        var y = face0.vertices[i + 1];
        
        
        let oppIndex = i/2 + 16 - (i)
        let oppX = face0.vertices[oppIndex*2]
        var h = (face0.vertices[i+3] - y)/4
        var w = (face0.vertices[i+2] - x)/4;
        var xOff = -0;
        if (i < 16) {
          for (let yOff = 0; yOff < 4*h; yOff+=h) {
            beginShape()
            for(let xx = x+xOff; xx < oppX-xOff; xx += 5) {
                  vertex(xx, y + yOff- noise(xx-x, millis()/(100000/chaos),i*yOff*1000)*chaos);
            }
            xOff += w;
            endShape()
          }
        } else {
          beginShape()
          for(let xx = x; xx < oppX; xx += 5) {
                vertex(xx, y - noise(xx-x, millis()/(100000/chaos),i*yOff*100)*chaos);
          }
          endShape()
        }
        //ellipse(x, y, 9, 9);
        //text((i / 2).toString(), x, y);
      }
      let leftDist = getEAR({left: [face0.vertices[37*2],face0.vertices[37*2+1]], right:[face0.vertices[38*2],face0.vertices[38*2+1]]}
        , {left:[face0.vertices[41*2],face0.vertices[41*2+1]], right:[face0.vertices[40*2],face0.vertices[40*2+1]]},[face0.vertices[36*2],face0.vertices[36*2+1]], [face0.vertices[39*2],face0.vertices[39*2+1]]);
      //console.log(leftDist)
        if (!chaosReached) {
          if (!prevBlinked) {
            distValues.push(leftDist)
            if (distValues.length > 300) {
              distValues.shift();
            }
          }
          let averageDist = 0
          distValues.forEach(val => {averageDist += val});
          averageDist = averageDist/distValues.length;
        if (leftDist < 0.8*averageDist && !prevBlinked) {
          chaosAmp = 0.1;
          chaos -= 7;
          if (chaos < 0) {
            chaos = 0;
          }
          console.log(chaos)
          if (chaos <= 20) {
            //chaosReached = true;
          }
        }
        prevBlinked = leftDist < 0.8*averageDist;
      }

      push()
      fill(220)
      stroke(1);
      noStroke();
      beginShape();
      for (let i=36 ; i<=41; i+=1) {
        vertex(face0.vertices[i*2], face0.vertices[i*2+1])
      }
      endShape(CLOSE)

      beginShape();
      for (let i=42 ; i<=47; i+=1) {
        vertex(face0.vertices[i*2], face0.vertices[i*2+1])
      }
      endShape(CLOSE)
      pop()
      
      right_eye = [];
      left_eye = [];

      // Rotations of the head, in radians
      var rx = face0.rotationX; // pitch
      var ry = face0.rotationY; // yaw
      var rz = face0.rotationZ; // roll

    }
  }
  if (!chaosReached) {
    chaos += 0.3 * chaosAmp;
    chaosAmp += 0.01;
    if (chaos > 100) {
      chaos = 100;
    }
  }

}

// LU: 37 38 LL: 41 40 L 36 R 39   RU: 43 44, RL: 47 46 L 42 R 45

function getEAR(upper, lower, ML, MR) {
  function getEucledianDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }

  console.log(getEucledianDistance(ML[0], ML[1], MR[0], MR[1]))
  return (
    (getEucledianDistance(upper.left[0], upper.left[1], lower.left[0], lower.left[1])
      + getEucledianDistance(
        upper.right[0],
        upper.right[1],
        lower.right[0],
        lower.right[1],
      ))
    / (2
      * getEucledianDistance(ML[0], ML[1], MR[0], MR[1]))
  );
}