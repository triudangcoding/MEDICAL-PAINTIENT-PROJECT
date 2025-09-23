export interface IUserInfo {
    id: string;
    gender: EGender;
    birthYear: number;
    specificAddress: string;
}

export interface IPatient {
    id: string;
    fullName: string;
    phoneNumber: string;
    status: EPatientStatus;
    role: string;
    userInfo: IUserInfo;
}
export interface ICreatePatientResponse {
    data: IPatient;
    statusCode: number;
}

export interface IGetPatientPaginationResponse {
    data: IPatient[];
    pagination: IPaginationResponse;
    statusCode: number;
}

export interface IGetPatientResponse {
    data: IPatient[];
    statusCode: number;
}

export interface IPaginationResponse {
    currentPage: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
}

export interface ICreatePatientResponse {
    data: IPatient;
    statusCode: number;
}

export interface ICreatePatientRequest {
    fullName: string;
    phoneNumber: string;
    password: string;
    role: string;
}

export interface IUpdatePatientRequest {
    fullName?: string;
    phoneNumber?: string;
    password?: string;
    role?: string;
}

export enum EPatientStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
}

export enum EGender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
}