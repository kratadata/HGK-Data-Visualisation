// Hand tracking variables
let handPose;
let hands = [];

// Hand tracking with pinch detection
let leftHand = {
  thumb: { x: 0, y: 0 },
  index: { x: 0, y: 0 },
  midpoint: { x: 0, y: 0 },
  isPinching: false,
  distance: 0,
  trail: [],
  detected: false
};

let rightHand = {
  thumb: { x: 0, y: 0 },
  index: { x: 0, y: 0 },
  midpoint: { x: 0, y: 0 },
  isPinching: false,
  distance: 0,
  trail: [],
  detected: false
};

let pinchThreshold = 70;
let trailLength = 10;

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
}

// Update hand tracking data
function updateHandTracking() {
  // Reset detection
  leftHand.detected = false;
  rightHand.detected = false;

  // Process each detected hand
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    // Get thumb tip and index finger tip
    // HandPose keypoints: 4 = thumb tip, 8 = index finger tip
    let thumbTip = hand.keypoints[4];
    let indexTip = hand.keypoints[8];

    if (!thumbTip || !indexTip) continue;

    // Determine if this is left or right hand
    let handObj;
    if (hand.handedness == "Left") {
      handObj = leftHand;
    } else {
      handObj = rightHand;
    }

    handObj.detected = true;
    handObj.thumb.x = thumbTip.x;
    handObj.thumb.y = thumbTip.y;
    handObj.index.x = indexTip.x;
    handObj.index.y = indexTip.y;

    // Calculate distance and midpoint
    handObj.distance = dist(handObj.thumb.x, handObj.thumb.y, handObj.index.x, handObj.index.y);
    handObj.midpoint.x = (handObj.thumb.x + handObj.index.x) / 2;
    handObj.midpoint.y = (handObj.thumb.y + handObj.index.y) / 2;

    // Check if pinching
    handObj.isPinching = handObj.distance < pinchThreshold;

    if (handObj.isPinching) {
      handObj.trail.push({ x: handObj.midpoint.x, y: handObj.midpoint.y });
      if (handObj.trail.length > trailLength) {
        //handObj.trail.shift();
      }
    } else {
      handObj.trail = [];
    }
  }

  // Clear trail if hand not detected
  if (!leftHand.detected) {
    leftHand.isPinching = false;
    leftHand.trail = [];
  }
  if (!rightHand.detected) {
    rightHand.isPinching = false;
    rightHand.trail = [];
  }
}

// Draw all hand keypoints for debugging
function drawHandKeypoints() {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    // Draw keypoints
    for (let j = 0; j < hand.keypoints.length; j++) {
      let kp = hand.keypoints[j];
      if (kp) {
        fill(255, 0, 0, 150);
        noStroke();
        circle(kp.x, kp.y, 8);
      }
    }
  }
}


function drawHand(hand) {
  push();

  // Draw line between thumb and index
  if (hand.isPinching) {
    stroke(0, 255, 0);
    strokeWeight(4);
  } else {
    stroke(255, 100, 100);
    strokeWeight(2);
  }
  line(hand.thumb.x, hand.thumb.y, hand.index.x, hand.index.y);

  // Draw thumb
  fill(255, 200, 0);
  noStroke();
  circle(hand.thumb.x, hand.thumb.y, 15);

  // Draw index
  fill(0, 200, 255);
  circle(hand.index.x, hand.index.y, 15);

  // Draw midpoint with texture/eraser preview if pinching
  if (hand.isPinching) {
    if (eraseMode) {
      // Show eraser preview
      fill(255, 50, 50, 150);
      stroke(255, 0, 0);
      strokeWeight(2);
      circle(hand.midpoint.x, hand.midpoint.y, brushSize);
      noStroke();
    } else if (selectedTextureIndex >= 0 && textures[selectedTextureIndex]) {
      // Show texture preview
      imageMode(CENTER);
      tint(255, 200);
      image(textures[selectedTextureIndex], hand.midpoint.x, hand.midpoint.y,
        brushSize, brushSize);
    }
  } else {
    fill(255, 100, 255, 100);
    circle(hand.midpoint.x, hand.midpoint.y, 20);
  }

  // Draw distance text
  fill(255);
  textSize(12);
  textAlign(CENTER);
  text(int(hand.distance), hand.midpoint.x, hand.midpoint.y - 30);

  pop();
}

// Get number of detected hands
function getHandsCount() {
  return hands.length;
}
