import { APIRequestContext, APIResponse } from '@playwright/test';
import { PlatformEndpoints } from 'helpers/datafactory/constants/paths.data';
import { MentorPayload } from 'helpers/datafactory/mentor.factory';


export class MentorClient {
  constructor(private readonly request: APIRequestContext) {}

  register(payload: MentorPayload): Promise<APIResponse> {
    return this.request.post(PlatformEndpoints.MENTORS, { data: payload });
  }

  list(): Promise<APIResponse> {
    return this.request.get(PlatformEndpoints.MENTORS);
  }

  accept(id: number): Promise<APIResponse> {
    return this.request.patch(`${PlatformEndpoints.MENTORS}/${id}/accept`);
  }
}
