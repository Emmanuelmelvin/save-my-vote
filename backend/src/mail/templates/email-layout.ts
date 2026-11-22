import { TemplateRenderer } from './template-renderer.js';

export interface LayoutOptions {
  /** Already-escaped HTML for the message body. */
  bodyHtml: string;
  heading?: string;
  accentColor?: string;
  logoUrl?: string | null;
  button?: { label: string; url: string };
  /** Shown in a highlighted box, e.g. a one-time code. */
  highlight?: { label: string; value: string };
  footer?: string;
}

const SAFE_COLOR = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

/** The shared, inline-styled HTML shell around every email. */
export class EmailLayout {
  static render(options: LayoutOptions): string {
    const esc = TemplateRenderer.escapeHtml;
    const accent =
      options.accentColor && SAFE_COLOR.test(options.accentColor)
        ? options.accentColor
        : '#1050ff';
    const logo =
      options.logoUrl && /^https:\/\//.test(options.logoUrl)
        ? `<img src="${esc(options.logoUrl)}" alt="" style="max-height:48px;margin-bottom:16px">`
        : '';
    const heading = options.heading
      ? `<h1 style="font-size:20px;margin:0 0 16px;color:#111">${esc(options.heading)}</h1>`
      : '';
    const highlight = options.highlight
      ? `<div style="margin:24px 0;padding:16px;border-radius:8px;background:#f3f5fb;text-align:center">
           <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#555">${esc(options.highlight.label)}</div>
           <div style="font-size:28px;font-weight:700;letter-spacing:6px;font-family:monospace;color:#111">${esc(options.highlight.value)}</div>
         </div>`
      : '';
    const button = options.button
      ? `<p style="margin:24px 0"><a href="${esc(options.button.url)}" style="display:inline-block;padding:12px 20px;border-radius:6px;background:${accent};color:#fff;text-decoration:none;font-weight:600">${esc(options.button.label)}</a></p>
         <p style="font-size:12px;color:#666">If the button doesn't work, open this link:<br>${esc(options.button.url)}</p>`
      : '';
    const footer = esc(options.footer ?? 'Sent by SaveMyVote');

    return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#222">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;padding:32px;border-top:4px solid ${accent}">
    ${logo}${heading}
    <div style="font-size:15px;line-height:1.6">${options.bodyHtml}</div>
    ${highlight}${button}
  </div>
  <p style="max-width:560px;margin:16px auto 0;font-size:12px;color:#888;text-align:center">${footer}</p>
</body></html>`;
  }
}
