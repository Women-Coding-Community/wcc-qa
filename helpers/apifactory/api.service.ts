import { APIRequestContext } from "@playwright/test";
import { AuthenticationClient } from "./clients/authentication.client";
import { MentorClient } from "./clients/mentor.client";
import { MemberClient } from "./clients/member.client";
import { CmsClient } from "./clients/cms.client";
import { CycleClient } from "./clients/cycle.client";
import { AuthenticationService } from "./services/authentication.service";
import { MentorService } from "./services/mentor.service";
import { MemberService } from "./services/member.service";
import { CmsService } from "./services/cms.service";
import { CycleService } from "./services/cycle.service";

export class APIService {
	public readonly authentication: AuthenticationService;
	public readonly mentor: MentorService;
	public readonly member: MemberService;
	public readonly cms: CmsService;
	public readonly cycle: CycleService;

	/**
	 * The raw context every service above is bound to (same base URL and auth headers).
	 * Escape hatch for endpoints that have no client/service method yet — mark such calls `// FIXME`.
	 */
	constructor(public readonly request: APIRequestContext) {
		this.authentication = new AuthenticationService(new AuthenticationClient(request));
		this.mentor = new MentorService(new MentorClient(request));
		this.member = new MemberService(new MemberClient(request));
		this.cms = new CmsService(new CmsClient(request));
		this.cycle = new CycleService(new CycleClient(request));
	}
}
