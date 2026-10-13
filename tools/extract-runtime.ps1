param([Parameter(Mandatory=$true)][string]$ArchivePath,[Parameter(Mandatory=$true)][string]$DestinationPath)
$ErrorActionPreference='Stop'
$ArchivePath=[IO.Path]::GetFullPath($ArchivePath)
$DestinationPath=[IO.Path]::GetFullPath($DestinationPath)
$BuildRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../build')).TrimEnd('\')
if(!$DestinationPath.StartsWith($BuildRoot+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Extract runtime only into this project build directory'}
if(Test-Path -LiteralPath $DestinationPath){throw 'Extraction directory already exists'}
Expand-Archive -LiteralPath $ArchivePath -DestinationPath $DestinationPath
