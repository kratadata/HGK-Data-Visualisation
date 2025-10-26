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
}
