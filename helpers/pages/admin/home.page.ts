import { AdminBasePage } from './base.admin.page';

export class AdminHomePage extends AdminBasePage {
  async goto() {
    await this.page.goto('/');
  }
}
