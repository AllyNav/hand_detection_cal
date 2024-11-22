// Select elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const handCountElement = document.getElementById('handCount');

// Initialize MediaPipe Hands
const hands = new hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.5,
});

// Handle detected hands and draw results
hands.onResults((results) => {
  // Clear the canvas
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw video frame to canvas
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  // Number of detected hands
  const handCount = results.multiHandLandmarks.length;
  handCountElement.innerText = handCount;

  // Process each detected hand
  results.multiHandLandmarks.forEach((landmarks, index) => {
    detectGestures(landmarks, index);

    // Draw hand landmarks
    landmarks.forEach((landmark) => {
      const x = landmark.x * canvasElement.width;
      const y = landmark.y * canvasElement.height;

      canvasCtx.beginPath();
      canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
      canvasCtx.fillStyle = 'cyan';
      canvasCtx.fill();
    });
  });
});

// Gesture recognition logic
function detectGestures(landmarks, index) {
  const thumbTip = landmarks[4];
  const indexFingerTip = landmarks[8];
  const palmBase = landmarks[0];

  const thumbToIndexDistance = Math.sqrt(
    Math.pow(thumbTip.x - indexFingerTip.x, 2) +
    Math.pow(thumbTip.y - indexFingerTip.y, 2)
  );

  // Thumbs up gesture
  if (thumbTip.y < palmBase.y && thumbToIndexDistance > 0.2) {
    displayGesture('High Five', index);
  }

  // High-five gesture (open hand)
  const fingersSpread = Math.abs(landmarks[5].x - landmarks[9].x);
  if (fingersSpread > 0.4) {
    displayGesture('High Five', index);
  }
}

// Display gesture on the canvas
function displayGesture(gesture, index) {
  canvasCtx.font = '20px Arial';
  canvasCtx.fillStyle = 'yellow';
  canvasCtx.fillText(`${gesture}`, 10, 30 + index * 30);
}

// Set up the camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
camera.start();
