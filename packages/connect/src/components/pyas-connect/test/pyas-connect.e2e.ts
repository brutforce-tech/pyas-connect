import { newE2EPage } from '@stencil/core/testing';

describe('pyas-connect', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<pyas-connect></pyas-connect>');

    const element = await page.find('pyas-connect');
    expect(element).toHaveClass('hydrated');
  });
});
