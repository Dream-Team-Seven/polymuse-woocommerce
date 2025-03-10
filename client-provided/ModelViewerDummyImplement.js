 <div class="gallery-viewer">
            {% if modelviewer_config != blank %}
              <div class="model-viewer-container">
                <model-viewer 
                  id="product-model"
                  class="media-item active"
                  src="{{ modelviewer_config.model_url }}"
                  ios-src="{{ modelviewer_config.ios_model_url }}"
                  alt="3D model viewer"
                  shadow-intensity="1"
                  camera-controls
                  touch-action="pan-y"
                  camera-orbit="{% if modelviewer_config.camera_orbit %}{{ modelviewer_config.camera_orbit }}{% else %}0deg 55deg 10m{% endif %}"
                  min-camera-orbit="{% if modelviewer_config.min_camera_orbit %}{{ modelviewer_config.min_camera_orbit }}{% else %}auto 45deg auto{% endif %}"
                  max-camera-orbit="{% if modelviewer_config.max_camera_orbit %}{{ modelviewer_config.max_camera_orbit }}{% else %}auto 75deg auto{% endif %}"
                  {% if modelviewer_config.disable_zoom %}disable-zoom{% endif %}
                  {% if modelviewer_config.disable_pan %}disable-pan{% endif %}
                  {% if modelviewer_config.ar %}ar{% endif %}
                  {% if modelviewer_config.auto_rotate %}
                    auto-rotate
                    rotation-per-second="{% if modelviewer_config.rotate_direction == 'left' %}30deg{% else %}-30deg{% endif %}"
                  {% endif %}
                  dimension-system="{% if modelviewer_config.dimension_unit == 'metric' %}metres{% else %}inches{% endif %}"
                  style="width: 100%; height: 500px; background-color: {% if modelviewer_config.is_transparent %}transparent{% else %}{{ modelviewer_config.background_color | default: '#FFFFFF' }}{% endif %};"
                  data-config="{{ modelviewer_config | json | escape }}"
                >
                  <!-- AR button -->
                  <button class="ar-button" slot="ar-button" data-umami-event="AR Experiences">
                    <i class="fa-solid fa-cube"></i>
                    <span>View in your space</span>
                  </button>

                  <!-- Dimension hotspots will be added dynamically -->
                  
                  <!-- Branding -->
                  {% if modelviewer_config.polymuse_branding %}
                    <a 
                      class="polymuse-branding"
                      href="https://polymuse.tech" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <i class="fa-solid fa-layer-group"></i>
                      Polymuse.
                    </a>
                  {% endif %}

                  <!-- Controls -->
                  <div class="model-controls">
                    {% if modelviewer_config.show_qr_code_button %}
                      <button class="control-button qr-button" data-umami-event="QR Code button">
                        <i class="fa-solid fa-qrcode"></i>
                        <span>View in your space</span>
                      </button>
                    {% endif %}
                    
                    {% if modelviewer_config.show_dimensions_button %}
                      <button class="control-button dimensions-button">
                        <i class="fa-solid fa-ruler"></i>
                        <span>Show Dimensions</span>
                      </button>
                    {% endif %}
                  </div>
                </model-viewer>
              </div>
            {% endif %}