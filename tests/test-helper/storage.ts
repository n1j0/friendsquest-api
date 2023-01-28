export const storage: { bucket: jest.Mock, storageClient: string, appInternal: string } = {
    appInternal: '',
    storageClient: '',
    bucket: jest.fn().mockReturnValue({
        file: jest.fn().mockReturnValue({
            save: jest.fn(),
        }),
        deleteFiles: jest.fn().mockResolvedValue('deleteFiles'),
    }),
}
