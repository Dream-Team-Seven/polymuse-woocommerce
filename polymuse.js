jQuery(document).ready(function ($) {
    function adjustModelViewerHeight() {
        $('.polymuse-model-viewer').height(500);
    }

    adjustModelViewerHeight();
    $(window).resize(adjustModelViewerHeight);

    setupModelViewerVariants();

    addVariantButtonOnClick();

    addQrPopupButton();

    // If model viewer is found, create variant buttons
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
        // console.log('Update variant:', variant);
        // console.log('Variant label:', variantLabel);
        // console.log('Variant select:', variantSelect);
        // console.log('Variant select value:', variantSelect.val());

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
        // Create QR dialog on page load
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

                document.body.appendChild(qrPopup);
            }
            return qrPopup;
        }

        const qrPopup = createQRDialog();

        // Handle click events
        $('#qr-button').on('click', function () {
            generateQRCode();
            qrPopup.style.display = 'block';
        });

        $(qrPopup).on('click', '.qr-popup-close, .qr-popup-overlay', function () {
            qrPopup.style.display = 'none';
        });
    }

    function generateQRCode() {
        const qrContainer = $('#qr-code-container');
        if (qrContainer) {
            // Clear any existing QR code
            qrContainer.innerHTML = '';
            
            // Get the current URL
            const currentUrl = window.location.href;
            
            // Create new QR code
            const qr = new QRCode(qrContainer, {
                text: currentUrl,
                width: 280,
                height: 280,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }  

});



