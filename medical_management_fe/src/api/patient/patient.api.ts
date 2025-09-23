// Mocked patient API for FE-only flow
import { ICreatePatientRequest, ICreatePatientResponse, IGetPatientPaginationResponse, IGetPatientResponse, IUpdatePatientRequest } from "./types.patient";

interface IPaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const patientApi = {
    getPatients: async (params?: IPaginationQuery): Promise<IGetPatientPaginationResponse> => {
        const total = 8;
        const limit = params?.limit || 10;
        const currentPage = params?.page || 1;
        const data = Array.from({ length: Math.min(total, limit) }).map((_, idx) => ({
            id: `p${idx + 1}`,
            fullName: `Patient ${idx + 1}`,
            phoneNumber: `09123456${(10 + idx).toString().slice(-2)}`,
            status: idx % 3 === 0 ? 'SUSPENDED' : idx % 2 === 0 ? 'INACTIVE' : 'ACTIVE',
            userInfo: { birthYear: 1990 + (idx % 10), gender: idx % 2 === 0 ? 'MALE' : 'FEMALE', specificAddress: 'Mock address' }
        }));
        return Promise.resolve({
            data,
            pagination: {
                total,
                limit,
                currentPage,
                totalPages: Math.ceil(total / limit),
                hasNextPage: false,
                hasPrevPage: false
            }
        } as unknown as IGetPatientPaginationResponse);
    },

    getAllPatients: async (): Promise<IGetPatientResponse> => {
        return Promise.resolve({ data: [], statusCode: 200 } as unknown as IGetPatientResponse);
    },

    createPatientService: async (data: ICreatePatientRequest): Promise<ICreatePatientResponse> => {
        return Promise.resolve({ data: { id: 'p-new', ...data }, statusCode: 201 } as unknown as ICreatePatientResponse);
    },

    updatePatient: async (id: string, data: IUpdatePatientRequest) => {
        return Promise.resolve({ data: { id, ...data }, statusCode: 200 } as any);
    },

    deletePatient: async (_id: string): Promise<any> => {
        return Promise.resolve({ statusCode: 200 });
    },

    deleteMultiplePatients: async (_ids: string[]): Promise<any> => {
        return Promise.resolve({ statusCode: 200 });
    },
};