CREATE TABLE IF NOT EXISTS parent_child_links (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NOT NULL,
    child_id BIGINT NOT NULL,
    linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (child_id) REFERENCES users(id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_child_id (child_id),
    UNIQUE KEY uk_parent_child (parent_id, child_id)
);