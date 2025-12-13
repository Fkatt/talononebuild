interface CreateBackupParams {
    instanceId: number;
    name: string;
    userId: number;
}
interface RestoreBackupParams {
    backupId: number;
    targetInstanceId: number;
    userId: number;
}
export declare const createBackup: (params: CreateBackupParams) => Promise<{
    id: number;
    name: string;
    instanceId: number;
    createdAt: Date;
}>;
export declare const restoreBackup: (params: RestoreBackupParams) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const listBackups: (userId: number) => Promise<{
    id: number;
    createdAt: Date;
    name: string;
    instanceId: number;
}[]>;
export declare const getBackup: (backupId: number) => Promise<{
    id: number;
    createdAt: Date;
    name: string;
    data: import("@prisma/client/runtime/library").JsonValue;
    instanceId: number;
}>;
export declare const deleteBackup: (backupId: number) => Promise<{
    success: boolean;
}>;
export {};
//# sourceMappingURL=backup.service.d.ts.map