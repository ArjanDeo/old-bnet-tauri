@echo off
REM Make sure cwebp.exe is in the same folder as this script or in PATH

for %%f in (*.jpg *.jpeg *.png) do (
    echo Converting %%f to WebP...
    cwebp "%%f" -q 80 -o "%%~nf.webp"
    if exist "%%~nf.webp" (
        echo Successfully converted: %%f
    ) else (
        echo Failed to convert: %%f
    )
)

echo All done! Originals are safe.
pause
