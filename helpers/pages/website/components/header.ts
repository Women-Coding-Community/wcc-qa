import { Locator, Page } from '@playwright/test';

export class Header {
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly mentorshipDropdown: Locator;
  readonly programmesDropdown: Locator;
  readonly eventsLink: Locator;
  readonly blogLink: Locator;
  readonly jobsLink: Locator;
  readonly aboutUsDropdown: Locator;
  readonly findMentorButton: Locator;

  constructor(readonly page: Page) {
    this.logo = page.getByRole('img', { name: 'Logo' });
    this.homeLink = page.getByRole('button', { name: 'Home' });
    this.mentorshipDropdown = page.getByRole('button', { name: 'Mentorship' });
    this.programmesDropdown = page.getByRole('button', { name: 'Programmes' });
    this.eventsLink = page.getByRole('button', { name: 'Events' });
    this.blogLink = page.getByRole('button', { name: 'Blog' });
    this.jobsLink = page.getByRole('button', { name: 'Jobs' });
    this.aboutUsDropdown = page.getByRole('button', { name: 'About Us' });
    this.findMentorButton = page.getByRole('button', { name: 'Find a mentor' });
  }

  menuitem(itemTitle: string): Locator {
    return this.page.getByRole('menuitem', { name: itemTitle });
  }
}
