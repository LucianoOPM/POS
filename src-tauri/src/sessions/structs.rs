use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Session {
    pub user_id: String,
    pub username: String,
    pub profile_id: i32,
    pub profile_name: String,
    pub email: String,
    pub permissions: Vec<String>,
}

impl Session {
    /// Verifica si la sesión tiene un permiso específico
    pub fn has_permission(&self, permission_code: &str) -> bool {
        self.permissions.contains(&permission_code.to_string())
    }

    // /// Verifica si la sesión tiene alguno de los permisos especificados
    // pub fn has_any_permission(&self, permission_codes: &[&str]) -> bool {
    //     permission_codes
    //         .iter()
    //         .any(|code| self.permissions.contains(&code.to_string()))
    // }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginData {
    pub username: String,
    pub password: String,
}
