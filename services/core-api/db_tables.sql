create table users (
    id uuid primary key,
    username varchar(255) unique not null,
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    created_at timestamp default current_timestamp
);

CREATE TABLE mods
(
    id          UUID PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    version     VARCHAR(50),
    author_id   UUID REFERENCES users (id),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table mod_versions (
    id uuid primary key,
    mod_id uuid not null references mods(id) on delete cascade,
    version_tag varchar(50) not null,
    target_device varchar(255),
    android_version varchar(255),
    status varchar(50) default 'pending',
    file_path varchar(255) not null,
    uploaded_at timestamp default current_timestamp
);

create table likes (
    user_id uuid not null references users(id) on delete cascade,
    mod_id uuid not null references mods(id) on delete cascade,
    created_at timestamp default current_timestamp,
    primary key (user_id, mod_id)
);