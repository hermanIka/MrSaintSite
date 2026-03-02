import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Trips schema
export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  date: text("date").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  itinerary: text("itinerary").array().notNull(),
  included: text("included").array().notNull(),
  notIncluded: text("not_included").array().notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

// Trip Gallery Photos schema
export const tripGalleryPhotos = pgTable("trip_gallery_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertTripGalleryPhotoSchema = createInsertSchema(tripGalleryPhotos).omit({
  id: true,
});

export type InsertTripGalleryPhoto = z.infer<typeof insertTripGalleryPhotoSchema>;
export type TripGalleryPhoto = typeof tripGalleryPhotos.$inferSelect;

// Testimonials schema
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  business: text("business").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Portfolio schema - enriched for dynamic content
export const portfolio = pgTable("portfolio", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(), // visa, agence, voyage
  category: text("category").notNull(), // Type de client/projet
  result: text("result").notNull(), // Résultat obtenu
  year: text("year").notNull(), // Année/période
  imageUrl: text("image_url").notNull(),
  clientLogo: text("client_logo"), // Logo optionnel
  status: text("status").notNull().default("published"), // draft, published
  createdAt: text("created_at").notNull(),
});

export const insertPortfolioSchema = createInsertSchema(portfolio).omit({
  id: true,
});

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolio.$inferSelect;

// Service types for portfolio filtering
export const SERVICE_TYPES = [
  { value: "visa", label: "Facilitation Visa" },
  { value: "agence", label: "Création d'Agence" },
  { value: "voyage", label: "Voyage d'Affaires" },
] as const;

// Admin schema
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

// Activity Log schema
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: text("details"),
  adminId: text("admin_id").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// FAQ schema
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
});

export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// Services schema - for admin-managed services with dynamic pricing
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // visa, agence, consultation, voyage
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  price: integer("price").notNull(), // Prix en euros (entier)
  priceLabel: text("price_label").notNull(), // "À partir de", "Programme complet", etc.
  priceUnit: text("price_unit"), // "/ session", "/ personne", null
  category: text("category").notNull(), // visa, formation, consultation, voyage
  features: text("features").array().notNull(), // Liste des avantages
  imageUrl: text("image_url"),
  iconName: text("icon_name").notNull(), // Nom de l'icône lucide
  ctaText: text("cta_text").notNull(), // Texte du bouton d'action
  ctaLink: text("cta_link").notNull(), // Lien du bouton
  order: integer("order").notNull().default(0),
  status: text("status").notNull().default("published"), // draft, published
  createdAt: text("created_at").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Service categories
export const SERVICE_CATEGORIES = [
  { value: "visa", label: "Facilitation Visa" },
  { value: "formation", label: "Formation / Coaching" },
  { value: "consultation", label: "Consultation" },
  { value: "voyage", label: "Voyages" },
] as const;

// Credit Travel Request schema
export const creditTravelRequests = pgTable("credit_travel_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Section 1 - Informations personnelles
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  birthDate: text("birth_date").notNull(),
  nationality: text("nationality").notNull(),
  countryOfResidence: text("country_of_residence").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  
  // Section 2 - Situation professionnelle
  professionalStatus: text("professional_status").notNull(),
  profession: text("profession").notNull(),
  monthlyIncome: text("monthly_income").notNull(),
  professionalSeniority: text("professional_seniority").notNull(),
  
  // Section 3 - Projet de voyage
  destination: text("destination").notNull(),
  tripType: text("trip_type").notNull(),
  departureDate: text("departure_date").notNull(),
  stayDuration: text("stay_duration").notNull(),
  estimatedBudget: integer("estimated_budget").notNull(),
  creditAmount: integer("credit_amount").notNull(),
  hasPersonalContribution: boolean("has_personal_contribution").notNull().default(false),
  personalContributionAmount: integer("personal_contribution_amount"),
  
  // Section 4 - Remboursement
  creditDuration: text("credit_duration").notNull(),
  repaymentMethod: text("repayment_method").notNull(),
  repaymentFrequency: text("repayment_frequency").notNull(),
  
  // Section 5 - Documents (chemins sécurisés)
  identityDocumentUrl: text("identity_document_url").notNull(),
  incomeProofUrl: text("income_proof_url").notNull(),
  addressProofUrl: text("address_proof_url").notNull(),
  recentPhotoUrl: text("recent_photo_url").notNull(),
  explanatoryLetterUrl: text("explanatory_letter_url"),
  
  // Métadonnées
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertCreditTravelRequestSchema = createInsertSchema(creditTravelRequests).omit({
  id: true,
});

export type InsertCreditTravelRequest = z.infer<typeof insertCreditTravelRequestSchema>;
export type CreditTravelRequest = typeof creditTravelRequests.$inferSelect;

// Constants for Credit Travel Request
export const PROFESSIONAL_STATUS_OPTIONS = [
  { value: "salarie", label: "Salarié" },
  { value: "independant", label: "Indépendant" },
  { value: "fonctionnaire", label: "Fonctionnaire" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "etudiant", label: "Étudiant" },
] as const;

export const TRIP_TYPE_OPTIONS = [
  { value: "tourisme", label: "Tourisme" },
  { value: "etudes", label: "Études" },
  { value: "soins", label: "Soins médicaux" },
  { value: "regroupement_familial", label: "Regroupement familial" },
  { value: "autre", label: "Autre" },
] as const;

export const CREDIT_DURATION_OPTIONS = [
  { value: "3", label: "3 mois" },
  { value: "6", label: "6 mois" },
  { value: "9", label: "9 mois" },
  { value: "12", label: "12 mois" },
] as const;

export const REPAYMENT_METHOD_OPTIONS = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "virement", label: "Virement bancaire" },
] as const;

