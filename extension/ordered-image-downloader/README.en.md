# Ordered Image Downloader (Chrome extension)

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

Preview the images on the current page in top-to-bottom order, untick the ones you don't want, drag to reorder, then download them into a folder you name, auto-numbered `00, 01, …`. The UI follows Chrome's language (zh / en / ja).

## Install

From the Chrome Web Store (link pending), or manually:
1. Unzip the release to a permanent location.
2. Open `chrome://extensions`, turn on **Developer mode**.
3. **Load unpacked** → select the `ordered-image-downloader` folder.
4. Pin the icon from the puzzle-piece menu.

Works the same on Edge and other Chromium browsers.

## Use

1. On the page you want, click the toolbar icon. The extension auto-scrolls the page once (to trigger lazy loading) and lists all images, three per row, all selected by default.
2. Type a folder name (required).
3. Click an image to deselect / reselect; drag to reorder. The badge shows the final file number live.
4. **Start download**. The progress view shows each image's state (waiting / downloading / done / failed). Downloads continue in the background if you close the popup; click the icon again to see progress, or **Back to selection** to adjust.
5. Selection state (scan result, ticks, order, folder name) is kept per tab until the page reloads, navigates or closes. **Rescan** discards it.
6. Failed images are marked red with the reason; **Retry failed images** retries them, numbers unchanged.

## Numbering

Starts at `00`; the width is the number of digits needed for the selected count, minimum two: ≤100 images → `00`–`99`; 101–1000 → `000`–`999`; 1001–10000 → `0000`–`9999`. Original formats are kept (jpg / png / webp / gif …); URLs without an extension get one from the file's actual content.

## Where files go (two modes, switchable in Settings)

**Browser download (default)**
- Uses Chrome's download API; the folder is created inside Chrome's default download directory. To land on the Desktop, change Chrome's default download location to the Desktop.
- Don't enable Chrome's "Ask where to save each file before downloading".
- If a download-manager extension such as IDM is also enabled, its card will show a harmless "could not name the file" notice, and this extension must be installed *after* IDM to win the filename (see Limitations).

**Direct write (optional)**
- Switch "Save method" to direct write and pick a location once. **Chrome does not allow picking Desktop, Documents or Downloads themselves** ("contains system files"); create a folder on the Desktop (e.g. `Images`) and pick that.
- Each download then creates a named folder inside it and writes the images directly, bypassing the browser's download list — no interference with IDM, no naming notice.
- After restarting the browser, the first download asks you to click "Grant access" once.

## Settings (gear icon in the popup)

- Skip small images (default on, under 100×100), thresholds adjustable
- Remove duplicates (default on)
- Auto-scroll before scanning (default on)
- Include CSS background images (default off)
- Parallel downloads (default 3)
- Save method and direct-write location

## Limitations

- Browser-internal pages (`chrome://`, the Web Store) can't be scanned.
- Images inside cross-origin iframes are not collected.
- Browser-download mode with IDM: Chrome lets the *most recently installed* extension decide filenames, so this extension must be installed after IDM. If a later IDM reinstall breaks the naming, remove and re-load this extension once.
- A few sites with strict hotlink protection may reject all three fetch strategies; those images are marked failed and can be saved manually.
