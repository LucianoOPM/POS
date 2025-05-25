use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Session {
    pub username: String,
    pub role: String,
    pub email: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginData {
    pub username: String,
    pub password: String,
}
