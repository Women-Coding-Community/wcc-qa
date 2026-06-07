/**
 * API endpoint paths.
 *
 * @example
 * ```ts
 * import { AuthEndpoints } from 'helpers/datafactory/constants/paths.data';
 *
 * const response = await request.get(ApiEndpoints.AUTH_ME);
 * ```
 */

/** CMS endpoints */
export enum CmsEndpoints {
  ABOUT_US = '/api/cms/v1/about',
  CELEBRATE_HER = '/api/cms/v1/celebrateHer',
  CODE_OF_CONDUCT = '/api/cms/v1/code-of-conduct',
  COLLABORATORS = '/api/cms/v1/collaborators',
  EVENTS = '/api/cms/v1/events',
  EVENTS_FILTERS = '/api/cms/v1/events/filters',
  FOOTER = '/api/cms/v1/footer',
  LANDING_PAGE = '/api/cms/v1/landingPage',
  MENTORSHIP_CODE_OF_CONDUCT = '/api/cms/v1/mentorship/code-of-conduct',
  MENTORSHIP_FAQ = '/api/cms/v1/mentorship/faq',
  MENTORSHIP_OVERVIEW = '/api/cms/v1/mentorship/overview',
  MENTORSHIP_MENTORS = '/api/cms/v1/mentorship/mentors',
  PARTNERS = '/api/cms/v1/partners',
  TEAM = '/api/cms/v1/team',
  PLATFORM_PAGE = '/api/platform/v1/page',
}

/** Platform endpoints */
export enum PlatformEndpoints {
  MENTORS = '/api/platform/v1/mentors',
  MEMBERS = '/api/platform/v1/members',
}

/** Auth endpoints */
export enum AuthEndpoints {
  LOGIN = '/api/auth/login',
  ME = '/api/auth/me',
  USERS = '/api/auth/users',
}
