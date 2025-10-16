-- 初始化数据库Schema
-- 创建用户、题目、提交记录、竞赛等核心表

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY NOT NULL,
    bio TEXT,
    learning_goals TEXT,
    preferred_difficulty VARCHAR(10),
    total_solved INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 题目表
CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    difficulty VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    table_schema TEXT,
    initial_data TEXT,
    default_score INTEGER DEFAULT 100,
    is_published BOOLEAN DEFAULT FALSE,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 测试用例表
CREATE TABLE IF NOT EXISTS test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER NOT NULL,
    input_data TEXT,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 提交记录表
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    sql_code TEXT NOT NULL,
    execution_time INTEGER,
    memory_usage INTEGER,
    score INTEGER,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 提交结果详情表
CREATE TABLE IF NOT EXISTS submission_results (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL,
    test_case_id INTEGER NOT NULL,
    actual_output TEXT,
    is_passed BOOLEAN NOT NULL,
    execution_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 竞赛表
CREATE TABLE IF NOT EXISTS competitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    max_participants INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 竞赛参与者表
CREATE TABLE IF NOT EXISTS competition_participants (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    final_score INTEGER DEFAULT 0,
    final_rank INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 用户题目统计表
CREATE TABLE IF NOT EXISTS user_problem_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    attempts_count INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT FALSE,
    first_solved_at TIMESTAMP,
    last_attempt_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS problems_type_idx ON problems(type);
CREATE INDEX IF NOT EXISTS problems_difficulty_idx ON problems(difficulty);
CREATE INDEX IF NOT EXISTS problems_category_idx ON problems(category);
CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON submissions(user_id);
CREATE INDEX IF NOT EXISTS submissions_problem_id_idx ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions(status);
CREATE INDEX IF NOT EXISTS submissions_submitted_at_idx ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS competition_participants_competition_id_idx ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS competition_participants_user_id_idx ON competition_participants(user_id);