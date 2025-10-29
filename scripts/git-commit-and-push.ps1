param(
  [string]$Branch = "master",
  [string]$Message = "chore: commit project changes"
)

# ...existing code...
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

$remoteUrl = "https://github.com/devikaverma155/AI-Powered-Finance-tracker.git"

if (-not (Test-Path .git)) {
  Write-Host "No git repo found. Initializing..."
  git init
}

Write-Host "Staging all changes..."
git add -A

# ensure node_modules is not staged/tracked
$tracked = git ls-files --error-unmatch node_modules 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Removing node_modules from index..."
  git rm -r --cached node_modules | Out-Null
}

try {
  git commit -m $Message
  Write-Host "Committed changes."
} catch {
  Write-Host "Nothing to commit."
}

# reset origin to provided remote
if (git remote | Select-String -Pattern '^origin$') {
  git remote remove origin
}
git remote add origin $remoteUrl

Write-Host "Pushing to origin/$Branch..."
git push -u origin $Branch
Write-Host "Done."