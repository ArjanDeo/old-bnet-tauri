use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use std::fs;
use walkdir::WalkDir;
use winreg::enums::*;
use winreg::RegKey;
use tauri_plugin_store::StoreBuilder;
use std::fs::File;
use std::io::prelude::*;
use serde::{Deserialize, Serialize};


#[derive(Debug)]
pub struct WowBuild {
    pub product: String,
    pub version: String,
    pub branch: String,
}
#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BattleNetAggregate {
    pub installed: Vec<Installed>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Installed {
    #[serde(rename = "box_art_uri")]
    pub box_art_uri: String,
    #[serde(rename = "icon_index")]
    pub icon_index: i64,
    #[serde(rename = "icon_path")]
    pub icon_path: String,
    #[serde(rename = "last_played_timestamp")]
    pub last_played_timestamp: i64,
    #[serde(rename = "launch_uri")]
    pub launch_uri: String,
    #[serde(rename = "logo_art_uri")]
    pub logo_art_uri: String,
    pub name: String,
    #[serde(rename = "product_id")]
    pub product_id: String,
}

#[tauri::command]
fn get_wow_playtime() -> Result<u64, String> {
    // Handle the Option<String>
    let wow_root = match get_blizzard_game_install_path("wow".to_string()) {
        Some(path) => PathBuf::from(path),
        None => return Err("get_wow_install_path returned None".to_string()),
    };

    let account_path = wow_root.join("WTF").join("Account");

    if !account_path.exists() {
        return Err(format!("Account path not found: {:?}", account_path));
    }

    let mut total_playtime: u64 = 0;

    for entry in WalkDir::new(&account_path).into_iter().filter_map(Result::ok) {
        let path = entry.path();

        // Looking specifically for SavedVariables/TotalPlayed.lua
        if path.is_file()
            && path.file_name().map(|f| f == "TotalPlayed.lua").unwrap_or(false)
            && path.parent().map(|p| p.ends_with("SavedVariables")).unwrap_or(false)
        {
            if let Ok(contents) = fs::read_to_string(path) {
                for line in contents.lines() {
                    if let Some(stripped) = line.strip_prefix("TotalPlayTime = ") {
                        if let Ok(seconds) = stripped.trim().parse::<u64>() {
                            total_playtime += seconds;
                        }
                    }
                }
            }
        }
    }

    Ok(total_playtime)
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

#[tauri::command]
fn locate_game(game: String) -> Option<String> {
    get_blizzard_game_install_path(game)
}

#[tauri::command]
fn sync_game_build(app_handle: tauri::AppHandle, game: String) -> Result<String, String> {
    let Some(game_path) = get_blizzard_game_install_path(game.clone()) else {
        return Err(format!("{} not found.", game));
    };

    let root_path = Path::new(&game_path)
        .parent()
        .ok_or("Cannot determine root game folder")?;

    let build_info_path = root_path.join(".build.info");
    if !build_info_path.exists() {
        return Err("Could not find .build.info".into());
    }

    let builds = parse_build_info(&build_info_path).map_err(|e| e.to_string())?;

    let mut version_map = serde_json::Map::new();
    
    // Get product prefixes based on game
    let prefixes = get_game_product_prefixes(&game);
    
    for b in builds {
        // Check if this build matches any of the game's product prefixes
        if prefixes.iter().any(|&prefix| b.product == prefix) {
            version_map.insert(b.product.clone(), serde_json::Value::String(b.version));
        }
    }

    if version_map.is_empty() {
        return Err(format!("No {} builds found in .build.info", game));
    }

    // Save to Tauri store with game-specific key
    let store = StoreBuilder::new(&app_handle, PathBuf::from("store.json"))
        .build()
        .map_err(|e| e.to_string())?;

    let store_key = format!("{}_versions", game);
    store.set(&store_key, serde_json::Value::Object(version_map));
    store.save().map_err(|e| e.to_string())?;

    Ok(format!("{} versions synced to store", game))
}

fn get_game_product_prefixes(game: &str) -> Vec<&str> {
    match game.to_lowercase().as_str() {
        "wow" => vec!["wow", "wowxptr", "wowt", "wow_beta", "wow_classic", "wow_classic_era"],
        "ow" => vec!["pro"],
        "sc2" => vec!["s2"],
        _ => vec![],
    }
}

fn get_blizzard_game_install_path(game: String) -> Option<String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    let paths = [
        r"SOFTWARE\WOW6432Node\Blizzard Entertainment\World of Warcraft",
        r"SOFTWARE\Blizzard Entertainment\World of Warcraft",
    ];
    if &game.to_lowercase() == "wow" {
        for path in paths {
            if let Ok(key) = hklm.open_subkey(path) {
                if let Ok(install_path) = key.get_value::<String, _>("InstallPath") {
                    return Some(install_path);
                }
            }
        }
    }


    // If code reaches here, WoW wasn't found in the windows registry (or its a different game), so look in Battle.Net's ProgramData

    let path = Path::new("C:\\ProgramData\\Battle.net\\Agent\\aggregate.json");
    let display = path.display();

    let mut file = match File::open(&path) {
        Err(why) => panic!("Couldn't open {}: {}", display, why),
        Ok(file) => file,
    };

    let mut aggregate_file_string = String::new();
    match file.read_to_string(&mut aggregate_file_string) {
        Err(why) => panic!("couldn't read {}: {}", display, why),
        Ok(_) => print!("{} contains:\n{}", display, aggregate_file_string),
    }

    let deserialized_aggregate: BattleNetAggregate = serde_json::from_str(&aggregate_file_string).unwrap();

    for installed_game in deserialized_aggregate.installed {
        if &installed_game.product_id.to_lowercase() == &game.to_lowercase() || (&installed_game.product_id.to_lowercase() == "pro" && &game.to_lowercase() == "ow") {
            let mut pb = PathBuf::from(installed_game.icon_path); // icon_path is a path to the games launcher (e.g. "X:/Games/World of Warcraft/World of Warcraft Launcher.exe")
            pb.pop();
            pb.push("_retail_");
            let game_install_path = pb.to_string_lossy().into_owned();
            return Some(game_install_path);
        }
    }
    None
}

#[tauri::command]
fn launch_game(folder_path: &str, game: &str, version: Option<&str>) -> Result<String, String> {
    let folder_path = folder_path.trim_end_matches('\\');
    let root_path = Path::new(folder_path)
        .parent() // go up one level from _retail_
        .ok_or("Cannot determine root WoW folder")?;
    
    let exe_path = if game == "wow" {
        root_path.join("World of Warcraft Launcher.exe")
    } else {
        root_path.join("Overwatch Launcher.exe")
    };
    
    if !exe_path.exists() {
        return Err(format!(
            "Launcher not found at: {}",
            exe_path.display()
        ));
    }
    
    // Launch
    let launch_arg = if game == "wow" {
        match version {
            Some("retail") => "--exec=launch WoW",
            Some("wow_classic_era") => "--exec=launch WoWC",
            Some("wow_classic") => "--exec=launch WoWC",
            _ => "--exec=launch WoW" // default to retail
        }
    } else {
        "--exec=launch Pro"
    };
    
    Command::new(&exe_path)
        .args([launch_arg])
        .spawn()
        .map_err(|e| e.to_string())?;
    
    Ok("Game launch command executed.".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![locate_game, launch_game, sync_game_build, get_wow_playtime])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
