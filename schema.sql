-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'student', 'teacher', 'admin'
    coin_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar Events Table
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_type VARCHAR(20) NOT NULL, -- 'lecture', 'exam', 'workshop'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Join table for event participants
CREATE TABLE event_participants (
    event_id INTEGER REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

-- Math Problems Table
CREATE TABLE math_problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
    topic VARCHAR(50) NOT NULL,
    correct_answer TEXT NOT NULL, -- Store securely if sensitive
    point_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Problem Attempts Table
CREATE TABLE user_problem_attempts (
    id SERIAL PRIMARY KEY, -- Added primary key for easier reference if needed
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES math_problems(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Consider unique constraint if user can only attempt once: UNIQUE(user_id, problem_id)
);

-- Visualizations Table
CREATE TABLE visualizations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    visualization_type VARCHAR(20) NOT NULL, -- 'graph', 'simulation'
    data_payload JSONB NOT NULL, -- Use JSONB for efficiency
    topic VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Posts Table
CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Or CASCADE
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Comments Table
CREATE TABLE forum_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Or CASCADE
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reward Actions Table (Lookup table for reward types)
CREATE TABLE reward_actions (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'solve_easy_problem', 'create_forum_post'
    coin_value INTEGER NOT NULL
);

-- User Rewards History Table (Log of earned rewards)
CREATE TABLE user_rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) REFERENCES reward_actions(action_type), -- Link to action type
    coins_earned INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --- Initial Data (Example) ---
-- INSERT INTO reward_actions (action_type, coin_value) VALUES
-- ('solve_easy_problem', 5),
-- ('solve_medium_problem', 10),
-- ('solve_hard_problem', 20),
-- ('create_forum_post', 2),
-- ('create_forum_comment', 1);


