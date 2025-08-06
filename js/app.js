// Main application logic
class NucleiCounterApp {
    constructor() {
        this.uploadedImage = null;
        this.results = {};
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

    processImage() {
        console.log('Starting image processing...');
        
        // Show progress card
        document.getElementById('progressCard').style.display = 'block';
        
        // For now, just show a placeholder
        this.showPlaceholderResults();
    }

    showPlaceholderResults() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                <h6>🚧 Processing Implementation</h6>
                <p>Image processing algorithms will be implemented in the next step.</p>
                <p><strong>Uploaded image:</strong> Ready for analysis</p>
            </div>
            <div class="row">
                <div class="col-12">
                    <img src="${this.uploadedImage}" alt="Uploaded image" class="img-fluid">
                </div>
            </div>
        `;
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.nucleiApp = new NucleiCounterApp();
    console.log('Nuclei Counter App initialized!');
});