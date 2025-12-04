import { it, expect, describe } from 'vitest'
import { Api } from "../../client/api-client";
import {dataGen} from "../../datagen/datagen";
import {alice} from "../../client/users";
import {
    WipStepCreateData,
    WipStepDetailRes,
    WipStepListStep,
    WipStepTypeSelectOption,
    WipStepUpdateReq
} from "../../client/generated";

const template = async (api: Api): Promise<string> => {
    const projectName = dataGen.str()
    await api.templateManagerApi.createTemplate({
        name: projectName,
    })
    const listRes = await alice.templateManagerApi.listTemplates()
    const myTemplate = listRes.data.find(t => t.name === projectName)

    return myTemplate!.id
}

describe('template designer', () => {

    const createStep = async (api: Api, sessionId: string, name: string): Promise<WipStepCreateData> => {
        const res = await api.wipTemplateApi.createStep(sessionId)
        const stepNubmer = res.data.stepNumber
        expect(stepNubmer).toBeDefined()
        const updateRes = await api.wipTemplateApi.updateStep(
            sessionId,
            stepNubmer,
            {
                title: name,
                question: dataGen.str(100),
                orderPosition: "MIDDLE",
                data: {
                    type: "TEXT"
                }
            }
        )
        const x = dataGen.int(100, 500)
        const y = dataGen.int(100, 500)
        await api.wipTemplateApi.updateStepLocation(sessionId, stepNubmer, {
            position: {
                x,
                y
            }
        })
        const { data: detail } = await api.wipTemplateApi.getStep(sessionId, stepNubmer)

        return {
            ...res.data,
            nodeData: updateRes.data,
            gridPosition: {
                x, y
            },
            ...detail
        }
    }

    const updateReq = (data: WipStepDetailRes): WipStepUpdateReq => ({
        title: data.title,
        question: data.question,
        orderPosition: data.orderPosition,
        data: data.data
    })

    const verifyStep = (nodes: WipStepListStep[], expectedNode: WipStepListStep) => {
        const found = nodes.find(n => n.stepNumber === expectedNode.stepNumber)
        expect(found).toBeDefined()
        expect(found).toMatchObject({
            nodePosition: {
                x: expectedNode.nodePosition.x,
                y: expectedNode.nodePosition.y
            },
            nodeData: {
                title: expectedNode.nodeData.title
            }
        })
        if (expectedNode.nodeData.inputs.length > 0) {
            expect(found!.nodeData.inputs.length).toBe(expectedNode.nodeData.inputs.length)
            for (let i = 0; i < expectedNode.nodeData.inputs.length; i++) {
                expect(found!.nodeData.inputs[i].key).toBe(expectedNode.nodeData.inputs[i].key)
            }
        }
        if (expectedNode.nodeData.outputs.length > 0) {
            expect(found!.nodeData.outputs.length).toBe(expectedNode.nodeData.outputs.length)
            for (let i = 0; i < expectedNode.nodeData.outputs.length; i++) {
                expect(found!.nodeData.outputs[i].key).toBe(expectedNode.nodeData.outputs[i].key)
            }
        }
    }

    it('designing a template lifecycle', async () => {
        const templateId = await template(alice)

        const { data } = await alice.wipTemplateApi.getSession(templateId)
        expect(data.value).toBeDefined()
        const sessionId = data.value

        const stepA = await createStep(alice, sessionId, 'stepA')
        const stepB = await createStep(alice, sessionId, 'stepB')
        const stepC = await createStep(alice, sessionId, 'stepC')
        const stepD = await createStep(alice, sessionId, 'stepD')

        /*
        Step A is first -> Select -> connects to B and C
        Step B connects to D
        Step C and D are last steps
         */
        const optionA = {
            label: dataGen.str(),
            value: dataGen.str()
        } as WipStepTypeSelectOption
        const optionB = {
            label: dataGen.str(),
            value: dataGen.str()
        } as WipStepTypeSelectOption
        await alice.wipTemplateApi.updateStep(sessionId, stepA.stepNumber, {
            ...updateReq(stepA),
            orderPosition: "FIRST",
            data: {
                type: "SELECT",
                selectTypeData: {
                    options: [ optionA, optionB ]
                }
            }
        })
        await alice.wipTemplateApi.updateStep(sessionId, stepB.stepNumber, {
            ...updateReq(stepB),
            orderPosition: "MIDDLE"
        })
        await alice.wipTemplateApi.updateStep(sessionId, stepC.stepNumber, {
            ...updateReq(stepC),
            orderPosition: "LAST"
        })
        await alice.wipTemplateApi.updateStep(sessionId, stepD.stepNumber, {
            ...updateReq(stepD),
            orderPosition: "LAST"
        })

        // Connect steps
        await alice.wipTemplateApi.createConnection(sessionId, {
            sourceStepNumber: stepA.stepNumber,
            targetStepNumber: stepB.stepNumber,
            sourceOutput: optionA.value!,
            targetInput: stepB.nodeData.inputs[0].key
        })
        await alice.wipTemplateApi.createConnection(sessionId, {
            sourceStepNumber: stepA.stepNumber,
            targetStepNumber: stepC.stepNumber,
            sourceOutput: optionB.value!,
            targetInput: stepC.nodeData.inputs[0].key
        })
        await alice.wipTemplateApi.createConnection(sessionId, {
            sourceStepNumber: stepB.stepNumber,
            targetStepNumber: stepD.stepNumber,
            sourceOutput: stepB.nodeData.outputs[0].key,
            targetInput: stepD.nodeData.inputs[0].key
        })

        // validation
        const validationRes = await alice.wipTemplateApi.validateSteps(sessionId)
        console.log(validationRes.data)
        expect(validationRes.data.isValid).toBe(true)
        await alice.wipTemplateApi.completeTemplate(sessionId)

        // new session
        const newSessionRes = await alice.wipTemplateApi.getSession(templateId)
        const newSessionId = newSessionRes.data.value
        expect(newSessionId).not.toBe(sessionId)

        // old session fetch should fail
        await expect(
            alice.wipTemplateApi.getSteps(sessionId)
        ).rejects.toThrow()

        const nodesRes = await alice.wipTemplateApi.getSteps(newSessionId)
        expect(nodesRes.data.steps.length).toBe(4)
        verifyStep(nodesRes.data.steps, {
            stepNumber: stepA.stepNumber,
            nodePosition: stepA.gridPosition,
            nodeData: {
                title: stepA.title,
                inputs: [],
                outputs: [
                    {
                        key: optionA.value!,
                        label: optionA.label!
                    },
                    {
                        key: optionB.value!,
                        label: optionB.label!
                    }
                ]
            }
        })
        verifyStep(nodesRes.data.steps, {
            stepNumber: stepB.stepNumber,
            nodePosition: stepB.gridPosition,
            nodeData: {
                title: stepB.title,
                inputs: stepB.nodeData.inputs,
                outputs: stepB.nodeData.outputs
            }
        })
        verifyStep(nodesRes.data.steps, {
            stepNumber: stepC.stepNumber,
            nodePosition: stepC.gridPosition,
            nodeData: {
                title: stepC.title,
                inputs: stepC.nodeData.inputs,
                outputs: stepC.nodeData.outputs
            }
        })
        verifyStep(nodesRes.data.steps, {
            stepNumber: stepD.stepNumber,
            nodePosition: stepD.gridPosition,
            nodeData: {
                title: stepD.title,
                inputs: stepD.nodeData.inputs,
                outputs: stepD.nodeData.outputs
            }
        })
    })
})