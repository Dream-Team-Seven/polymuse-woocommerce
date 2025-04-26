jQuery(document).ready(function ($) {

    $('<script>')
        .attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js')
        .appendTo('head');

    adjustModelViewerHeight();
    $(window).resize(adjustModelViewerHeight);
    setupModelViewerVariants();
    addVariantButtonOnClick();
    addQrPopupButtonAction();
    setupDimensionsButton(); // Initialize the dimensions button

    let showDimensions = false;
    let dimensionUnit = 'metric';
    const $modelViewer = $('#product-model'); 

    function adjustModelViewerHeight() {
        $('.polymuse-model-viewer').height(500);
    }

    function setupModelViewerVariants() {
        if ($modelViewer[0]) {
            console.log('Model viewer found:', $modelViewer[0]);

            $modelViewer.on('load', () => {
                console.log('Model viewer loaded (event fired)');
                const model = $modelViewer[0].model;
                console.log('Model:', model);

                const materials = $modelViewer[0].model.materials;
                console.log(materials);

                const variants = $modelViewer[0].availableVariants;
                console.log('Available variants:', variants);

                const variantInfo = {};
                if (variants) {
                    changeVariantInputToLabel();
                    variants.forEach(variant => {
                        $modelViewer[0].variantName = variant;
                        const material = $modelViewer[0].model.materials[0]; // Assuming first material
                        if (material && material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorFactor) {
                            variantInfo[variant] = material.pbrMetallicRoughness.baseColorFactor;
                        }
                    });
                    $modelViewer[0].variantName = variants[0];
                }

                const $variantButtonsContainer = $('#variant-options-container');
                if ($variantButtonsContainer.length) {
                    if (variants && variants.length > 0) {
                        $.each(variants, function (index, variant) {
                            $('<button id="variantButton-' + variant.replace(/\s+/g, '-') + '" class="variant-selector-button alt wp-element-button"></button>') // Use ID for buttons
                                .text(variant)
                                .on('click', function () {
                                    $modelViewer[0].variantName = variant;
                                })
                                .appendTo($variantButtonsContainer);
                        });
                    } else {
                        $variantButtonsContainer.text('No variants available');
                    }
                }
            });

            const $select = $('#variant');
            $select.on('input', function (event) {
                $modelViewer[0].variantName = event.target.value === 'default' ? null : event.target.value;
            });

        } else {
            console.log('Model Viewer element not found.');
        }
    }

    function changeVariantInputToLabel() {
        const $variantSelect = $('#variant');
        $variantSelect.hide();
        $('.theme-select').css('display', 'none');

        const observer = new MutationObserver(function (mutations) {
            $('.reset_variations').css('display', 'none');
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const $variantLabel = $('<label id="variantLabel">Choose an option</label>'); // Use ID for label
        $variantSelect.after($variantLabel);
    }

    function updateVariantLabel(variant) {
        const $variantLabel = $('#variantLabel');
        const $variantSelect = $('#variant');
        $variantLabel.text(variant);
        $variantSelect.val(variant).trigger('change');
    }

    function addVariantButtonOnClick() {
        const $variantButtonsContainer = $('#variant-options-container');
        console.log('$variantButtonsContainer:', $variantButtonsContainer);
        if ($variantButtonsContainer.length) {
            $variantButtonsContainer.on('click', 'button', function () {
                const variant = $(this).text();
                console.log('Variant clicked:', variant);
                updateVariantLabel(variant);
            });
        } else {
            $variantButtonsContainer.text('No variants available');
        }
    }

    function addQrPopupButtonAction() {
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
        const $qrContainer = $('#qr-code-container');
        const $qrButton = $('#qr-button');

        if ($qrContainer.length && $qrButton.length) {
            $qrContainer.empty();
            const embedUrl = $qrButton.data('embed-url');
            new QRCode($qrContainer[0], {
                text: embedUrl,
                width: 280,
                height: 280,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        console.log("gen qr code called")
    }

    function setupDimensionsButton() {
        const $dimensionsButton = $('.dimensions-button'); // Keep class selector for the button
        console.log('$dimensionsButton element:', $dimensionsButton); // Log the button element

        if ($dimensionsButton.length) {
            $dimensionsButton.on('click', function () {
                console.log('Dimensions button clicked!'); // Log button click
                showDimensions = !showDimensions;
                if (showDimensions) {
                    console.log('Showing dimensions...');
                    setupDimensions();
                } else {
                    console.log('Removing dimensions...');
                    removeDimensions();
                }
            });
        } else {
            console.log('Dimensions button element not found!'); // Log if button is not found
        }
    }

    function setupDimensions() {
        console.log('setupDimensions function called.');
        if (!$modelViewer[0].modelIsVisible) {
            console.log('Model is not visible, returning.');
            return;
        }

        removeDimensions();

        const cornerPositions = ['dotOrigin', 'dotX', 'dotY', 'dotZ'];
        $.each(cornerPositions, function (index, position) {
            const $dot = $('<button id="hotspot-' + position + '" class="dot" slot="hotspot-' + position + '" data-position="0 0 0" data-normal="1 0 0"></button>') // Use IDs for dots
                .appendTo($modelViewer);
            console.log('Created dot:', $dot); // Log each created dot
        });

        const dimLabels = ['dimX', 'dimY', 'dimZ'];
        $.each(dimLabels, function (index, dim) {
            const $label = $('<button id="hotspot-' + dim + '" class="dim" slot="hotspot-' + dim + '" data-position="0 0 0" data-normal="1 0 0"></button>') // Use IDs for dimension labels
                .appendTo($modelViewer);
            console.log('Created label:', $label); // Log each created label
        });

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'dimLines'; // Use ID for SVG
        svg.setAttribute('class', 'dimensionLineContainer');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');

        for (let i = 0; i < 3; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'dimensionLine');
            svg.appendChild(line);
        }
        $modelViewer[0].appendChild(svg);
        console.log('Created SVG lines container:', svg); // Log SVG creation

        $modelViewer.on('load', updateDimensions);
        $modelViewer.on('camera-change', renderSVG);
        console.log('Added event listeners for load and camera-change.');

        setTimeout(updateDimensions, 100);
        console.log('Timeout set for initial updateDimensions.');
    }

    function removeDimensions() {
        console.log('removeDimensions function called.');
        const $dots = $('[id^="hotspot-dot"]');
        console.log('Dots to remove:', $dots); // Log the dots being selected for removal
        $dots.remove();

        const $labels = $('[id^="hotspot-dim"]');
        console.log('Labels to remove:', $labels); // Log the labels being selected for removal
        $labels.remove();

        const $svg = $('#dimLines');
        console.log('SVG to remove:', $svg); // Log the SVG being selected for removal
        $svg.remove();

        $modelViewer.off('camera-change', renderSVG);
        $modelViewer.off('load', updateDimensions);
        console.log('Removed event listeners.');
    }

    function updateDimensions() {
        if (!$modelViewer[0].modelIsVisible || !showDimensions) return;
        console.log('updateDimensions called. modelIsVisible:', $modelViewer[0].modelIsVisible, 'showDimensions:', showDimensions);

        try {
            const center = $modelViewer[0].getBoundingBoxCenter();
            const size = $modelViewer[0].getDimensions();
            const x2 = size.x / 2;
            const y2 = size.y / 2;
            const z2 = size.z / 2;

            const origin = {
                x: center.x - x2,
                y: center.y - y2,
                z: center.z - z2
            };

            $modelViewer[0].updateHotspot({ name: 'hotspot-dotOrigin', position: `${origin.x} ${origin.y} ${origin.z}` });
            $modelViewer[0].updateHotspot({ name: 'hotspot-dotX', position: `${origin.x + size.x} ${origin.y} ${origin.z}` });
            $modelViewer[0].updateHotspot({ name: 'hotspot-dotY', position: `${origin.x} ${origin.y + size.y} ${origin.z}` });
            $modelViewer[0].updateHotspot({ name: 'hotspot-dotZ', position: `${origin.x} ${origin.y} ${origin.z + size.z}` });

            $modelViewer[0].updateHotspot({ name: 'hotspot-dimX', position: `${origin.x + size.x / 2} ${origin.y - 0.1} ${origin.z - 0.1}` });
            $modelViewer[0].updateHotspot({ name: 'hotspot-dimY', position: `${origin.x - 0.1} ${origin.y + size.y / 2} ${origin.z - 0.1}` });
            $modelViewer[0].updateHotspot({ name: 'hotspot-dimZ', position: `${origin.x - 0.1} ${origin.y - 0.1} ${origin.z + size.z / 2}` });

            const multiplier = dimensionUnit === 'metric' ? 100 : 39.37;
            const unit = dimensionUnit === 'metric' ? 'cm' : 'in';

            const dimElements = {
                'dimX': size.x,
                'dimY': size.y,
                'dimZ': size.z
            };

            $.each(dimElements, function (name, value) {
                const $element = $(`#hotspot-${name}`);
                if ($element.length) {
                    $element.text(`${(value * multiplier).toFixed(1)} ${unit}`);
                } else {
                    console.log('Dimension label element not found:', `#hotspot-${name}`);
                }
            });

            renderSVG();

        } catch (error) {
            console.error('Error updating dimensions:', error);
        }
    }

    function renderSVG() {
        const lines = $('#dimLines line');
        if (!lines.length) {
            console.error('Dimension lines not found');
            return;
        }

        drawLine(lines[0], 'dotOrigin', 'dotX', 'dimX'); // X-axis
        drawLine(lines[1], 'dotOrigin', 'dotY', 'dimY'); // Y-axis
        drawLine(lines[2], 'dotOrigin', 'dotZ', 'dimZ'); // Z-axis
    }

    function drawLine(svgLine, dot1, dot2, dimensionHotspot) {
        const hotspot1 = $modelViewer[0].queryHotspot(`hotspot-${dot1}`);
        const hotspot2 = $modelViewer[0].queryHotspot(`hotspot-${dot2}`);

        if (hotspot1 && hotspot2 && hotspot1.canvasPosition && hotspot2.canvasPosition) {
            svgLine.setAttribute('x1', hotspot1.canvasPosition.x);
            svgLine.setAttribute('y1', hotspot1.canvasPosition.y);
            svgLine.setAttribute('x2', hotspot2.canvasPosition.x);
            svgLine.setAttribute('y2', hotspot2.canvasPosition.y);

            if (dot2 === 'dotX') {
                svgLine.setAttribute('stroke', '#FF0000'); // Red for X-axis
            } else if (dot2 === 'dotY') {
                svgLine.setAttribute('stroke', '#00FF00'); // Green for Y-axis
            } else if (dot2 === 'dotZ') {
                svgLine.setAttribute('stroke', '#0000FF'); // Blue for Z-axis
            }

            if (dimensionHotspot) {
                const dimHotspot = $modelViewer[0].queryHotspot(`hotspot-${dimensionHotspot}`);
                if (dimHotspot && !dimHotspot.facingCamera) {
                    $(svgLine).addClass('hide');
                } else {
                    $(svgLine).removeClass('hide');
                }
            }
        } else {
            console.log('Could not find hotspot or canvas position for drawing line:', dot1, dot2);
        }
    }
});