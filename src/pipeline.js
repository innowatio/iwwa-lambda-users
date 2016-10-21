import {map} from "bluebird";

import log from "services/logger";

import {addHierarchicalInfos} from "steps/add-hierarchical-infos";
import {retrieveUserParents} from "steps/retrieve-parents";
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
            !rawUser.roles && 
            !rawUser.sensors &&
            !rawUser.groups &&
            !rawUser.profile
        ) {
            return null;
        }

        await updateExistingUser(rawUser, options.spreadValues);

        const parents = await retrieveUserParents(rawUser);

        await map(parents, async (parent) => {
            await addHierarchicalInfos(parent, rawUser);
        });

    } catch (error) {
        log.error(error);
        throw error;
    }
}
