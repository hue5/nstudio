# Nikhil Studio, demo website

A five-page Indian photography studio site for Nikhil Studio. Warm darkroom palette, large editorial type, scroll-driven contact sheet, floating service previews, sticky process, and a lightbox that morphs from the frame. The demo photographs are Indian wedding, portrait and documentary images from Wikimedia Commons, downloaded into `images/` and credited in the footer. Replace them with your own work when you are ready.

## Pages

- `index.html`: home. Hero, statement, selected work, contact sheet filmstrip, services, process, packages, closing image, footer.
- `work.html`: full gallery with filters, lightbox, edit notes, and a service strip.
- `studio.html`: about, the room, facts, and how we work.
- `services.html`: four service blocks, packages, FAQ, closing.
- `contact.html`: booking form, studio details, studio note, next steps.

Shared: `styles.css`, `script.js`, `tokens.css`, `base.css`.

## Run it

Open `index.html` in a browser. No build step. Internet is used for Google Fonts and the Wikimedia demo photographs.

## What to update first

### 1. Photographs (the one that matters most)

Every replaceable image sits in a `data-slot` figure. Replace the `<img src>` inside, or use the helper at the bottom of each page:

```html
<script>window.hallmarkSlots({ hero: "images/hero.jpg", "sel-1": "images/wedding.jpg" })</script>
```

Slots:

- `hero`: full bleed, 16:9 or 4:5, under 2 MB. Your best wedding or family frame.
- `intro`: portrait, 4:5. A quiet close-up.
- `sel-1` to `sel-4`: home selected work, 4:3, 4:5, 1:1, 16:10.
- `film-1` to `film-6`: contact sheet frames, 3:2.
- `w1` to `w8`: work page gallery, mixed ratios.
- `sv1` to `sv4`: service page images, 4:5.
- `studio-1` to `studio-3`: studio page images.
- `contact-studio`: contact page print or room frame, 4:3.
- `cta`: home and services closing image, wide.

The footer has a `data-credits` line. Remove it when you use your own photographs.

### 2. Contact and studio facts

- Phone, email, address and city: footer, contact page, menu foot, and `data-fill` spans.
- Replace the demo email `hello@nikhilstudio.example` and phone `+91 98765 43210`.
- Replace `Your city` and `Your address`.

### 3. Prices

In `index.html` and `services.html`, packages are Essentials, Signature and Heirloom. All say Demo price. Replace the numbers and the included lines.

### 4. Booking form

`contact.html` has `data-endpoint=""` behaviour in `script.js`: it validates, shows a loading state, then says nothing was sent. Connect it to WhatsApp, email or a booking tool, then update the note and the status copy.

### 5. Copy

All copy is demo. Replace the studio story, process lines, FAQ answers and image captions with your own. The structure is built to take real words without layout changes.

## Motion and design

- Preloader on the first visit, 950ms, skipped on later pages and under reduced motion.
- Hero: image settles, headline rises line by line, scroll parallax on the image, vertical scroll cue.
- Page transitions use the View Transitions API where supported.
- Scroll reveals use clip-path for images and a short rise for text, one language across pages.
- Contact sheet: horizontal track driven by page scroll on desktop, native horizontal scroll on phones.
- Services: hovering a row shows a floating preview that follows the pointer, fine pointers only.
- Process: sticky image with clip-path frame changes as each step enters.
- Lightbox: morphs from the clicked frame, keyboard previous and next, focus returns to the trigger.
- Buttons: subtle magnetic pull, fill sweep on hover, visible focus ring.
- Mobile: full-screen menu with staggered links, safe-area aware.
- Reduced motion: all motion stops, content stays visible.

## Checks

- `sloplint --render` on all five pages: 0 FAIL.
- Impeccable detector: no blocking findings; the advisory notes are waived in the CSS stamp.
- Verified at 1280x800, 1440x900, 1920x1080 and 375 wide.
- No invented logos, testimonials or metrics. Prices and photos are clearly demo.

## Known demo limits

- The form sends nothing.
- Photographs are Indian Wikimedia Commons stand-ins, credited in the footer.
- The city, phone, email, address and prices are placeholders.
- The lightbox images are the same stand-ins as the grid.
