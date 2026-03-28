IF OBJECT_ID(N'dbo.AdminLogin', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.AdminLogin (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(150) NOT NULL,
    role NVARCHAR(50) NOT NULL CONSTRAINT DF_AdminLogin_role DEFAULT 'admin',
    is_active BIT NOT NULL CONSTRAINT DF_AdminLogin_is_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_AdminLogin_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_AdminLogin_updated_at DEFAULT SYSUTCDATETIME()
  );

  CREATE UNIQUE INDEX UX_AdminLogin_username ON dbo.AdminLogin(username);
END
GO
