# AI Person Detection Web App

A real-time person detection web application using TensorFlow.js and the COCO-SSD model. The app utilizes your webcam to detect people in real-time, draws bounding boxes around them, and automatically captures photos when people are detected.

## Features
- Real-time person detection using TensorFlow.js
- Adjustable detection confidence threshold
- Automatic photo capture with customizable cooldown
- Dark/Light mode transitions
- Timestamp on captured photos
- Responsive design
- Green bounding boxes with confidence percentage

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- TensorFlow.js
- COCO-SSD Model
- Canvas API
- MediaDevices API

## How to Use
1. Clone this repository:
   ```bash
   git clone [your-repo-url]
   ```
2. Open `index.html` in a modern web browser (Chrome recommended).
3. Allow camera access when prompted.
4. Wait for the AI model to load.
5. Click **"Start Detection"** to begin.
6. Adjust settings as needed:
   - **Detection Confidence (0-1):** Higher values for more accurate detection.
   - **Capture Cooldown:** Time between automatic photo captures.

## Settings
### Detection Confidence
- **Range:** 0.0 to 1.0
- **Default:** 0.6 (60%)
- **Higher values:** More accurate but less sensitive.
- **Lower values:** More sensitive but may produce false positives.

### Capture Cooldown
- **Range:** 1 to 10 seconds
- **Default:** 3 seconds
- **Controls:** How frequently photos are taken when people are detected.

## Requirements
- Modern web browser with JavaScript enabled
- Webcam access
- Internet connection (for loading TensorFlow.js and COCO-SSD model)

## Browser Support
- **Chrome** (recommended)
- **Firefox**
- **Edge**
- **Safari**

## Privacy Note
This application processes all video data locally in your browser. No video or images are sent to any server.

## License
MIT License - feel free to use this project for any purpose.

## Author
J.S.

