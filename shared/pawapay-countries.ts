/**
 * PawaPay Countries Configuration
 * 
 * Complete list of countries, operators (correspondents), currencies,
 * phone prefixes, and EUR exchange rates for PawaPay Mobile Money.
 */

export interface MobileOperator {
  code: string;
  name: string;
  logo?: string;
}

export interface PawaPayCountry {
  code: string;
  name: string;
  flag: string;
  phonePrefix: string;
  currency: string;
  currencySymbol: string;
  eurRate: number;
  usdRate: number;
  operators: MobileOperator[];
}

export const EUR_TO_USD_RATE = 1.08;

export const PAWAPAY_COUNTRIES: PawaPayCountry[] = [
  {
    code: "CMR",
    name: "Cameroun",
    flag: "🇨🇲",
    phonePrefix: "237",
    currency: "XAF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "MTN_MOMO_CMR", name: "MTN Mobile Money" },
      { code: "ORANGE_CMR", name: "Orange Money" },
    ],
  },
  {
    code: "CIV",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    phonePrefix: "225",
    currency: "XOF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "MTN_MOMO_CIV", name: "MTN Mobile Money" },
      { code: "ORANGE_CIV", name: "Orange Money" },
    ],
  },
  {
    code: "SEN",
    name: "Sénégal",
    flag: "🇸🇳",
    phonePrefix: "221",
    currency: "XOF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "ORANGE_SEN", name: "Orange Money" },
      { code: "FREE_SEN", name: "Free Money" },
    ],
  },
  {
    code: "BEN",
    name: "Bénin",
    flag: "🇧🇯",
    phonePrefix: "229",
    currency: "XOF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "MTN_MOMO_BEN", name: "MTN Mobile Money" },
      { code: "MOOV_BEN", name: "Moov Money" },
    ],
  },
  {
    code: "BFA",
    name: "Burkina Faso",
    flag: "🇧🇫",
    phonePrefix: "226",
    currency: "XOF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "ORANGE_BFA", name: "Orange Money" },
      { code: "MOOV_BFA", name: "Moov Money" },
    ],
  },
  {
    code: "MLI",
    name: "Mali",
    flag: "🇲🇱",
    phonePrefix: "223",
    currency: "XOF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "ORANGE_MLI", name: "Orange Money" },
      { code: "MOOV_MLI", name: "Moov Money" },
    ],
  },
  {
    code: "TGO",
    name: "Togo",
    flag: "🇹🇬",
    phonePrefix: "228",
    currency: "XOF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "MOOV_TGO", name: "Moov Money" },
    ],
  },
  {
    code: "NER",
    name: "Niger",
    flag: "🇳🇪",
    phonePrefix: "227",
    currency: "XOF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "AIRTEL_NER", name: "Airtel Money" },
    ],
  },
  {
    code: "GHA",
    name: "Ghana",
    flag: "🇬🇭",
    phonePrefix: "233",
    currency: "GHS",
    currencySymbol: "GH₵",
    eurRate: 16.5,
    usdRate: 15.3,
    operators: [
      { code: "MTN_MOMO_GHA", name: "MTN Mobile Money" },
      { code: "VODAFONE_GHA", name: "Vodafone Cash" },
      { code: "AIRTELTIGO_GHA", name: "AirtelTigo Money" },
    ],
  },
  {
    code: "KEN",
    name: "Kenya",
    flag: "🇰🇪",
    phonePrefix: "254",
    currency: "KES",
    currencySymbol: "KSh",
    eurRate: 165,
    usdRate: 153,
    operators: [
      { code: "MPESA_KEN", name: "M-Pesa" },
    ],
  },
  {
    code: "TZA",
    name: "Tanzanie",
    flag: "🇹🇿",
    phonePrefix: "255",
    currency: "TZS",
    currencySymbol: "TSh",
    eurRate: 2800,
    usdRate: 2593,
    operators: [
      { code: "VODACOM_TZA", name: "M-Pesa" },
      { code: "AIRTEL_TZA", name: "Airtel Money" },
      { code: "TIGO_TZA", name: "Tigo Pesa" },
    ],
  },
  {
    code: "UGA",
    name: "Ouganda",
    flag: "🇺🇬",
    phonePrefix: "256",
    currency: "UGX",
    currencySymbol: "USh",
    eurRate: 4100,
    usdRate: 3796,
    operators: [
      { code: "MTN_MOMO_UGA", name: "MTN Mobile Money" },
      { code: "AIRTEL_OAPI_UGA", name: "Airtel Money" },
    ],
  },
  {
    code: "RWA",
    name: "Rwanda",
    flag: "🇷🇼",
    phonePrefix: "250",
    currency: "RWF",
    currencySymbol: "FRw",
    eurRate: 1380,
    usdRate: 1278,
    operators: [
      { code: "MTN_MOMO_RWA", name: "MTN Mobile Money" },
      { code: "AIRTEL_RWA", name: "Airtel Money" },
    ],
  },
  {
    code: "ZMB",
    name: "Zambie",
    flag: "🇿🇲",
    phonePrefix: "260",
    currency: "ZMW",
    currencySymbol: "K",
    eurRate: 28,
    usdRate: 26,
    operators: [
      { code: "MTN_MOMO_ZMB", name: "MTN Mobile Money" },
      { code: "AIRTEL_ZMB", name: "Airtel Money" },
    ],
  },
  {
    code: "MWI",
    name: "Malawi",
    flag: "🇲🇼",
    phonePrefix: "265",
    currency: "MWK",
    currencySymbol: "MK",
    eurRate: 1850,
    usdRate: 1713,
    operators: [
      { code: "AIRTEL_MWI", name: "Airtel Money" },
      { code: "TNM_MWI", name: "TNM Mpamba" },
    ],
  },
  {
    code: "COD",
    name: "RD Congo",
    flag: "🇨🇩",
    phonePrefix: "243",
    currency: "CDF",
    currencySymbol: "FC",
    eurRate: 2950,
    usdRate: 2731,
    operators: [
      { code: "VODACOM_COD", name: "M-Pesa" },
      { code: "ORANGE_COD", name: "Orange Money" },
      { code: "AIRTEL_COD", name: "Airtel Money" },
    ],
  },
  {
    code: "COG",
    name: "Congo Brazzaville",
    flag: "🇨🇬",
    phonePrefix: "242",
    currency: "XAF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "MTN_MOMO_COG", name: "MTN Mobile Money" },
      { code: "AIRTEL_COG", name: "Airtel Money" },
    ],
  },
  {
    code: "GAB",
    name: "Gabon",
    flag: "🇬🇦",
    phonePrefix: "241",
    currency: "XAF",
    currencySymbol: "FCFA",
    eurRate: 656,
    usdRate: 607,
    operators: [
      { code: "AIRTEL_GAB", name: "Airtel Money" },
    ],
  },
  {
    code: "MOZ",
    name: "Mozambique",
    flag: "🇲🇿",
    phonePrefix: "258",
    currency: "MZN",
    currencySymbol: "MT",
    eurRate: 69,
    usdRate: 64,
    operators: [
      { code: "VODACOM_MOZ", name: "M-Pesa" },
    ],
  },
];

export function getCountryByCode(code: string): PawaPayCountry | undefined {
  return PAWAPAY_COUNTRIES.find(c => c.code === code);
}

export function getCountryByPhonePrefix(prefix: string): PawaPayCountry | undefined {
  return PAWAPAY_COUNTRIES.find(c => c.phonePrefix === prefix);
}

export function getOperatorByCode(operatorCode: string): { country: PawaPayCountry; operator: MobileOperator } | undefined {
  for (const country of PAWAPAY_COUNTRIES) {
    const operator = country.operators.find(op => op.code === operatorCode);
    if (operator) {
      return { country, operator };
    }
  }
  return undefined;
}

export function getCurrencyForOperator(operatorCode: string): string {
  const result = getOperatorByCode(operatorCode);
  return result?.country.currency || "XAF";
}

export function getEurRateForOperator(operatorCode: string): number {
  const result = getOperatorByCode(operatorCode);
  return result?.country.eurRate || 656;
}
