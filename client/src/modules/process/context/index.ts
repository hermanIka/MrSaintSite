/**
 * PROCESS MODULE CONTEXT
 * 
 * Domaine: Processus métier et offres de services
 * 
 * Responsabilités:
 * - Page Services/Offres (ServicesPage)
 * - Processus de facilitation visa (FacilitationVisaPage)
 * - Processus de création d'agence (CreationAgencePage)
 * - Parcours client pour les services
 * 
 * Ce module décrit les étapes des services proposés.
 * Il NE gère PAS les paiements (voir module transaction).
 */

export const PROCESS_MODULE = {
  name: 'process',
  description: 'Processus métier - services, visa, création agence',
  pages: ['ServicesPage', 'FacilitationVisaPage', 'CreationAgencePage'],
  processes: [
    'FacilitationVisa',
    'CreationAgence',
    'VoyagesOrganisés'
  ],
  futureProcesses: ['FormationEnLigne']
} as const;
