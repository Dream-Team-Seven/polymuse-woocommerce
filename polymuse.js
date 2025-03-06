jQuery(document).ready(function ($) {
    function adjustModelViewerHeight() {
        $('.polymuse-model-viewer').height(500);
    }

    adjustModelViewerHeight();
    $(window).resize(adjustModelViewerHeight);

    setupModelViewerVariants();
    addVariantButtonOnClick();
    blockPhotoSwipeSwiping();

    $("<style>.pswp__container, .pswp__zoom-wrap { -ms-touch-action: none; touch-action: none; }</style>").appendTo("head");

    // Function to disable PhotoSwipe swiping
    function blockPhotoSwipeSwiping() {
        var originalPhotoSwipe = window.PhotoSwipe;
        window.PhotoSwipe = function (ui, items, options) {
            options = options || {};
            options.allowPanToNext = false;
            options.closeOnScroll = false;

            var pswpInstance = new originalPhotoSwipe(ui, items, options);

            pswpInstance.listen('preventDragEvent', function (e, isDown, preventObj) {
                if (e.type.indexOf('touch') > -1 || e.type === 'mousedown') {
                    preventObj.prevent = true;
                    console.log('Drag/Swipe gesture blocked');
                }
            });

            pswpInstance.listen('bindEvents', function () {
                pswpInstance.options.arrowEl = false;
                console.log('PhotoSwipe events bound, arrows disabled');
            });

            pswpInstance.listen('afterChange', function () {
                pswpInstance.scrollTo(pswpInstance.currItem.initialPosition.x, pswpInstance.currItem.initialPosition.y);
                console.log('Forced back to current item position');
            });

            return pswpInstance;
        };
        window.PhotoSwipeUI_Default = originalPhotoSwipe.UI_Default;
    }

    // Rest of your existing functions remain unchanged
    function setupModelViewerVariants() {
        const modelViewer = $('model-viewer')[0];
        if (modelViewer) {
            console.log('Model viewer found:', modelViewer);
            $(modelViewer).on('load', () => {
                console.log('Model viewer loaded (event fired)');
                const model = modelViewer.model;
                console.log('Model:', model);
                const materials = modelViewer.model.materials;
                console.log(materials);

                const variants = modelViewer.availableVariants;
                console.log('Available variants:', variants);

                const variantInfo = {};
                if (variants) {
                    changeVariantInputToLabel();
                    variants.forEach(variant => {
                        modelViewer.variantName = variant;
                        const material = modelViewer.model.materials[0];
                        if (material && material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorFactor) {
                            variantInfo[variant] = material.pbrMetallicRoughness.baseColorFactor;
                        }
                    });
                    modelViewer.variantName = variants[0];
                }

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

    function changeVariantInputToLabel() {
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
        const variantLabel = $('#variantLabel')[0];
        const variantSelect = $('#variant');
        variantLabel.textContent = variant;
        variantSelect.val(variant).trigger('change');
    }

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
});