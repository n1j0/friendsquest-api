import { deepFreeze } from '../../../src/helper/deepFreeze'

describe('deepFreeze', () => {
    it('should freeze an empty object', () => {
        const object = {}
        const frozenObject = deepFreeze(object)
        // @ts-ignore
        expect(() => { frozenObject.a = 1 }).toThrow(TypeError)
    })

    it('should freeze an object with one key', () => {
        const object = { a: 1 }
        const frozenObject = deepFreeze(object)
        // @ts-ignore
        expect(() => { frozenObject.a = 2 }).toThrow(TypeError)
    })

    it('should freeze an object with multiple keys', () => {
        const object = { a: 1, b: 2 }
        const frozenObject = deepFreeze(object)
        // @ts-ignore
        expect(() => { frozenObject.a = 3 }).toThrow(TypeError)
        // @ts-ignore
        expect(() => { frozenObject.b = 4 }).toThrow(TypeError)
    })

    it('should freeze an object with object as value', () => {
        const object = { a: { b: 1 } }
        const frozenObject = deepFreeze(object)
        // @ts-ignore
        expect(() => { frozenObject.a = 2 }).toThrow(TypeError)
        // @ts-ignore
        expect(() => { frozenObject.a.b = 3 }).toThrow(TypeError)
    })
})
