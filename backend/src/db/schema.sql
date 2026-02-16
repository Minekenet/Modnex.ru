-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    password_hash VARCHAR(255), -- Nullable for social login
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url VARCHAR(255),
    banner_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(10),
    verification_expires TIMESTAMP WITH TIME ZONE,
    google_id VARCHAR(255) UNIQUE,
    yandex_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Games Table (Global Settings)
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    cover_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sections Table (Dynamic Tabs like Mods, Skins, etc.)
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    slug VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    ui_config JSONB DEFAULT '{}'::jsonb, -- Controls Frontend Layout (card_type, details_layout)
    filter_config JSONB DEFAULT '[]'::jsonb, -- Defines available filters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, slug)
);

-- Items Table (Mods, Skins, Maps - Generic Entity)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    summary VARCHAR(255),
    description TEXT,
    attributes JSONB DEFAULT '{}'::jsonb, -- Stores dynamic filter values (loader: fabric, etc)
    stats JSONB DEFAULT '{"downloads": 0, "likes": 0, "views": 0}'::jsonb,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section_id, slug)
);

-- Files Table (Downloadable versions)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL, -- S3 Key/URL
    changelog TEXT,
    data JSONB DEFAULT '{}'::jsonb, -- Hash, size, virus_status
    download_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gallery Table (Images)
CREATE TABLE IF NOT EXISTS item_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(20) DEFAULT 'image', -- image, video, sketchfab
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_items_attributes ON items USING GIN (attributes);
CREATE INDEX IF NOT EXISTS idx_items_section_id ON items(section_id);
CREATE INDEX IF NOT EXISTS idx_items_slug ON items(slug);
CREATE INDEX IF NOT EXISTS idx_sections_game_id ON sections(game_id);

-- User Favorite Games Table
CREATE TABLE IF NOT EXISTS user_favorite_games (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_user_fav_user_id ON user_favorite_games(user_id);
