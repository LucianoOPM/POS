import { z } from "zod";

// ERP Settings Schema
export const erpSettingsSchema = z.object({
  "erp.enabled": z.coerce.boolean(),
  "erp.server_url": z.string().url("URL invalida").or(z.literal("")),
  "erp.api_key": z.string().optional(),
  "erp.sync_interval": z.coerce
    .number()
    .min(1, "Minimo 1 minuto")
    .max(1440, "Maximo 24 horas (1440 min)"),
});

// Business Settings Schema
export const businessSettingsSchema = z.object({
  "business.name": z.string().max(200),
  "business.address": z.string().max(500).optional(),
  "business.phone": z.string().max(20).optional(),
  "business.tax_id": z.string().max(20).optional(),
  "business.email": z.string().email("Email invalido").or(z.literal("")),
});

// Sales Settings Schema
export const salesSettingsSchema = z.object({
  "sales.default_tax_rate": z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .max(1, "Maximo 100% (1.0)"),
  "sales.allow_discounts": z.coerce.boolean(),
  "sales.max_discount_percent": z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .max(100, "Maximo 100%"),
  "sales.prices_include_tax": z.coerce.boolean(),
});

// Inventory Settings Schema
export const inventorySettingsSchema = z.object({
  "inventory.low_stock_alerts": z.coerce.boolean(),
  "inventory.low_stock_threshold": z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .int("Debe ser un numero entero"),
});

// Receipt Settings Schema
export const receiptSettingsSchema = z.object({
  "receipt.show_logo": z.coerce.boolean(),
  "receipt.footer_text": z.string().max(500).optional(),
  "receipt.thank_you_message": z.string().max(200).optional(),
});

export type ErpSettingsData = z.infer<typeof erpSettingsSchema>;
export type BusinessSettingsData = z.infer<typeof businessSettingsSchema>;
export type SalesSettingsData = z.infer<typeof salesSettingsSchema>;
export type InventorySettingsData = z.infer<typeof inventorySettingsSchema>;
export type ReceiptSettingsData = z.infer<typeof receiptSettingsSchema>;
