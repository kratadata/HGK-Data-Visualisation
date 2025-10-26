let video;

// Canvas layer
let drawingLayer;

// Textures
let textures = [];
let selectedTextureIndex = -1;
let textureDisplayImages = [];

// Brush settings
let brushSize = 50;
let brushOpacity = 80;
let showVideo = true;
let showHands = false;
let eraseMode = false;

// UI Elements
let sizeSlider, opacitySlider, thresholdSlider;
let uploadButton, saveButton, clearButton, eraseModeButton;
let videoCheckbox, handsCheckbox;
let fileInput;

// Status message
let statusMessage = 'Loading hand tracking...';


function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create drawing layer
  drawingLayer = createGraphics(width, height);
  drawingLayer.clear();

  // Setup webcam
  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  video.hide();

  // Start hand detection
  startHandDetection(video);

  // Setup UI
  setupUI();

  statusMessage = '';
}

function setupUI() {
  // Top row - buttons
  uploadButton = createButton('Upload Textures');
  uploadButton.position(10, 10);
  uploadButton.style('background-color', '#000000ff');
  uploadButton.style('color', 'white');
  uploadButton.style('font-family', 'Bitcount Grid Single, system-ui');
  uploadButton.mousePressed(triggerFileUpload);

  saveButton = createButton('Save Artwork');
  saveButton.position(160, 10);
  saveButton.style('background-color', '#000000ff');
  saveButton.style('color', 'white');
  saveButton.style('font-family', 'Bitcount Grid Single, system-ui');
  saveButton.mousePressed(saveArtwork);

  clearButton = createButton('Clear Canvas');
  clearButton.position(290, 10);
  clearButton.style('background-color', '#000000ff');
  clearButton.style('color', 'white');
  clearButton.style('font-family', 'Bitcount Grid Single, system-ui');
  clearButton.mousePressed(clearCanvas);

  // Hidden file input
  fileInput = createFileInput(handleFile, true);
  fileInput.position(-1000, -1000);



  // Second row - sliders

  eraseModeButton = createButton('Draw Mode');
  eraseModeButton.position(10, 50);
  eraseModeButton.style('background-color', '#000000ff');
  eraseModeButton.style('color', 'white');
  eraseModeButton.style('font-family', 'Bitcount Grid Single, system-ui');  
  eraseModeButton.mousePressed(toggleEraseMode);

  createP('Size').position(120, 35).style('color', 'black');
  sizeSlider = createSlider(10, 100, 50);
  sizeSlider.position(160, 50);
  sizeSlider.size(100);

  createP('Opacity').position(290, 35).style('color', 'black');
  opacitySlider = createSlider(10, 100, 50);
  opacitySlider.position(360, 50);
  opacitySlider.size(100);

  // Third row - checkboxes
  videoCheckbox = createCheckbox(' Show Video', true);
  videoCheckbox.position(10, 90);
  videoCheckbox.style('color', 'black');

  handsCheckbox = createCheckbox(' Show Hand Keypoints', false);
  handsCheckbox.position(150, 90);
  handsCheckbox.style('color', 'black');
}

function draw() {
  // Update settings
  brushSize = sizeSlider.value();
  brushOpacity = opacitySlider.value();
  showVideo = videoCheckbox.checked();
  showHands = handsCheckbox.checked();

  // Draw main canvas
  background(20);

  // Draw video feed if enabled
  if (showVideo) {
    push();

    // Scale to full width, adjust height proportionally to maintain aspect ratio
    let videoAspect = video.width / video.height;
    let aHeight = width / videoAspect;

    image(video, 0, 0, width, aHeight);
    pop();
  }

  // Process hands
  updateHandTracking();

  // Draw hand keypoints if enabled
  if (showHands) {
    drawHandKeypoints();
  }

  // Draw or erase with hands if pinching
  if (eraseMode) {
    // Erase mode - no texture needed
    if (leftHand.isPinching) {
      eraseWithBrush(leftHand);
    }
    if (rightHand.isPinching) {
      eraseWithBrush(rightHand);
    }
  } else {
    // Draw mode - texture required
    if (selectedTextureIndex >= 0 && textures[selectedTextureIndex]) {
      if (leftHand.isPinching) {
        drawWithBrush(leftHand);
      }
      if (rightHand.isPinching) {
        drawWithBrush(rightHand);
      }
    }
  }

  // Draw the accumulated artwork
  image(drawingLayer, 0, 0);

  // Draw hand indicators
  drawHandIndicators();

  // Draw texture gallery
  drawTextureGallery();

  // Draw status message
  drawStatus();

}

function drawWithBrush(hand) {
  let texture = textures[selectedTextureIndex];
  if (!texture) return;

  let alpha = map(brushOpacity, 0, 100, 0, 255);

  drawingLayer.push();
  drawingLayer.imageMode(CENTER);

  // Draw trail
  for (let i = 0; i < hand.trail.length; i++) {
    let t = hand.trail[i];
    let trailAlpha = map(i, 0, hand.trail.length, alpha * 0.3, alpha);
    let trailSize = map(i, 0, hand.trail.length, brushSize * 0.5, brushSize);

    drawingLayer.tint(255, trailAlpha);
    drawingLayer.image(texture, t.x, t.y, trailSize, trailSize);
  }

  drawingLayer.pop();
}

