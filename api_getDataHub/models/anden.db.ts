import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Destiny from './destiny.db';

const Anden = db.define('anden', {
    id: {
        primaryKey: true,
        field: "id_anden",
        type:DataTypes.STRING},
    anden: {
        type: DataTypes.NUMBER,
    },
    whse: DataTypes.STRING
},
{
    
  timestamps: false,

  
  
  
  paranoid: true,

  
  
  underscored: true,

  
  
  
  freezeTableName: true,

  
  tableName: 'anden'
}
);

Anden.hasMany(Destiny, {
    foreignKey:'id_anden',
    sourceKey:'id'
});

Destiny.belongsTo(Anden, {
    foreignKey: "id_anden",
    targetKey: "id",
  })

export default Anden;