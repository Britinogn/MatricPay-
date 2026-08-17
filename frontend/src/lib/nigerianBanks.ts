// // Infers: "Access Bank" | "Citibank Nigeria" | "Ecobank Nigeria" | ...
// export type NigerianBankName = (typeof NIGERIAN_BANKS)[number]["name"];

// // Infers: "044" | "023" | "050" | ...
// export type NigerianBankCode = (typeof NIGERIAN_BANKS)[number]["code"];


// export const NIGERIAN_BANKS_MAP: Record<string, string> = {
//   "044": "Access Bank",
//   "023": "Citibank Nigeria",
//   "050": "Ecobank Nigeria",
//   "070": "Fidelity Bank",
//   "011": "First Bank of Nigeria",
//   "214": "First City Monument Bank",
//   "00103": "Globus Bank",
//   "058": "Guaranty Trust Bank",
//   "030": "Heritage Bank",
//   "082": "Keystone Bank",
//   "090267": "Kuda Bank",
//   "100004": "Opay",
//   "100033": "PalmPay",
//   "076": "Polaris Bank",
//   "101": "Providus Bank",
//   "221": "Stanbic IBTC Bank",
//   "068": "Standard Chartered Bank",
//   "232": "Sterling Bank",
//   "032": "Union Bank of Nigeria",
//   "033": "United Bank For Africa",
//   "215": "Unity Bank",
//   "090110": "VFD Microfinance Bank",
//   "035": "Wema Bank",
//   "057": "Zenith Bank"
// };



export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "090267" },
  { name: "Opay", code: "100004" },
  { name: "PalmPay", code: "100033" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank For Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD Microfinance Bank", code: "090110" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
] as const;