function eraseWithBrush(hand) {
  drawingLayer.push();
  drawingLayer.erase();
  drawingLayer.noStroke();

  // Erase trail
  for (let i = 0; i < hand.trail.length; i++) {
    let t = hand.trail[i];
    let trailSize = map(i, 0, hand.trail.length, brushSize * 0.5, brushSize);
    drawingLayer.rectMode(CENTER);
    drawingLayer.rect(t.x, t.y, trailSize);
  }

  drawingLayer.noErase();
  drawingLayer.pop();
}

function drawHandIndicators() {
  if (leftHand.detected) drawHand(leftHand);
  if (rightHand.detected) drawHand(rightHand);
}


function drawTextureGallery() {
  let startX = 10;
  let startY = 140;
  let thumbSize = 80;
  let gap = 10;

  // Background
  fill(0, 0, 0, 150);
  noStroke();
  let galleryWidth = min(textures.length, 10) * (thumbSize + gap) + gap;
  rect(startX - 5, startY - 5, galleryWidth, thumbSize + 10);


  // Draw texture thumbnails
  for (let i = 0; i < textures.length; i++) {
    let x = startX + i * (thumbSize + gap);
    let y = startY;

    // Check if hovering
    let isHovered = mouseX > x && mouseX < x + thumbSize &&
      mouseY > y && mouseY < y + thumbSize;

    // Draw border
    if (i === selectedTextureIndex) {
      stroke(0, 255, 0);
      strokeWeight(4);
    } else if (isHovered) {
      stroke(255, 255, 0);
      strokeWeight(3);
    } else {
      stroke(100);
      strokeWeight(1);
    }

    fill(50);
    rect(x, y, thumbSize, thumbSize);

    // Draw texture
    if (textureDisplayImages[i]) {
      image(textureDisplayImages[i], x + 2, y + 2, thumbSize - 4, thumbSize - 4);
    }

    // Draw X button on hover
    if (isHovered) {
      fill(255, 0, 0);
      noStroke();
      circle(x + thumbSize - 10, y + 10, 18);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(14);
      text('×', x + thumbSize - 10, y + 10);
    }
  }
}

function drawStatus() {

  fill(255);
  textSize(14);
  noStroke();
  textAlign(RIGHT);
  

  let handsDetected = getHandsCount();
  let status = `${handsDetected} hand(s) detected | ${statusMessage}`;
  text(status, width - 15, 30);
}

function mousePressed() {
  // Check if clicking on texture gallery
  let startX = 10;
  let startY = 140;
  let thumbSize = 80;
  let gap = 10;

  for (let i = 0; i < textures.length; i++) {
    let x = startX + i * (thumbSize + gap);
    let y = startY;

    if (mouseX > x && mouseX < x + thumbSize &&
      mouseY > y && mouseY < y + thumbSize) {

      // Check if clicking X button
      let xButtonX = x + thumbSize - 10;
      let xButtonY = y + 10;
      let distToX = dist(mouseX, mouseY, xButtonX, xButtonY);

      if (distToX < 9) {
        removeTexture(i);
      } else {
        selectedTextureIndex = i;
        statusMessage = `Texture ${i + 1} selected. Pinch to draw!`;
      }
      return;
    }
  }
}

function triggerFileUpload() {
  fileInput.elt.click();
}

function handleFile(file) {
  if (file.type === 'image') {
    loadImage(file.data, img => {
      textures.push(img);

      // Create thumbnail
      let thumb = createGraphics(80, 80);
      thumb.image(img, 0, 0, 80, 80);
      textureDisplayImages.push(thumb);

      // Auto-select first texture
      if (selectedTextureIndex < 0) {
        selectedTextureIndex = 0;
        statusMessage = `Texture loaded! Pinch thumb and index to draw.`;
      } else {
        statusMessage = `${textures.length} textures loaded`;
      }
    });
  }
}

function removeTexture(index) {
  textures.splice(index, 1);
  textureDisplayImages.splice(index, 1);

  if (selectedTextureIndex === index) {
    selectedTextureIndex = textures.length > 0 ? 0 : -1;
  } else if (selectedTextureIndex > index) {
    selectedTextureIndex--;
  }

  statusMessage = textures.length > 0 ? `${textures.length} textures remaining` : 'Upload textures to begin';
}

function saveArtwork() {
  saveCanvas(drawingLayer, 'pinch-brush-artwork', 'png');
  statusMessage = 'Artwork saved!';
  setTimeout(() => {
    statusMessage = 'Pinch thumb and index to draw';
  }, 2000);
}

function clearCanvas() {
  drawingLayer.clear();
  statusMessage = 'Canvas cleared';
}

function toggleEraseMode() {
  eraseMode = !eraseMode;
  if (eraseMode) {
    eraseModeButton.html('Erase Mode');
    eraseModeButton.style('background-color', '#ffffffff');
    eraseModeButton.style('color', 'black');
    statusMessage = 'Erase mode active - pinch to erase';
  } else {
    eraseModeButton.html('Draw Mode');
    eraseModeButton.style('background-color', '#000000ff');
    eraseModeButton.style('color', 'white');
    statusMessage = 'Draw mode active - pinch to draw';
  }
}