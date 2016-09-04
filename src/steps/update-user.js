import {findUser, updateUser} from "../services/mongodb";

export async function updateExistingUser(user) {
    const savedUser = await findUser(user.uid);
    if (savedUser) {
        await updateUser(user.uid, {
            sites: user.sites ? user.sites : [],
            roles: user.roles ? user.roles : [],
            services: {
                sso: {
                    uid: user.uid
                }
            }
        });
    }
}