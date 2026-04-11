# Design System: The Focused Architect

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Sanctuary"**

For the ADHD mind, the interface must be more than just "clean"—it must be quiet. This design system rejects the frantic density of traditional IDEs in favor of a "Digital Sanctuary." We move beyond standard mobile UI by employing a high-end editorial approach: generous whitespace, rhythmic typography, and a "monastic" structural discipline. 

The system breaks the "template" look by avoiding the standard 16dp padding grid. Instead, we use **Intentional Asymmetry** and **Tonal Depth**. By utilizing wide-set margins and high-contrast typographic scales, we guide the eye toward a single point of focus, ensuring that the act of learning Python feels like a premium, meditative experience rather than a cognitive chore.

## 2. Colors & Surface Philosophy
The palette is rooted in deep slates and muted teals to lower visual cortisol levels.

### The "No-Line" Rule
Traditional 1px borders are cognitively "loud." **This design system prohibits 1px solid borders for sectioning.** 
*   **Boundary Definition:** Separate content blocks solely through background shifts. A `surface-container-low` card sitting on a `surface` background provides all the definition a user needs without the visual "noise" of a line.

### Surface Hierarchy & Nesting
We treat the UI as a series of nested, physical layers.
*   **The Base:** `surface` (#081425) is our infinite floor.
*   **The Content Layer:** `surface-container` (#152031) houses the primary learning modules.
*   **The Detail Layer:** `surface-container-high` (#1f2a3c) is used for interactive code snippets or active inputs.
*   **Nesting Logic:** Always move "up" or "down" one level to show containment. Never skip tiers (e.g., placing `surface-container-highest` directly on `surface`) as the contrast jump is too jarring for a distraction-free environment.

### Signature Textures
To add "soul" to the professional tone, use a subtle linear gradient on primary actions:
*   **Primary CTA Gradient:** From `primary` (#4fdbc8) to `primary-container` (#14b8a6) at a 135-degree angle. This provides a tactile, "pressable" depth that flat colors lack.

## 3. Typography
We utilize a dual-typeface system to balance technical precision with approachable learning.

*   **Display & Headlines (Space Grotesk):** A high-character sans-serif with wide apertures. Use `display-lg` (3.5rem) for milestone achievements and `headline-md` (1.75rem) for lesson titles. The intentional letterforms reduce "visual crowding" often experienced by neurodivergent users.
*   **Body & Titles (Lexend):** Designed specifically to improve reading proficiency. All instructional content uses `body-lg` (1rem) with increased line-height (1.6) to ensure the eye doesn't skip lines during long-form explanations.
*   **Labels:** Use `label-md` in all-caps with 0.05em tracking for non-interactive metadata to distinguish it clearly from actionable text.

## 4. Elevation & Depth
In this system, depth is a functional tool for focus, not just a stylistic choice.

*   **The Layering Principle:** Replace shadows with **Tonal Layering**. Place `surface-container-lowest` containers within a `surface-container-low` section to create a "sunken" feel for secondary information like code comments or documentation.
*   **Ambient Shadows:** For floating elements (Modals/Popovers), use a "Whisper Shadow": `color: #000000`, `opacity: 0.08`, `blur: 40px`, `y-offset: 12px`. The shadow must feel like a soft glow rather than a hard edge.
*   **The "Ghost Border" Fallback:** If a boundary is strictly required for accessibility (e.g., a text input), use `outline-variant` at **15% opacity**. This creates a "Ghost Border" that defines space without drawing the eye away from the content.

## 5. Components

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid the use of divider lines. Separate list items using 12px of vertical white space and a 4% shift in background color between the list item and the parent container.
*   **Touch Targets:** All interactive list items must have a minimum height of 64px to accommodate high-motor-precision needs.

### Buttons
*   **Primary:** Rounded `xl` (1.5rem), using the Signature Gradient. No shadow; instead, use a 2px inner-glow (white at 10% opacity) on the top edge to simulate high-end hardware.
*   **Tertiary:** Text-only, using `primary` color. These must be spaced at least 32px away from other elements to prevent accidental taps.

### Code Editor Interface
*   **Background:** `surface-container-lowest` (#040e1f).
*   **In-Line Assistance:** Instead of tooltips that block code, use "Inline Expansion"—where the code pushes down to reveal an explanation on a `surface-variant` (#2a3548) background.

### Progression Chips
*   **Style:** Low-profile, rounded `full`.
*   **Active State:** `secondary-container` text on `on-secondary-container` background. This provides a soft, "muted" confirmation of progress that doesn't distract from the current task.

## 6. Do's and Don'ts

### Do
*   **DO** use asymmetric margins (e.g., 24px left, 32px right) for headlines to create an editorial, rhythmic flow.
*   **DO** use `surface-bright` for momentary hover or "active" states to provide clear, bright feedback.
*   **DO** utilize the `lg` (1rem) corner radius as the standard for all cards to create a friendly, "softened" architectural feel.

### Don't
*   **DON'T** use Floating Action Buttons (FABs). They block content and cause visual anxiety. All primary actions must live in the natural flow of the page or a fixed bottom bar.
*   **DON'T** use 100% white (#FFFFFF). Only use `on-background` (#d8e3fb) or `primary-fixed` (#71f8e4) for text to prevent screen-glare fatigue.
*   **DON'T** allow elements to overlap. Each component must have its own "breathing room" defined by the spacing scale.