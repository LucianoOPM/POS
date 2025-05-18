use crate::entities::users::{self, ActiveModel};
use bcrypt::{hash, DEFAULT_COST};
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub id_user: i32,
    pub id_profile: i32,
    pub username: String,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NewUser {
    pub profile: i32,
    pub username: String,
    pub password: String,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateUser {
    pub profile: Option<i32>,
}

impl From<users::Model> for User {
    fn from(user: users::Model) -> Self {
        Self {
            id_user: user.id_user,
            id_profile: user.profile_id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_active: user.is_active,
        }
    }
}

impl From<NewUser> for users::ActiveModel {
    fn from(new_user: NewUser) -> Self {
        let hash_password = hash(new_user.password, DEFAULT_COST).expect("Error during hash");
        ActiveModel {
            profile_id: Set(new_user.profile),
            username: Set(new_user.username),
            is_active: Set(new_user.is_active),
            password: Set(hash_password),
            email: Set(new_user.email),
            first_name: Set(new_user.first_name),
            last_name: Set(new_user.last_name),
            ..Default::default()
        }
    }
}
