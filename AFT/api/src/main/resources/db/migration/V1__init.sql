

CREATE TABLE users (
    id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE email_verifications(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE refresh_tokens(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);

CREATE TABLE projects
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_url VARCHAR(255) NOT NULL,
    card_color VARCHAR(20)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_project_user ON projects(user_id);


CREATE TABLE modules(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_modules_project ON modules(project_id);
CREATE INDEX idx_modules_name ON modules(name);


CREATE TABLE scenarios(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    CHECK ( status IN ('DRAFT','READY') ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_scenarios_module ON scenarios(module_id);

CREATE TABLE steps(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    action VARCHAR(45) NOT NULL,
    selector JSONB,
    value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_steps_scenario ON steps(scenario_id);
CREATE UNIQUE INDEX idx_steps_order ON steps(scenario_id, step_order);


CREATE TABLE test_runs(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
    CHECK(status IN ('QUEUED', 'RUNNING', 'PASSED', 'FAILED')),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    total_steps INT NOT NULL DEFAULT 0,
    passed_steps INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_runs_scenario ON test_runs(scenario_id);
CREATE INDEX idx_runs_created ON test_runs(created_at DESC);


CREATE TABLE step_results(
    id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
    passed BOOLEAN NOT NULL,
    error_message TEXT,
    screenshot_key VARCHAR(500),
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_results_run ON step_results(test_run_id);


CREATE TABLE scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    cron_expression VARCHAR(100) NOT NULL,
    active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_scheduled_active ON scheduled_tasks(active);






