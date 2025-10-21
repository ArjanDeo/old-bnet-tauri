use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use std::fs;
use winreg::enums::*;
use winreg::RegKey;
use tauri_plugin_store::StoreBuilder;

#[derive(Debug)]
pub struct WowBuild {
    pub product: String,
    pub version: String,
    pub branch: String,
}

pub fn parse_build_info<P: AsRef<Path>>(path: P) -> std::io::Result<Vec<WowBuild>> {
    let content = fs::read_to_string(path)?;
    let mut lines = content.lines();

    let header = lines.next().unwrap_or_default();
    let headers: Vec<&str> = header.split('|').collect();

    let version_idx = headers.iter().position(|&h| h.contains("Version")).unwrap_or(0);
    let product_idx = headers.iter().position(|&h| h.contains("Product")).unwrap_or(0);
    let branch_idx  = headers.iter().position(|&h| h.contains("Branch")).unwrap_or(0);

    let mut builds = Vec::new();

    for line in lines {
        let parts: Vec<&str> = line.split('|').collect();
        if parts.len() <= version_idx { continue; }

        builds.push(WowBuild {
            branch:  parts.get(branch_idx).unwrap_or(&"").to_string(),
            version: parts.get(version_idx).unwrap_or(&"").to_string(),
            product: parts.get(product_idx).unwrap_or(&"").to_string(),
        });
    }

    Ok(builds)
}
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn locate_wow() -> Option<String> {
    get_wow_install_path()
}
#[tauri::command]
fn sync_wow_build(app_handle: tauri::AppHandle) -> Result<String, String> {
    let Some(wow_path) = get_wow_install_path() else {
        return Err("WoW not found in registry.".into());
    };

    let root_path = Path::new(&wow_path)
        .parent()
        .ok_or("Cannot determine root WoW folder")?;

    let build_info_path = root_path.join(".build.info");
    if !build_info_path.exists() {
        return Err("Could not find .build.info".into());
    }

    let builds = parse_build_info(&build_info_path).map_err(|e| e.to_string())?;

    let mut version_map = serde_json::Map::new();
    for b in builds {
        if b.product == "wow" || b.product == "wowxptr" {
            version_map.insert(b.product.clone(), serde_json::Value::String(b.version));
        }
    }

    if version_map.is_empty() {
        return Err("No WoW or PTR builds found in .build.info".into());
    }

    // Save to Tauri store
    let store = StoreBuilder::new(&app_handle, PathBuf::from("store.json"))
        .build()
        .map_err(|e| e.to_string())?;

    store.set("wow_versions", serde_json::Value::Object(version_map));
    store.save().map_err(|e| e.to_string())?;

    Ok("WoW versions synced to store".into())
}




fn get_wow_install_path() -> Option<String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    let paths = [
        r"SOFTWARE\WOW6432Node\Blizzard Entertainment\World of Warcraft",
        r"SOFTWARE\Blizzard Entertainment\World of Warcraft",
    ];

    for path in paths {
        if let Ok(key) = hklm.open_subkey(path) {
            if let Ok(install_path) = key.get_value::<String, _>("InstallPath") {
                return Some(install_path);
            }
        }
    }

    None
}
#[tauri::command]
fn launch_wow(folder_path: &str) -> Result<String, String> {
    let folder_path = folder_path.trim_end_matches('\\');

    let root_path = Path::new(folder_path)
        .parent() // go up one level from _retail_
        .ok_or("Cannot determine root WoW folder")?;

    let exe_path = root_path.join("World of Warcraft Launcher.exe");

    if !exe_path.exists() {
        return Err(format!(
            "Launcher not found at: {}",
            exe_path.display()
        ));
    }

    // Launch
    Command::new(&exe_path)
        .args([("--exec=launch WoW")]) // 'WoWC' works for classic but I haven't implemented that yet. 
        .spawn()                       // I can't find a code for PTR so only retail is supported right now. (For some reason, WoWPTR launches retail as well)
        .map_err(|e| e.to_string())?;

    Ok("WoW launch command executed.".into())
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![locate_wow, launch_wow, sync_wow_build])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
