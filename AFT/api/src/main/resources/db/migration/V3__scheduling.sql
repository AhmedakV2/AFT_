ALTER TABLE scheduled_tasks ADD COLUMN next_fire_at TIMESTAMPTZ;
ALTER TABLE scheduled_tasks ADD COLUMN last_fired_at TIMESTAMPTZ;

CREATE INDEX idx_scheduled_due ON scheduled_tasks(active, next_fire_at);

CREATE TABLE shedlock (
                          name       VARCHAR(64)  NOT NULL,
                          lock_until TIMESTAMPTZ  NOT NULL,
                          locked_at  TIMESTAMPTZ  NOT NULL,
                          locked_by  VARCHAR(255) NOT NULL,
                          PRIMARY KEY (name)
);