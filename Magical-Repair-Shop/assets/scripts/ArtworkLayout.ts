/** Fit raster art uniformly; stretch only explicitly sliced UI surfaces. */
export function fitArtwork(sourceWidth: number, sourceHeight: number, width: number, height: number, cover = false) {
    const scale = cover
        ? Math.max(width / sourceWidth, height / sourceHeight)
        : Math.min(width / sourceWidth, height / sourceHeight);
    return { width: sourceWidth * scale, height: sourceHeight * scale };
}
