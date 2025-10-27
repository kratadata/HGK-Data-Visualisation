// Hand tracking variables
let handPose;
let hands = [];

// Hand tracking with pinch detection
let leftHand = {
  thumb: { x: 0, y: 0, z: 0 },
  index: { x: 0, y: 0, z: 0 },
  midpoint: { x: 0, y: 0, z: 0 },
  isPinching: false,
  distance: 0,
  detected: false,
};

let rightHand = {
  thumb: { x: 0, y: 0, z: 0 },
  index: { x: 0, y: 0, z: 0 },
  midpoint: { x: 0, y: 0, z: 0 },
  isPinching: false,
  distance: 0,
  detected: false,
};

let pinchThreshold = 50;
// Initialize hand tracking
function preload() {
  handPose = ml5.handPose({ flipped: true });
}

// Start hand detection with video
function startHandDetection(videoElement) {
  handPose.detectStart(videoElement, gotHands);
}

// Callback for hand detection results
function gotHands(results) {
  hands = results;
  console.log(hands);
}

function drawKeypoints() {

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j< hand.keypoints.length; j++){
      let kp = hand.keypoints[j];
      //console.log(kp);
      if (kp){
        fill(255, 255, 255);
        stroke(0,0,0);
        circle(kp.x, kp.y, 20);
      }
    }
  }
}

function pinchTracking() {

  leftHand.detected = false;
  rightHand.detected = false;

  for (let i = 0; i< hands.length; i++){
    let hand = hands[i];
    let thumbTip = hand.keypoints[4];
    let indexTip = hand.keypoints[8];

    let handObj;
    if (hand.handedness == "Left"){
      handObj = leftHand;
    }else {
      handObj = rightHand;
    }

    handObj.detected = true;

    handObj.thumb.x = thumbTip.x;
    handObj.thumb.y = thumbTip.y;

    handObj.index.x = indexTip.x;
    handObj.index.y = indexTip.y;

    handObj.distance = dist(handObj.thumb.x,handObj.thumb.y, handObj.index.x, handObj.index.y )
    handObj.midpoint.x = (handObj.thumb.x + handObj.index.x) /2;
    handObj.midpoint.y = (handObj.thumb.y + handObj.index.y) /2;

    if (handObj.distance < pinchThreshold)  {
      handObj.isPinching = true;
    } else {
       handObj.isPinching = false;
    }
    

    console.log(handObj.distance)
  }

}

function drawHand(hand) {

  //Draw distance line
  if (hand.isPinching){
    strokeWeight(5);
    stroke(0,255,0)
  }else {
    strokeWeight(1);
    stroke(255,255,255);
  }

  line(hand.thumb.x, hand.thumb.y, hand.index.x, hand.index.y);

  //Draw thumb point
  fill(200,100,0);
  circle(hand.thumb.x, hand.thumb.y, 20);

  //Draw index point
  fill(0,100,200);
  circle(hand.index.x, hand.index.y, 20);

  //Draw midpoint 
  fill(100, 200, 0);
  circle(hand.midpoint.x, hand.midpoint.y, 20);

}


function drawCube() {
  push()

  if (leftHand.detected) {
    cubeX = leftHand.midpoint.x - width/2;
    cubeY = leftHand.midpoint.y - height/2;
    translate(cubeX, cubeY, 100);
  }

  stroke(100,200, 0)
  strokeWeight(3)
  noFill()
  box(50);


  pop()

}