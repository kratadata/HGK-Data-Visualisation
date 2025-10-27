
let video;
let bodyPose;
let poses = [];
let connections;
let numSteps = 5;

let noseArray = [];
let leftAnkleArray = [];

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(1920, 1080);

  // Create the video and hide it
  video = createVideo("video.mov");
  video.size(width, height);
  video.loop();
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();
}

function draw() {
  // Draw the webcam video
  background(0,5)
  //image(video, 0, 0, width, height);

  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[0];
    updateTrail(pose, "nose", noseArray)
    updateTrail(pose, "left_ankle", leftAnkleArray)
    //  for (let j = 0; j < pose.keypoints.length; j++) {
    //   let keypoint = pose.keypoints[j];
    //    // Only draw a circle if the keypoint's confidence is bigger than 0.1
    //    console.log(keypoint);
    // }
  }
}



// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}


function updateTrail(pose, keyPointName, arrayTrail){
    let keypoint = null;

    for(let i=0; i< pose.keypoints.length; i++){
      if (pose.keypoints[i].name == keyPointName) {
          keypoint = pose.keypoints[i];
          console.log(keypoint)
      }
    }

    if (keypoint.confidence > 0.1){
      noFill();
      stroke(255, 0,0)
      strokeWeight(2)
      circle(keypoint.x, keypoint.y, 10);
    }

    arrayTrail.push(createVector(keypoint.x, keypoint.y))
    if (arrayTrail.length > 1){
      noFill()
      stroke(255, 255, 255)
      strokeWeight(2);

      beginShape()

      for( let i = 0; i<arrayTrail.length; i++){
          curveVertex(arrayTrail[i].x,arrayTrail[i].y)
      }

      endShape()
    }

    if(arrayTrail.length > numSteps){
      arrayTrail.splice(0, 1)
    }

} 