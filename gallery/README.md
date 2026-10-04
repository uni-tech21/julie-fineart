# Updating Julie’s gallery

The homepage and Gallery page share the list in `gallery/artworks.json`.
The current photographs are temporary examples from the old template, clearly marked as preview images. Replace them with Julie’s actual artwork photographs when ready.

## Add or replace an artwork

1. Save its photograph in `gallery/images/`. Use a simple filename such as `woodland-study.webp`. JPG, PNG, WebP and AVIF work. Around 1200 pixels wide is a useful starting point; the site shows the complete artwork without cropping.
2. Open `gallery/artworks.json` and replace an existing entry, or copy an entry to add another. Put a comma between entries, with no comma after the last one.
3. Fill in the artwork details. Use this example:

```json
{
  "id": "woodland-study",
  "title": "Woodland study",
  "category": "Landscape",
  "price": "£250",
  "image": "images/woodland-study.webp",
  "alt": "Describe the artwork shown in the photograph",
  "description": "Add the confirmed materials, dimensions and any other useful details.",
  "width": 1200,
  "height": 900,
  "preview": false
}
```

`image` is relative to this `gallery/` folder. The existing preview images use `../images/` because they are stored in the old image folder.

Use `preview: false` only for actual artwork photographs. This removes that card’s preview label; the gallery notice disappears when every entry is real. Keep `preview: true` for temporary images. Use `price: "Enquire for price"` when a price is not set. Do not add dimensions, materials or availability until confirmed.

The list order controls both pages. The homepage displays the first three entries. An artwork’s ID becomes its link, for example `portfolio.html#woodland-study`; use a unique ID containing letters, numbers and hyphens.

4. Refresh both pages in the local preview and check the image, viewer and enquiry link.
5. Commit and push the photograph and updated list together to publish the change.

## Current guide prices

- Smaller works: from £125.
- Medium works: from £250.
- Larger works: from £450.
- Commissions: from £250.

These are provisional starting prices, chosen at Uni-Tech’s request. Update them to Julie’s confirmed prices when the catalogue is ready. The pages explain that size, materials, framing and availability are confirmed before ordering. The Contact page also mentions the commission starting price, so update that sentence if the commission rate changes.

## If an entry does not appear

Check the filename, JSON commas and the required `title`, `image` and `preview` fields. Images must be stored on this site. If the list cannot load, the original preview cards remain visible rather than leaving an empty gallery. Visitors without JavaScript can still use the page links, view the original preview photographs and email Julie.
