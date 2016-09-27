import {findUser, updateUser} from "../services/mongodb";

import log from "../services/logger";

export async function updateExistingUser(user, appendData) {
    const savedUser = await findUser(user.uid);

    if (savedUser) {

        const updatedUser = {};
        const savedSites = appendData && savedUser.sites ? savedUser.sites : [];
        const savedRoles = appendData && savedUser.roles ? savedUser.roles : [];

        user.sites ? updatedUser.sites = [...savedSites, ...user.sites] : null;
        user.roles ? updatedUser.roles = [...savedRoles, ...user.roles] : null;

        log.info({
            updatedUser
        }, `Updating user ${user.uid}`);

        await updateUser(user.uid, updatedUser);
    }
}