[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$PackageId='minefield-native-bridge-recovery-v1.9.3-r7-transport'
$RunId='mf193-r7-transport-'+[guid]::NewGuid().ToString('n')
$Started=(Get-Date).ToUniversalTime().ToString('o')
$Root=Split-Path -Parent $MyInvocation.MyCommand.Path
$StableRoot=if(Test-Path 'E:\Downloads\_DT_RUNS'){'E:\Downloads\_DT_RUNS'}else{Join-Path $env:USERPROFILE 'Downloads\_DT_RUNS'}
$DriveInbox='G:\My Drive\Doubletab\inbox'
$Bootstrap=Join-Path $StableRoot 'MINEFIELD-NATIVE-BRIDGE-R7-TRANSPORT__BOOTSTRAP__LATEST.json'
$FailureResult=Join-Path $StableRoot 'MINEFIELD-NATIVE-BRIDGE-R7-TRANSPORT__RESULT__LATEST.json'
$Zip=Join-Path $Root 'DT-RUN-MF-NATIVE-BRIDGE__RECOVERY__v1.9.3-r7.zip'
$Payload=Join-Path $Root 'payload-r7'
$Expected='88d38f965ab1de2b98302e7ce7ff59765e9246a33173650f89d218c352172b5a'
$Url='https://drive.usercontent.google.com/download?id=1rmyWmFmnGQoRDO2LgwWPqajuzJ8JX9mE&export=download&confirm=t'
function Write-Json([object]$Value,[string]$Path){New-Item -ItemType Directory -Force -Path (Split-Path $Path -Parent)|Out-Null;$tmp=$Path+'.tmp-'+$PID;$Value|ConvertTo-Json -Depth 30|Set-Content -LiteralPath $tmp -Encoding UTF8;Move-Item -LiteralPath $tmp -Destination $Path -Force}
function Sha([string]$Path){$s=[IO.File]::OpenRead($Path);$h=[Security.Cryptography.SHA256]::Create();try{([BitConverter]::ToString($h.ComputeHash($s))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose();$s.Dispose()}}
New-Item -ItemType Directory -Force -Path $StableRoot,$Root|Out-Null
$boot=[ordered]@{protocol='dt-result/v1';package_id=$PackageId;run_id=$RunId;status='BOOTSTRAP';started_at=$Started;transport='public-github-ps1-to-drive-zip';url=$Url;expected_sha256=$Expected;payload=$Zip}
Write-Json $boot $Bootstrap
if(Test-Path (Split-Path $DriveInbox -Parent)){New-Item -ItemType Directory -Force -Path $DriveInbox|Out-Null;Write-Json $boot (Join-Path $DriveInbox 'MINEFIELD-NATIVE-BRIDGE-R7-TRANSPORT__BOOTSTRAP__LATEST.json')}
try{
  Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $Zip -MaximumRedirection 10
  $actual=Sha $Zip
  if($actual-ne$Expected){throw "Downloaded package SHA-256 mismatch expected=$Expected actual=$actual"}
  if(Test-Path $Payload){Remove-Item -LiteralPath $Payload -Recurse -Force}
  Expand-Archive -LiteralPath $Zip -DestinationPath $Payload -Force
  $entry=Join-Path $Payload 'run.cmd'
  if(-not(Test-Path -LiteralPath $entry)){throw 'Extracted package missing run.cmd'}
  $p=Start-Process -FilePath $entry -WorkingDirectory $Payload -Wait -PassThru
  exit $p.ExitCode
}catch{
  $result=[ordered]@{protocol='dt-result/v1';version='minefield-native-bridge-r7-transport-result/v1';package_id=$PackageId;run_id=$RunId;status='NEEDS_REPAIR';ok=$false;exit_code=1;started_at=$Started;finished_at=(Get-Date).ToUniversalTime().ToString('o');error=$_.Exception.Message;RESULT='The public PS1 transport launched but could not download, verify, extract or enter the reviewed r7 payload.';FOLLOWUP='Use this exact transport receipt; do not return to acquisition probing.';EXPANDEXTENSION='No extension mutation is claimed unless the nested r7 payload produced its own bootstrap/result.';artifacts=[ordered]@{wrapper=$MyInvocation.MyCommand.Path;zip=$Zip;payload=$Payload;stable_result=$FailureResult}}
  Write-Json $result $FailureResult
  if(Test-Path (Split-Path $DriveInbox -Parent)){Write-Json $result (Join-Path $DriveInbox 'MINEFIELD-NATIVE-BRIDGE-R7-TRANSPORT__RESULT__LATEST.json')}
  exit 1
}
