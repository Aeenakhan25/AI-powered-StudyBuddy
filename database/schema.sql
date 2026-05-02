IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ai_study_assistant')
BEGIN
    CREATE DATABASE ai_study_assistant;
END
GO

USE ai_study_assistant;
GO

-- Users table: Securely stores user identity
IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- Notes table: Linked to specific users
IF OBJECT_ID('dbo.notes', 'U') IS NULL
BEGIN
    CREATE TABLE notes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        folder VARCHAR(50) DEFAULT 'General',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- Chats table: Persists history of interactions between user and AI
IF OBJECT_ID('dbo.chats', 'U') IS NULL
BEGIN
    CREATE TABLE chats (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- Quizzes table: Metadata for each quiz session
IF OBJECT_ID('dbo.quizzes', 'U') IS NULL
BEGIN
    CREATE TABLE quizzes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        note_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        score INT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Note: multiple cascading paths might cause issues in SQL Server depending on other tables. If so, remove ON DELETE CASCADE here.
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE NO ACTION
    );
END
GO

-- Quiz Questions table: Stores individual questions for a quiz (Normalized)
IF OBJECT_ID('dbo.quiz_questions', 'U') IS NULL
BEGIN
    CREATE TABLE quiz_questions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        options NVARCHAR(MAX) NOT NULL, -- Array of 4 strings stored as JSON
        correct_answer VARCHAR(255) NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );
END
GO

-- Flashcards table: Includes next_review_date for spaced repetition
IF OBJECT_ID('dbo.flashcards', 'U') IS NULL
BEGIN
    CREATE TABLE flashcards (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        note_id INT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        next_review_date DATE,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE NO ACTION
    );
END
GO

-- Study Plans table: Tasks and deadlines
IF OBJECT_ID('dbo.study_plans', 'U') IS NULL
BEGIN
    CREATE TABLE study_plans (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(100),
        description TEXT,
        deadline DATE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'archived')),
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- Progress table: Tracks performance metrics
IF OBJECT_ID('dbo.progress', 'U') IS NULL
BEGIN
    CREATE TABLE progress (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        quiz_scores NVARCHAR(MAX), -- Array of scores for that day stored as JSON
        study_hours DECIMAL(4,2) DEFAULT 0.00,
        tasks_completed INT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO
