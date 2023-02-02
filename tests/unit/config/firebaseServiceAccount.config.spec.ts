import { serviceAccountConfig } from '../../../src/config/firebaseServiceAccount.config'

// @see <rootDir>/jest.setup.ts

describe('firebaseServiceAccount', () => {
    it('exports Service Account information', () => {
        const config = serviceAccountConfig
        expect(Object.values(config)).toHaveLength(10)
        expect(config.type).toBe('service_account')
        expect(config.projectId).toBe('project_id')
        expect(config.privateKeyId).toBe('admin_private_key_id')
        expect(config.clientEmail).toBe('admin_client_email')
        expect(config.clientId).toBe('admin_client_id')
        expect(config.authUri).toBe('https://accounts.google.com/o/oauth2/auth')
        expect(config.tokenUri).toBe('https://oauth2.googleapis.com/token')
        expect(config.authProvider_x509_cert_url).toBe('admin_auth_cert_url')
        expect(config.client_x509_cert_url).toBe('admin_client_cert_url')
    })

    it('replaces escaped line breaks in private key', () => {
        const config = serviceAccountConfig
        expect(config.privateKey).toBe('sample\ntest')
    })
})
