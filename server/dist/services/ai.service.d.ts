interface GenerateParams {
    prompt: string;
    context?: any;
}
interface EnhanceParams {
    prompt: string;
}
interface FeedbackParams {
    prompt: string;
    response: any;
    rating: number;
    feedback?: string;
}
export declare const generate: (params: GenerateParams) => Promise<{
    prompt: string;
    generated: {
        type: string;
        name: string;
        description: string;
        conditions: never[];
        effects: never[];
    };
    metadata: {
        model: string;
        timestamp: string;
    };
}>;
export declare const enhance: (params: EnhanceParams) => Promise<{
    original: string;
    enhanced: string;
    metadata: {
        model: string;
        timestamp: string;
    };
}>;
export declare const submitFeedback: (params: FeedbackParams) => Promise<{
    id: number;
    message: string;
}>;
export declare const getSystemSettings: () => Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    aiProvider: string;
    aiConfig: import("@prisma/client/runtime/library").JsonValue;
    docLinks: import("@prisma/client/runtime/library").JsonValue;
}>;
export declare const updateSystemSettings: (aiProvider: string, aiConfig: any) => Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    aiProvider: string;
    aiConfig: import("@prisma/client/runtime/library").JsonValue;
    docLinks: import("@prisma/client/runtime/library").JsonValue;
}>;
export {};
//# sourceMappingURL=ai.service.d.ts.map