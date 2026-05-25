import { websiteTest as test, expect } from '@fixtures';
import { mentorshipMenuItems } from '@data/website/navigation';

test.describe('Validate Navigation', () => {
  test('NAV-004: Click and navigate through Mentorship dropdown items', async ({
    page,
    websitePages,
  }) => {
    for (const { name, expectedURL, expectedHeading } of mentorshipMenuItems) {
      await test.step(`Navigate to Mentorship > ${name}`, async () => {
        await page.goto('/mentorship');
        await websitePages.header.mentorshipDropdown.click();
        await websitePages.header.menuitem(name).click();
        await expect(page).toHaveURL(expectedURL);
        await expect(
          page
            .getByRole('heading', { name: expectedHeading, exact: true })
            .first(),
        ).toBeVisible();
      });
    }
  });
});
