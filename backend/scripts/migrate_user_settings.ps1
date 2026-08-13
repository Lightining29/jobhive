# Requires -Version 5.1
<#
.SYNOPSIS
    Migrates user settings and extensions from standard Antigravity directories to Antigravity IDE directories.
.DESCRIPTION
    This script is designed for production use, substituting absolute hardcoded usernames with dynamic environment profile paths.
    It verifies source file/directory existence, implements consistent folder copying behavior, and provides error handling.
#>

$ErrorActionPreference = "Stop"

# Retrieve reliable directory roots from environment variables
$HomeDir         = $env:USERPROFILE
$AppDataDir      = $env:APPDATA

# Dynamic Path Construction
$SrcExtensions   = Join-Path $HomeDir ".antigravity\extensions"
$DestExtensions  = Join-Path $HomeDir ".antigravity-ide\extensions"
$SrcSettings     = Join-Path $AppDataDir "Antigravity\User\settings.json"
$DestUserConfig  = Join-Path $AppDataDir "Antigravity IDE\User"
$DestSettings    = Join-Path $DestUserConfig "settings.json"

Write-Host "Starting migration workflow..." -ForegroundColor Cyan

try {
    # 1. Copy Extensions
    if (Test-Path $SrcExtensions) {
        Write-Host "Processing Extensions..." -ForegroundColor Cyan
        if (-not (Test-Path $DestExtensions)) {
            New-Item -ItemType Directory -Path $DestExtensions -Force | Out-Null
            Write-Host "Created target extensions directory: $DestExtensions" -ForegroundColor Gray
        }
        # Copy elements inside directory to prevent nested folders on repeated runs
        Copy-Item -Path "$SrcExtensions\*" -Destination $DestExtensions -Recurse -Force
        Write-Host "Extensions successfully migrated to: $DestExtensions" -ForegroundColor Green
    } else {
        Write-Warning "Source extensions directory not found at: $SrcExtensions"
    }

    # 2. Create IDE User config directory
    if (-not (Test-Path $DestUserConfig)) {
        Write-Host "Creating configuration path: $DestUserConfig..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $DestUserConfig -Force | Out-Null
        Write-Host "Created user config path." -ForegroundColor Gray
    }

    # 3. Copy Settings File
    if (Test-Path $SrcSettings) {
        Write-Host "Processing Settings..." -ForegroundColor Cyan
        Copy-Item -Path $SrcSettings -Destination $DestSettings -Force
        Write-Host "settings.json successfully migrated to: $DestSettings" -ForegroundColor Green
    } else {
        Write-Warning "Source settings.json not found at: $SrcSettings"
    }

    Write-Host "Migration completed successfully." -ForegroundColor Green

} catch {
    Write-Error "Migration workflow failed: $_"
    exit 1
}
