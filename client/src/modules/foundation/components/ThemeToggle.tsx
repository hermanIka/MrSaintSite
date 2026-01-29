import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      data-testid="button-theme-toggle"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="hover-elevate active-elevate-2"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-white" />
      ) : (
        <Sun className="w-5 h-5 text-white" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
