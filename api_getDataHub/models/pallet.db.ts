import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Carton from './carton.db';
import LogEstatus from './log.db';
import Anden from './anden.db';

const Pallet = db.define('pallet', {
    id: {
        primaryKey: true,
        field: "id_pallet",
        type:DataTypes.STRING},
    pallet: {
        type: DataTypes.STRING,
    },
    whse : {
        type: DataTypes.STRING
    },
    id_estado: {
        type: DataTypes.STRING
    },
    id_jaula: {
        type: DataTypes.STRING
    },
    id_anden: DataTypes.STRING
},
{
    
  timestamps: false,

  
  
  
  paranoid: true,

  
  
  underscored: true,

  
  
  
  freezeTableName: true,

  
  tableName: 'pallet'
}
);


Pallet.hasMany(Carton, {
    foreignKey: "id_pallet",
    sourceKey: "id",
  })

  Carton.belongsTo(Pallet, {
    foreignKey: "id_pallet",
    targetKey: "id",
  })

  Pallet.hasMany(LogEstatus, {
    foreignKey: "id_pallet",
    sourceKey: "id",
  });

  LogEstatus.belongsTo(Pallet, {
    foreignKey: "id_pallet",
    targetKey: "id",
  })


  Pallet.hasOne(Anden, {
    foreignKey: "id",
    sourceKey: "id_anden",
  });

  Anden.belongsTo(Pallet, {
    foreignKey: "id",
    targetKey: "id_anden",
  })

export default Pallet;