import { APIResponse } from '@playwright/test';
import { ensureSuccess as assertSuccess } from '../api.helper';
import { MemberClient } from '../clients/member.client';

export class MemberService {
  constructor(private readonly client: MemberClient) {}

  async delete(id: number, ensureSuccess = false): Promise<APIResponse> {
    const response = await this.client.delete(id);
    if (ensureSuccess) assertSuccess(response);
    return response;
  }
}
