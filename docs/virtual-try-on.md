# Virtual try-on — how to make it real

Status (2026-09-16): `src/app/(tabs)/try-on.tsx` is a camera preview (`expo-camera`) with a face-guide
outline and frame thumbnails. Nothing is placed on the face yet; "Add to cart" works, the shutter does not.

## What a working try-on needs

### 1. Face tracking on the device (the hard part)
`expo-camera` only gives the video feed; it cannot report where the eyes are. A face-landmark detector has
to run on every frame.

| Option | Quality | Cost | Constraint |
|---|---|---|---|
| **`react-native-vision-camera` + `react-native-vision-camera-face-detector` (Google ML Kit)** | Good 2D: face box, eye positions, head roll, ~30 fps | Free | Needs a **dev build** (`npx expo run:android` / EAS) — does not run in Expo Go |
| Commercial AR SDK (Banuba, DeepAR, Snap Camera Kit) | True 3D glasses: depth, occlusion, reflections | Paid licence | Dev build + native SDK |
| MediaPipe FaceLandmarker in a WebView | Decent | Free | Fragile camera permissions inside WebView; not for a shipping app |

`expo-face-detector` was removed in Expo SDK 50 — not available on our SDK 57 app.

### 2. A try-on asset per product / colour
Catalogue photos are not usable; try-on needs a **front-view PNG of the frame with a transparent
background** plus its real width. We already store `specs.frameWidth` (mm).

Scaling: `pixelsPerMm = eyeDistancePx / ~63 mm (average PD)` → draw the PNG at `frameWidth * pixelsPerMm`.

Backend additions:
- `try_on_image_url` column — on `product_variants` (colours differ) with a product-level fallback, or on
  `products` only for the MVP.
- Expose it in `ProductDetail.variants[].tryOnImageUrl` / `ProductCard`.
- Admin: upload field in the product form (UploadThing `productImage` route is already wired in the panel).

### 3. Overlay + capture (mobile)
Per frame: two eye landmarks → midpoint (position), distance (scale), angle (rotation) →
`<Image>` with `transform: [{ translateX }, { translateY }, { scale }, { rotate }]` over the camera.
Smooth values with a small low-pass filter to avoid jitter. Only render when a face is detected;
otherwise show the existing "place your face in the frame" hint.

Shutter: `react-native-view-shot` captures camera + overlay together → save to gallery
(`expo-media-library`) or share (`expo-sharing`).

## Plan

### Phase 1 — 2D overlay (free, ~2–3 days)
1. **Mobile → dev build**: `npx expo prebuild`, `npx expo run:android` (or EAS development build).
   Add `react-native-vision-camera`, `react-native-vision-camera-face-detector`,
   `react-native-worklets-core` (if required by the detector), `react-native-view-shot`.
2. **Backend**: add `tryOnImageUrl` (variant + product fallback), migration, DTOs, admin update schema.
3. **Admin panel**: "Try-on image (transparent PNG)" upload in the product form, per colour row.
4. **Mobile `try-on.tsx`**: replace `CameraView` with vision-camera + face detector frame processor;
   overlay component driven by eye landmarks; frame picker loads `tryOnImageUrl` per selected colour;
   working shutter with save/share.
5. Content: produce transparent front-view PNGs for the frames that should support try-on (the frame
   picker should only list products that have one).

### Phase 2 — 3D (optional, paid)
Swap the 2D overlay for a commercial SDK (Banuba / DeepAR / Snap Camera Kit). Assets, tracking hook and
capture flow from phase 1 carry over; each SDK wants its own 3D model format for the frames.

## Decision needed before starting
Moving from Expo Go to a development build (required by any on-device face detector).

## iOS notes
- `react-native-vision-camera` supports iOS 13+ and Android; `react-native-vision-camera-face-detector`
  uses Google ML Kit on both platforms (iOS via the `GoogleMLKit/FaceDetection` CocoaPod). Same API on both.
- Dev build required on iOS too. No Mac here → use an **EAS development build** (`eas build --profile development
  --platform ios`); an Apple Developer account is needed to install on a physical iPhone.
- The iOS Simulator has no camera — test try-on on a real device only.
- ML Kit adds ~10–20 MB to the iOS binary.
- Worklets: the app already uses `react-native-worklets` 0.10 (Reanimated 4). VisionCamera frame processors
  historically required `react-native-worklets-core`; pick the VisionCamera version compatible with the
  worklets package already installed to avoid a duplicate runtime. Verify at install time.

## Building iOS without a Mac (EAS)
EAS Build compiles on Expo's macOS machines; no local Mac needed. Requirements are on Apple's side:
1. Apple Developer Program membership ($99/yr) — mandatory to sign a build that installs on a real iPhone.
2. A physical iPhone registered to the account (development builds use an ad-hoc profile, ≤100 devices).
3. Expo account + EAS CLI (`app.json` already has `owner` and `extra.eas.projectId`).

```bash
npm i -g eas-cli
eas login
eas device:create                                   # register the iPhone's UDID (QR / link)
eas build --profile development --platform ios      # first run creates certs + provisioning profile
npx expo start --dev-client                         # after installing the .ipa on the phone
```
Rebuild only when native code changes (new native module, plugin config, SDK bump); JS reloads over Metro.
Free plan has a monthly build quota with a slower iOS queue. Simulator builds skip signing but need a Mac
to run and have no camera — irrelevant for try-on. Production: `eas build --profile production --platform ios`
then `eas submit` → TestFlight / App Store, also Mac-free.
