export const deepFreeze = (object: { [key: string]: any }) => {
    Object.keys(object).forEach((property) => {
        if (typeof object[property] === 'object' && !Object.isFrozen(object[property])) {
            deepFreeze(object[property])
        }
    })
    return Object.freeze(object)
}
