export const defaultVendorPricingConfig = {
  paperPrices: [
    { size: "A4", bw: 2, color: 8 },
    { size: "A3", bw: 4, color: 15 },
  ],
  gsmPrices: [
    { gsm: "75 GSM", add: 0 },
    { gsm: "100 GSM", add: 1 },
    { gsm: "120 GSM", add: 2 },
  ],
  finishingPrices: [
    { item: "Duplex Printing (per sheet)", price: 1, enabled: true },
    { item: "Spiral Binding", price: 30, enabled: true },
    { item: "Soft Binding", price: 45, enabled: true },
    { item: "Hard Binding", price: 80, enabled: true },
    { item: "Lamination", price: 20, enabled: true },
  ],
};

export function getDefaultVendorPricingConfig() {
  return JSON.parse(JSON.stringify(defaultVendorPricingConfig));
}
