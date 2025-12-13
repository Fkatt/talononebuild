interface DatabaseConfig {
    url: string;
}
interface ServerConfig {
    port: number;
    nodeEnv: string;
}
interface SecurityConfig {
    encryptionKey: string;
    jwtSecret: string;
}
interface TalonConfig {
}
interface ContentfulConfig {
}
interface Config {
    server: ServerConfig;
    database: DatabaseConfig;
    security: SecurityConfig;
    talon: TalonConfig;
    contentful: ContentfulConfig;
}
declare const config: Config;
export default config;
//# sourceMappingURL=index.d.ts.map