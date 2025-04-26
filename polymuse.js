jQuery(document).ready(function ($) {

    $('<script>')
        .attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js')
        .appendTo('head');

    adjustModelViewerHeight();

    $(window).resize(adjustModelViewerHeight);

    setupModelViewerVariants();

    addVariantButtonOnClick();

    addQrPopupButtonAction();

    function adjustModelViewerHeight() {
        $('.polymuse-model-viewer').height(500);
    }

    function setupModelViewerVariants() {
        // Get the model viewer element
        const modelViewer = $('model-viewer')[0];
        if (modelViewer) {
            console.log('Model viewer found:', modelViewer);

            $(modelViewer).on('load', () => {
                console.log('Model viewer loaded (event fired)');
                const model = modelViewer.model;
                console.log('Model:', model);

                const materials = modelViewer.model.materials;
                console.log(materials);

                // Check for available variants
                const variants = modelViewer.availableVariants;
                console.log('Available variants:', variants);

                // Get material info for each variant
                const variantInfo = {};
                if (variants) {
                    changeVariantInputToLabel();
                    variants.forEach(variant => {
                        modelViewer.variantName = variant;
                        const material = modelViewer.model.materials[0]; // Assuming first material
                        if (material && material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorFactor) {
                            variantInfo[variant] = material.pbrMetallicRoughness.baseColorFactor;
                        }
                    });
                    // Reset to first variant
                    modelViewer.variantName = variants[0];
                }

                // Create buttons for each variant
                const variantButtonsContainer = $('#variant-options-container')[0];
                if (variantButtonsContainer) {
                    if (variants && variants.length > 0) {
                        variants.forEach(variant => {
                            const button = $('<button class="variant-selector-button alt wp-element-button"></button>')[0];
                            button.textContent = variant;
                            button.addEventListener('click', () => {
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
            console.log('Model Viewer element not found.');
        }
    }

    // Change variant input to label
    function changeVariantInputToLabel() {
        const variantSelect = $('#variant');
        variantSelect.hide();

        // Hide the theme select span
        $('.theme-select').css('display', 'none');

        // Create observer to hide it whenever it appears
        const observer = new MutationObserver(function (mutations) {
            $('.reset_variations').css('display', 'none');
        });

        // Start observing the document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const variantLabel = $('<label id="variantLabel">Choose an option</label>')[0];

        variantSelect.after(variantLabel);
    }

    // Update variant label and hidden select
    function updateVariantLabel(variant) {
        const variantLabel = $('#variantLabel')[0];
        const variantSelect = $('#variant');
        variantLabel.textContent = variant;
        variantSelect.val(variant).trigger('change');
    }

    // Add on click event to variant buttons
    function addVariantButtonOnClick() {
        const variantButtonsContainer = $('#variant-options-container')[0];
        console.log('variantButtonsContainer:', variantButtonsContainer);
        if (variantButtonsContainer) {
            $(variantButtonsContainer).on('click', 'button', function () {
                const variant = $(this).text();
                console.log('Variant clicked:', variant);
                updateVariantLabel(variant);
            });
        } else {
            variantButtonsContainer.textContent = 'No variants available';
        }
    }

    function addQrPopupButton() {
        function createQRDialog() {
            let qrPopup = document.querySelector('.qr-popup');
            if (!qrPopup) {
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
            qrPopup.style.display = 'block';
            generateQRCode();
        });

        $(qrPopup).on('click', '.qr-popup-close, .qr-popup-overlay', function () {
            qrPopup.style.display = 'none';
        });
    }

    function generateQRCode() {
        const qrContainer = $('#qr-code-container');
        const qrButton = $('#qr-button');

        if (qrContainer && qrButton) {
            // Clear any existing QR code
            qrContainer.empty();

            // Get the embed URL from the qr-button element
            const embedUrl = qrButton.data('embed-url');

            // Create new QR code using QRCode.js
            new QRCode(qrContainer[0], {
                text: embedUrl,
                width: 280,
                height: 280,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H // High error correction
            });
        }
        console.log("gen qr code called")
    }

    // Converted jQuery code for model viewer dimensions and variants
    const $modelViewerVariants = $('model-viewer#chair');
    const $select = $('#variant');
    let showDimensions = false;
    let dimensionUnit = 'metric';

    $modelViewerVariants.on('load', function() {
        const names = $modelViewerVariants[0].availableVariants;
        $.each(names, function(index, name) {
            $('<option>', {
                value: name,
                text: name
            }).appendTo($select);
        });
        // Adds a default option
        $('<option>', {
            value: 'default',
            text: 'Default'
        }).appendTo($select);
    });

    $select.on('input', function(event) {
        $modelViewerVariants[0].variantName = event.target.value === 'default' ? null : event.target.value;
    });

    const $dimensionsButton = $('#dimension-button');
    if ($dimensionsButton.length) {
        $dimensionsButton.on('click', function() {
            showDimensions = !showDimensions;
            if (showDimensions) {
                setupDimensions();
            } else {
                removeDimensions();
            }
        });
    }

    function setupDimensions() {
        if (!$modelViewerVariants[0].modelIsVisible) return;

        // Remove any existing dimension elements
        removeDimensions();

        // Create corner dots
        const cornerPositions = ['dotOrigin', 'dotX', 'dotY', 'dotZ'];
        $.each(cornerPositions, function(index, position) {
            $('<button>', {
                slot: `hotspot-${position}`,
                class: 'dot',
                'data-position': '0 0 0',
                'data-normal': '1 0 0'
            }).appendTo($modelViewerVariants);
        });

        // Create dimension labels
        const dimLabels = ['dimX', 'dimY', 'dimZ'];
        $.each(dimLabels, function(index, dim) {
            $('<button>', {
                slot: `hotspot-${dim}`,
                class: 'dim',
                'data-position': '0 0 0',
                'data-normal': '1 0 0'
            }).appendTo($modelViewerVariants);
        });

        // Create SVG for lines
        const $svg = $('<svg>', {
            id: 'dimLines',
            class: 'dimensionLineContainer',
            width: '100%',
            height: '100%'
        });

        // Create 3 lines
        for (let i = 0; i < 3; i++) {
            $('<line>', {
                class: 'dimensionLine'
            }).appendTo($svg);
        }

        $svg.appendTo($modelViewerVariants);

        // Update dimensions and add listener
        $modelViewerVariants.on('load', function() {
            updateDimensions();
        });

        $modelViewerVariants.on('camera-change', function() {
            renderSVG();
        });

        // Force initial update
        setTimeout(function() {
            updateDimensions();
        }, 100);
    }

    function removeDimensions() {
        // Remove corner dots
        $modelViewerVariants.find('[slot^="hotspot-dot"]').remove();

        // Remove dimension labels
        $modelViewerVariants.find('[slot^="hotspot-dim"]').remove();

        // Remove SVG
        $modelViewerVariants.find('#dimLines').remove();

        // Remove event listeners
        $modelViewerVariants.off('camera-change');
        $modelViewerVariants.off('load');
    }

    function updateDimensions() {
        if (!$modelViewerVariants[0].modelIsVisible || !showDimensions) return;

        try {
            const center = $modelViewerVariants[0].getBoundingBoxCenter();
            const size = $modelViewerVariants[0].getDimensions();
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
            $modelViewerVariants[0].updateHotspot({
                name: 'hotspot-dotOrigin',
                position: `${origin.x} ${origin.y} ${origin.z}`
            });

            $modelViewerVariants[0].updateHotspot({
                name: 'hotspot-dotX',
                position: `${origin.x + size.x} ${origin.y} ${origin.z}`
            });

            $modelViewerVariants[0].updateHotspot({
                name: 'hotspot-dotY',
                position: `${origin.x} ${origin.y + size.y} ${origin.z}`
            });

            $modelViewerVariants[0].updateHotspot({
                name: 'hotspot-dotZ',
                position: `${origin.x} ${origin.y} ${origin.z + size.z}`
            });

            // Update dimension label positions
            $modelViewerVariants[0].updateHotspot({
                name: 'hotspot-dimX',
                position: `${origin.x + size.x / 2} ${origin.y - 0.1} ${origin.z - 0.1}`
            });

            $modelViewerVariants[0].updateHotspot({
                name: 'hotspot-dimY',
                position: `${origin.x - 0.1} ${origin.y + size.y / 2} ${origin.z - 0.1}`
            });

            $modelViewerVariants[0].updateHotspot({
                name: 'hotspot-dimZ',
                position: `${origin.x - 0.1} ${origin.y - 0.1} ${origin.z + size.z / 2}`
            });

            // Update dimension values
            const multiplier = dimensionUnit === 'metric' ? 100 : 39.37;
            const unit = dimensionUnit === 'metric' ? 'cm' : 'in';

            const dimElements = {
                'dimX': size.x,
                'dimY': size.y,
                'dimZ': size.z
            };

            $.each(dimElements, function(name, value) {
                const $element = $modelViewerVariants.find(`[slot="hotspot-${name}"]`);
                if ($element.length) {
                    $element.text(`${(value * multiplier).toFixed(1)} ${unit}`);
                }
            });

            // Render SVG lines
            renderSVG();

        } catch (error) {
            console.error('Error updating dimensions:', error);
        }
    }

    function renderSVG() {
        const $lines = $('#dimLines line');
        if (!$lines.length || $lines.length < 3) {
            console.error('Dimension lines not found');
            return;
        }

        // Draw the three axis lines
        drawLine($lines.eq(0), 'dotOrigin', 'dotX', 'dimX'); // X-axis
        drawLine($lines.eq(1), 'dotOrigin', 'dotY', 'dimY'); // Y-axis
        drawLine($lines.eq(2), 'dotOrigin', 'dotZ', 'dimZ'); // Z-axis
    }

    function drawLine($svgLine, dot1, dot2, dimensionHotspot) {
        const hotspot1 = $modelViewerVariants[0].queryHotspot(`hotspot-${dot1}`);
        const hotspot2 = $modelViewerVariants[0].queryHotspot(`hotspot-${dot2}`);

        if (hotspot1 && hotspot2 && hotspot1.canvasPosition && hotspot2.canvasPosition) {
            $svgLine.attr({
                x1: hotspot1.canvasPosition.x,
                y1: hotspot1.canvasPosition.y,
                x2: hotspot2.canvasPosition.x,
                y2: hotspot2.canvasPosition.y
            });

            // Add different colors for each axis
            if (dot2 === 'dotX') {
                $svgLine.attr('stroke', '#FF0000'); // Red for X-axis
            } else if (dot2 === 'dotY') {
                $svgLine.attr('stroke', '#00FF00'); // Green for Y-axis
            } else if (dot2 === 'dotZ') {
                $svgLine.attr('stroke', '#0000FF'); // Blue for Z-axis
            }

            if (dimensionHotspot) {
                const dimHotspot = $modelViewerVariants[0].queryHotspot(`hotspot-${dimensionHotspot}`);
                if (dimHotspot && !dimHotspot.facingCamera) {
                    $svgLine.addClass('hide');
                } else {
                    $svgLine.removeClass('hide');
                }
            }
        }
    }
});