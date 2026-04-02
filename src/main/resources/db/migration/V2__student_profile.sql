CREATE TABLE student_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100),
    age INT NOT NULL,
    learning_level VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id)
);