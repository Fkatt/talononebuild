interface Asset {
    type: string;
    id: string | number;
}
interface AssetNames {
    applications?: {
        [key: string]: string;
    };
    loyalty_programs?: {
        [key: string]: string;
    };
    giveaways?: {
        [key: string]: string;
    };
    campaign_templates?: {
        [key: string]: string;
    };
    audiences?: {
        [key: string]: string;
    };
}
interface MigrateParams {
    sourceId: number;
    destId: number;
    assets: Asset[];
    userId: number;
    newName?: string;
    copySchema?: boolean;
    appNames?: {
        [key: string]: string;
    };
    assetNames?: AssetNames;
}
export declare const migrate: (params: MigrateParams) => Promise<{
    migrationId: number;
    status: string;
    results: any[];
    errors: any[];
}>;
export {};
//# sourceMappingURL=migration.service.d.ts.map