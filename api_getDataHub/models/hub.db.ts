import { DataTypes } from 'sequelize';
import db from '../db/connection';

import Pallet from './pallet.db';

const Hub = db.define('hub', {
    id: {
        primaryKey: true,
        field: "id_hub",
        type:DataTypes.STRING},
    nombre_hub: {
        type: DataTypes.NUMBER,
    },
},
{
    
  timestamps: false,

  
  
  
  paranoid: true,

  
  
  underscored: true,

  
  
  
  freezeTableName: true,

  
  tableName: 'hub'
}
);

Hub.hasMany(Pallet, {
    foreignKey:'id_jaula',
    sourceKey:'id'
});

Pallet.belongsTo(Hub, {
    foreignKey: "id_jaula",
    targetKey: "id",
  })

export default Hub;