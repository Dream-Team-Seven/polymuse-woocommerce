<?php
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