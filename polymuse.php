<?php
/*
Plugin Name: PolyMuse
Plugin URI: https://yourwebsite.com/
Description: Allows users to add 3D models to WooCommerce products
Version: 1.0
Author: Your Name
Author URI: https://yourwebsite.com/
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Check if WooCommerce is active
if (in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {

    // Add custom field to product editor
    function polymuse_custom_field() {
        woocommerce_wp_text_input(
            array(
                'id' => '_3d_model_url',
                'label' => '3D Model URL',
                'description' => 'Enter the URL of the 3D model file (e.g., .glb or .gltf)',
                'desc_tip' => true,
            )
        );
    }
    add_action('woocommerce_product_options_general_product_data', 'polymuse_custom_field');

    // Save custom field data
    function polymuse_save_custom_field($post_id) {
        $model_url = $_POST['_3d_model_url'];
        if (!empty($model_url)) {
            update_post_meta($post_id, '_3d_model_url', esc_url($model_url));
        }
    }
    add_action('woocommerce_process_product_meta', 'polymuse_save_custom_field');

    // Display 3D model on product page
    function polymuse_display() {
        global $product;

        $model_url = get_post_meta($product->get_id(), '_3d_model_url', true);

        if (!empty($model_url)) {
            echo '<div id="polymuse-3d-viewer">';
            echo '<model-viewer src="' . esc_url($model_url) . '" alt="3D model of ' . esc_attr($product->get_name()) . '" auto-rotate camera-controls></model-viewer>';
            echo '</div>';
        }
    }
    add_action('woocommerce_before_single_product_summary', 'polymuse_display');

    // Add 3D model to product gallery
    // Add 3D model to product gallery

    function polymuse_add_model_to_gallery($html, $attachment_id) {
        global $product;
    
        if (!$product) {
            return $html;
        }
    
        $model_url = get_post_meta($product->get_id(), '_3d_model_url', true);
    
        if (!empty($model_url)) {
            // Add the <model-viewer> element as part of the gallery
            $model_viewer = '<div class="woocommerce-product-gallery__image polymuse-model-viewer">';
            $model_viewer .= '<model-viewer src="' . esc_url($model_url) . '" alt="3D model of ' . esc_attr($product->get_name()) . '" auto-rotate camera-controls style="width: 100%; height: 100%;"></model-viewer>';
            $model_viewer .= '</div>';
            
            // Add the 3D model viewer before the gallery images
            return $model_viewer . $html;
        }
    
        return $html;
    }


    add_filter('woocommerce_single_product_image_thumbnail_html', 'polymuse_add_model_to_gallery', 10, 4);

    // Enqueue styles and scripts
    function polymuse_enqueue_assets() {
        wp_enqueue_style('polymuse-styles', plugins_url('styles.css', __FILE__));
        wp_enqueue_script('polymuse-script', plugins_url('polymuse.js', __FILE__), array('jquery'), '1.0', true);
    }
    add_action('wp_enqueue_scripts', 'polymuse_enqueue_assets');

    // Add model-viewer script to header
    function polymuse_add_model_viewer_script() {
        echo '<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>';
    }
    add_action('wp_head', 'polymuse_add_model_viewer_script');

}