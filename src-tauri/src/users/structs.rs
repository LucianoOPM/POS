use crate::entities::{profiles, users};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub is_active: bool,
    pub profile_id: i32,
    pub profile_name: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl User {
    pub fn from_with_profile(user: users::Model, profile: Option<profiles::Model>) -> Self {
        Self {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_active: user.is_active,
            profile_id: user.profile_id,
            profile_name: profile.map(|p| p.name),
            created_at: user.created_at.to_string(),
            updated_at: user.updated_at.to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UserFilter {
    pub status: Option<bool>,
    pub page: u64,
    pub limit: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserListReturn {
    pub users: Vec<User>,
    pub total_pages: u64,
    pub total_items: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub password: String,
    pub first_name: String,
    pub last_name: String,
    pub profile_id: i32,
    pub created_by: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateUser {
    pub username: Option<String>,
    pub email: Option<String>,
    pub password: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub profile_id: Option<i32>,
    pub is_active: Option<bool>,
    pub updated_by: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Profile {
    pub id: i32,
    pub name: String,
    pub description: String,
    pub is_active: bool,
}

impl From<profiles::Model> for Profile {
    fn from(profile: profiles::Model) -> Self {
        Self {
            id: profile.id,
            name: profile.name,
            description: profile.description,
            is_active: profile.is_active,
        }
    }
}
