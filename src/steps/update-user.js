import {findUser, updateUser} from "../services/mongodb";

import log from "../services/logger";

export async function updateExistingUser(user) {
    const savedUser = await findUser(user.uid);

    if (savedUser) {

        const updatedUser = {};
        user.sites ? updatedUser.sites = user.sites : null;
        user.roles ? updatedUser.roles = user.roles : null;

        log.info({
            updatedUser
        }, `Updating user ${user.uid}`);

        await updateUser(user.uid, updatedUser);
    }
}