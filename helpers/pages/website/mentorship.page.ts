import { expect, Locator, Page } from '@playwright/test';
import { WebsiteBasePage } from './base.website.page';

export class TestimonialCard {
  readonly card: Locator;
  readonly icon: Locator;
  readonly text: Locator;
  readonly author: Locator;

  constructor(readonly page: Page, card: Locator) {
    this.card = card;
    this.icon = card.locator('svg');
    this.text = card.getByTestId('feedback-card-text');
    this.author = card.getByTestId('feedback-card-author');
  }

  async toContainText(text: string): Promise<void> {
    await expect(this.text).toContainText(text);
  }

  async notToContainText(text: string): Promise<void> {
    await expect(this.text).not.toContainText(text);
  }

  async expandText(): Promise<void> {
    await this.card
      .getByRole('button', { name: 'Show more', exact: true })
      .click();
  }

  async collapseText(): Promise<void> {
    await this.card
      .getByRole('button', { name: 'Show less', exact: true })
      .click();
  }
}

export class WebsiteMentorshipPage extends WebsiteBasePage {
  readonly testimonialsTitle: Locator;
  readonly feedbackArea: Locator;
  readonly testimonialCards: Locator;
  readonly showMoreButton: Locator;

  constructor(page: Page) {
    super(page);

    this.testimonialsTitle = page.getByRole('heading', {
      name: 'What do participants think about our Mentorship Programme?',
      exact: true,
    });

    this.feedbackArea = page.getByTestId('feedback-area');
    this.testimonialCards = this.feedbackArea.getByTestId('feedback-card');
    this.showMoreButton = this.feedbackArea.getByTestId('feedback-show-more');
  }

  getTestimonialCard(index: number): TestimonialCard {
    return new TestimonialCard(this.page, this.testimonialCards.nth(index));
  }

  async verifyFeedbackSectionInitialState(): Promise<void> {
    await expect(this.testimonialsTitle).toBeVisible();
    await expect(this.testimonialCards.first()).toBeVisible();
    await expect(this.showMoreButton).toBeVisible();
    await expect(this.showMoreButton).toBeEnabled();
  }

  getCardByAuthor(authorText: string): TestimonialCard {
    const cardLocator = this.testimonialCards
      .filter({
        has: this.page.getByText(authorText, { exact: true }),
      })
      .first();

    return new TestimonialCard(this.page, cardLocator);
  }
}
