// Environment variable validation for production readiness

interface EnvConfig {
  NEXT_PUBLIC_OPENAI_API_KEY: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_ONCHAINKIT_API_KEY: string;
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private config: EnvConfig | null = null;
  private errors: string[] = [];

  private constructor() {
    this.validateEnvironment();
  }

  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  private validateEnvironment(): void {
    this.errors = [];

    // Required environment variables
    const requiredVars: (keyof EnvConfig)[] = [
      'NEXT_PUBLIC_OPENAI_API_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_ONCHAINKIT_API_KEY',
    ];

    const config: Partial<EnvConfig> = {};

    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value.trim() === '') {
        this.errors.push(`Missing required environment variable: ${varName}`);
      } else {
        config[varName] = value;
      }
    });

    // Additional validation
    if (config.NEXT_PUBLIC_SUPABASE_URL && !this.isValidUrl(config.NEXT_PUBLIC_SUPABASE_URL)) {
      this.errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL');
    }

    if (config.NEXT_PUBLIC_OPENAI_API_KEY && !config.NEXT_PUBLIC_OPENAI_API_KEY.startsWith('sk-')) {
      this.errors.push('NEXT_PUBLIC_OPENAI_API_KEY appears to be invalid (should start with sk-)');
    }

    if (this.errors.length === 0) {
      this.config = config as EnvConfig;
    }
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  isValid(): boolean {
    return this.errors.length === 0 && this.config !== null;
  }

  getErrors(): string[] {
    return [...this.errors];
  }

  getConfig(): EnvConfig {
    if (!this.config) {
      throw new Error('Environment configuration is not valid. Check getErrors() for details.');
    }
    return this.config;
  }

  // Development helper
  logStatus(): void {
    if (process.env.NODE_ENV === 'development') {
      if (this.isValid()) {
        console.log('✅ Environment configuration is valid');
      } else {
        console.error('❌ Environment configuration errors:');
        this.errors.forEach(error => console.error(`  - ${error}`));
      }
    }
  }

  // Production readiness check
  checkProductionReadiness(): {
    ready: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for environment validation errors
    if (!this.isValid()) {
      issues.push(...this.errors);
    }

    // Check for production-specific concerns
    if (process.env.NODE_ENV === 'production') {
      // Check if using development/test keys
      if (this.config?.NEXT_PUBLIC_OPENAI_API_KEY?.includes('test')) {
        warnings.push('Using test OpenAI API key in production');
      }

      if (this.config?.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
        issues.push('Using localhost Supabase URL in production');
      }

      // Check for secure protocols
      if (this.config?.NEXT_PUBLIC_SUPABASE_URL && !this.config.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
        issues.push('Supabase URL should use HTTPS in production');
      }
    }

    return {
      ready: issues.length === 0,
      issues,
      warnings,
    };
  }
}

// Export singleton instance
export const envValidator = EnvironmentValidator.getInstance();

// Helper function for components
export function useEnvironmentValidation() {
  const validator = EnvironmentValidator.getInstance();
  
  return {
    isValid: validator.isValid(),
    errors: validator.getErrors(),
    config: validator.isValid() ? validator.getConfig() : null,
    productionReadiness: validator.checkProductionReadiness(),
  };
}

// Initialize validation on import
if (typeof window !== 'undefined') {
  // Client-side initialization
  envValidator.logStatus();
} else {
  // Server-side initialization
  envValidator.logStatus();
}
