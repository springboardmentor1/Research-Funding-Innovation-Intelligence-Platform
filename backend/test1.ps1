$body = "username=researcher@demo.edu&password=research123"
$r = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/token" -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
Write-Host "Login Status:" $r.StatusCode
Write-Host "Login Response:" $r.Content
