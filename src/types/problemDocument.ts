/* eslint-disable no-unused-vars */
declare namespace Error {
    interface ProblemDocument {
        detail?: string;
        instance?: string;
        status: number;
        title: string;
        type?: string;
    }
}
/* eslint-enable no-unused-vars */
