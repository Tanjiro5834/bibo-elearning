CREATE TABLE IF NOT EXISTS game_scores (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id  BIGINT NOT NULL,
    game_key    VARCHAR(50) NOT NULL,
    score       INT NOT NULL,
    played_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    INDEX idx_game_scores_student (student_id)
);