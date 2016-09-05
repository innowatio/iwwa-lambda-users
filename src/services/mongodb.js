import {MongoClient} from "mongodb";

import {
    MONGODB_URL,
    USERS_COLLECTION_NAME
} from "../config";

var mongoClientInstance;

export async function getMongoClient() {
    if (!mongoClientInstance) {
        mongoClientInstance = await MongoClient.connect(MONGODB_URL);
    }
    return mongoClientInstance;
}

async function update(collection, id, object) {
    const db = await getMongoClient();
    await db.collection(collection).updateOne(
        {"services.sso.uid": id},
        {
            $set: object
        },
        {upsert: false}
    );
}

async function findOne(collection, query) {
    const db = await getMongoClient();
    return await db.collection(collection).findOne(query);
}

export async function updateUser(uid, user) {
    await update(USERS_COLLECTION_NAME, uid, user);
}

export async function findUser(uid) {
    return await findOne(USERS_COLLECTION_NAME, {
        "services.sso.uid": uid
    });
}
