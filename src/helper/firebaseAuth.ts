import { getAuth } from 'firebase-admin/auth'

export const verifyAuthToken = (token: string | string[]): Promise<string> => {
    let idToken = token
    if (typeof idToken !== 'string') {
        [idToken] = idToken
    }
    return getAuth().verifyIdToken(idToken)
        .then((decodedToken) => {
            const { uid } = decodedToken
            return uid
        })
        .catch((error) => {
            throw error
        })
}
