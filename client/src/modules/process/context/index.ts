/**
 * PROCESS MODULE CONTEXT
 * 
 * Domaine: Processus métier
 * 
 * Responsabilités:
 * - Processus de facilitation visa
 * - Processus de création d'agence
 * - Parcours client pour les services
 * 
 * Ce module décrit les étapes des services proposés.
 * Il NE gère PAS les paiements (voir module transaction).
 */

export const PROCESS_MODULE = {
  name: 'process',
  description: 'Processus métier - visa, création agence',
  processes: [
    'FacilitationVisa',
    'CreationAgence'
  ],
  futureProcesses: ['FormationEnLigne']
} as const;
