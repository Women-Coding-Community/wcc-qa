import { expect } from '@playwright/test';
import { test } from 'helpers/fixtures/common.fixtures';
import { CmsEndpoints } from 'helpers/datafactory/constants/paths.data';
import { mentorResponseSchema, mentorListSchema } from 'helpers/datafactory/schemas/mentor.schema';

test.describe('Mentor — Register and Accept Flow', () => {
  let mentorId: number | undefined;

  test.afterEach(async ({ adminApi }) => {
    if (mentorId === undefined) return;

    const response = await adminApi.member.delete(mentorId);
    expect(response.status()).toBe(204);

    mentorId = undefined;
  });

  test('Mentor can be registered, approved, and verified in platform and CMS lists', async ({
    authApi,
    adminApi,
    authRequest,
  }) => {
    let mentorEmail: string;

    await test.step('MENTOR-A01: Register mentor creates record with PENDING status', async () => {
      const response = await authApi.mentor.register();
      expect(response.status()).toBe(201);

      const mentor = mentorResponseSchema.parse(await response.json());
      expect(mentor.profileStatus).toBe('PENDING');

      mentorId = mentor.id;
      mentorEmail = mentor.email;
    });

    await test.step('MENTOR-A02: Registered mentor appears in platform list', async () => {
      const response = await adminApi.mentor.list(true);

      const mentors = mentorListSchema.parse(await response.json());
      const found = mentors.find((m) => m.email === mentorEmail);
      expect(found).toBeDefined();
      expect(found?.profileStatus).toBe('PENDING');
    });

    await test.step('MENTOR-A03: Approve mentor changes status to ACTIVE', async () => {
      const response = await adminApi.mentor.accept(mentorId!, true);

      const mentor = mentorResponseSchema.parse(await response.json());
      expect(mentor.profileStatus).toBe('ACTIVE');
      expect(mentor.id).toBe(mentorId);
    });

    // FIXME: move to a CMS service once one exists — no CMS client/service yet.
    await test.step.skip('MENTOR-A04: Active mentor appears in public CMS list', async () => {
      const response = await authRequest.get(CmsEndpoints.MENTORSHIP_MENTORS);
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.mentors).toBeDefined();
      expect(Array.isArray(body.mentors)).toBeTruthy();

      const found = body.mentors.find((m: { email: string }) => m.email === mentorEmail);
      expect(found).toBeDefined();
    });

    await test.step('MENTOR-A05: Approve already-active mentor returns 409', async () => {
      const response = await adminApi.mentor.accept(mentorId!);

      expect(response.status()).toBe(409);
    });
  });
});
