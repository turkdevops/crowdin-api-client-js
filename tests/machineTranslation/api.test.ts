import * as nock from 'nock';
import { Credentials, MachineTranslation } from '../../src';

describe('Machine Translation engines (MTs) API', () => {
    let scope: nock.Scope;
    const credentials: Credentials = {
        token: 'testToken',
        organization: 'testOrg',
    };
    const api: MachineTranslation = new MachineTranslation(credentials);
    const mtId = 2;
    const groupId = 3;
    const name = 'test';
    const type = 'type';
    const lang = 'us';
    const apiKey = 'test';

    const limit = 25;

    beforeAll(() => {
        scope = nock(api.url)
            .get('/mts', undefined, {
                reqheaders: {
                    Authorization: `Bearer ${api.token}`,
                },
            })
            .query({
                groupId: groupId,
            })
            .reply(200, {
                data: [
                    {
                        data: {
                            id: mtId,
                        },
                    },
                ],
                pagination: {
                    offset: 0,
                    limit: limit,
                },
            })
            .post(
                '/mts',
                {
                    name: name,
                    type: type,
                    credentials: { apiKey },
                },
                {
                    reqheaders: {
                        Authorization: `Bearer ${api.token}`,
                    },
                },
            )
            .reply(200, {
                data: {
                    id: mtId,
                },
            })
            .get(`/mts/${mtId}`, undefined, {
                reqheaders: {
                    Authorization: `Bearer ${api.token}`,
                },
            })
            .reply(200, {
                data: {
                    id: mtId,
                },
            })
            .delete(`/mts/${mtId}`, undefined, {
                reqheaders: {
                    Authorization: `Bearer ${api.token}`,
                },
            })
            .reply(200)
            .patch(
                `/mts/${mtId}`,
                [
                    {
                        value: name,
                        op: 'replace',
                        path: '/name',
                    },
                ],
                {
                    reqheaders: {
                        Authorization: `Bearer ${api.token}`,
                    },
                },
            )
            .reply(200, {
                data: {
                    id: mtId,
                    name: name,
                },
            })
            .post(
                `/mts/${mtId}/translations`,
                {
                    targetLanguageId: lang,
                },
                {
                    reqheaders: {
                        Authorization: `Bearer ${api.token}`,
                    },
                },
            )
            .reply(200, {
                data: {
                    targetLanguageId: lang,
                },
            });
    });

    afterAll(() => {
        scope.done();
    });

    it('List MTs', async () => {
        const mts = await api.listMts({ groupId });
        expect(mts.data.length).toBe(1);
        expect(mts.data[0].data.id).toBe(mtId);
        expect(mts.pagination.limit).toBe(limit);
    });

    it('Create MT', async () => {
        const mt = await api.createMt({
            name: name,
            type: type,
            credentials: { apiKey },
        });
        expect(mt.data.id).toBe(mtId);
    });

    it('Get MT', async () => {
        const mt = await api.getMt(mtId);
        expect(mt.data.id).toBe(mtId);
    });

    it('Delete MT', async () => {
        await api.deleteMt(mtId);
    });

    it('Update MT', async () => {
        const mt = await api.updateMt(mtId, [
            {
                op: 'replace',
                path: '/name',
                value: name,
            },
        ]);
        expect(mt.data.id).toBe(mtId);
        expect(mt.data.name).toBe(name);
    });

    it('Translate via MT', async () => {
        const translations = await api.translate(mtId, {
            targetLanguageId: lang,
        });
        expect(translations.data.targetLanguageId).toBe(lang);
    });
});
