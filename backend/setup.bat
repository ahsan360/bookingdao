@echo off
echo ========================================
echo   Backend Setup - Command Prompt
echo ========================================
echo.
echo This script will:
echo 1. Install missing dependencies
echo 2. Generate encryption key
echo 3. Run database migration
echo 4. Generate Prisma client
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/5] Installing ioredis...
call npm install ioredis

echo.
echo [2/5] Installing sslcommerz-lts and uuid...
call npm install sslcommerz-lts uuid
call npm install --save-dev @types/uuid

echo.
echo [3/5] Generating encryption key...
echo.
echo ========================================
echo IMPORTANT: Copy the key below!
echo ========================================
node generate-encryption-key.js
echo.
echo ========================================
echo.
echo Please update .env file line 22 with the key above
echo Press any key when you've copied the key...
pause

echo.
echo [4/5] Running database migration...
echo When asked "Ok to proceed? (y)", type: y
echo.
call npx prisma migrate dev --name ssl_commerz_integration

echo.
echo [5/5] Generating Prisma client...
call npx prisma generate

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure you updated .env with the encryption key
echo 2. Start Redis: docker run -d --name my-redis -p 6379:6379 redis:latest
echo 3. Start backend: npm run dev
echo.
echo Press any key to exit...
pause
