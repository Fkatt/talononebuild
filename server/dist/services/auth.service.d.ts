interface LoginCredentials {
    email: string;
    password: string;
}
interface LoginResult {
    token: string;
    user: {
        id: number;
        email: string;
        role: string;
    };
}
export declare const login: (credentials: LoginCredentials) => Promise<LoginResult>;
export {};
//# sourceMappingURL=auth.service.d.ts.map