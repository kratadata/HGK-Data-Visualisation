let video;
let showVideo = true;
let showHands = false;
let cubeGraphics;
let cubeSize = 0;
let rotationX = 0;
let rotationY = 0;
let cubeX = 0;
let cubeY = 0;
let clr;


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Setup webcam
  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  video.hide();

  // Start hand detection
  startHandDetection(video);
  setupUI();

  clr = color(0, 255, 200);
}

function setupUI() {
  videoCheckbox = createCheckbox('Show Video', true);
  videoCheckbox.position(10, 10);
  videoCheckbox.style('color', 'black');

  handsCheckbox = createCheckbox('Show Hand Keypoints', false);
  handsCheckbox.position(150, 10);
  handsCheckbox.style('color', 'black');
}

function draw() {
  background(20);

  showVideo = videoCheckbox.checked();
  showHands = handsCheckbox.checked();

  push();
  translate(-width/2, -height/2); // Push video back in Z space

  // Draw video feed if enabled (in 2D mode)
  if (showVideo) {
    let videoAspect = video.width / video.height;
    let aHeight = width / videoAspect;
    image(video, 0, 0, width, aHeight);
  }
  pop();
}

