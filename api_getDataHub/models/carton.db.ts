import { DataTypes } from 'sequelize';
import db from '../db/connection';
import LogEstatus from './log.db';

const Carton = db.define('carton', {
    olpn: {
        primaryKey: true,
        field: "olpn",
        type:DataTypes.STRING},
    id_pallet: {
        type: DataTypes.STRING,
    },
    created_at: DataTypes.DATE
},
{
    
  timestamps: false,

  
  
  
  paranoid: true,

  
  
  underscored: true,

  
  
  
  freezeTableName: true,

  
  tableName: 'carton'
}
);


Carton.hasMany(LogEstatus, {
    foreignKey: "id_pallet",
    sourceKey: "id_pallet",
  });

  LogEstatus.belongsTo(Carton, {
    foreignKey: "id_pallet",
    targetKey: "id_pallet",
  })
export default Carton;