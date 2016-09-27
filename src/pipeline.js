import log from "services/logger";

import {updateExistingUser} from "steps/update-user";

export default async function pipeline(event, options) {
    log.info(event);

    try {
        const rawUser = event.data.element;

        /*
        *   Workaround: some events have been incorrectly generated and thus don't
        *   have an `element` property. When processing said events, just return and
        *   move on without failing, as failures can block the kinesis stream.
        */
        if (!rawUser ||
            !rawUser.uid ||
            !rawUser.sites &&
            !rawUser.roles
        ) {
            return null;
        }

        await updateExistingUser(rawUser, options.spreadValues);

    } catch (error) {
        log.error(error);
        throw error;
    }
}
