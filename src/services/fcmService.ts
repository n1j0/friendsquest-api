import { BaseMessage, BatchResponse, getMessaging, Messaging } from 'firebase-admin/messaging'
import { FCMMessage } from '../types/fcmMessage.js'

export class FcmService {
    readonly messaging: Messaging

    readonly batchSize = Number.parseInt(process.env.BATCH_SIZE ?? '500', 10)

    constructor(messaging: Messaging = getMessaging()) {
        this.messaging = messaging
    }

    getPreparedMessage = (message: FCMMessage): BaseMessage => ({
        notification: { ...message },
    })

    /**
     * Sends a message to a single token
     * @returns invalid token in array
     */
    sendSingleMessage = async (token: string, message: FCMMessage): Promise<string[]> => {
        try {
            await this.messaging.send({
                ...this.getPreparedMessage(message),
                token,
            })
            return []
        } catch {
            return [token]
        }
    }

    /**
     * Sends a message to a batch of tokens
     * @returns invalid tokens
     */
    sendBatchMessage = async (registrationTokens: string[], message: FCMMessage): Promise<string[]> => {
        if (registrationTokens.length === 1) {
            return this.sendSingleMessage(registrationTokens[0], message)
        }

        const numberBatches = Math.ceil(registrationTokens.length / this.batchSize)

        const sendRequests: Promise<BatchResponse>[] = Array.from({ length: numberBatches }, (_, index) => {
            const tokens = registrationTokens.slice(index * this.batchSize, (index + 1) * this.batchSize)
            return this.messaging.sendEachForMulticast({
                ...this.getPreparedMessage(message),
                tokens,
            })
        })

        try {
            const responses = await Promise.all(sendRequests)
            // returns invalid tokens
            return responses.flatMap(
                (response, index) => response.responses.flatMap(
                    (sendResponse, tokenIndex) => (
                        sendResponse.success ? [] : [registrationTokens[tokenIndex + (index * this.batchSize)]]),
                ),
            )
        } catch (error) {
            console.error('Error sending FCM messages:', error)
            throw error
        }
    }
}
