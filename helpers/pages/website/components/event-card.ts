import { expect, Locator, Page } from '@playwright/test';

export class EventCard {
  readonly card: Locator;

  constructor(readonly page: Page, card: Locator) {
    this.card = card;
  }

  async verifyCardStructure(): Promise<void> {
    await expect(this.card).toBeVisible();

    const eventType = this.card.getByTestId('event-card-type');
    await expect(eventType).toHaveText(/^[A-Z_]+$/);

    const eventDate = this.card.getByTestId('event-card-date');
    await expect(eventDate).toHaveText(
      /[A-Za-z]{3}.{0,20}\d{4}.{0,10}\d{1,2}:\d{2}/,
    );

    const eventTitle = this.card.getByTestId('event-card-title');
    await expect(eventTitle).not.toBeEmpty();

    const eventSpeaker = this.card.getByTestId('event-card-speaker');
    await expect(eventSpeaker).toHaveText(/^Speaker:/);

    const eventDescription = this.card.getByTestId('event-card-description');
    await expect(eventDescription).not.toBeEmpty();

    const eventImage = this.card.getByTestId('event-card-image');
    await expect(eventImage).toBeVisible();

    const eventCTA = this.card.getByTestId('event-card-cta');
    await expect(eventCTA).not.toBeEmpty();
  }

  async clickCtaAndWaitForNewPage(): Promise<Page> {
    const ctaButton = this.card.getByTestId('event-card-cta');
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      ctaButton.click(),
    ]);
    await newPage.waitForLoadState();
    return newPage;
  }
}

export class EventsSection {
  readonly section: Locator;

  constructor(readonly page: Page, section: Locator) {
    this.section = section;
  }

  getEventCard(index: number): EventCard {
    const cards = this.section.getByTestId('event-card');
    return new EventCard(this.page, cards.nth(index));
  }

  getEventCardByTitle(titleText: string): EventCard {
    const card = this.section
      .getByTestId('event-card')
      .filter({
        has: this.page
          .getByTestId('event-card-title')
          .filter({ hasText: titleText }),
      })
      .first();
    return new EventCard(this.page, card);
  }

  async verifySectionVisible(): Promise<void> {
    const sectionTitle = this.section.getByTestId('events-section-title');
    const viewAllLink = this.section.getByTestId('events-view-all-link');

    await expect(this.section).toBeVisible();
    await expect(sectionTitle).toBeVisible();
    await expect(viewAllLink).toBeVisible();
  }

  async clickViewAllEventsLink(): Promise<void> {
    const viewAllLink = this.section.getByTestId('events-view-all-link');
    await viewAllLink.click();
  }
}
