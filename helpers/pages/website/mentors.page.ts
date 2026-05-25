import { Locator, Page } from '@playwright/test';
import { WebsiteBasePage } from './base.website.page';

export class WebsiteMentorsPage extends WebsiteBasePage {
  readonly pageTitle: Locator;
  readonly searchByMentorNameInput: Locator;
  readonly filtersToggle: Locator;
  readonly applyForMentorLink: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByRole('heading', {
      name: /meet our (dedicated )?mentors/i,
    });
    this.searchByMentorNameInput = page.getByRole('textbox', {
      name: 'Search by mentor name',
    });
    this.filtersToggle = page.getByText('Filters', { exact: true });
    this.applyForMentorLink = page.getByRole('link', {
      name: 'Apply for this mentor',
    });
  }

  applyLinkByMentorId(mentorId: number): Locator {
    return this.page.locator(
      `a[href*="mentee-registration?id=${mentorId}"]`,
    );
  }

  // The card wrapper has no role or test id, so we scope by structure:
  // it is the innermost div containing both the mentor's apply link and the
  // Presentation/Skills tablist. `.last()` picks the innermost match in DOM order.
  mentorCard(mentorId: number): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.applyLinkByMentorId(mentorId) })
      .filter({ has: this.page.getByRole('tablist') })
      .last();
  }

  mentorName(mentorId: number, fullName: string): Locator {
    return this.mentorCard(mentorId).getByRole('heading', {
      level: 6,
      name: fullName,
    });
  }

  mentorImage(mentorId: number): Locator {
    return this.mentorCard(mentorId).getByRole('img', {
      name: /profile picture/i,
    });
  }

  mentorPosition(mentorId: number, positionAndCompany: string): Locator {
    return this.mentorCard(mentorId).getByRole('heading', {
      level: 6,
      name: positionAndCompany,
    });
  }

  presentationTab(mentorId: number): Locator {
    return this.mentorCard(mentorId).getByRole('tab', { name: 'Presentation' });
  }

  skillsAndSupportTab(mentorId: number): Locator {
    return this.mentorCard(mentorId).getByRole('tab', {
      name: 'Skills & Support Areas',
    });
  }
}
