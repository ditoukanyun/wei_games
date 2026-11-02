import { ResolutionPolicy, sys, view } from 'cc';

/** Keep the whole portrait board visible in browser previews and H5 builds. */
export function adaptMobileWeb() {
    if (!sys.isBrowser) return;
    view.resizeWithBrowserSize(true);
    view.setDesignResolutionSize(720, 1280, ResolutionPolicy.SHOW_ALL);
}
