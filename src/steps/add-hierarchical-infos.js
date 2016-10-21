import get from "lodash.get";

import {updateUserById} from "../services/mongodb";

export async function addHierarchicalInfos(user, {sensors = [], sites = []}) {

    const userSites = get(user, "sites", []);
    const userSensors = get(user, "sensors", []);

    await updateUserById(user._id, {
        ...user,
        sites: [...userSites, ...sites].filter(x => x),
        sensors: [...userSensors, ...sensors].filter(x => x)
    });

}