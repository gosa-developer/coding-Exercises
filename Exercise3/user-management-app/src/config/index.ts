// src/config/index.ts

interface Config {
  port: number;
  nodeEnv: string;
  apiVersion: string;
  corsOrigin: string;
}

class Configuration {
  private static instance: Configuration;
  private config: Config;

  private constructor() {
    this.config = {
      port: parseInt(process.env.PORT || '3000', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      apiVersion: process.env.API_VERSION || 'v1',
      corsOrigin: process.env.CORS_ORIGIN || '*'
    };
  }

  public static getInstance(): Configuration {
    if (!Configuration.instance) {
      Configuration.instance = new Configuration();
    }
    return Configuration.instance;
  }

  public get(key: keyof Config): any {
    return this.config[key];
  }

  public getAll(): Config {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }
}

export const config = Configuration.getInstance();