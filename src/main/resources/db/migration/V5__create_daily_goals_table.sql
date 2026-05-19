CREATE TABLE IF NOT EXISTS daily_goals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NOT NULL,
    child_id BIGINT NOT NULL,
    goal_count INT NOT NULL,
    goal INT NOT NULL,
    updated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (child_id) REFERENCES users(id),
    INDEX idx_parent_child (parent_id, child_id)
);