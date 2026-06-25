ALTER TABLE  steps
ADD COLUMN included_scenario_id UUID
REFERENCES scenarios(id) ON DELETE RESTRICT ;

CREATE INDEX idx_steps_included_scenario_id ON steps(included_scenario_id);