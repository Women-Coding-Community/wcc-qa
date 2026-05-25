import { websiteTest as test, expect } from '@fixtures';
import { mentorsApiBodySchema } from '@data/models/mentor';
import { WebsiteMentorsPage } from '@pages/website/mentors.page';

test.describe('Validate Mentorship Page', () => {
  test('MENT-001: Register as Mentor', async ({ page, websitePages }) => {
    await page.goto('/');
    const newPagePromise = page.waitForEvent('popup');
    await websitePages.home.joinAsMentorBtn.click();

    const newPage = await newPagePromise;

    expect(newPage.url()).toContain('/mentorship/mentor-registration');
    await expect(
      newPage.getByRole('heading', {
        name: 'WCC: Registration Form for Mentors',
      }),
    ).toBeVisible();
  });

  test('MENT-002: Find a Mentor', async ({ page, context, websitePages }) => {
    const mentorsResponsePromise = context.waitForEvent(
      'response',
      (r) => r.url().endsWith('/api/mentors') && r.status() === 200,
    );

    await page.goto('/');
    const newPagePromise = page.waitForEvent('popup');
    await websitePages.home.checkOurMentorsLink.click();
    const mentorsTab = await newPagePromise;
    await mentorsTab.waitForLoadState('domcontentloaded');

    const mentorsPage = new WebsiteMentorsPage(mentorsTab);

    const body = mentorsApiBodySchema.parse(
      await (await mentorsResponsePromise).json(),
    );
    const firstMentor =
      body.mentors.find((m) => m.profileStatus === 'ACTIVE') ?? body.mentors[0];

    await test.step('Redirects to the mentors listing page', async () => {
      expect(mentorsTab.url()).toContain('/mentorship/mentors');
    });

    await test.step(`First mentor "${firstMentor.fullName}" is rendered with API data`, async () => {
      await expect(mentorsPage.applyLinkByMentorId(firstMentor.id)).toBeVisible();
      await expect(
        mentorsPage.mentorName(firstMentor.id, firstMentor.fullName),
      ).toBeVisible();
      await expect(mentorsPage.mentorImage(firstMentor.id)).toBeVisible();

      const expectedLanguages = firstMentor.skills.languages
        .map((l) => l.language)
        .join(', ');
      await expect(
        mentorsPage.mentorCard(firstMentor.id).getByText(expectedLanguages),
      ).toBeVisible();

      const expectedPosition = `${firstMentor.position}, ${firstMentor.companyName}`;
      await expect(
        mentorsPage.mentorPosition(firstMentor.id, expectedPosition),
      ).toBeVisible();
    });

    await test.step('Mentor profile tabs (Presentation selected by default + Skills & Support Areas)', async () => {
      await expect(mentorsPage.presentationTab(firstMentor.id)).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(
        mentorsPage.skillsAndSupportTab(firstMentor.id),
      ).toBeVisible();
    });
  });

  test.skip('MENT-003: Browse Mentorship Feedback', async ({
    page,
    websitePages,
  }) => {
    const { mentorship } = websitePages;
    await page.goto('/mentorship');

    await test.step('Verify testimonials section and initial card display', async () => {
      await expect(mentorship.testimonialsTitle).toBeVisible();
      await expect(mentorship.testimonialCards).toHaveCount(3);

      const firstCard = mentorship.getTestimonialCard(0);
      await expect(firstCard.icon).toBeVisible();
      await expect(firstCard.text).toBeVisible();
      await expect(firstCard.text).not.toBeEmpty();
      await expect(firstCard.author).toHaveText(
        /^.+,\s*(Mentee|Mentor)\s+\d{4}$/,
      );

      await expect(mentorship.showMoreButton).toBeVisible();
    });

    await test.step('Show More button reveals additional cards', async () => {
      await expect(mentorship.getTestimonialCard(3).card).not.toBeVisible();
      await mentorship.showMoreButton.click();
      await expect(mentorship.getTestimonialCard(3).card).toBeVisible();
    });

    await test.step('Text expansion works on long cards', async () => {
      const cardWithLongText = mentorship.getCardByAuthor('Jane, Mentor 2024');
      await cardWithLongText.toContainText('...');
      await cardWithLongText.expandText();
      await cardWithLongText.notToContainText('...');
      await cardWithLongText.collapseText();
      await cardWithLongText.toContainText('...');
    });
  });

  test.skip(
    'MENT-005: Visual Test - FAQ Page',
    { tag: '@visual' },
    async ({ page }) => {
      await page.goto('/mentorship/faqs');
      await expect(page).toHaveScreenshot('faq-page.png', { fullPage: true });
    },
  );
});
