ALTER TABLE daily_goals ADD UNIQUE KEY uk_daily_goals_parent_child (parent_id, child_id);
ALTER TABLE daily_goals DROP INDEX idx_parent_child;