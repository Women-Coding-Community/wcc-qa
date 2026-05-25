import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { Header } from './components/header';
import { Footer } from './components/footer';

export class WebsiteBasePage extends BasePage {
  readonly header: Header;
  readonly footer: Footer;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.footer = new Footer(page);
  }
}
