jQuery(document).ready(function($) {
    // Ensure the 3D model slide is the same height as other slides
    function adjustModelViewerHeight() {
        var galleryHeight = $('.woocommerce-product-gallery__wrapper').height();
        $('.polymuse-model-viewer').height(galleryHeight);
    }

    // Run on page load and when the window is resized
    adjustModelViewerHeight();
    $(window).resize(adjustModelViewerHeight);

    // Reinitialize FlexSlider to include the new slide
    $('.woocommerce-product-gallery').each(function() {
        $(this).wc_product_gallery();
    });
});