CREATE TABLE users
(
    id            UUID PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50) DEFAULT 'user',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mods
(
    id          UUID PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    author_id   UUID REFERENCES users (id),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mod_versions
(
    id              UUID PRIMARY KEY,
    mod_id          UUID         NOT NULL REFERENCES mods (id) ON DELETE CASCADE,
    version_tag     VARCHAR(50)  NOT NULL,
    target_device   VARCHAR(255),
    android_version VARCHAR(255),
    status          VARCHAR(50) DEFAULT 'pending',
    file_path       VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);