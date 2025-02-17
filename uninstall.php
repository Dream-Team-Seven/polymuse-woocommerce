<?php
/*
Plugin Name: PolyMuse
*/

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove post meta data
$posts = get_posts(array(
    'post_type' => 'product',
    'posts_per_page' => -1,
));

foreach ($posts as $post) {
    delete_post_meta($post->ID, '_3d_model_url');
}

// Remove options
delete_option('polymuse_options');

// Remove custom transients
delete_transient('polymuse_transient');

// Remove custom user meta
delete_metadata('user', 0, 'polymuse_user_meta', '', true);

// Remove custom cron jobs
wp_clear_scheduled_hook('polymuse_cron_job');

// Remove custom files (not necessary in this case, but good practice)
$upload_dir = wp_upload_dir();
$polymuse_files = array(
    '3d-model-thumbnail.png',
    '3d.webp',
    'polymuse.js',
    'polymuse.php',
    'styles.css',
);

foreach ($polymuse_files as $file) {
    $file_path = $upload_dir['basedir'] . '/' . $file;
    if (file_exists($file_path)) {
        wp_delete_file($file_path);
    }
}