interface CreateBackupParams {
    instanceId: number;
    name: string;
    userId: number;
}
interface RestoreBackupParams {
    backupId: number;
    targetInstanceId: number;
    userId: number;
    newName: string;
}
export declare const createBackup: (params: CreateBackupParams) => Promise<{
    id: number;
    name: string;
    instanceId: number | null;
    createdAt: Date;
    size: number;
    vertical: string | null;
}>;
export declare const restoreBackup: (params: RestoreBackupParams) => Promise<{
    success: boolean;
    message: string;
    applicationName: string;
}>;
export declare const listBackups: (userId: number, vertical?: string) => Promise<{
    id: number;
    createdAt: Date;
    name: string;
    vertical: string | null;
    instanceId: number | null;
    size: number;
}[]>;
export declare const getBackupCountsByVertical: () => Promise<Record<string, number>>;
export declare const getBackup: (backupId: number) => Promise<{
    id: number;
    createdAt: Date;
    name: string;
    data: import("@prisma/client/runtime/library").JsonValue;
    vertical: string | null;
    instanceId: number | null;
    size: number;
}>;
export declare const deleteBackup: (backupId: number) => Promise<{
    success: boolean;
}>;
export {};
//# sourceMappingURL=backup.service.d.ts.map