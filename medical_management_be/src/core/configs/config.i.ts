export interface IAppConfig {
  nodeEnv: EEnvironment;
  port: number;
  frontendUrl: string;
}

export enum EEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

export interface IAllConfigType {
  app: IAppConfig;
}
