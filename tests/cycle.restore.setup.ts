import { test as setup } from "@playwright/test";
import { DEFAULT_CYCLE_SCENARIO } from "helpers/datafactory/constants/cycle.data";
import { switchCycle } from "helpers/environment/cycle.switch";

/** Teardown of `setup_ad_hoc`: leaves the stack on the seeded default once the `@ad-hoc` tests are done. */
setup("restore the default mentorship cycle", () => {
	switchCycle(DEFAULT_CYCLE_SCENARIO);
});
