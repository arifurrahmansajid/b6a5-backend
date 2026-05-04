export interface EnvConfig {
  appName: string;
  nodeEnv: string;
  port: number;

  databaseUrl: string;
  cookieSecret: string;

  corsOrigins: string[];

  jwt: {
    accessToken: {
      secret: string;
      expiresIn: string;
    };
    refreshToken: {
      secret: string;
      expiresIn: string;
    };
  };

  betterAuth: {
    baseURL: string;
    basePath: string;
    secret: string;
    cookiePrefix: string;

    sessionToken: {
      expiresIn: string;
      updateAge: string;
      cookieCacheAge: string;
    };
  };

  email: {
    smtp: {
      host: string;
      port: number;
      user: string;
      pass: string;
      secure: boolean;
    };
    from: string;
  };
  superAdmin: {
    email: string;
    password: string;
  };

  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
}
