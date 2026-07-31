import { PolicyConfig, IPolicyConfigDocument } from '../models/PolicyConfig.model';
import { POLICY_RULES } from '../config/constants';

export class ConfigService {
  /**
   * Initialize default config if the database is empty
   */
  async initializeDefaultConfig() {
    const currentYear = new Date().getFullYear();
    const configCount = await PolicyConfig.countDocuments();

    if (configCount === 0) {
      console.log(
        `[ConfigService] No policy configurations found. Seeding defaults for ${currentYear}.`
      );
      await PolicyConfig.create({
        year: currentYear,
        annualLimit: POLICY_RULES.ANNUAL_LIMIT,
        deductible: POLICY_RULES.DEDUCTIBLE,
        coverageRate: POLICY_RULES.COVERAGE_RATE,
        isActive: true,
      });
    }
  }

  /**
   * Get policy configuration for a specific year.
   * If it doesn't exist for that year, it falls back to the most recent active configuration.
   * If NO config exists at all, returns the hardcoded defaults.
   */
  async getConfigForYear(year: number): Promise<{
    annualLimit: number;
    deductible: number;
    coverageRate: number;
    isActive?: boolean;
  }> {
    const config = await PolicyConfig.findOne({ year, isActive: true });

    if (config) {
      return config;
    }

    // Fallback to most recent active config
    const recentConfig = await PolicyConfig.findOne({ isActive: true }).sort({ year: -1 });

    if (recentConfig) {
      return recentConfig;
    }

    // Absolute fallback (should ideally never hit this if DB is seeded)
    return {
      annualLimit: POLICY_RULES.ANNUAL_LIMIT,
      deductible: POLICY_RULES.DEDUCTIBLE,
      coverageRate: POLICY_RULES.COVERAGE_RATE,
      isActive: true,
    };
  }

  /**
   * Get all policy configs (for admin panel)
   */
  async getAllConfigs() {
    return PolicyConfig.find().sort({ year: -1 });
  }

  /**
   * Update or create a policy config for a specific year
   */
  async upsertConfig(
    year: number,
    data: { annualLimit: number; deductible: number; coverageRate: number; isActive: boolean }
  ) {
    const config = await PolicyConfig.findOneAndUpdate(
      { year },
      { $set: data },
      { new: true, upsert: true }
    );
    return config;
  }
}

export const configService = new ConfigService();
