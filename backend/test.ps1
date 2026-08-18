# Test login
$loginBody = @{
    username = "researcher@demo.edu"
    password = "research123"
}

try {
    $loginResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/token" -Method POST -Body $loginBody -ContentType "application/x-www-form-urlencoded"
    Write-Host "Login Status: $($loginResponse.StatusCode)"
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.access_token
    Write-Host "Token obtained: $($token.Substring(0, 20))..."
    
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    # Test Research Intelligence Dashboard
    Write-Host "`nTesting Research Intelligence Dashboard..."
    $riResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/research-intelligence/dashboard" -Method GET -Headers $headers
    Write-Host "Status: $($riResponse.StatusCode)"
    Write-Host "Response: $($riResponse.Content.Substring(0, [Math]::Min(500, $riResponse.Content.Length)))"
    
    # Test Publication Records
    Write-Host "`nTesting Publication Records..."
    $pubResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/publication-records/" -Method GET -Headers $headers
    Write-Host "Status: $($pubResponse.StatusCode)"
    Write-Host "Response: $($pubResponse.Content.Substring(0, [Math]::Min(500, $pubResponse.Content.Length)))"
    
    # Test Dashboard API
    Write-Host "`nTesting Dashboard API..."
    $dashResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/dashboard/" -Method GET -Headers $headers
    Write-Host "Status: $($dashResponse.StatusCode)"
    Write-Host "Response: $($dashResponse.Content.Substring(0, [Math]::Min(500, $dashResponse.Content.Length)))"
    
    Write-Host "`n✓ All tests completed successfully"
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Response: $($_.Exception.Response.Content)"
}
