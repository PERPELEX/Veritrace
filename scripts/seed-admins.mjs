import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import sql from "mssql";

dotenv.config({ path: ".env.local" });
dotenv.config();

const required = ["DB_SERVER", "DB_USER", "DB_PASSWORD"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME ?? "master",
  options: {
    encrypt: process.env.DB_ENCRYPT !== "false",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
  },
};

const admins = [
  {
    username: "admin_primary",
    fullName: "Primary Administrator",
    role: "admin",
    password: "Admin@12345",
  },
  {
    username: "admin_security",
    fullName: "Security Administrator",
    role: "admin",
    password: "Admin@54321",
  },
];

const createTableSql = `
IF OBJECT_ID(N'dbo.AdminLogin', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.AdminLogin (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(150) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
`;

const upsertSql = `
MERGE dbo.AdminLogin AS target
USING (SELECT @username AS username) AS source
ON target.username = source.username
WHEN MATCHED THEN
  UPDATE SET
    password_hash = @password_hash,
    full_name = @full_name,
    role = @role,
    is_active = 1,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (username, password_hash, full_name, role, is_active)
  VALUES (@username, @password_hash, @full_name, @role, 1);
`;

async function run() {
  const pool = await sql.connect(config);

  try {
    await pool.request().query(createTableSql);

    for (const admin of admins) {
      const passwordHash = await bcrypt.hash(admin.password, 12);
      await pool
        .request()
        .input("username", sql.NVarChar(100), admin.username)
        .input("password_hash", sql.NVarChar(255), passwordHash)
        .input("full_name", sql.NVarChar(150), admin.fullName)
        .input("role", sql.NVarChar(50), admin.role)
        .query(upsertSql);
    }

    console.log("Admin login table ensured and default admins upserted.");
  } finally {
    await pool.close();
  }
}

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