export const REPAYMENT_FREQUENCY_OPTIONS = [
  { value: "mensuelle", label: "Mensuelle" },
  { value: "bimensuelle", label: "Bimensuelle" },
] as const;

export const CREDIT_REQUEST_STATUS = [
  { value: "pending", label: "En attente", color: "bg-yellow-500" },
  { value: "approved", label: "Approuvée", color: "bg-green-500" },
  { value: "rejected", label: "Rejetée", color: "bg-red-500" },
] as const;

// ==========================================
// PAYMENTS MODULE - Persistent payment records
// ==========================================

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey(),
  provider: text("provider").notNull(),
  externalId: text("external_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull().default("pending"),
  serviceId: text("service_id").notNull(),
  serviceName: text("service_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  paymentMode: text("payment_mode").notNull().default("direct"),
  source: text("source").notNull().default("reservation"),
  metadata: text("metadata"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments);

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ==========================================
// GO+ MODULE - Cartes virtuelles de fidélité
// ==========================================

export const goPlusPlans = pgTable("go_plus_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // En centimes (ex: 1000 = 10€)
  currency: text("currency").notNull().default("EUR"),
  discountPercentage: integer("discount_percentage").notNull(),
  privileges: text("privileges").notNull(), // JSON stringifié
  durationDays: integer("duration_days").notNull().default(365),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const insertGoPlusPlanSchema = createInsertSchema(goPlusPlans).omit({
  id: true,
});

export type InsertGoPlusPlan = z.infer<typeof insertGoPlusPlanSchema>;
export type GoPlusPlan = typeof goPlusPlans.$inferSelect;

export const goPlusCards = pgTable("go_plus_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Email de l'acheteur
  planId: varchar("plan_id").notNull(),
  cardNumber: varchar("card_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending / active / expired / suspended
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertGoPlusCardSchema = createInsertSchema(goPlusCards).omit({
  id: true,
});

export type InsertGoPlusCard = z.infer<typeof insertGoPlusCardSchema>;
export type GoPlusCard = typeof goPlusCards.$inferSelect;

export const goPlusTransactions = pgTable("go_plus_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Email de l'acheteur
  planId: varchar("plan_id").notNull(),
  provider: text("provider").notNull(), // maishapay / pawapay
  providerPaymentId: text("provider_payment_id"),
  amount: integer("amount").notNull(), // En centimes
  currency: text("currency").notNull().default("EUR"),
  status: text("status").notNull().default("pending"), // pending / paid / failed
  rawWebhookPayload: text("raw_webhook_payload"), // JSON stringifié
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertGoPlusTransactionSchema = createInsertSchema(goPlusTransactions).omit({
  id: true,
});

export type InsertGoPlusTransaction = z.infer<typeof insertGoPlusTransactionSchema>;
export type GoPlusTransaction = typeof goPlusTransactions.$inferSelect;

// ==========================================
// CHATBOT MODULE - Tables sécurisées
// ==========================================

// Table pour stocker les conversations du chatbot
export const chatbotConversations = pgTable("chatbot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(), // Identifiant de session unique
  messages: text("messages").notNull(), // JSON stringifié des messages
  messageCount: integer("message_count").notNull().default(0),
  mode: text("mode").notNull().default("rules"), // "rules" ou "ai"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations).omit({
  id: true,
});

export type InsertChatbotConversation = z.infer<typeof insertChatbotConversationSchema>;
export type ChatbotConversation = typeof chatbotConversations.$inferSelect;

// Table pour le prompt système du chatbot (versionnée)
export const chatbotSystemPrompts = pgTable("chatbot_system_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  version: text("version").notNull(), // ex: "1.0", "1.1", "2.0"
  name: text("name").notNull(), // Nom descriptif du prompt
  content: text("content").notNull(), // Contenu complet du prompt système
  active: boolean("active").notNull().default(false), // Une seule version active à la fois
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertChatbotSystemPromptSchema = createInsertSchema(chatbotSystemPrompts).omit({
  id: true,
});

export type InsertChatbotSystemPrompt = z.infer<typeof insertChatbotSystemPromptSchema>;
export type ChatbotSystemPrompt = typeof chatbotSystemPrompts.$inferSelect;

// ==========================================
// VISA REQUESTS MODULE
// ==========================================

export const visaRequests = pgTable("visa_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  nationality: text("nationality").notNull(),
  birthDate: text("birth_date").notNull(),
  visaType: text("visa_type").notNull(), // tourisme, business, etudes, travail
  destination: text("destination").notNull(),
  passportUrl: text("passport_url").notNull(),
  photoUrl: text("photo_url").notNull(),
  supportingDocUrl: text("supporting_doc_url"),
  paymentId: text("payment_id"),
  paymentMethod: text("payment_method"), // maishapay, pawapay
  amount: integer("amount").notNull().default(75),
  status: text("status").notNull().default("pending"), // pending, processing, approved, rejected
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertVisaRequestSchema = createInsertSchema(visaRequests).omit({
  id: true,
});

export type InsertVisaRequest = z.infer<typeof insertVisaRequestSchema>;
export type VisaRequest = typeof visaRequests.$inferSelect;

export const VISA_TYPES = [
  { value: "tourisme", label: "Tourisme" },
  { value: "business", label: "Business" },
  { value: "etudes", label: "Études" },
  { value: "travail", label: "Travail" },
] as const;

export const VISA_REQUEST_STATUS = [
  { value: "pending", label: "En attente", color: "bg-yellow-500" },
  { value: "processing", label: "En cours", color: "bg-blue-500" },
  { value: "approved", label: "Approuvée", color: "bg-green-500" },
  { value: "rejected", label: "Rejetée", color: "bg-red-500" },
] as const;

// ============ AGENCY REQUESTS ============

export const agencyRequests = pgTable("agency_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lastName: text("last_name").notNull(),
  firstName: text("first_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  nationality: text("nationality").notNull(),
  birthDate: text("birth_date").notNull(),
  packName: text("pack_name").notNull(), // classique, premium, elite
  packPrice: integer("pack_price").notNull(), // prix accompagnement en euros
  message: text("message"), // motivation optionnelle
  paymentId: text("payment_id"),
  paymentMethod: text("payment_method"), // maishapay, pawapay
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, approved, rejected
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertAgencyRequestSchema = createInsertSchema(agencyRequests).omit({
  id: true,
});

export type InsertAgencyRequest = z.infer<typeof insertAgencyRequestSchema>;
export type AgencyRequest = typeof agencyRequests.$inferSelect;

// Service prices schema
export const servicePrices = pgTable("service_prices", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  amount: integer("amount").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const insertServicePriceSchema = createInsertSchema(servicePrices).omit({ id: true });
export type InsertServicePrice = z.infer<typeof insertServicePriceSchema>;
export type ServicePrice = typeof servicePrices.$inferSelect;

export const AGENCY_PACKS = [
  {
    value: "classique",
    label: "Agence Classique",
    price: 800,
    startBudget: "2 000€",
    description: "Lancer ton agence avec 2 000€",
    accompagnementDescription: "Frais d'accompagnement pour la création de votre agence de voyage",
    highlighted: false,
    revenue: "1 500€ – 2 500€ / mois",
    features: [
      "Définition de la cible et du nom de votre agence",
      "Stratégie marketing adaptée à votre niche",
      "Plan de rentabilité en 2 à 3 mois",
    ],
  },
  {
    value: "premium",
    label: "Agence Premium",
    price: 1500,
    startBudget: "6 000€",
    description: "Lancer ton agence avec 6 000€",
    accompagnementDescription: "Frais d'accompagnement et coaching personnalisé.",
    highlighted: true,
    revenue: "2 500€ – 5 000€ / mois",
    features: [
      "Création complète : nom, emplacement et type d'agence",
      "Stratégie marketing et coaching personnalisé",
      "Formation de vos agents",
      "Accès aux partenaires : hôtels, vols, transport",
      "Accompagnement sur 6 mois",
    ],
  },
  {
    value: "elite",
    label: "Agence Elite",
    price: 2500,
    startBudget: "10 000€",
    description: "Lancer ton agence avec 10 000€",
    accompagnementDescription: "Frais d'accompagnement complet avec gestion d'agence et intégration au réseau Go Groupe",
    highlighted: false,
    revenue: "25 000€ – 50 000€ / mois",
    features: [
      "Tout ce qui est inclus dans le forfait Premium",
      "Réseau Go Groupe et avantages exclusifs",
      "Tourisme + conciergerie (Airbnb & gestion propriétés)",
      "Gestion complète de votre agence",
      "Stratégie pour maximiser partenariats et ventes",
    ],
  },
] as const;
