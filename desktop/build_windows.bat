@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Forma Inventory - Windows build
echo  -------------------------------
echo.

where py >nul 2>nul
if errorlevel 1 (
  echo Python launcher "py" was not found. Install Python 3.10+ from python.org
  echo and make sure "Add Python to PATH" is selected.
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo Creating virtual environment...
  py -3 -m venv .venv || goto :error
)

echo Installing runtime and build dependencies...
call ".venv\Scripts\python.exe" -m pip install --upgrade pip
call ".venv\Scripts\python.exe" -m pip install -r requirements.txt pyinstaller || goto :error

echo.
echo Running PyInstaller...
call ".venv\Scripts\pyinstaller.exe" --noconfirm --clean FormaInventory.spec || goto :error

echo.
echo Build complete:
echo   dist\Forma Inventory\Forma Inventory.exe
echo.
echo Zip the whole "dist\Forma Inventory" folder when sharing the app.
pause
exit /b 0

:error
echo.
echo Build failed. Read the messages above, then try again.
pause
exit /b 1
