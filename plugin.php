<?php
/*
Plugin Name: polymuse-woocommerce
Plugin URI: https://yourwebsite.com/
Description: Allows users to add 3D models to WooCommerce products
Version: 1.0
Author: Corazon Palencia, Gary Simwawa, Patrick MacDonald, Xiangyu Hou, Tim Karachentsev
Author URI: https://polymuse.tech/
*/


if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Check if WooCommerce is active
if (in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {

    // Add theme warning
    function my_polymuse_theme_warning_plugin_init()
    {
        $current_theme = get_template();
        $suboptimal_themes = array(
            'oceanwp',
        );

        if (in_array($current_theme, $suboptimal_themes)) {
            add_action('admin_notices', 'my_polymuse_plugin_styling_warning');
        }
    }

    function my_polymuse_plugin_styling_warning()
    {
        ?>
        <div class="is-dismissible notice notice-warning">
            <p>
                <strong>My Polymuse Plugin:</strong>
                While this plugin is functional with the current theme
                (<?php echo esc_html(get_template()); ?>), its appearance may not be optimal.
                Some styling adjustments might be necessary for the best visual experience.
            </p>
        </div>
        <?php
    }
    add_action('plugins_loaded', 'my_polymuse_theme_warning_plugin_init');

    // // Add custom field to product editor
    // function polymuse_custom_field()
    // {
    //     woocommerce_wp_text_input(
    //         array(
    //             'id' => '_3d_model_url',
    //             'label' => '3D Model URL',
    //             'description' => 'Enter the URL of the 3D model file (e.g., .glb or .gltf)',
    //             'desc_tip' => true,
    //         )
    //     );
    // }
    // add_action('woocommerce_product_options_general_product_data', 'polymuse_custom_field');

    // // Save custom field data
    // function polymuse_save_custom_field($post_id)
    // {
    //     $model_url = $_POST['_3d_model_url'];
    //     if (!empty($model_url)) {
    //         update_post_meta($post_id, '_3d_model_url', esc_url($model_url));
    //     }
    // }
    // add_action('woocommerce_process_product_meta', 'polymuse_save_custom_field');
// Add custom field to product editor
    function polymuse_custom_field()
    {
        global $post;
        $value = get_post_meta($post->ID, '_3d_model_config_json', true);
        woocommerce_wp_textarea_input(
            array(
                'id' => '_3d_model_config_json',
                'label' => '3D Model Config JSON',
                'description' => 'Enter the JSON configuration for the 3D model viewer',
                'desc_tip' => true,
                'value' => $value, // Ensure current value is populated
            )
        );
    }
    add_action('woocommerce_product_options_general_product_data', 'polymuse_custom_field');

    // Save custom field data
    function polymuse_save_custom_field($post_id)
    {
        error_log('POST data received: ' . print_r($_POST, true));

        if (isset($_POST['_3d_model_config_json'])) {
            $model_config_json = $_POST['_3d_model_config_json'];
            error_log('Raw JSON input: ' . $model_config_json);

            if (!empty($model_config_json)) {
                // Trim whitespace and log the exact input
                $model_config_json = trim($model_config_json);
                error_log('Trimmed JSON input: ' . $model_config_json);

                // Attempt to decode and check for errors
                $decoded = json_decode($model_config_json);
                if ($decoded === null) {
                    $json_error = json_last_error_msg();
                    error_log('Invalid JSON provided: ' . $model_config_json);
                    error_log('JSON decode error: ' . $json_error);
                    wp_die('Invalid JSON format in 3D Model Config: ' . $json_error);
                }
                update_post_meta($post_id, '_3d_model_config_json', $model_config_json);
                error_log('JSON saved: ' . $model_config_json);
            } else {
                update_post_meta($post_id, '_3d_model_config_json', '');
                error_log('Empty JSON saved');
            }
        } else {
            error_log('No _3d_model_config_json in POST data');
        }
    }
    add_action('woocommerce_process_product_meta', 'polymuse_save_custom_field');

    // Add 3D model to product gallery
    function polymuse_add_model_and_thumbnail_to_gallery($html, $attachment_id)
    {
        global $product;

        // Debug logging
        error_log('polymuse_add_model_and_thumbnail_to_gallery called');
        error_log('Attachment ID: ' . $attachment_id);
        error_log('HTML received: ' . $html);

        if (!$product) {
            error_log('No product found');
            return $html;
        }

        $model_config_json = get_post_meta($product->get_id(), '_3d_model_config_json', true);


        $config_array = json_decode($model_config_json, true);
        error_log('Model URL: ' . $config_array['model_url']);


        // if (!empty($model_config_json)) {
        //     // Create thumbnail URL for the 3D model
        //     $model_thumbnail_url = plugins_url('3d.webp', __FILE__);
        //     error_log('Model Thumbnail URL: ' . $model_thumbnail_url);

        //     // Check if this is the first image in the gallery
        //     static $first_image = true;

        //     if ($first_image) {
        //         $first_image = false;
        //         // Create the model viewer div
        //         $model_viewer = '<div data-thumb="' . esc_url($model_thumbnail_url) . '" ';
        //         $model_viewer .= 'data-thumb-alt="3D Model" ';
        //         $model_viewer .= 'data-thumb-srcset="' . esc_url($model_thumbnail_url) . ' 100w" ';
        //         $model_viewer .= 'data-thumb-sizes="(max-width: 100px) 100vw, 100px" ';
        //         $model_viewer .= 'class="woocommerce-product-gallery__image polymuse-model-viewer" ">';
        //         $model_viewer .= '<model-viewer 
        //           id="product-model"
        //           class="media-item active"
        //           src="' . esc_url($model_config_json["model_url"]) . '"
        //           ios-src="' . esc_url($model_config_json["ios_model_url"]) . '"
        //           alt="3D model viewer"
        //           shadow-intensity="1"
        //           camera-controls
        //           touch-action="pan-y"
        //           camera-orbit="' . $model_config_json["camera_orbit"] . '"
        //           min-camera-orbit="' . $model_config_json["min_camera_orbit"] . '"
        //           max-camera-orbit="' . $model_config_json["max_camera_orbit"] . '"
        //           ' . ($model_config_json["disable_zoom"] ? 'disable-zoom' : '') . '
        //           ' . ($model_config_json["disable_pan"] ? 'disable-pan' : '') . '
        //           ' . ($model_config_json["ar"] ? 'ar' : '') . '
        //           ' . ($model_config_json["auto_rotate"] ? 'auto-rotate' : '') . '
        //           ' . ($model_config_json["auto_rotate"] ? 'rotation-per-second="' . ($model_config_json["rotate_direction"] == 'left' ? '30deg' : '-30deg') . '"' : '') . '
        //           dimension-system="' . $model_config_json["dimension_unit"] . '"
        //           style="width: 100%; height: 100%; background-color: ' . ($model_config_json["is_transparent"] ? 'transparent' : $model_config_json["background_color"]) . ';"
        //           data-config="' . json_encode($model_config_json) . '"
        //         >';
        //         $model_viewer .= '  <!-- AR button -->';
        //         $model_viewer .= '<button class="ar-button" slot="ar-button" data-umami-event="AR Experiences"><i class="fa-solid fa-cube"></i><span>View in your space</span></button>';
        //         $model_viewer .= '  <!-- Dimension hotspots will be added dynamically -->';
        //         $model_viewer .= '  <!-- Branding -->';
        //         $model_viewer .= '  ' . ($model_config_json["polymuse_branding"] ? '<a class="polymuse-branding" href="https://polymymuse.tech" target="_blank" rel="noopener noreferrer"><i class="fa-layer-group fa-solid"></i> Polymuse.</a>' : '');
        //         $model_viewer .= '  <!-- Controls -->';
        //         $model_viewer .= '  <div class="model-controls">';
        //         $model_viewer .= '    ' . ($model_config_json["show_qr_code_button"] ? '<button class="qr-button control-button" data-umami-event="QR Code button"><i class="fa-solid fa-qrcode"></i><span>View in your space</span></button>' : '');
        //         $model_viewer .= '    ' . ($model_config_json["show_dimensions_button"] ? '<button class="control-button dimensions-button"><i class="fa-solid fa-ruler"></i><span>Show Dimensions</span></button>' : '');
        //         $model_viewer .= '  </div>';
        //         $model_viewer .= '</model-viewer>';
        //         $model_viewer .= '</div>';

        //         // Hide default this will make selecting variants work properly
        //         // with out this when you select a variant product  there will be a place holder image out of place
        //         // The down side is then the main product image will not show up in the carousel or thumb nail
        //         // A benefit is that when you select a variant the main image will not change and show the model viewer
        //         $html = '<style>.woocommerce-product-gallery__image--placeholder:first-child { display: none; }</style>';
        //         error_log('Modified HTML: ' . $html);
        //         return $model_viewer . $html;
        //     }
        // }

        return $html;
    }
    add_filter('woocommerce_single_product_image_thumbnail_html', 'polymuse_add_model_and_thumbnail_to_gallery', 10, 2);

    function add_buttons_container()
    {
        global $product;

        if (is_product()) {

            // Create a container div for variant options
            ?>
            <div id="variant-options-container"></div>
            <?php
        }
    }
    add_action('woocommerce_before_add_to_cart_form', 'add_buttons_container');

    // Add model-viewer script to header
    function polymuse_add_model_viewer_script()
    {
        echo '<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>';
    }
    add_action('wp_head', 'polymuse_add_model_viewer_script');

    // Enqueue styles and scripts
    function polymuse_enqueue_assets()
    {
        wp_enqueue_style('polymuse-styles', plugins_url('styles.css', __FILE__));
        wp_enqueue_script('polymuse-script', plugins_url('polymuse.js', __FILE__), array('jquery'), '1.0', true);
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css');
    }
    add_action('wp_enqueue_scripts', 'polymuse_enqueue_assets');


    // Disable FlexSlider on single product pages
    function polymuse_disable_flexslider()
    {
        if (wp_is_mobile()) {
            return false; // Disable FlexSlider on mobile devices
        }
        return true; // Enable FlexSlider on non-mobile devices
    }
    add_filter('woocommerce_single_product_flexslider_enabled', 'polymuse_disable_flexslider', 10);
}