import {
    findUser,
    findUserById
} from "../services/mongodb";

import get from "lodash.get";

async function retrieveParents(user, parents = []) {
    const hasParents = get(user, "profile.parentUserId");
    const parent = await findUserById(hasParents);
    return hasParents && parent ? retrieveParents(parent, [...parents, parent]) : parents;
}

export async function retrieveUserParents(user) {
    const savedUser = await findUser(user.uid);
    return savedUser && savedUser.profile ? await retrieveParents(savedUser) : [];
}
