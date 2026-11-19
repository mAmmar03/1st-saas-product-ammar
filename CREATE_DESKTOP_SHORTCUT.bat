@echo off
title Create Desktop Shortcut - AmmarDev CRM
cls

set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%_shortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\AmmarDev Influencer CRM.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%~dp0START_AMMARDEV_CRM.bat" >> %SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %SCRIPT%
echo oLink.Description = "Launch AmmarDev Influencer CRM" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%

echo ======================================================================
echo  [SUCCESS] Desktop Shortcut Created: "AmmarDev Influencer CRM"
echo ======================================================================
echo  You can now launch the CRM directly from your Desktop anytime!
echo.
pause
