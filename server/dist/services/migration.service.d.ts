interface Asset {
    type: string;
    id: string | number;
}
interface MigrateParams {
    sourceId: number;
    destId: number;
    assets: Asset[];
    userId: number;
}
export declare const migrate: (params: MigrateParams) => Promise<{
    migrationId: number;
    status: string;
    results: any[];
    errors: any[];
}>;
export {};
//# sourceMappingURL=migration.service.d.ts.map