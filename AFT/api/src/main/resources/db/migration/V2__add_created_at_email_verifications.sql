ALTER TABLE email_verifications
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE steps RENAME COLUMN selector TO selectors;