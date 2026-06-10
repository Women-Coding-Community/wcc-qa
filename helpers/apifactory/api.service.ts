import { APIRequestContext } from "@playwright/test";
import { AuthenticationClient } from "./clients/authentication.client";
import { MentorClient } from "./clients/mentor.client";
import { MemberClient } from "./clients/member.client";
import { AuthenticationService } from "./services/authentication.service";
import { MentorService } from "./services/mentor.service";
import { MemberService } from "./services/member.service";

export class APIService {
	public readonly authentication: AuthenticationService;
	public readonly mentor: MentorService;
	public readonly member: MemberService;

	constructor(request: APIRequestContext) {
		this.authentication = new AuthenticationService(new AuthenticationClient(request));
		this.mentor = new MentorService(new MentorClient(request));
		this.member = new MemberService(new MemberClient(request));
	}
}
