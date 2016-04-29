CREATE TABLE "USERS" (
  "ID" INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY (START WITH 1, INCREMENT BY 1),
  "LOGIN" VARCHAR(255),
  "NAME" VARCHAR(200),
  "EMAIL" VARCHAR(100),
  "CRYPTED_PASSWORD" VARCHAR(40),
  "SALT" VARCHAR(40),
  "REMEMBER_TOKEN" VARCHAR(500),
  "REMEMBER_TOKEN_EXPIRES_AT" TIMESTAMP,
  "ACTIVE" BOOLEAN DEFAULT TRUE,
  "SCM_ACCOUNTS" VARCHAR(4000),
  "EXTERNAL_IDENTITY" VARCHAR(255),
  "EXTERNAL_IDENTITY_PROVIDER" VARCHAR(100),
  "USER_LOCAL" BOOLEAN,
  "CREATED_AT" BIGINT,
  "UPDATED_AT" BIGINT
);

CREATE TABLE "PROPERTIES" (
  "ID" INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY (START WITH 1, INCREMENT BY 1),
  "PROP_KEY" VARCHAR(512),
  "RESOURCE_ID" INTEGER,
  "TEXT_VALUE" CLOB(2147483647),
  "USER_ID" INTEGER
);
