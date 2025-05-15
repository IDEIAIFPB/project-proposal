export class CreateUserDTO {
    username: string;
    name: string;
    email: string;
    password: string;
    document: string;
    phone: string;
    dateOfBirth: string;
    isConfirmed?: boolean;
    confirmationCode?: string;
}
