import { h } from '@stencil/core'

/**
 * The providers' own marks, unaltered, as their sign-in branding guidelines
 * require (Google and Microsoft check them in OAuth app review), and the
 * widget's few glyphs. No gradients or ids, so two widgets on one page never
 * share or clash over SVG ids.
 *
 * Zoom: the camera mark on Zoom blue; check it against Zoom's current brand
 * kit before release (plan §59).
 */

export const GoogleMark = () => (
    <svg class="mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
)

export const MicrosoftMark = () => (
    <svg class="mark" viewBox="0 0 21 21" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="9" height="9" fill="#F25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
        <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
)

export const ZoomMark = () => (
    <svg class="mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <rect width="48" height="48" rx="11" fill="#0B5CFF" />
        <path fill="#FFFFFF" d="M10 18a3 3 0 0 1 3-3h13.5a4.5 4.5 0 0 1 4.5 4.5V30a3 3 0 0 1-3 3H14.5A4.5 4.5 0 0 1 10 28.5zM33 21.4l5.3-3.9c.8-.6 1.7 0 1.7.9v11.2c0 .9-.9 1.5-1.7.9L33 26.6z" />
    </svg>
)

export const providerMark = (provider: string) =>
    provider === 'google' ? <GoogleMark /> : provider === 'microsoft' ? <MicrosoftMark /> : provider === 'zoom' ? <ZoomMark /> : null

export const CloseGlyph = () => (
    <svg class="glyph" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </svg>
)

export const CheckGlyph = () => (
    <svg class="glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const AlertGlyph = () => (
    <svg class="glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 7.5v6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" />
        <circle cx="12" cy="17" r="1.35" fill="currentColor" />
    </svg>
)

