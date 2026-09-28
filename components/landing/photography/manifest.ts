/**
 * PHOTOGRAPHY MANIFEST — reduced to the two editorial photographs the
 * redesigned landing page uses (brief: 2–3 major photos TOTAL).
 *
 * 1. heroWheatSunrise — the hero landscape.
 * 2. leafMacro       — the crop-health intelligence panel.
 *
 * Everything else on the page is typography, diagrams, product UI and
 * controlled motion. Swap a file here (or in public/photography/) to
 * replace imagery globally.
 */

export type PhotoId = "heroWheatSunrise" | "leafMacro";

export interface Photo {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
  width: number;
  height: number;
}

export const PHOTOS: Record<PhotoId, Photo> = {
  heroWheatSunrise: {
    src: "/photography/hero-wheat-sunrise.jpg",
    alt: "Wide wheat field under a warm sunrise sky",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com/photos/photo-1500382017468-9049fed747ef",
    width: 2400,
    height: 1350,
  },
  leafMacro: {
    src: "/photography/leaf-macro.jpg",
    alt: "Macro photograph of a green leaf with visible veins",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com/photos/photo-1518531933037-91b2f5f229cc",
    width: 1600,
    height: 2844,
  },
};

/** Photos preloaded by the preloader gate (hero-critical only). */
export const CRITICAL_PHOTOS: PhotoId[] = ["heroWheatSunrise"];
