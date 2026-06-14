@echo off
cd /d "%~dp0"
echo === run started %date% %time% === > run.log 2>&1
echo --- docker version --- >> run.log 2>&1
docker version >> run.log 2>&1
echo --- compose build+up (db + dashboard) --- >> run.log 2>&1
docker compose up -d --build db dashboard >> run.log 2>&1
echo EXIT=%errorlevel% >> run.log 2>&1
echo --- compose ps --- >> run.log 2>&1
docker compose ps >> run.log 2>&1
echo === run script finished === >> run.log 2>&1
