jQuery(document).ready(function ($) {
    console.log('Polymuse script initialized');

    $('<script>')
        .attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js')
        .appendTo('head');

    adjustModelViewerHeight();
    $(window).resize(adjustModelViewerHeight);
    setupModelViewerVariants();
    addVariantButtonOnClick();
    addQrPopupButtonAction();
    setupDimensionsButton();

    function adjustModelViewerHeight() {
        console.log('Adjusting model viewer height');
        $('.polymuse-model-viewer').height(500);
    }

    function setupModelViewerVariants() {
        console.log('Setting up model viewer variants');
        const modelViewer = $('model-viewer#product-model')[0];
        if (modelViewer) {
            console.log('Model viewer found:', modelViewer);

            $(modelViewer).on('load', () => {
                console.log('Model viewer loaded');
                const model = modelViewer.model;
                console.log('Model loaded:', model);

                const materials = model.materials;
                console.log('Materials:', materials);

                const variants = modelViewer.availableVariants;
                console.log('Available variants:', variants);

                const variantInfo = {};
                if (variants) {
                    console.log('Processing variants');
                    changeVariantInputToLabel();
                    variants.forEach(variant => {
                        modelViewer.variantName = variant;
                        const material = model.materials[0];
                        if (material?.pbrMetallicRoughness?.baseColorFactor) {
                            variantInfo[variant] = material.pbrMetallicRoughness.baseColorFactor;
                        }
                    });
                    modelViewer.variantName = variants[0];
                }

                const variantButtonsContainer = $('#variant-options-container')[0];
                if (variantButtonsContainer) {
                    console.log('Creating variant buttons');
                    if (variants?.length > 0) {
                        variants.forEach(variant => {
                            const button = $('<button class="variant-selector-button alt wp-element-button"></button>')[0];
                            button.textContent = variant;
                            button.addEventListener('click', () => {
                                console.log('Variant button clicked:', variant);
                                modelViewer.variantName = variant;
                            });
                            variantButtonsContainer.appendChild(button);
                        });
                    } else {
                        variantButtonsContainer.textContent = 'No variants available';
                    }
                }
            });
        } else {
            console.error('Model Viewer element not found');
        }
    }

    function changeVariantInputToLabel() {
        console.log('Changing variant input to label');
        const variantSelect = $('#variant');
        variantSelect.hide();
        $('.theme-select').css('display', 'none');

        const observer = new MutationObserver(function (mutations) {
            $('.reset_variations').css('display', 'none');
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const variantLabel = $('<label id="variantLabel">Choose an option</label>')[0];
        variantSelect.after(variantLabel);
    }

    function updateVariantLabel(variant) {
        console.log('Updating variant label:', variant);
        const variantLabel = $('#variantLabel')[0];
        const variantSelect = $('#variant');
        variantLabel.textContent = variant;
        variantSelect.val(variant).trigger('change');
    }

    function addVariantButtonOnClick() {
        console.log('Adding variant button click handlers');
        const variantButtonsContainer = $('#variant-options-container')[0];
        if (variantButtonsContainer) {
            $(variantButtonsContainer).on('click', 'button', function () {
                const variant = $(this).text();
                console.log('Variant button clicked:', variant);
                updateVariantLabel(variant);
            });
        } else {
            console.error('Variant buttons container not found');
            variantButtonsContainer.textContent = 'No variants available';
        }
    }

    function addQrPopupButtonAction() {
        console.log('Setting up QR popup button');
        function createQRDialog() {
            let qrPopup = document.querySelector('.qr-popup');
            if (!qrPopup) {
                console.log('Creating QR popup dialog');
                qrPopup = document.createElement('div');
                qrPopup.className = 'qr-popup';
                qrPopup.style.display = 'none';
                qrPopup.innerHTML = `
                    <div class="qr-popup-overlay"></div>
                    <div class="qr-popup-content">
                        <div class="qr-popup-header">
                            <h3>Scan QR Code</h3>
                            <button class="qr-popup-close">×</button>
                        </div>
                        <div class="qr-popup-body">
                            <p>Point your camera to scan the QR code to view this product in AR</p>
                            <div id="qr-code-container" class="qr-code-container"></div>
                            <div class="qr-requirements">
                                Minimum requirement: iOS 13, iPadOS 13 or Android with ARCore 1.9+
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(qrPopup);
            }
            return qrPopup;
        }

        const qrPopup = createQRDialog();
        $('#qr-button').on('click', function () {
            console.log('QR button clicked');
            qrPopup.style.display = 'block';
            generateQRCode();
        });

        $(qrPopup).on('click', '.qr-popup-close, .qr-popup-overlay', function () {
            console.log('Closing QR popup');
            qrPopup.style.display = 'none';
        });
    }

    function generateQRCode() {
        console.log('Generating QR code');
        const qrContainer = $('#qr-code-container');
        const qrButton = $('#qr-button');

        if (qrContainer && qrButton) {
            qrContainer.empty();
            const embedUrl = qrButton.data('embed-url');
            console.log('QR code URL:', embedUrl);

            new QRCode(qrContainer[0], {
                text: embedUrl,
                width: 280,
                height: 280,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            console.error('QR container or button not found');
        }
    }

    function setupDimensionsButton() {
        console.log('Setting up dimensions button');
        const modelViewer = $('model-viewer')[0];
        let showDimensions = false;

        // Retrieve dimension unit from model-viewer data attribute
        const dimensionUnit = $(modelViewer).data('dimension-unit') || 'metric';

        console.log("dimension usint: ", dimensionUnit);

        $('#dimensions-button').on('click', function () {
            console.log('Dimensions button clicked');
            showDimensions = !showDimensions;
            if (showDimensions) {
                console.log('Showing dimensions');
                setupDimensions();
            } else {
                console.log('Hiding dimensions');
                removeDimensions();
            }
        });

        function setupDimensions() {
            console.log('Setting up dimensions');
            if (!modelViewer.modelIsVisible) {
                console.warn('Model not visible');
                return;
            }

            removeDimensions();

            const cornerPositions = ['dotOrigin', 'dotX', 'dotY', 'dotZ'];
            cornerPositions.forEach(position => {
                const dot = document.createElement('button');
                dot.slot = `hotspot-${position}`;
                dot.className = 'dot';
                dot.dataset.position = '0 0 0';
                dot.dataset.normal = '1 0 0';
                modelViewer.appendChild(dot);
            });

            const dimLabels = ['dimX', 'dimY', 'dimZ'];
            dimLabels.forEach(dim => {
                const label = document.createElement('button');
                label.slot = `hotspot-${dim}`;
                label.className = 'dim';
                label.dataset.position = '0 0 0';
                label.dataset.normal = '1 0 0';
                modelViewer.appendChild(label);
            });

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.id = 'dimLines';
            svg.setAttribute('class', 'dimensionLineContainer');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');

            for (let i = 0; i < 3; i++) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('class', 'dimensionLine');
                svg.appendChild(line);
            }
            modelViewer.appendChild(svg);

            $(modelViewer).on('load.dimensions', updateDimensions);
              const throttledRenderSVG = throttle(renderSVG, 200); // 100ms throttle
            $(modelViewer).on('camera-change.dimensions', throttledRenderSVG)

            setTimeout(updateDimensions, 100);
        }

        function removeDimensions() {
            console.log('Removing dimensions');
            modelViewer.querySelectorAll('[slot^="hotspot-dot"]').forEach(dot => dot.remove());
            modelViewer.querySelectorAll('[slot^="hotspot-dim"]').forEach(label => label.remove());
            const svg = modelViewer.querySelector('#dimLines');
            if (svg) svg.remove();

            $(modelViewer).off('load.dimensions');
            $(modelViewer).off('camera-change.dimensions');
        }

        function updateDimensions() {
            console.log('Updating dimensions');
            if (!modelViewer.modelIsVisible || !showDimensions) return;

            try {
                const center = modelViewer.getBoundingBoxCenter();
                const size = modelViewer.getDimensions();
                const x2 = size.x / 2;
                const y2 = size.y / 2;
                const z2 = size.z / 2;

                const origin = {
                    x: center.x - x2,
                    y: center.y - y2,
                    z: center.z - z2
                };

                modelViewer.updateHotspot({
                    name: 'hotspot-dotOrigin',
                    position: `${origin.x} ${origin.y} ${origin.z}`
                });

                modelViewer.updateHotspot({
                    name: 'hotspot-dotX',
                    position: `${origin.x + size.x} ${origin.y} ${origin.z}`
                });

                modelViewer.updateHotspot({
                    name: 'hotspot-dotY',
                    position: `${origin.x} ${origin.y + size.y} ${origin.z}`
                });

                modelViewer.updateHotspot({
                    name: 'hotspot-dotZ',
                    position: `${origin.x} ${origin.y} ${origin.z + size.z}`
                });

                modelViewer.updateHotspot({
                    name: 'hotspot-dimX',
                    position: `${origin.x + size.x / 2} ${origin.y - 0.1} ${origin.z - 0.1}`
                });

                modelViewer.updateHotspot({
                    name: 'hotspot-dimY',
                    position: `${origin.x - 0.1} ${origin.y + size.y / 2} ${origin.z - 0.1}`
                });

                modelViewer.updateHotspot({
                    name: 'hotspot-dimZ',
                    position: `${origin.x - 0.1} ${origin.y - 0.1} ${origin.z + size.z / 2}`
                });

                const multiplier = dimensionUnit === 'metric' ? 100 : 39.37;
                const unit = dimensionUnit === 'metric' ? 'cm' : 'in';

                const dimElements = {
                    'dimX': size.x,
                    'dimY': size.y,
                    'dimZ': size.z
                };

                Object.entries(dimElements).forEach(([name, value]) => {
                    const element = modelViewer.querySelector(`[slot="hotspot-${name}"]`);
                    if (element) {
                        element.textContent = `${(value * multiplier).toFixed(1)} ${unit}`;
                    }
                });

                renderSVG();
            } catch (error) {
                console.error('Error updating dimensions:', error);
            }
        }

        function renderSVG() {
            console.log('Rendering SVG lines');
            const lines = modelViewer.querySelectorAll('#dimLines line');
            if (!lines || lines.length < 3) {
                console.error('Dimension lines not found');
                return;
            }

            drawLine(lines[0], 'dotOrigin', 'dotX', 'dimX');
            drawLine(lines[1], 'dotOrigin', 'dotY', 'dimY');
            drawLine(lines[2], 'dotOrigin', 'dotZ', 'dimZ');
        }

        function drawLine(svgLine, dot1, dot2, dimensionHotspot) {
            const hotspot1 = modelViewer.queryHotspot(`hotspot-${dot1}`);
            const hotspot2 = modelViewer.queryHotspot(`hotspot-${dot2}`);

            if (hotspot1?.canvasPosition && hotspot2?.canvasPosition) {
                svgLine.setAttribute('x1', hotspot1.canvasPosition.x);
                svgLine.setAttribute('y1', hotspot1.canvasPosition.y);
                svgLine.setAttribute('x2', hotspot2.canvasPosition.x);
                svgLine.setAttribute('y2', hotspot2.canvasPosition.y);

                svgLine.setAttribute('stroke',
                    dot2 === 'dotX' ? '#FF0000' :
                        dot2 === 'dotY' ? '#00FF00' : '#0000FF'
                );

                if (dimensionHotspot) {
                    const dimHotspot = modelViewer.queryHotspot(`hotspot-${dimensionHotspot}`);
                    if (dimHotspot && !dimHotspot.facingCamera) {
                        svgLine.classList.add('hide');
                    } else {
                        svgLine.classList.remove('hide');
                    }
                }
            }
        }
    }

    function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function () {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

});