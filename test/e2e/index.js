import "babel-polyfill";

import chai, {expect} from "chai";
import {spy} from "sinon";
import sinonChai from "sinon-chai";
import {v4} from "node-uuid";

chai.use(sinonChai);

import {getEventFromObject} from "../mocks";
import {handler} from "index";
import {getMongoClient} from "services/mongodb";
import {
    USERS_COLLECTION_NAME
} from "config";

describe("Handle kinesis user event", () => {

    let usersCollection;
    let context = {
        succeed: spy(),
        fail: spy()
    };

    beforeEach(async () => {
        context.succeed.reset();
        context.fail.reset();

        const db = await getMongoClient();
        usersCollection = db.collection(USERS_COLLECTION_NAME);
    });

    afterEach(async () => {
        usersCollection.remove({});
    });

    describe("Ignore malformed events", () => {
        it("without sites or sensors field", async () => {
            const userEvent = {
                id: v4(),
                data: {
                    element: {
                        uid: "user.test"
                    },
                    id: v4()
                },
                type: "element inserted in collection users"
            };

            await handler(getEventFromObject(userEvent), context);
            expect(context.succeed).to.have.been.calledOnce;

            const users = await usersCollection.find({}).toArray();
            expect(users.length).to.be.equal(0);
        });

        it("from non-existing users", async () => {
            const userEvent = {
                id: v4(),
                data: {
                    element: {
                        uid: "user.test",
                        sites: ["sito-1"]
                    },
                    id: v4()
                },
                type: "element inserted in collection users"
            };

            await handler(getEventFromObject(userEvent), context);
            expect(context.succeed).to.have.been.calledOnce;

            const users = await usersCollection.find({}).toArray();
            expect(users.length).to.be.equal(0);
        });
    });

    describe("On element inserted (POST)", () => {
        it("replace both user's sites and sensors", async () => {

            const userEvent = {
                id: v4(),
                data: {
                    element: {
                        uid: "user.test",
                        sites: ["sito-1", "sito-2"],
                        roles: ["ruolo-2"],
                        groups: ["gruppo-1"],
                        sensors: ["sensore-1"],
                        profile: {
                            active: true,
                            confirmed: true,
                            isDeleted: false
                        }
                    },
                    id: v4()
                },
                type: "element inserted in collection users"
            };

            usersCollection.insert({
                services: {
                    sso: {
                        uid: "user.test"
                    },
                },
                sites: ["sito-3"],
                roles: ["ruolo-1"],
                groups: ["gruppo-2"],
                sensors: ["sensore-2"],
                profile: {
                    active: false,
                    confirmed: false,
                    isDeleted: false
                }
            });

            await handler(getEventFromObject(userEvent), context);
            expect(context.succeed).to.have.been.calledOnce;

            const users = await usersCollection.find({}).toArray();

            expect(users.length).to.be.equal(1);

            const user = await usersCollection.findOne({
                "services.sso.uid": "user.test"
            });

            expect(user.sites).to.be.deep.equal([
                "sito-1",
                "sito-2"
            ]);

            expect(user.roles).to.be.deep.equal([
                "ruolo-2"
            ]);

            expect(user.groups.sort()).to.be.deep.equal([
                "gruppo-1"
            ]);

            expect(user.sensors.sort()).to.be.deep.equal([
                "sensore-1"
            ]);

            expect(user.profile).to.be.deep.equal({
                active: true,
                confirmed: true,
                isDeleted: false
            });

            expect(user.services.sso.uid).to.be.deep.equal("user.test");
        });

        it("replace only user's sensors", async () => {

            usersCollection.insert({
                "services": {
                    "sso": {
                        "uid": "user.test"
                    }
                },
                "sensors": [
                    "sensor-1",
                    "sensor-2"
                ]
            });

            const userEvent = {
                id: v4(),
                data: {
                    element: {
                        "uid": "user.test",
                        "sensors": [
                            "sensor-3"
                        ]
                    },
                    id: v4()
                },
                type: "element inserted in collection users"
            };

            await handler(getEventFromObject(userEvent), context);

            const user = await usersCollection.findOne({
                "services.sso.uid": "user.test"
            });

            expect(user.sensors.sort()).to.be.deep.equal([
                "sensor-3"
            ]);

        });
    });

    describe("On element replaced (PUT)", () => {
        it("add both user's sites and sensors", async () => {

            const userEvent = {
                id: v4(),
                data: {
                    element: {
                        uid: "user.test",
                        sites: ["sito-1", "sito-2"],
                        roles: ["ruolo-2"],
                        groups: ["gruppo-1"],
                        sensors: ["sensore-1"],
                        profile: {
                            active: true,
                            confirmed: true,
                            isDeleted: false
                        }
                    },
                    id: v4()
                },
                type: "element replaced in collection users"
            };

            usersCollection.insert({
                services: {
                    sso: {
                        uid: "user.test"
                    }
                },
                sites: ["sito-3"],
                roles: ["ruolo-1"],
                groups: ["gruppo-2"],
                sensors: ["sensore-2"],
                profile: {
                    active: false,
                    confirmed: false,
                    isDeleted: false
                }
            });

            await handler(getEventFromObject(userEvent), context);
            expect(context.succeed).to.have.been.calledOnce;

            await handler(getEventFromObject(userEvent), context);
            expect(context.succeed).to.have.been.calledTwice;

            const users = await usersCollection.find({}).toArray();

            expect(users.length).to.be.equal(1);

            const user = await usersCollection.findOne({
                "services.sso.uid": "user.test"
            });

            expect(user.sites.sort()).to.be.deep.equal([
                "sito-1",
                "sito-2",
                "sito-3"
            ]);

            expect(user.roles.sort()).to.be.deep.equal([
                "ruolo-1",
                "ruolo-2"
            ]);

            expect(user.groups.sort()).to.be.deep.equal([
                "gruppo-1",
                "gruppo-2"
            ]);

            expect(user.sensors.sort()).to.be.deep.equal([
                "sensore-1",
                "sensore-2"
            ]);

            expect(user.profile).to.be.deep.equal({
                active: true,
                confirmed: true,
                isDeleted: false
            });

            expect(user.services.sso.uid).to.be.deep.equal("user.test");
        });

        it("add only user's sensors", async () => {

            usersCollection.insert({
                "services": {
                    "sso": {
                        "uid": "user.test"
                    }
                },
                "sensors": [
                    "sensor-1",
                    "sensor-2"
                ]
            });

            const userEvent = {
                id: v4(),
                data: {
                    element: {
                        "uid": "user.test",
                        "sensors": [
                            "sensor-3"
                        ]
                    },
                    id: v4()
                },
                type: "element replaced in collection users"
            };

            await handler(getEventFromObject(userEvent), context);

            const user = await usersCollection.findOne({
                "services.sso.uid": "user.test"
            });

            expect(user.sensors.sort()).to.be.deep.equal([
                "sensor-1",
                "sensor-2",
                "sensor-3"
            ]);

        });

        it("add user's parents data", async () => {

            const id = v4();

            usersCollection.insert({
                _id: id,
                services: {
                    sso: {
                        uid: "user.test.parent"
                    }
                },
                sensors: [
                    "sensor-1",
                    "sensor-2"
                ]
            });

            usersCollection.insert({
                services: {
                    sso: {
                        uid: "user.test.child"
                    }
                },
                sensors: [
                    "sensor-3",
                    "sensor-4"
                ],
                profile: {
                    parentUserId: id
                }
            });

            const userEvent = {
                id: v4(),
                data: {
                    element: {
                        "uid": "user.test.child",
                        "sensors": [
                            "sensor-5"
                        ],
                        "sites": [
                            "site-1"
                        ]
                    },
                    id: v4()
                },
                type: "element replaced in collection users"
            };

            await handler(getEventFromObject(userEvent), context);

            const userParent = await usersCollection.findOne({
                "services.sso.uid": "user.test.parent"
            });

            expect(userParent.sensors.sort()).to.be.deep.equal([
                "sensor-1",
                "sensor-2",
                "sensor-5"
            ]);

            expect(userParent.sites.sort()).to.be.deep.equal([
                "site-1"
            ]);

        });
    });
});
