import { TemplateRenderer } from './template-renderer.js';

describe('TemplateRenderer', () => {
  const vars = { voterName: '<script>x</script>', otp: 'K7P2QX' };

  it('fills placeholders, tolerating spaces inside the braces', () => {
    expect(
      TemplateRenderer.renderText('Hi {{voterName}}, code {{ otp }}', vars),
    ).toBe('Hi <script>x</script>, code K7P2QX');
  });

  it('leaves unknown placeholders visible', () => {
    expect(TemplateRenderer.renderText('{{nope}}', vars)).toBe('{{nope}}');
  });

  it('escapes the template and the values in HTML and keeps line breaks', () => {
    expect(
      TemplateRenderer.renderHtml('<b>Hi</b> {{voterName}}\nbye', vars),
    ).toBe('&lt;b&gt;Hi&lt;/b&gt; &lt;script&gt;x&lt;/script&gt;<br>bye');
  });

  it('keeps subjects on one header-safe line', () => {
    expect(
      TemplateRenderer.renderSubject('Vote\r\nBcc: evil@example.com', {}),
    ).toBe('Vote Bcc: evil@example.com');
  });

  it("doesn't resolve inherited object keys", () => {
    expect(TemplateRenderer.renderText('{{constructor}}', {})).toBe(
      '{{constructor}}',
    );
  });
});
