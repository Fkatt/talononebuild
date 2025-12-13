interface InstanceCredentials {
    apiKey?: string;
    apiToken?: string;
    spaceId?: string;
    accessToken?: string;
    [key: string]: any;
}
interface CreateInstanceData {
    name: string;
    type: 'talon' | 'contentful';
    region: string;
    url: string;
    credentials: InstanceCredentials;
    bundleId?: string;
    userId: number;
}
interface UpdateInstanceData {
    name?: string;
    region?: string;
    url?: string;
    credentials?: InstanceCredentials;
    bundleId?: string;
}
interface ConnectionTestParams {
    type: 'talon' | 'contentful';
    url: string;
    credentials: InstanceCredentials;
}
export declare const getUserInstances: (userId: number) => Promise<{
    id: number;
    name: string;
    type: string;
    region: string;
    url: string;
    bundleId: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const getInstance: (instanceId: number, userId: number) => Promise<{
    id: number;
    name: string;
    type: string;
    region: string;
    url: string;
    bundleId: string | null;
    credentials: any;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createInstance: (data: CreateInstanceData) => Promise<{
    id: number;
    name: string;
    type: string;
    region: string;
    url: string;
    bundleId: string | null;
    createdAt: Date;
}>;
export declare const updateInstance: (instanceId: number, userId: number, data: UpdateInstanceData) => Promise<{
    id: number;
    name: string;
    type: string;
    region: string;
    url: string;
    bundleId: string | null;
    updatedAt: Date;
}>;
export declare const deleteInstance: (instanceId: number, userId: number) => Promise<{
    success: boolean;
}>;
export declare const testConnection: (params: ConnectionTestParams) => Promise<{
    success: boolean;
    error?: string;
}>;
export declare const updateInstanceBundle: (instanceId: number, userId: number, bundleId: string | null) => Promise<{
    id: number;
    bundleId: string | null;
}>;
export {};
//# sourceMappingURL=instance.service.d.ts.map