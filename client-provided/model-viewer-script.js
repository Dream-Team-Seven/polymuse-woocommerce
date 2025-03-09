class PolymuseModelViewer {
  constructor(modelViewer) {
    this.modelViewer = modelViewer;
    this.config = JSON.parse(modelViewer.dataset.config || '{}');
    this.showDimensions = false;
    this.dimensionUnit = this.config.dimension_unit || 'metric';
    
    this.qrButton = document.querySelector('.qr-button');
    this.dimensionsButton = document.querySelector('.dimensions-button');
    
    // Create QR dialog if it doesn't exist
    this.createQRDialog();
    
    // Load MicroModal if not already loaded
    this.loadMicroModal();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    
    // Add analytics script if website_id is provided
    // if (this.config.website_id) {
    //   const script = document.createElement('script');
    //   script.defer = true;
    //   script.src = "https://umami-wwows8g84w0g40gc0k88cgwg.184.73.178.248.sslip.io/script.js";
    //   script.dataset.websiteId = this.config.website_id;
    //   document.head.appendChild(script);
    // }
  }

  loadMicroModal() {
    if (!window.MicroModal) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/micromodal/dist/micromodal.min.js';
      script.onload = () => {
        if (window.MicroModal) {
          window.MicroModal.init({
            openTrigger: 'data-micromodal-trigger',
            closeTrigger: 'data-micromodal-close',
            disableFocus: true,
            disableScroll: true,
            awaitOpenAnimation: true,
            awaitCloseAnimation: true
          });
        }
      };
      document.head.appendChild(script);
    }
  }

  init() {
    this.setupEventListeners();
  }

  createQRDialog() {
    // Check if dialog already exists
    let qrPopup = document.querySelector('.qr-popup');
    
    if (!qrPopup) {
      // Create a popup that matches the screenshot
      qrPopup = document.createElement('div');
      qrPopup.className = 'qr-popup';
      qrPopup.style.display = 'none';
      
      // Create popup content
      qrPopup.innerHTML = `
        <div class="qr-popup-overlay"></div>
        <div class="qr-popup-content">
          <div class="qr-popup-header">
            <h3>Scan QR Code</h3>
            <button class="qr-popup-close">&times;</button>
          </div>
          <div class="qr-popup-body">
            <p>Point your camera to scan the QR code to view this product in AR - see how it looks in your space!</p>
            <div class="qr-code-container"></div>
            <div class="qr-requirements">
              Minimum requirement: iOS 13, iPadOS 13 or Android with ARCore 1.9 or higher
            </div>
          </div>
        </div>
      `;
      
      // Append popup to the body to ensure it's centered in the window
      document.body.appendChild(qrPopup);
    }
    
    this.qrPopup = qrPopup;
  }

  setupEventListeners() {
    // QR Code button
    if (this.qrButton) {
      this.qrButton.addEventListener('click', () => {
        this.toggleQRPopup(true);
      });
    }

    // Close popup button
    const closeButton = document.querySelector('.qr-popup-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.toggleQRPopup(false);
      });
    }

    // Dimensions button
    if (this.dimensionsButton) {
      this.dimensionsButton.addEventListener('click', () => {
        this.showDimensions = !this.showDimensions;
        if (this.showDimensions) {
          this.setupDimensions();
        } else {
          this.removeDimensions();
        }
      });
    }

    // Model loaded event
    this.modelViewer.addEventListener('load', () => {
      console.log('Model loaded');
      if (this.showDimensions) {
        this.setupDimensions();
      }
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', (event) => {
      if (this.qrPopup && this.qrPopup.style.display !== 'none') {
        const popupContent = this.qrPopup.querySelector('.qr-popup-content');
        if (popupContent && !popupContent.contains(event.target) && !this.qrButton.contains(event.target)) {
          this.toggleQRPopup(false);
        }
      }
    });
    
    // Close popup with escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.qrPopup && this.qrPopup.style.display !== 'none') {
        this.toggleQRPopup(false);
      }
    });
  }

  toggleQRPopup(show) {
    if (!this.qrPopup) return;
    
    if (show) {
      this.qrPopup.style.display = 'flex';
      document.body.classList.add('qr-popup-open'); // Add class to body to prevent scrolling
      this.generateQRCode();
    } else {
      this.qrPopup.style.display = 'none';
      document.body.classList.remove('qr-popup-open'); // Remove class from body
    }
  }

  generateQRCode() {
    if (!this.config.embed_url) {
      console.error('No embed URL provided for QR code');
      return;
    }
    
    // Check if QRCode library is loaded
    if (window.QRCode && this.qrPopup) {
      console.log('Generating QR code for URL:', this.config.embed_url);
      const qrContainer = this.qrPopup.querySelector('.qr-code-container');
      if (qrContainer) {
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Generate new QR code with logo
        new QRCode(qrContainer, {
          text: this.config.embed_url,
          width: 280,
          height: 280,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H // Higher error correction for better scanning
        });
        
        // Add logo overlay
        setTimeout(() => {
          const qrImage = qrContainer.querySelector('img');
          if (qrImage) {
            const logoOverlay = document.createElement('div');
            logoOverlay.className = 'qr-logo-overlay';
            logoOverlay.innerHTML = '<div class="ar-logo">AR<span>polymuse</span></div>';
            qrContainer.appendChild(logoOverlay);
          }
        }, 100);
      }
    } else {
      console.error('QRCode library not loaded');
    }
  }

  setupDimensions() {
    if (!this.modelViewer.modelIsVisible) return;
    
    // Remove any existing dimension elements
    this.removeDimensions();
    
    // Create corner dots - we'll use fewer dots for our simplified approach
    const cornerPositions = [
      'dotOrigin', 'dotX', 'dotY', 'dotZ'
    ];
    
    cornerPositions.forEach(position => {
      const dot = document.createElement('button');
      dot.slot = `hotspot-${position}`;
      dot.className = 'dot';
      dot.dataset.position = '0 0 0';
      dot.dataset.normal = '1 0 0';
      this.modelViewer.appendChild(dot);
    });
    
    // Create dimension labels - one for each axis
    const dimLabels = ['dimX', 'dimY', 'dimZ'];
    dimLabels.forEach(dim => {
      const label = document.createElement('button');
      label.slot = `hotspot-${dim}`;
      label.className = 'dim';
      label.dataset.position = '0 0 0';
      label.dataset.normal = '1 0 0';
      this.modelViewer.appendChild(label);
    });
    
    // Create SVG for lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'dimLines';
    svg.setAttribute('class', 'dimensionLineContainer');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    
    // Create 3 lines - one for each axis
    for (let i = 0; i < 3; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'dimensionLine');
      svg.appendChild(line);
    }
    
    this.modelViewer.appendChild(svg);
    
    // Update dimensions immediately and add listener
    this.modelViewer.addEventListener('load', () => {
      this.updateDimensions();
    });
    
    this.modelViewer.addEventListener('camera-change', () => {
      this.renderSVG();
    });
    
    // Force an initial update
    setTimeout(() => {
      this.updateDimensions();
    }, 100);
  }

  removeDimensions() {
    // Remove corner dots
    const dots = this.modelViewer.querySelectorAll('[slot^="hotspot-dot"]');
    dots.forEach(dot => dot.remove());
    
    // Remove dimension labels
    const labels = this.modelViewer.querySelectorAll('[slot^="hotspot-dim"]');
    labels.forEach(label => label.remove());
    
    // Remove SVG
    const svg = this.modelViewer.querySelector('#dimLines');
    if (svg) svg.remove();
    
    // Remove event listeners
    this.modelViewer.removeEventListener('camera-change', () => {
      this.renderSVG();
    });
    
    this.modelViewer.removeEventListener('load', () => {
      this.updateDimensions();
    });
  }

  updateDimensions() {
    if (!this.modelViewer.modelIsVisible || !this.showDimensions) return;
    
    try {
      const center = this.modelViewer.getBoundingBoxCenter();
      const size = this.modelViewer.getDimensions();
      const x2 = size.x / 2;
      const y2 = size.y / 2;
      const z2 = size.z / 2;
      
      // Set origin at the bottom left corner
      const origin = {
        x: center.x - x2,
        y: center.y - y2,
        z: center.z - z2
      };
      
      // Update dot positions
      this.modelViewer.updateHotspot({
        name: 'hotspot-dotOrigin',
        position: `${origin.x} ${origin.y} ${origin.z}`
      });
      
      this.modelViewer.updateHotspot({
        name: 'hotspot-dotX',
        position: `${origin.x + size.x} ${origin.y} ${origin.z}`
      });
      
      this.modelViewer.updateHotspot({
        name: 'hotspot-dotY',
        position: `${origin.x} ${origin.y + size.y} ${origin.z}`
      });
      
      this.modelViewer.updateHotspot({
        name: 'hotspot-dotZ',
        position: `${origin.x} ${origin.y} ${origin.z + size.z}`
      });
      
      // Update dimension label positions - midway along each axis
      this.modelViewer.updateHotspot({
        name: 'hotspot-dimX',
        position: `${origin.x + size.x/2} ${origin.y - 0.1} ${origin.z - 0.1}`
      });
      
      this.modelViewer.updateHotspot({
        name: 'hotspot-dimY',
        position: `${origin.x - 0.1} ${origin.y + size.y/2} ${origin.z - 0.1}`
      });
      
      this.modelViewer.updateHotspot({
        name: 'hotspot-dimZ',
        position: `${origin.x - 0.1} ${origin.y - 0.1} ${origin.z + size.z/2}`
      });
      
      // Update dimension values
      const multiplier = this.dimensionUnit === 'metric' ? 100 : 39.37;
      const unit = this.dimensionUnit === 'metric' ? 'cm' : 'in';
      
      const dimElements = {
        'dimX': size.x,
        'dimY': size.y,
        'dimZ': size.z
      };
      
      Object.entries(dimElements).forEach(([name, value]) => {
        const element = this.modelViewer.querySelector(`[slot="hotspot-${name}"]`);
        if (element) {
          element.textContent = `${(value * multiplier).toFixed(1)} ${unit}`;
        }
      });
      
      // Render SVG lines
      this.renderSVG();
      
    } catch (error) {
      console.error('Error updating dimensions:', error);
    }
  }

  renderSVG() {
    const lines = document.querySelectorAll('#dimLines line');
    if (!lines || lines.length < 3) {
      console.error('Dimension lines not found');
      return;
    }
    
    // Draw the three axis lines from origin
    this.drawLine(lines[0], 'dotOrigin', 'dotX', 'dimX');  // X-axis
    this.drawLine(lines[1], 'dotOrigin', 'dotY', 'dimY');  // Y-axis
    this.drawLine(lines[2], 'dotOrigin', 'dotZ', 'dimZ');  // Z-axis
  }

  drawLine(svgLine, dot1, dot2, dimensionHotspot) {
    const hotspot1 = this.modelViewer.queryHotspot(`hotspot-${dot1}`);
    const hotspot2 = this.modelViewer.queryHotspot(`hotspot-${dot2}`);
    
    if (hotspot1 && hotspot2 && hotspot1.canvasPosition && hotspot2.canvasPosition) {
      svgLine.setAttribute('x1', hotspot1.canvasPosition.x);
      svgLine.setAttribute('y1', hotspot1.canvasPosition.y);
      svgLine.setAttribute('x2', hotspot2.canvasPosition.x);
      svgLine.setAttribute('y2', hotspot2.canvasPosition.y);
      
      // Add different colors for each axis
      if (dot2 === 'dotX') {
        svgLine.setAttribute('stroke', '#FF0000'); // Red for X-axis
      } else if (dot2 === 'dotY') {
        svgLine.setAttribute('stroke', '#00FF00'); // Green for Y-axis
      } else if (dot2 === 'dotZ') {
        svgLine.setAttribute('stroke', '#0000FF'); // Blue for Z-axis
      }
      
      if (dimensionHotspot) {
        const dimHotspot = this.modelViewer.queryHotspot(`hotspot-${dimensionHotspot}`);
        if (dimHotspot && !dimHotspot.facingCamera) {
          svgLine.classList.add('hide');
        } else {
          svgLine.classList.remove('hide');
        }
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.getElementById('product-model');
  if (modelViewer) {
    new PolymuseModelViewer(modelViewer);
  }
  
  // Initialize the rest of the product configurator
  // const container = document.querySelector('.product-configurator-container');
  // if (container) {
  //   new ProductConfigurator(container);
  // }
}); 