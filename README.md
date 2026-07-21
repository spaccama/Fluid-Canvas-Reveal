# Fluid Reveal Effect

## What It Is
An interactive, high-performance hero section component built for modern web implementations. It blends procedural multi-layered topographic graphics, a continuous high-speed diagonal scanning mask, and dynamic liquid particle trails triggered by cursor movement or touch interaction to seamlessly reveal distinct image layers (base, subject, and outlines).

---

## Tech Stack and Architecture
- Core Library: p5.js (HTML5 Canvas 2D API)
- Scripting Language: Vanilla JavaScript (ES6+, IIFE module structure, object-oriented instance scoping)
- Integration Layer: Custom PHP Shortcode API mapped via child theme functions, featuring automatic dependency management (wp_enqueue_scripts) and container data-attribute binding (data-*)
- Styling and Presentation: Modular CSS layout framework with responsive typography scaling via clamp() and isolated z-index stacking context

---

## How to Use It

1. Ensure the required styles and scripts are integrated into your environment (e.g., via your theme functions file as configured in the implementation snippet).
2. Invoke the component anywhere using the [hero_reveal] shortcode, passing the required layer URLs and optional configuration parameters:

[hero_reveal base="URL_BASE_IMAGE" reveal="URL_REVEAL_IMAGE" outlines="URL_OUTLINES_IMAGE" title="Main Title" subtitle="Descriptive Subtitle"]

### Available Shortcode Attributes
- base: URL for the primary background/base image layer (required).
- reveal: URL for the secondary subject layer revealed via cursor movement (required).
- outlines: URL for the foreground outline overlay layer (required).
- title: Main heading text displayed over the hero container.
- subtitle: Subheading text displayed below the main title.
- blobs: Number of generative elements.
- flow_speed: Speed of the procedural fluid motion.
- blur: Intensity of the metaball fusion effect.

---

## How It Works (Technical Breakdown)

- DOM and Data Binding: The PHP shortcode generates a uniquely identified container wrapping optional header copy, safely injecting asset endpoints and environmental attributes directly into HTML data-* attributes.
- Instance Scoping: An Immediately Invoked Function Expression (IIFE) queries container instances and initializes isolated, object-oriented p5 sketches to safely support multiple modules on a single view.
- Buffer Architecture and Optimization: Computes heavy rendering operations across off-screen 2D graphics buffers (p.createGraphics) configured with willReadFrequently: true to optimize CPU-GPU pixel readbacks for runtime filters and masks.
- Procedural Topography: Generates complex, multi-layered background graphics dynamically utilizing multi-frequency Perlin noise fields (p.noise) inside a dedicated pattern buffer.
- Pointer Tracking and Trail Physics: Event listeners monitor high-frequency cursor/touch movements (pointermove), calculating interpolation steps across set distance intervals (spacing) to populate a timed array of organic trail nodes.
- Advanced Compositing: The main render loop (p.draw) applies multi-pass HTML5 Canvas blend modes (destination-in and destination-out). It masks out background regions, renders the reveal subject layer exclusively inside active fluid trails, and slices through a continuous, overlapping diagonal scanning line mechanism.
