import { websiteTest as test, expect } from '@fixtures';

test.describe('Validate Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('HP-001: Join Slack button navigates to Slack invite in the new page', async ({
    page,
    websitePages,
  }) => {
    const newPagePromise = page.waitForEvent('popup');
    await websitePages.home.joinSlackButton.click();
    const newPage = await newPagePromise;

    expect(newPage.url()).toContain('womencodingcommunity.slack.com');
    await expect(newPage).toHaveTitle(/Slack/i);
  });

  test('HP-002: Opportunities and Programmes section', async ({
    page,
    websitePages,
  }) => {
    const { home } = websitePages;

    await expect(home.mainHeading).toBeVisible();
    await expect(home.mainText).toBeVisible();

    await home.mentorshipLink.click();
    await expect(page).toHaveURL('/mentorship');
    await expect(
      page.getByText('Mentorship Programme', { exact: true }),
    ).toBeVisible();

    await page.goto('/');
    await home.eventsLink.click();
    await expect(page).toHaveURL('/events');
    await expect(
      page.getByText('Welcome to the EventsPage', { exact: true }),
    ).toBeVisible();

    await page.goto('/');
    await home.bookClubLink.click();
    await expect(page).toHaveURL('/programmes/book-club');
    await expect(
      page.getByText('Welcome to the BookClubPage', { exact: true }),
    ).toBeVisible();

    await page.goto('/');
    await home.cvClinicLink.click();
    await expect(page).toHaveURL('/programmes/cv-clinic');
    await expect(
      page.getByText('404 - Not found', { exact: true }),
    ).toBeVisible();

    await page.goto('/');
    await home.mockInterviewsLink.click();
    await expect(page).toHaveURL('/programmes/interviews');
    await expect(
      page.getByText('404 - Not found', { exact: true }),
    ).toBeVisible();

    await page.goto('/');
    await home.leetCodeLink.click();
    await expect(page).toHaveURL('/programmes/leetcode');
    await expect(
      page.getByText('404 - Not found', { exact: true }),
    ).toBeVisible();
  });

  test('HP-003: Verify Events Card information and CTA link', async ({
    page,
    websitePages,
  }) => {
    const { home } = websitePages;

    await test.step('Verify events section is visible', async () => {
      await home.eventsSection.verifySectionVisible();
    });

    await test.step('Verify event card displays all required information', async () => {
      const eventCard = home.eventsSection.getEventCard(0);
      await eventCard.verifyCardStructure();
    });

    await test.step('Verify CTA button opens external link', async () => {
      const eventCard = home.eventsSection.getEventCard(0);
      const newPage = await eventCard.clickCtaAndWaitForNewPage();

      const url = newPage.url();
      const isValidDomain =
        url.includes('github.com') || url.includes('meetup.com');
      expect(isValidDomain).toBeTruthy();

      await newPage.close();
      await page.bringToFront();
    });

    await test.step('Verify "View all events" link navigates to events page', async () => {
      await home.eventsSection.clickViewAllEventsLink();
      await expect(page).toHaveURL('/events');
    });
  });

  test('HP-004: Become Mentor section', async ({ page, websitePages }) => {
    const { home } = websitePages;
    await expect(home.becomeMentorSectionTitle).toBeVisible();
    await expect(home.becomeMentorSectionDescription).toBeVisible();
    await expect(home.joinAsMentorBtn).toBeVisible();
    await home.joinAsMentorBtn.click();

    await expect(page).toHaveURL('/mentorship/mentor-registration');
    await expect(
      page.getByText('Welcome to the MentorRegistrationPage', { exact: true }),
    ).toBeVisible();
  });

  test('HP-004: Volunteer section', async ({ page, websitePages }) => {
    const { home } = websitePages;
    await home.learnMoreVolunteerBtn.click();

    await expect(page).toHaveURL('/about-us/volunteer');
    await expect(
      page.getByText('Welcome to the VolunteerPage', { exact: true }),
    ).toBeVisible();
  });
});
