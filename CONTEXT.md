# Matchup

A browser extension that lays a design image over a live page so the two can be compared pixel for pixel.

## Language

**Layer**:
One design image a site holds, with its own placement and look. Layers are saved per site.
_Avoid_: Mockup, image, design

**Selected layer**:
The one layer currently drawn on the page and edited by the panel.
_Avoid_: Active layer, current layer

**Overlay**:
The selected layer as drawn over the page.
_Avoid_: Layer (when meaning what's on screen)

**Lock**:
The overlay ignores the pointer — clicks pass through to the page and it can't be dragged. The panel still edits a locked layer freely.
_Avoid_: Freeze, click-through

**Visible**:
Whether the overlay is drawn on the page at all. The panel still edits a hidden layer freely.
_Avoid_: Shown, enabled

**Panel**:
The extension's control surface — floating on the page, or docked in the browser's side panel.
_Avoid_: Widget, popup
