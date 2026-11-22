export type TemplateVariables = Record<string, string>;

const PLACEHOLDER = /\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g;

/**
 * Fills `{{name}}` placeholders in organiser-written text.
 * The HTML version escapes everything (the template and the values), so an
 * organiser or a voter name can't inject markup; line breaks become <br>.
 */
export class TemplateRenderer {
  static escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Unknown placeholders are left as typed so mistakes are visible. */
  static renderText(template: string, variables: TemplateVariables): string {
    return template.replace(PLACEHOLDER, (match, name: string) =>
      Object.hasOwn(variables, name) ? variables[name] : match,
    );
  }

  static renderHtml(template: string, variables: TemplateVariables): string {
    return TemplateRenderer.escapeHtml(
      TemplateRenderer.renderText(template, variables),
    ).replace(/\r?\n/g, '<br>');
  }

  /** Header-safe single line, for subjects. */
  static renderSubject(template: string, variables: TemplateVariables): string {
    return TemplateRenderer.renderText(template, variables)
      .replace(/[\r\n]+/g, ' ')
      .trim()
      .slice(0, 200);
  }
}
