# Julie Martin Fine Art

A static website with Home, Gallery, About Julie and Contact pages. Open the local preview or serve this folder with a static web server; opening the HTML directly can prevent the artwork list from loading.

The design uses local assets and system fonts. The public pages no longer use the original fixed-width theme, its jQuery plugins or its stock artist portrait. Legacy template files are kept for reference and are not loaded by the new pages.

## Gallery and prices

Update `gallery/artworks.json` to change the artwork cards on both the homepage and Gallery page. Store new artwork photographs in `gallery/images/`. See [gallery/README.md](gallery/README.md) for an example and full instructions.

The current gallery contains clearly labelled preview photographs while Julie’s actual artwork images are being prepared. The provisional guide prices are £125 for smaller works, £250 for medium works, £450 for larger works and £250 for commissions. No medium, dimensions or availability have been invented.

## Contact

Enquiries use the existing public address, `hello@juliemartinfineart.co.uk`. Gallery enquiry links open the Contact page with the artwork name; the email button includes that name in its subject and message. The site opens the visitor’s email app and does not claim to send messages itself. The old placeholder phone number has been removed.

## Publication

Commit and push the updated HTML, CSS, scripts, artwork list and image files together through the existing hosting workflow. No new build step or server is required. Asset references include version identifiers; when changing a CSS or script file again, update its version in the pages or refresh the browser cache during testing.

Diagnostic logs do not belong in the published site. The old root logs have been archived outside the website folder, and `.gitignore` excludes future logs and local environment files.
