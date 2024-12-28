class PersonDetector {
    constructor() {
        this.video = document.getElementById('video');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.status = document.getElementById('status');
        this.photosContainer = document.getElementById('photos-container');
        this.detectionCanvas = document.getElementById('detection-canvas');
        this.detectionContext = this.detectionCanvas.getContext('2d');
        this.loadingMessage = document.getElementById('loading-message');
        
        // Detection controls
        this.confidenceSlider = document.getElementById('confidence');
        this.cooldownSlider = document.getElementById('cooldown');
        this.confidenceValue = document.getElementById('confidenceValue');
        this.cooldownValue = document.getElementById('cooldownValue');
        
        this.stream = null;
        this.isDetecting = false;
        this.animationFrame = null;
        this.lastCaptureTime = 0;
        this.model = null;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d', { willReadFrequently: true });
        
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());
        
        // Add detection settings listeners
        this.confidenceSlider.addEventListener('input', () => {
            this.confidence = parseInt(this.confidenceSlider.value) / 100;
            this.confidenceValue.textContent = this.confidence.toFixed(2);
        });

        this.cooldownSlider.addEventListener('input', () => {
            this.cooldown = parseInt(this.cooldownSlider.value);
            this.cooldownValue.textContent = this.cooldown;
        });
        
        // Initial values
        this.confidence = parseInt(this.confidenceSlider.value) / 100;
        this.cooldown = parseInt(this.cooldownSlider.value);
        
        // Set initial dark mode
        document.body.classList.add('dark-mode');
        
        // Load the COCO-SSD model
        this.loadModel();
    }

    async loadModel() {
        try {
            this.loadingMessage.style.display = 'block';
            this.model = await cocoSsd.load();
            this.loadingMessage.style.display = 'none';
            this.startBtn.disabled = false;
        } catch (error) {
            console.error('Error loading model:', error);
            this.loadingMessage.textContent = 'Error loading AI model. Please refresh the page.';
        }
    }

    async startDetection() {
        if (!this.model) {
            alert('Please wait for the AI model to load.');
            return;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                } 
            });
            
            this.video.srcObject = this.stream;
            this.video.play();
            
            // Wait for video metadata to load before starting detection
            this.video.addEventListener('loadedmetadata', () => {
                // Set canvas sizes to match video
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.detectionCanvas.width = this.video.videoWidth;
                this.detectionCanvas.height = this.video.videoHeight;
                
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                this.isDetecting = true;
                this.detectPerson();
                
                this.status.textContent = 'Detection started';
                this.status.style.backgroundColor = '#7bed9f';
            }, { once: true });
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.status.textContent = 'Error: Could not access camera';
            this.status.style.backgroundColor = '#ff6b6b';
        }
    }

    stopDetection() {
        this.isDetecting = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.video.srcObject = null;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.status.textContent = 'Detection stopped';
        this.status.style.backgroundColor = '#f0f0f0';
        document.body.classList.add('dark-mode');
        
        // Clear detection canvas
        this.detectionContext.clearRect(0, 0, this.detectionCanvas.width, this.detectionCanvas.height);
    }

    capturePhoto() {
        try {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                const timestamp = new Date().toLocaleTimeString();
                
                // Use the existing canvas for capture
                this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';
                
                const img = document.createElement('img');
                img.src = this.canvas.toDataURL('image/jpeg', 0.8);
                
                const timestampDiv = document.createElement('div');
                timestampDiv.className = 'photo-timestamp';
                timestampDiv.textContent = timestamp;
                
                photoItem.appendChild(img);
                photoItem.appendChild(timestampDiv);
                this.photosContainer.insertBefore(photoItem, this.photosContainer.firstChild);
            }
        } catch (error) {
            console.error('Error capturing photo:', error);
        }
    }

    async detectPerson() {
        if (!this.isDetecting) return;

        try {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                // Detect objects in the video frame
                const predictions = await this.model.detect(this.video);
                
                // Clear previous drawings
                this.detectionContext.clearRect(0, 0, this.detectionCanvas.width, this.detectionCanvas.height);
                
                // Check for persons with confidence above threshold
                const persons = predictions.filter(pred => 
                    pred.class === 'person' && pred.score >= this.confidence
                );
                
                if (persons.length > 0) {
                    // Person detected
                    this.status.textContent = `Person detected! (Confidence: ${(persons[0].score * 100).toFixed(1)}%)`;
                    this.status.style.backgroundColor = '#ff9f43';
                    document.body.classList.remove('dark-mode');

                    // Draw bounding boxes
                    persons.forEach(person => {
                        this.drawDetectionBox(person);
                    });

                    // Capture photo if cooldown period has passed
                    const now = Date.now();
                    const timeSinceLastCapture = (now - this.lastCaptureTime) / 1000;
                    
                    if (timeSinceLastCapture >= this.cooldown) {
                        this.capturePhoto();
                        this.lastCaptureTime = now;
                    }
                } else {
                    // No person detected
                    this.status.textContent = 'No person detected';
                    this.status.style.backgroundColor = '#7bed9f';
                    document.body.classList.add('dark-mode');
                }
            }
            
            this.animationFrame = requestAnimationFrame(() => this.detectPerson());
        } catch (error) {
            console.error('Error in person detection:', error);
            this.stopDetection();
        }
    }

    drawDetectionBox(detection) {
        // Set styling for the box
        this.detectionContext.strokeStyle = '#00ff00';
        this.detectionContext.lineWidth = 2;
        this.detectionContext.fillStyle = '#00ff00';
        this.detectionContext.font = '16px Arial';

        // Draw the box
        this.detectionContext.beginPath();
        this.detectionContext.rect(
            detection.bbox[0],
            detection.bbox[1],
            detection.bbox[2],
            detection.bbox[3]
        );
        this.detectionContext.stroke();

        // Draw the label
        const confidence = (detection.score * 100).toFixed(1);
        this.detectionContext.fillStyle = 'rgba(0, 255, 0, 0.7)';
        this.detectionContext.fillRect(
            detection.bbox[0],
            detection.bbox[1] - 20,
            100,
            20
        );
        this.detectionContext.fillStyle = '#000000';
        this.detectionContext.fillText(
            `Person ${confidence}%`,
            detection.bbox[0] + 5,
            detection.bbox[1] - 5
        );
    }
}

// Initialize the person detector when the page loads
window.addEventListener('load', () => {
    new PersonDetector();
}); 