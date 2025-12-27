"use strict";
import { getWebRates } from "./webpage.js";

describe("getWebRates function", () => {
  test("getWebRates give array", async () => {
    const useTomorrowRate = false;
    const webRateStrings = await getWebRates(useTomorrowRate);
    console.log("webRateStrings");
    console.log(webRateStrings);
    expect(webRateStrings).toHaveLength(48);
  });
});
