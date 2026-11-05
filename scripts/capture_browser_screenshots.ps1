$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) {
    Write-Host "ERROR: Chrome executable not found at $chrome"
    exit 1
}

$baseDir = "C:\Users\Lenovo\OneDrive\Desktop\Projects\paddock\artifacts\visual_qa"
$profile = "$baseDir\temp_profile"

$screenshots = @(
    @{
        Name = "Desktop Prediction Tab (1280x800)"
        Html = "$baseDir\desktop_prediction_view.html"
        Output = "$baseDir\browser_screenshot_desktop_1280x800.png"
        Size = "1280,800"
    },
    @{
        Name = "Mobile Prediction Tab (390x844)"
        Html = "$baseDir\mobile_prediction_view.html"
        Output = "$baseDir\browser_screenshot_mobile_390x844.png"
        Size = "390,844"
    },
    @{
        Name = "Model Fusion View (1280x800)"
        Html = "$baseDir\model_fusion_view.html"
        Output = "$baseDir\browser_screenshot_model_fusion_1280x800.png"
        Size = "1280,800"
    },
    @{
        Name = "2026 Regulation Era Warning View (1280x800)"
        Html = "$baseDir\regulation_era_warning_view.html"
        Output = "$baseDir\browser_screenshot_regulation_warning_1280x800.png"
        Size = "1280,800"
    }
)

foreach ($item in $screenshots) {
    $url = "file:///" + $item.Html.Replace("\", "/")
    $size = $item.Size
    $out = $item.Output
    Write-Host "Capturing: $($item.Name) to $out"
    $args = @(
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=$size",
        "--user-data-dir=$profile",
        "--screenshot=$out",
        $url
    )
    $proc = Start-Process -FilePath $chrome -ArgumentList $args -Wait -PassThru
    if (Test-Path $out) {
        $len = (Get-Item $out).Length
        Write-Host "SUCCESS: Created $out ($len bytes)"
    } else {
        Write-Host "FAILED: $out was not created"
    }
}

