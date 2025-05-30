//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.11

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "refound_details")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id_refound_detail: i32,
    pub refound_id: i32,
    pub product_id: i32,
    pub quantity: i32,
    #[sea_orm(column_type = "Decimal(Some((5, 2)))")]
    pub unit_price: Decimal,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::products::Entity",
        from = "Column::ProductId",
        to = "super::products::Column::IdProduct",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Products,
    #[sea_orm(
        belongs_to = "super::refounds::Entity",
        from = "Column::RefoundId",
        to = "super::refounds::Column::IdRefound",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Refounds,
}

impl Related<super::products::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Products.def()
    }
}

impl Related<super::refounds::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Refounds.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
