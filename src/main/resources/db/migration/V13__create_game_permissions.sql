CREATE TABLE IF NOT EXISTS game_permissions (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id  BIGINT NOT NULL,
    game_key    VARCHAR(50) NOT NULL,
    allowed     BIT(1) NOT NULL DEFAULT 0,
    granted_by  BIGINT NULL,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_game_perm_student_game (student_id, game_key),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (granted_by) REFERENCES users(id)
);