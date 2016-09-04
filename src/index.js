import "babel-polyfill";
import router from "kinesis-router";

import pipeline from "./pipeline";

// pipeline definition is needed to avoid a babel-polyfill bug
export const handler = router().on("element inserted in collection users", pipeline);