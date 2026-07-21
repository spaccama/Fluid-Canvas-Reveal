<?php
if (!defined('ABSPATH')) exit;

add_action('wp_enqueue_scripts', function() {
    $theme_uri = get_stylesheet_directory_uri();
    $version   = wp_get_theme()->get('Version');

    wp_enqueue_style('hero-reveal-style', $theme_uri . '/assets/css/hero-reveal.css', array(), $version);

    
    wp_enqueue_script('p5js', 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js', array(), '1.9.0', true);

    wp_enqueue_script('hero-reveal-script', $theme_uri . '/assets/js/hero-reveal.js', array('p5js'), $version, true);
}, 20);

add_shortcode('hero_reveal', function($atts) {
    $atts = shortcode_atts(array(
        'base'            => '',
        'reveal'          => '',
        'outlines'        => '',
        'title'           => '',
        'subtitle'        => '',
        'blobs'           => 15,     
        'flow_speed'      => 0.35,   
        'blur'            => 25,     
        'mouse_influence' => 0.06,   
        'mouse_radius'    => 260,    
        'blob_min'        => 60,     
        'blob_max'        => 140,    
    ), $atts, 'hero_reveal');

    $base     = esc_url($atts['base']);
    $reveal   = esc_url($atts['reveal']);
    $outlines = esc_url($atts['outlines']);

    if (empty($base) || empty($reveal) || empty($outlines)) {
        return '<p style="color:red; font-weight:bold;">[Hero Reveal]: Specifica tutti gli URL (base, reveal, outlines) nello shortcode.</p>';
    }

    $unique_id = 'heroReveal-' . wp_generate_password(6, false, false);

    ob_start();
    ?>
    <div class="hero-reveal" 
         id="<?php echo esc_attr($unique_id); ?>" 
         data-base="<?php echo $base; ?>" 
         data-reveal="<?php echo $reveal; ?>" 
         data-outlines="<?php echo $outlines; ?>" 
         data-blobs="<?php echo absint($atts['blobs']); ?>"
         data-flow-speed="<?php echo floatval($atts['flow_speed']); ?>"
         data-blur="<?php echo absint($atts['blur']); ?>"
         data-mouse-influence="<?php echo floatval($atts['mouse_influence']); ?>"
         data-mouse-radius="<?php echo floatval($atts['mouse_radius']); ?>"
         data-blob-min="<?php echo floatval($atts['blob_min']); ?>"
         data-blob-max="<?php echo floatval($atts['blob_max']); ?>">
        
        <?php if (!empty($atts['title']) || !empty($atts['subtitle'])) : ?>
            <div class="hero-reveal__content">
                <?php if (!empty($atts['title'])) : ?>
                    <h1 class="hero-reveal__title"><?php echo esc_html($atts['title']); ?></h1>
                <?php endif; ?>
                <?php if (!empty($atts['subtitle'])) : ?>
                    <p class="hero-reveal__subtitle"><?php echo esc_html($atts['subtitle']); ?></p>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
});
