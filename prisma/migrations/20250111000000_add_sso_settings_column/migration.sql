-- Add settings column to SSOConfiguration table
ALTER TABLE "SSOConfiguration" ADD COLUMN "settings" JSONB NOT NULL DEFAULT '{}';
