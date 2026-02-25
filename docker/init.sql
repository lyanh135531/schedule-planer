-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== COURSE TYPES TABLE ====================
CREATE TABLE IF NOT EXISTS course_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    default_required_count INTEGER NOT NULL,
    registration_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default course types with TalkFirst API keys
INSERT INTO course_types (name, display_name, default_required_count, registration_order) VALUES
    ('MAIN-CLASS', 'Main Class', 3, 1),
    ('FREE-TALK', 'Free Talk', 1, 2),
    ('SKILLACTIVITIES', 'Skills & Activities', 0, 3)
ON CONFLICT (name) DO NOTHING;

-- ==================== USER COURSE SETTINGS TABLE ====================
CREATE TABLE IF NOT EXISTS user_course_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_type_id UUID NOT NULL REFERENCES course_types(id),
    required_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_type_id)
);

-- ==================== USER COURSE PLANS TABLE ====================
CREATE TABLE IF NOT EXISTS user_course_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_course_id TEXT NOT NULL,
    course_code TEXT,
    course_name TEXT NOT NULL,
    course_type_id UUID REFERENCES course_types(id),
    day TEXT NOT NULL,
    time_slot_label TEXT,
    start_time TEXT,
    end_time TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('primary', 'backup')),
    priority_order INTEGER,
    linked_primary_id UUID REFERENCES user_course_plans(id),
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'registered', 'failed', 'skipped')),
    registered_at TIMESTAMPTZ,
    failed_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SUBMISSION HISTORY TABLE ====================
CREATE TABLE IF NOT EXISTS submission_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    plan_id UUID REFERENCES user_course_plans(id),
    submission_date DATE NOT NULL,
    attempt_order INTEGER,
    result TEXT NOT NULL CHECK (result IN ('success', 'failed', 'skipped')),
    reason TEXT,
    api_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_user_course_settings_user ON user_course_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_plans_user ON user_course_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_plans_external ON user_course_plans(external_course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_plans_status ON user_course_plans(status);
CREATE INDEX IF NOT EXISTS idx_submission_history_user ON submission_history(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_history_date ON submission_history(submission_date);
