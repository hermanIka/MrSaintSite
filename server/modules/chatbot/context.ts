/**
 * CHATBOT MODULE - Context Documentation
 * 
 * Responsabilité:
 * Ce module gère l'assistant virtuel IA de Mr Saint.
 * Il permet aux visiteurs d'obtenir des réponses instantanées 24/7
 * sur les services, la FAQ, et les informations générales.
 * 
 * Composants:
 * - knowledgeBase.ts: Base de connaissances structurée (services, FAQ, infos)
 * - routes.ts: API endpoint pour les conversations (/api/chatbot/chat)
 * 
 * Fonctionnalités:
 * - Réponses basées sur une base de connaissances contrôlée
 * - Prompt système pour éviter les réponses hors sujet
 * - Historique de conversation (limité à 10 messages)
 * - Limitation de la longueur des messages (500 caractères)
 * - Gestion des erreurs et fallback gracieux
 * 
 * Sécurité:
 * - Clé API stockée en variable d'environnement (OPENAI_API_KEY)
 * - Pas d'exposition de données sensibles
 * - Prompt contrôlé pour éviter les réponses inappropriées
 * - Rate limiting via les limites OpenAI
 * 
 * API Endpoints:
 * - POST /api/chatbot/chat - Envoyer un message et recevoir une réponse
 * - GET /api/chatbot/status - Vérifier la disponibilité du service
 * 
 * Dépendances:
 * - OpenAI API (gpt-4o-mini)
 * - Variable d'environnement: OPENAI_API_KEY
 * 
 * Dernière mise à jour: Module 3 - Chatbot IA
 */

export const chatbotModuleContext = {
  name: "chatbot",
  version: "1.0.0",
  description: "Assistant virtuel IA pour le support client 24/7"
};
