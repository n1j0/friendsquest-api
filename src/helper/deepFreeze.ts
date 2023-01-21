export const deepFreeze = (object: { [key: string]: any }) => {
    Object.keys(object).forEach((property) => {
        if (typeof object[String(property)] === 'object' && !Object.isFrozen(object[String(property)])) {
            deepFreeze(object[String(property)])
        }
    })
    return Object.freeze(object)
}
