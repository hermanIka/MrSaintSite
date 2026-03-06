import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const toggle = () => {
    i18n.changeLanguage(isEn ? "fr" : "en");
  };

  return (
    <Button
      data-testid="button-language-toggle"
      variant="ghost"
      size="default"
      onClick={toggle}
      className="text-white font-semibold text-sm px-3"
      aria-label="Switch language"
    >
      {isEn ? "FR" : "EN"}
    </Button>
  );
}
