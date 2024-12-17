import { CurrencyTypes } from "./PlayerFeeCategory.schema";

export function getCurrencySymbol(currency: CurrencyTypes): string {
  switch (currency) {
    case CurrencyTypes.USD:
      return "$";
    case CurrencyTypes.EUR:
      return "€";
    case CurrencyTypes.GBP:
      return "£";
    default:
      const _exhaustiveCheck: never = currency;
      return _exhaustiveCheck;
  }
}
