import { mergeTests } from "@playwright/test";
import { test as POMFixture } from "./pom.fixture";
import { test as commonFixture } from "./common.fixtures";

export const test = mergeTests(POMFixture, commonFixture);
