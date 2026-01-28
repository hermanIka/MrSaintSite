/**
 * FOUNDATION MODULE CONTEXT
 * 
 * Domaine: Infrastructure de base de l'application
 * 
 * Responsabilités:
 * - Layout principal et structure des pages
 * - Navigation et routing
 * - Thème et apparence (dark/light mode)
 * - Composants partagés de structure (Header, Footer)
 * 
 * Ce module NE contient PAS de logique métier.
 * Il fournit uniquement l'infrastructure UI de base.
 */

export const FOUNDATION_MODULE = {
  name: 'foundation',
  description: 'Infrastructure de base - layout, navigation, thème',
  components: [
    'Layout',
    'Navigation', 
    'Footer',
    'ThemeProvider',
    'ThemeToggle'
  ]
} as const;
