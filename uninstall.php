<?php
/*
Plugin Name: polymuse-woocommerce
*/

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove post meta data
delete_post_meta_by_key('_3d_model_url');