/** Credit package definition: packageId -> { credits, amount in BRL } */
export interface CreditPackageConfig {
  credits: number;
  amount: number;
}

/** Extensible credit packages config. Add new packages here. */
export const CREDIT_PACKAGES: Record<string, CreditPackageConfig> = {
  '10': { credits: 10, amount: 9.9 },
  '50': { credits: 50, amount: 44.9 },
  '100': { credits: 100, amount: 79.9 },
};
