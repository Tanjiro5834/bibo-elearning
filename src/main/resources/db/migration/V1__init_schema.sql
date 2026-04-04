-- V1__init_schema.sql

-- ROLES
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

-- USERS
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BIT(1) NOT NULL,
    role_id BIGINT NOT NULL,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- STUDENT PROFILES
CREATE TABLE student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    age INT NOT NULL,
    learning_level VARCHAR(50) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- SUBJECTS
CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    active BIT(1) NOT NULL
);

-- LESSONS
CREATE TABLE lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    estimated_minutes INT,
    learning_level VARCHAR(50),
    published BIT(1) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_lesson_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- LESSON SECTIONS
CREATE TABLE lesson_sections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT,
    title VARCHAR(150),
    content TEXT NOT NULL,
    content_order INT NOT NULL,
    content_type VARCHAR(30) NOT NULL,
    CONSTRAINT fk_section_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- LESSON PROGRESS
CREATE TABLE lesson_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    progress_percent INT NOT NULL,
    current_section_order INT NOT NULL,
    last_accessed_at DATETIME,
    completed_at DATETIME,
    CONSTRAINT fk_progress_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id),
    CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- QUIZ
CREATE TABLE quiz (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description VARCHAR(255),
    passing_score INT NOT NULL,
    lesson_id BIGINT,
    CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- QUESTION
CREATE TABLE question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(255),
    quiz_id BIGINT,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quiz(id)
);

-- CHOICES
CREATE TABLE choices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    choice_text VARCHAR(255),
    is_correct BIT(1) NOT NULL,
    question_id BIGINT,
    CONSTRAINT fk_choice_question FOREIGN KEY (question_id) REFERENCES question(id)
);

-- QUIZ ATTEMPT
CREATE TABLE quiz_attempt (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT,
    quiz_id BIGINT,
    score INT NOT NULL,
    total_items INT NOT NULL,
    passed BIT(1) NOT NULL,
    attempted_at DATETIME,
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES student_profiles(id),
    CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES quiz(id)
);