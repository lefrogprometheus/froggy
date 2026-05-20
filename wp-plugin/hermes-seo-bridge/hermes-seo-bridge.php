<?php
/**
 * Plugin Name: Hermes SEO Bridge
 * Plugin URI: https://seo-suite.com
 * Description: Secure bridge for the SEO Suite SaaS. Enables remote SEO analysis and automated repairs.
 * Version: 1.0.0
 * Author: David Taylor
 * License: GPL2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Hermes_SEO_Bridge {

    private $option_name = 'hermes_seo_api_key';

    public function __construct() {
        add_action( 'init', array( $this, 'init' ) );
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        register_activation_hook( __FILE__, array( $this, 'activate' ) );
    }

    public function init() {
        // Initialization logic if needed
    }

    /**
     * Generate a secure API Key on activation
     */
    public function activate() {
        if ( ! get_option( $this->option_name ) ) {
            $key = bin2hex( random_bytes( 32 ) );
            update_option( $this->option_name, $key );
        }
    }

    /**
     * Register Custom REST API Routes
     */
    public function register_routes() {
        register_rest_route( 'hermes-seo/v1', '/status', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_status' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );

        register_rest_route( 'hermes-seo/v1', '/update-meta', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'update_post_meta' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    /**
     * Check if the request has the valid Hermes API Key
     */
    public function check_permission( $request ) {
        $key = $request->get_header( 'X-Hermes-Key' );
        $saved_key = get_option( $this->option_name );
        return $key === $saved_key;
    }

    /**
     * Endpoint: GET /hermes-seo/v1/status
     */
    public function get_status() {
        return new WP_REST_Response( array(
            'status'  => 'online',
            'version' => '1.0.0',
            'site'    => get_bloginfo( 'name' )
        ), 200 );
    }

    /**
     * Endpoint: POST /hermes-seo/v1/update-meta
     * Payload: { "post_id": 123, "meta_key": "_yoast_wpseo_metadesc", "meta_value": "New Description" }
     */
    public function update_post_meta( $request ) {
        $params = $request->get_json_params();
        $post_id = intval( $params['post_id'] );
        $meta_key = sanitize_text_field( $params['meta_key'] );
        $meta_value = sanitize_text_field( $params['meta_value'] );

        if ( ! $post_id || ! $meta_key ) {
            return new WP_Error( 'invalid_data', 'Missing post_id or meta_key', array( 'status' => 400 ) );
        }

        update_post_meta( $post_id, $meta_key, $meta_value );

        return new WP_REST_Response( array(
            'success' => true,
            'message' => "Updated $meta_key for post $post_id"
        ), 200 );
    }

    /**
     * Add Admin Settings Page to show the API Key
     */
    public function add_admin_menu() {
        add_options_page(
            'Hermes SEO Bridge',
            'Hermes SEO',
            'manage_options',
            'hermes-seo-bridge',
            array( $this, 'render_admin_page' )
        );
    }

    public function render_admin_page() {
        $key = get_option( $this->option_name );
        ?>
        <div class="wrap">
            <h1>Hermes SEO Bridge Settings</h1>
            <p>Use the API Key below to connect this site to your SEO Suite dashboard.</p>
            <table class="form-table">
                <tr>
                    <th scope="row">Your API Key</th>
                    <td>
                        <code style="background: #eee; padding: 10px; display: inline-block; border: 1px solid #ccc; font-size: 1.2em;">
                            <?php echo esc_html( $key ); ?>
                        </code>
                        <p class="description">Keep this key secret! Copy and paste it into your SaaS dashboard.</p>
                    </td>
                </tr>
            </table>
        </div>
        <?php
    }
}

new Hermes_SEO_Bridge();
