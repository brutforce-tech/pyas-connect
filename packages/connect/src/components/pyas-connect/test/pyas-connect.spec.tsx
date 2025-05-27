import { newSpecPage } from '@stencil/core/testing';
import { PyasConnect } from '../pyas-connect';

describe('pyas-connect', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PyasConnect],
      html: `<pyas-connect></pyas-connect>`,
    });
    expect(page.root).toEqualHtml(`
      <pyas-connect>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </pyas-connect>
    `);
  });
});
