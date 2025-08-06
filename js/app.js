// Main application logic
class NucleiCounterApp {
    constructor() {
        this.uploadedImage = null;
        this.results = {};
        this.openCVReady = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File input change
        document.getElementById('imageInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        uploadArea.addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });

        // Process button
        document.getElementById('processBtn').addEventListener('click', () => {
            this.processImage();
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileUpload(files[0]);
        }
    }

    handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImage = e.target.result;
            this.displayUploadedImage();
            document.getElementById('processBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }

    displayUploadedImage() {
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.innerHTML = `
            <img src="${this.uploadedImage}" alt="Uploaded image" style="max-width: 100%; max-height: 200px;">
            <p class="mt-2">Image uploaded successfully! Click "Analyze" to process.</p>
        `;
    }

    // NEW METHOD: Set OpenCV ready status
    setOpenCVReady() {
        this.openCVReady = true;
        console.log('OpenCV integration ready');
    }

    // UPDATED METHOD: Process image with OpenCV
    async processImage() {
        if (!this.openCVReady) {
            alert('OpenCV.js is still loading. Please wait a moment and try again.');
            return;
        }

        console.log('Starting image processing...');
        
        // Show progress card
        document.getElementById('progressCard').style.display = 'block';
        
        // Get selected methods
        const selectedMethods = [];
        if (document.getElementById('method1').checked) selectedMethods.push('method1');
        if (document.getElementById('method2').checked) selectedMethods.push('method2');
        if (document.getElementById('method3').checked) selectedMethods.push('method3');
        if (document.getElementById('method4').checked) selectedMethods.push('method4');

        if (selectedMethods.length === 0) {
            alert('Please select at least one method to run.');
            return;
        }

        // Create image element for processing
        const img = new Image();
        img.onload = async () => {
            try {
                await this.runSelectedMethods(img, selectedMethods);
            } catch (error) {
                console.error('Processing error:', error);
                alert('Error processing image: ' + error.message);
            }
        };
        img.src = this.uploadedImage;
    }

    // NEW METHOD: Run the selected methods
    async runSelectedMethods(imageElement, selectedMethods) {
        const results = {};
        const progressBars = document.getElementById('progressBars');
        
        // Create progress bars for each method
        progressBars.innerHTML = '';
        selectedMethods.forEach(methodId => {
            const methodName = this.getMethodName(methodId);
            progressBars.innerHTML += `
                <div class="mb-2">
                    <label class="form-label">${methodName}</label>
                    <div class="progress">
                        <div id="progress-${methodId}" class="progress-bar" role="progressbar" style="width: 0%"></div>
                    </div>
                </div>
            `;
        });

        // Process each method
        for (const methodId of selectedMethods) {
            try {
                // Update progress
                document.getElementById(`progress-${methodId}`).style.width = '50%';
                document.getElementById(`progress-${methodId}`).classList.add('progress-bar-animated');

                let result;
                switch (methodId) {
                    case 'method1':
                        result = await imageMethods.method1_otsuWatershed(imageElement);
                        break;
                    case 'method2':
                        result = await imageMethods.method2_simpleThreshold(imageElement);
                        break;
                    case 'method3':
                        result = await imageMethods.method3_blobDetection(imageElement);
                        break;
                    case 'method4':
                        result = await imageMethods.method4_adaptiveThreshold(imageElement);
                        break;
                }

                results[methodId] = result;

                // Complete progress
                document.getElementById(`progress-${methodId}`).style.width = '100%';
                document.getElementById(`progress-${methodId}`).classList.remove('progress-bar-animated');
                document.getElementById(`progress-${methodId}`).classList.add('bg-success');

            } catch (error) {
                console.error(`Error in ${methodId}:`, error);
                document.getElementById(`progress-${methodId}`).classList.add('bg-danger');
                results[methodId] = { error: error.message };
            }
        }

        // Display results
        this.displayResults(results);
    }

    // NEW METHOD: Get method display names
    getMethodName(methodId) {
        const names = {
            'method1': 'Otsu + Watershed',
            'method2': 'Simple Thresholding', 
            'method3': 'Blob Detection',
            'method4': 'Adaptive Thresholding'
        };
        return names[methodId] || methodId;
    }

    // UPDATED METHOD: Display results (replaces showPlaceholderResults)
    displayResults(results) {
        const resultsContainer = document.getElementById('resultsContainer');
        
        let html = '<div class="row">';
        
        // Create comparison table
        html += '<div class="col-12 mb-4">';
        html += '<h6>📊 Method Comparison</h6>';
        html += '<table class="table table-striped">';
        html += '<thead><tr><th>Method</th><th>Count</th><th>Time (ms)</th><th>Status</th></tr></thead>';
        html += '<tbody>';
        
        for (const [methodId, result] of Object.entries(results)) {
            const methodName = this.getMethodName(methodId);
            if (result.error) {
                html += `<tr><td>${methodName}</td><td>-</td><td>-</td><td><span class="badge bg-danger">Error</span></td></tr>`;
            } else {
                html += `<tr><td>${methodName}</td><td><strong>${result.count}</strong></td><td>${Math.round(result.time)}</td><td><span class="badge bg-success">Success</span></td></tr>`;
            }
        }
        
        html += '</tbody></table></div>';
        
        html += '<div class="col-12 mb-4">';
        html += '<div class="d-flex gap-2">';
        html += '<button class="btn btn-outline-primary" onclick="window.nucleiApp.downloadResults()">📥 Download Results (JSON)</button>';
        html += '<button class="btn btn-outline-secondary" onclick="window.nucleiApp.shareResults()">🔗 Share Results</button>';
        html += '</div>';
        html += '</div>';
        // Display result images
        for (const [methodId, result] of Object.entries(results)) {
            if (!result.error) {
                html += `
                    <div class="col-12 col-md-6 col-lg-3 mb-3">
                        <div class="method-result">
                            <h6>${result.method}</h6>
                            <div class="text-center mb-2">
                                <span class="badge bg-primary count-badge">${result.count} nuclei</span>
                            </div>
                            <div class="text-center">
                                ${result.canvas.outerHTML}
                            </div>
                            <small class="text-muted">Processing: ${Math.round(result.time)}ms</small>
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        
        resultsContainer.innerHTML = html;
        
        // Style the result images
        resultsContainer.querySelectorAll('canvas').forEach(canvas => {
            canvas.className = 'result-image';
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
        });
    }
    // Add download functionality
    downloadResults(results) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        // Create results summary
        const summary = {
            timestamp: new Date().toLocaleString(),
            image_analyzed: 'user_uploaded_image',
            results: {}
        };
        
        // Compile results
        for (const [methodId, result] of Object.entries(results)) {
            if (!result.error) {
                summary.results[result.method] = {
                    nuclei_count: result.count,
                    processing_time_ms: Math.round(result.time),
                    status: 'success'
                };
            } else {
                summary.results[this.getMethodName(methodId)] = {
                    nuclei_count: 0,
                    processing_time_ms: 0,
                    status: 'error',
                    error: result.error
                };
            }
        }
        
        // Download as JSON
        const blob = new Blob([JSON.stringify(summary, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nuclei_analysis_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.nucleiApp = new NucleiCounterApp();
    console.log('Nuclei Counter App initialized!');
});