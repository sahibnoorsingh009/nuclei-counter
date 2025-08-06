// Image processing methods using OpenCV.js

class ImageProcessingMethods {
    constructor() {
        this.isOpenCVReady = false;
    }

    setOpenCVReady() {
        this.isOpenCVReady = true;
        console.log('OpenCV.js is ready for image processing');
    }

    // Method 1: Otsu + Watershed (Primary Method)
    // Method 1: Simplified Otsu + Watershed (More Compatible)
async method1_otsuWatershed(imageElement) {
    console.log('Starting Method 1: Simplified Otsu + Watershed');
    const startTime = performance.now();

    try {
        // Convert image to OpenCV Mat
        const src = cv.imread(imageElement);
        const gray = new cv.Mat();
        
        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Gaussian blur
        const blurred = new cv.Mat();
        const ksize = new cv.Size(5, 5);
        cv.GaussianBlur(gray, blurred, ksize, 1.0);

        // Otsu thresholding
        const binary = new cv.Mat();
        cv.threshold(blurred, binary, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

        // Simple morphological operations
        const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
        const cleaned = new cv.Mat();
        cv.morphologyEx(binary, cleaned, cv.MORPH_OPEN, kernel);

        // Find contours instead of complex watershed
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(cleaned, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // Filter contours by area and border proximity
        let validCount = 0;
        const minArea = 30;
        const maxArea = 2000;
        const borderMargin = 10;

        // Create result visualization
        const result = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        cv.cvtColor(gray, result, cv.COLOR_GRAY2RGB);

        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            
            // Check area
            if (area < minArea || area > maxArea) continue;

            // Check if contour touches border
            const rect = cv.boundingRect(contour);
            if (rect.x < borderMargin || rect.y < borderMargin ||
                rect.x + rect.width > src.cols - borderMargin ||
                rect.y + rect.height > src.rows - borderMargin) {
                continue;
            }

            validCount++;
            // Draw contour in green
            cv.drawContours(result, contours, i, new cv.Scalar(0, 255, 0), 2);
        }

        const processingTime = performance.now() - startTime;

        // Convert result to canvas
        const canvas = document.createElement('canvas');
        cv.imshow(canvas, result);

        // Cleanup
        src.delete();
        gray.delete();
        blurred.delete();
        binary.delete();
        cleaned.delete();
        contours.delete();
        hierarchy.delete();
        result.delete();
        kernel.delete();

        return {
            count: validCount,
            time: processingTime,
            canvas: canvas,
            method: 'Otsu + Watershed'
        };

    } catch (error) {
        console.error('Error in Method 1:', error);
        throw error;
    }
}

    // Method 2: Simple Thresholding
    async method2_simpleThreshold(imageElement) {
        console.log('Starting Method 2: Simple Thresholding');
        const startTime = performance.now();

        try {
            const src = cv.imread(imageElement);
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            // Simple fixed threshold
            const binary = new cv.Mat();
            cv.threshold(gray, binary, 80, 255, cv.THRESH_BINARY);

            // Basic morphology
            const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
            const cleaned = new cv.Mat();
            cv.morphologyEx(binary, cleaned, cv.MORPH_OPEN, kernel);

            // Find contours
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(cleaned, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            // Count valid contours
            let validCount = 0;
            const minArea = 30;
            const maxArea = 2000;
            const borderMargin = 10;

            for (let i = 0; i < contours.size(); i++) {
                const contour = contours.get(i);
                const area = cv.contourArea(contour);
                
                if (area < minArea || area > maxArea) continue;

                const rect = cv.boundingRect(contour);
                if (rect.x < borderMargin || rect.y < borderMargin ||
                    rect.x + rect.width > src.cols - borderMargin ||
                    rect.y + rect.height > src.rows - borderMargin) {
                    continue;
                }

                validCount++;
            }

            // Create result visualization
            const result = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
            cv.cvtColor(gray, result, cv.COLOR_GRAY2RGB);

            // Draw valid contours
            for (let i = 0; i < contours.size(); i++) {
                const contour = contours.get(i);
                const area = cv.contourArea(contour);
                
                if (area < minArea || area > maxArea) continue;

                const rect = cv.boundingRect(contour);
                if (rect.x < borderMargin || rect.y < borderMargin ||
                    rect.x + rect.width > src.cols - borderMargin ||
                    rect.y + rect.height > src.rows - borderMargin) {
                    continue;
                }

                cv.drawContours(result, contours, i, new cv.Scalar(255, 0, 0), 2);
            }

            const processingTime = performance.now() - startTime;
            const canvas = document.createElement('canvas');
            cv.imshow(canvas, result);

            // Cleanup
            src.delete();
            gray.delete();
            binary.delete();
            cleaned.delete();
            contours.delete();
            hierarchy.delete();
            result.delete();
            kernel.delete();

            return {
                count: validCount,
                time: processingTime,
                canvas: canvas,
                method: 'Simple Thresholding'
            };

        } catch (error) {
            console.error('Error in Method 2:', error);
            throw error;
        }
    }

    // Method 3: Blob Detection (Simplified)
    async method3_blobDetection(imageElement) {
        console.log('Starting Method 3: Blob Detection');
        const startTime = performance.now();

        try {
            const src = cv.imread(imageElement);
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            // Apply Gaussian blur
            const blurred = new cv.Mat();
            cv.GaussianBlur(gray, blurred, new cv.Size(9, 9), 2.0);

            // Use HoughCircles for blob-like detection
            const circles = new cv.Mat();
            cv.HoughCircles(blurred, circles, cv.HOUGH_GRADIENT, 1, 20, 50, 30, 5, 50);

            let validCount = 0;
            const borderMargin = 10;
            const result = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
            cv.cvtColor(gray, result, cv.COLOR_GRAY2RGB);

            // Process detected circles
            for (let i = 0; i < circles.cols; i++) {
                const x = circles.data32F[i * 3];
                const y = circles.data32F[i * 3 + 1];
                const radius = circles.data32F[i * 3 + 2];

                // Check border proximity
                if (x - radius < borderMargin || y - radius < borderMargin ||
                    x + radius > src.cols - borderMargin || y + radius > src.rows - borderMargin) {
                    continue;
                }

                // Check size
                const area = Math.PI * radius * radius;
                if (area < 30 || area > 2000) continue;

                validCount++;

                // Draw circle
                cv.circle(result, new cv.Point(x, y), radius, new cv.Scalar(0, 0, 255), 2);
            }

            const processingTime = performance.now() - startTime;
            const canvas = document.createElement('canvas');
            cv.imshow(canvas, result);

            // Cleanup
            src.delete();
            gray.delete();
            blurred.delete();
            circles.delete();
            result.delete();

            return {
                count: validCount,
                time: processingTime,
                canvas: canvas,
                method: 'Blob Detection'
            };

        } catch (error) {
            console.error('Error in Method 3:', error);
            throw error;
        }
    }

    // Method 4: Adaptive Thresholding
    async method4_adaptiveThreshold(imageElement) {
        console.log('Starting Method 4: Adaptive Thresholding');
        const startTime = performance.now();

        try {
            const src = cv.imread(imageElement);
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            // Adaptive thresholding
            const binary = new cv.Mat();
            cv.adaptiveThreshold(gray, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

            // Morphological operations
            const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
            const cleaned = new cv.Mat();
            cv.morphologyEx(binary, cleaned, cv.MORPH_OPEN, kernel);

            // Find contours
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(cleaned, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            // Count valid contours
            let validCount = 0;
            const minArea = 30;
            const maxArea = 2000;
            const borderMargin = 10;

            const result = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
            cv.cvtColor(gray, result, cv.COLOR_GRAY2RGB);

            for (let i = 0; i < contours.size(); i++) {
                const contour = contours.get(i);
                const area = cv.contourArea(contour);
                
                if (area < minArea || area > maxArea) continue;

                const rect = cv.boundingRect(contour);
                if (rect.x < borderMargin || rect.y < borderMargin ||
                    rect.x + rect.width > src.cols - borderMargin ||
                    rect.y + rect.height > src.rows - borderMargin) {
                    continue;
                }

                validCount++;
                cv.drawContours(result, contours, i, new cv.Scalar(255, 255, 0), 2);
            }

            const processingTime = performance.now() - startTime;
            const canvas = document.createElement('canvas');
            cv.imshow(canvas, result);

            // Cleanup
            src.delete();
            gray.delete();
            binary.delete();
            cleaned.delete();
            contours.delete();
            hierarchy.delete();
            result.delete();
            kernel.delete();

            return {
                count: validCount,
                time: processingTime,
                canvas: canvas,
                method: 'Adaptive Thresholding'
            };

        } catch (error) {
            console.error('Error in Method 4:', error);
            throw error;
        }
    }
}

// Global variable for methods
let imageMethods = null;

// Initialize when OpenCV is ready
function onOpenCvReady() {
    imageMethods = new ImageProcessingMethods();
    imageMethods.setOpenCVReady();
    
    // Notify the main app
    if (window.nucleiApp) {
        window.nucleiApp.setOpenCVReady();
    }
}