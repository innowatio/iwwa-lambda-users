import "babel-polyfill";
import router from "kinesis-router";

import pipeline from "./pipeline";

const insertPipeline = async (event) => {
    return await pipeline(event, {
        spreadValues: false
    });
};

const updatePipeline = async (event) => {
    return await pipeline(event, {
        spreadValues: true
    });
};

// pipeline definition is needed to avoid a babel-polyfill bug
export const handler = router()
    .on("element inserted in collection users", insertPipeline)
    .on("element replaced in collection users", updatePipeline);