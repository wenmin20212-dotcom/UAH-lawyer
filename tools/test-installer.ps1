param([Parameter(Mandatory=$true)][string]$InstallerPath)
$ErrorActionPreference='Stop'
$Repo=[IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$TestRoot=Join-Path $Repo ('build/installer-tests/'+[Guid]::NewGuid().ToString())
$Installed=Join-Path $TestRoot 'installed';$Profile=Join-Path $TestRoot 'profile'
foreach($p in @($Installed,$Profile)){if(!$p.StartsWith($Repo+'\build\',[StringComparison]::OrdinalIgnoreCase)){throw 'Test target outside project build'};[IO.Directory]::CreateDirectory($p)|Out-Null}
$InstallerPath=[IO.Path]::GetFullPath($InstallerPath)
$DesktopShortcut=Join-Path ([Environment]::GetFolderPath('Desktop')) '律师助手 UAH.lnk'
$StartMenuShortcut=Join-Path ([Environment]::GetFolderPath('Programs')) '律师助手 UAH.lnk'
foreach($shortcutPath in @($DesktopShortcut,$StartMenuShortcut)){if(Test-Path -LiteralPath $shortcutPath){throw 'Existing user shortcut preserved; run the test on an isolated user profile'}}
function Setup {
 $process=Start-Process -FilePath $InstallerPath -ArgumentList @('/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART','/NOCLOSEAPPLICATIONS',('/DIR="'+$Installed+'"'),('/LOG="'+(Join-Path $TestRoot 'install.log')+'"')) -WindowStyle Hidden -Wait -PassThru
 if($process.ExitCode-ne0){throw 'Installer failed'}
}
function StopTestProcesses {
 foreach($process in @(Get-Process -ErrorAction SilentlyContinue)){try{if($process.Path-and$process.Path.StartsWith($Installed+'\',[StringComparison]::OrdinalIgnoreCase)){Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue}}catch{}}
}
$OldProfile=$env:UAH_LAWYER_PROFILE_ROOT
try{
 Setup
 $shell=New-Object -ComObject WScript.Shell
 foreach($shortcutPath in @($DesktopShortcut,$StartMenuShortcut)){
  if(!(Test-Path -LiteralPath $shortcutPath)){throw 'Installed shortcut missing'}
  $shortcut=$shell.CreateShortcut($shortcutPath)
  if($shortcut.TargetPath-ne(Join-Path $Installed 'app/BOSS-win32-x64/BOSS.exe')-or$shortcut.WorkingDirectory-ne$Installed-or!$shortcut.IconLocation.StartsWith((Join-Path $Installed 'assets/agent.ico'))){throw 'Installed shortcut target or icon incorrect'}
 }
 $env:UAH_LAWYER_PROFILE_ROOT=$Profile
 $Ready=Join-Path $Profile 'runtime-ready.json'
 $process=Start-Process -FilePath (Join-Path $Installed 'app/BOSS-win32-x64/BOSS.exe') -WorkingDirectory $Installed -WindowStyle Hidden -PassThru
 $deadline=[DateTime]::UtcNow.AddSeconds(55)
 while(!(Test-Path -LiteralPath $Ready)-and[DateTime]::UtcNow-lt$deadline){Start-Sleep -Milliseconds 500}
 if(!(Test-Path -LiteralPath $Ready)){throw 'Installed app did not reach window-loaded marker'}
 $info=Get-Content -LiteralPath $Ready -Raw -Encoding UTF8|ConvertFrom-Json
 if(!$info.windowLoaded-or$info.appId-ne'uah-lawyer'-or$info.version-ne'0.1.0'-or$info.profile-ne$Profile){throw 'Startup identity incorrect'}
 if(Test-Path -LiteralPath (Join-Path $Installed 'data')){throw 'Installed program stored user data in program directory'}
 $Node=Join-Path $Installed 'runtime/node.exe'
 $nodeVersion=& $Node --version;if($LASTEXITCODE-ne0){throw 'Node failed'}
 $npmVersion=& $Node (Join-Path $Installed 'runtime/node_modules/npm/bin/npm-cli.js') --version;if($LASTEXITCODE-ne0){throw 'npm failed'}
 $oldGoose=$env:GOOSE_PATH_ROOT;try{$env:GOOSE_PATH_ROOT=Join-Path $Profile 'data/goose';$backendVersion=& (Join-Path $Installed 'app/BOSS-win32-x64/resources/bin/goose.exe') --version;if($LASTEXITCODE-ne0){throw 'Backend failed'}}finally{$env:GOOSE_PATH_ROOT=$oldGoose}
 $config=Join-Path $Profile 'data/goose/config/config.yaml';$configBefore=[IO.File]::ReadAllText($config)
 $sentinel=Join-Path $Profile 'data/user-sentinel.txt';[IO.File]::WriteAllText($sentinel,'preserve-user-data')
 $instanceBefore=[IO.File]::ReadAllText((Join-Path $Profile 'instance.json'))
 StopTestProcesses
 Setup
 $configAfter=[IO.File]::ReadAllText($config)
 if($configAfter-ne$configBefore-or[IO.File]::ReadAllText($sentinel)-ne'preserve-user-data'){throw 'Upgrade modified user data'}
 $uninstaller=Join-Path $Installed 'unins000.exe'
 if(!$uninstaller.StartsWith($Repo+'\build\',[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe uninstall target'}
 $process=Start-Process -FilePath $uninstaller -ArgumentList @('/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART') -WindowStyle Hidden -Wait -PassThru
 if($process.ExitCode-ne0-or!(Test-Path -LiteralPath $sentinel)-or[IO.File]::ReadAllText((Join-Path $Profile 'instance.json'))-ne$instanceBefore){throw 'Uninstall removed user data'}
 $result=[ordered]@{passed=$true;version='0.1.0';actualInstaller=$true;actualWindowLoaded=$true;correctIdentity=$true;node=$nodeVersion;npm=$npmVersion;backend=$backendVersion;installedDataSeparated=$true;upgradePreservesData=$true;uninstallPreservesData=$true;desktopShortcutVerified=$true;startMenuShortcutVerified=$true;modelAccountTested=$false;scope='Installation, GUI load, shortcuts and data preservation; not legal capability validation'}
 [IO.File]::WriteAllText((Join-Path $Repo 'build/installer-verification.json'),($result|ConvertTo-Json -Depth 10),[Text.UTF8Encoding]::new($false));$result|ConvertTo-Json -Depth 10
}finally{StopTestProcesses;$env:UAH_LAWYER_PROFILE_ROOT=$OldProfile}
