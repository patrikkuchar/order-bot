import { it, expect, describe } from 'vitest'
import {TemplateCreateReq} from "../../client/generated";
import {dataGen} from "../../datagen/datagen";
import {alice} from "../../client/users";

describe('template manager', () => {

    const getReq = (): TemplateCreateReq => ({
        name: dataGen.str(),
        description: dataGen.str(50)
    })

    it('template create and fetch', async () => {
        const req = getReq();

        await alice.templateManagerApi.createTemplate(req);

        const listRes = await alice.templateManagerApi.listTemplates();
        expect(listRes.data.length).toBeGreaterThan(0);

        const myTemplate = listRes.data.find(t => t.name === req.name);
        expect(myTemplate).toBeDefined();

        const detail = await alice.templateManagerApi.getTemplateById(myTemplate!.id);
        expect(detail.data).toMatchObject({
            name: req.name,
            description: req.description
        })
    })
})