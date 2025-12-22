import { DataTypes } from 'sequelize';
import db from '../db/connection';

import Pallet from './pallet.db';
import Hub from './hub.db';

const Jaula = db.define('jaula', {
    id: {
        primaryKey: true,
        field: "id_jaula",
        type:DataTypes.NUMBER},
    num_jaula: {
        type: DataTypes.NUMBER,
    },
    id_hub: DataTypes.NUMBER,
},
{
    
  timestamps: false,

  
  
  
  paranoid: true,

  
  
  underscored: true,

  
  
  
  freezeTableName: true,

  
  tableName: 'jaula'
}
);

Jaula.hasMany(Hub, {
    foreignKey:'id_hub',
    sourceKey:'id_hub'
});

Hub.belongsTo(Jaula, {
    foreignKey: "id_hub",
    targetKey: "id",
  })

export default Jaula;