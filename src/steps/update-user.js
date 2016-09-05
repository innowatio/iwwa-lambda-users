import {findUser, updateUser} from "../services/mongodb";

export async function updateExistingUser(user) {
    const savedUser = await findUser(user.uid);

    if (savedUser) {

        const updatedUser = {};
        user.sites ? updatedUser.sites = user.sites : null;
        user.roles ? updatedUser.roles = user.roles : null;

        await updateUser(user.uid, updatedUser);
    }
}