import { test as base } from '@playwright/test';
import { AdminHomePage } from '@pages/admin/home.page';
import { WebsiteHomePage } from '@pages/website/home.page';
import { WebsiteMentorshipPage } from '@pages/website/mentorship.page';
import { Header } from '@pages/website/components/header';
import { Footer } from '@pages/website/components/footer';

export type AdminPages = {
  home: AdminHomePage;
};

export type WebsitePages = {
  home: WebsiteHomePage;
  mentorship: WebsiteMentorshipPage;
  header: Header;
  footer: Footer;
};

export const adminPagesTest = base.extend<{ adminPages: AdminPages }>({
  adminPages: async ({ page }, use) => {
    await use({
      home: new AdminHomePage(page),
    });
  },
});

export const websitePagesTest = base.extend<{ websitePages: WebsitePages }>({
  websitePages: async ({ page }, use) => {
    await use({
      home: new WebsiteHomePage(page),
      mentorship: new WebsiteMentorshipPage(page),
      header: new Header(page),
      footer: new Footer(page),
    });
  },
});
