#ifndef Payload
 #error Payload must point to the clean payload
#endif
#ifndef Output
 #error Output directory required
#endif
[Setup]
AppId={{CA8D47D4-5DAD-4D0E-B32A-937D20DA7F02}
AppName=律师助手 UAH
AppVersion=0.1.0
AppVerName=律师助手 UAH 0.1.0 prototype
AppPublisher=wenmin20212-dotcom
AppPublisherURL=https://github.com/wenmin20212-dotcom/UAH-lawyer
DefaultDirName={localappdata}\Programs\UAH-Lawyer
DefaultGroupName=律师助手 UAH
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
DisableProgramGroupPage=yes
OutputDir={#Output}
OutputBaseFilename=UAH-Lawyer-0.1.0-win-x64-Setup
SetupIconFile={#Payload}\assets\agent.ico
UninstallDisplayIcon={app}\assets\agent.ico
Compression=lzma2/fast
SolidCompression=yes
WizardStyle=modern
CloseApplications=no
RestartApplications=no
LicenseFile={#Payload}\LICENSE-Goose
InfoBeforeFile={#Payload}\安装说明.txt
[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"
[Files]
Source: "{#Payload}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
[Icons]
Name: "{autoprograms}\律师助手 UAH"; Filename: "{app}\app\BOSS-win32-x64\BOSS.exe"; WorkingDir: "{app}"; IconFilename: "{app}\assets\agent.ico"
Name: "{autodesktop}\律师助手 UAH"; Filename: "{app}\app\BOSS-win32-x64\BOSS.exe"; WorkingDir: "{app}"; IconFilename: "{app}\assets\agent.ico"
[Run]
Filename: "{app}\app\BOSS-win32-x64\BOSS.exe"; WorkingDir: "{app}"; Description: "启动律师助手 UAH"; Flags: nowait postinstall skipifsilent
