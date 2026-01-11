import * as faceapi from 'face-api.js';

// Using a reliable CDN for face-api.js models to keep the repo clean
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights';

let modelsLoaded = false;

export const loadFaceModels = async () => {
    if (modelsLoaded) return;

    try {
        console.log("Loading face detection models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        // await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL); // Optional: for more precision
        modelsLoaded = true;
        console.log("Face detection models loaded.");
    } catch (error) {
        console.error("Failed to load face detection models:", error);
        throw new Error("Failed to load face detection models");
    }
};

export const verifyHumanFace = async (imageBase64: string): Promise<{ isValid: boolean; score?: number; error?: string }> => {
    if (!modelsLoaded) {
        await loadFaceModels();
    }

    try {
        // Create an HTMLImageElement from the base64 string
        const img = await faceapi.fetchImage(imageBase64);

        // Detect faces using the Tiny Face Detector (fast and lightweight)
        const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());

        if (detections.length === 0) {
            return {
                isValid: false,
                error: "No face detected. Please ensure your face is clearly visible."
            };
        }

        if (detections.length > 1) {
            return {
                isValid: false,
                error: "Multiple faces detected. Please ensure only you are in the frame."
            };
        }

        // Check confidence score
        const bestDetection = detections[0];
        if (bestDetection.score < 0.5) {
            return {
                isValid: false,
                error: "Face detection confidence too low. Please try better lighting."
            };
        }

        return {
            isValid: true,
            score: bestDetection.score
        };

    } catch (error) {
        console.error("Face verification error:", error);
        return {
            isValid: false,
            error: "Error processing image."
        };
    }
};
