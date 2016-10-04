import uniq from "lodash.uniq";

import {findUser, updateUser} from "../services/mongodb";

import log from "../services/logger";

export async function updateExistingUser(user, appendData) {
    const savedUser = await findUser(user.uid);

    if (savedUser) {

        const updatedUser = {};
        const savedSites = appendData && savedUser.sites ? savedUser.sites : [];
        const savedRoles = appendData && savedUser.roles ? savedUser.roles : [];
        const savedGroups = appendData && savedUser.groups ? savedUser.groups : [];
        const savedSensors = appendData && savedUser.sensors ? savedUser.sensors : [];

        user.sites ? updatedUser.sites = uniq([...savedSites, ...user.sites]) : null;
        user.roles ? updatedUser.roles = uniq([...savedRoles, ...user.roles]) : null;
        user.groups ? updatedUser.groups = uniq([...savedGroups, ...user.groups]) : null;
        user.sensors ? updatedUser.sensors = uniq([...savedSensors, ...user.sensors]) : null;
        user.profile ? updatedUser.profile = user.profile : null;

        log.info({
            updatedUser
        }, `Updating user ${user.uid}`);

        await updateUser(user.uid, updatedUser);
    }
}