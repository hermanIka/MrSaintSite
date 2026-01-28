/**
 * CHATBOT COMPONENT - Context Documentation
 * 
 * Responsabilité:
 * Widget de chat flottant permettant aux visiteurs d'interagir
 * avec l'assistant virtuel de Mr Saint.
 * 
 * Composant:
 * - ChatWidget.tsx: Widget flottant en bas à droite de l'écran
 * 
 * Fonctionnalités:
 * - Bouton flottant pour ouvrir/fermer le chat
 * - Historique de conversation dans la session
 * - Interface de chat moderne et responsive
 * - Message de bienvenue automatique
 * - Indicateur de chargement pendant les réponses
 * - Support mobile (largeur adaptative)
 * 
 * État:
 * - isOpen: boolean - Chat ouvert ou fermé
 * - messages: Message[] - Historique de la conversation
 * - inputValue: string - Message en cours de saisie
 * - isLoading: boolean - Attente de réponse
 * - isAvailable: boolean - Service disponible ou non
 * 
 * Intégration:
 * - Intégré dans le Layout (affiché sur toutes les pages)
 * - Communique avec /api/chatbot/chat pour les messages
 * - Vérifie la disponibilité via /api/chatbot/status
 * 
 * Data-testids:
 * - button-toggle-chat: Bouton pour ouvrir/fermer
 * - card-chat-widget: Container du chat
 * - button-close-chat: Bouton fermer (dans l'en-tête)
 * - input-chat-message: Champ de saisie
 * - button-send-message: Bouton envoyer
 * - message-{role}-{index}: Messages individuels
 * 
 * Dernière mise à jour: Module 3 - Chatbot IA
 */

export const chatWidgetContext = {
  component: "ChatWidget",
  module: "interaction",
  type: "floating-widget"
};
