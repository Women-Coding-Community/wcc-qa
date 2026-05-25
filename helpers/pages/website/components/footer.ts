import { Locator, Page } from '@playwright/test';

export class Footer {
  readonly logo: Locator;
  readonly nonProfitText: Locator;
  readonly copyrightText: Locator;
  readonly followUsTitle: Locator;
  readonly followUsDescription: Locator;
  readonly technicalIssuesText: Locator;
  readonly socialLinks: Record<string, Locator>;

  constructor(readonly page: Page) {
    this.logo = page.getByAltText('Woman Coding Community');
    this.nonProfitText = page.getByText(
      'Women Coding Community is a not-for-profit organisation.',
    );
    this.copyrightText = page.getByText(
      new RegExp(`© \\d{4} Women Coding Community`),
    );
    this.followUsTitle = page.getByText('Follow Us', { exact: true });
    this.followUsDescription = page.getByText(
      'Join us on social media and stay tuned.',
      { exact: true },
    );
    this.technicalIssuesText = page.getByText(
      'Experiencing Technical Issues?',
    );

    const links = page.getByRole('link');
    this.socialLinks = {
      LinkedIn: links.filter({ has: page.getByTestId('LinkedInIcon') }),
      GitHub: links.filter({ has: page.getByTestId('GitHubIcon') }),
      Instagram: links.filter({ has: page.getByTestId('InstagramIcon') }),
      Email: links.filter({ has: page.getByTestId('EmailIcon') }),
      Slack: page.locator('a[href*="join.slack.com"]').last(),
      'Send us a report': page.getByText('Send us a report', { exact: true }),
    };
  }
}
