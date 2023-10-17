@echo off
cd /d %~dp0
echo Server running...
echo ---------------------------------------------------------------------
@REM Platform kontrolü
if "%OS%"=="Windows_NT" (
  @REM Windows
  echo Detected Windows...

  @REM Eğer npm yüklü değilse, yükleyin
  where npm || (
    echo npm downloaded...
    powershell -Command "& { iwr -useb https://npmjs.org/install.sh | iex }"
  )

  @REM Eğer nodemon yüklü değilse, yükleyin
  where nodemon || (
    echo nodemon downloaded...
    npm install -g nodemon
  )
) else (
  echo Detected Linux...

  command -v npm >/dev/null 2>&1 || {
    echo npm downloaded...
    bash -c "$(curl -fsSL https://npmjs.org/install.sh)"
  }

  command -v nodemon >/dev/null 2>&1 || {
    echo nodemon downloaded...
    npm install -g nodemon
  }
)
echo ---------------------------------------------------------------------

@REM Bağımlılıkları kontrol et
if not exist node_modules\NUL (
  echo Downloaded node_modules...
  pnpm install || npm install
) else (
  echo Node modules already installed. APP Starting...
  pnpm run nodemon || npm run nodemon
)

pause