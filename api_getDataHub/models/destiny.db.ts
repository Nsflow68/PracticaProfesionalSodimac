import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Anden from './anden.db';

const Destiny = db.define(
  "destino",
  {
    id: {
      primaryKey: true,
      field: "idDestino",
      type: DataTypes.STRING,
    },
    destino: DataTypes.STRING,
    id_anden: {
      type: DataTypes.NUMBER,
    },
    active: DataTypes.BOOLEAN,

  },
  {
    
    timestamps: false,

    
    
    
    paranoid: true,

    
    
    underscored: true,

    
    
    
    freezeTableName: true,

    
    tableName: "destino",
  }
);










export default Destiny;