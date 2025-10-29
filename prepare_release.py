import os
import shutil
import sys
import platform

def get_release_type():
    print("Select release type:")
    print("(1) Alpha")
    print("(2) Beta")
    print("(3) Release")

    while True:
        choice = input("Enter 1, 2, or 3: ").strip()
        if choice in ("1", "2", "3"):
            return {"1": "alpha", "2": "beta", "3": "release"}[choice]
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")

def get_version():
    while True:
        version = input("Enter version (e.g., 0.1.2): ").strip()
        if version.count('.') == 2 and all(part.isdigit() for part in version.split('.')):
            return version
        print("Invalid version format. Please use semantic versioning (e.g., 1.0.0).")

def verify_file_exists(path):
    if not os.path.isfile(path):
        print(f"Missing file: {os.path.abspath(path)}")
        sys.exit(1)

def open_folder(path):
    try:
        if platform.system() == "Windows":
            os.startfile(path)
        elif platform.system() == "Darwin":  # macOS
            os.system(f"open '{path}'")
        else:  # Linux
            os.system(f"xdg-open '{path}'")
    except Exception as e:
        print(f"could not open folder automatically: {e}")

def main():
    try:
        base_dir = os.path.join(".", "src-tauri", "target", "release")

        exe_path = os.path.join(base_dir, "old-bnet-tauri.exe")
        msi_path = os.path.join(base_dir, "bundle", "msi", "old-bnet-tauri_0.1.0_x64_en-US.msi")
        nsis_path = os.path.join(base_dir, "bundle", "nsis", "old-bnet-tauri_0.1.0_x64-setup.exe")

        for path in [exe_path, msi_path, nsis_path]:
            verify_file_exists(path)

        release_type = get_release_type()
        version = get_version()

        output_dir = os.path.join(base_dir, "github releases")
        os.makedirs(output_dir, exist_ok=True)

        new_files = {
            exe_path: f"old-bnet-tauri-v{version}-{release_type}-portable.exe",
            msi_path: f"old-bnet-tauri-v{version}-{release_type}-x64-en-US.msi",
            nsis_path: f"old-bnet-tauri-v{version}-{release_type}-x64-setup.exe"
        }

        print("\nCopying and renaming files...")
        for src, new_name in new_files.items():
            dest = os.path.join(output_dir, new_name)
            shutil.copy2(src, dest)
            print(f"{os.path.basename(src)} → {new_name}")

        print("\nAll binaries prepared successfully!")
        print(f"Output folder: {os.path.abspath(output_dir)}")

        open_folder(output_dir)

    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
