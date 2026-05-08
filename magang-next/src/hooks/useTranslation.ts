import { useLanguage } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

const translations = { en, id };

type TranslationKey = keyof typeof id;

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    // Check if key exists in the translations, fallback to key if not found
    return (translations[language] as Record<string, string>)[key as string] || key as string;
  };

  return { t, language };
}
