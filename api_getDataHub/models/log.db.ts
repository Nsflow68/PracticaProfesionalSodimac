import { DataTypes } from 'sequelize';
import db from '../db/connection';

const LogEstatus = db.define('log_estado', {
    fecha:DataTypes.DATE,
    id_estado: {
        type: DataTypes.STRING,
    },
    id_pallet: DataTypes.STRING,
    user: DataTypes.STRING
},
{
    
  timestamps: false,

  
  
  
  paranoid: true,

  
  
  underscored: true,

  
  
  
  freezeTableName: true,

  
  tableName: 'log_estado'
}
);


export default LogEstatus;