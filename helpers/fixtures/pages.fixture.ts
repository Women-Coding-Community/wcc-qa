import { test as base } from '@playwright/test';
import { AdminHomePage } from '@pages/admin/home.page';
import { Header } from '@pages/website/components/header';

export type AdminPages = {
  home: AdminHomePage;
};

export type WebsitePages = {
  header: Header;
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
      header: new Header(page),
    });
  },
});
