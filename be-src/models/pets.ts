import { sequelize } from './sequelize'
import { Model, DataTypes } from 'sequelize';

export class Pet extends Model { }

Pet.init({
  name: DataTypes.STRING,
  lat: DataTypes.FLOAT,
  lng: DataTypes.FLOAT,
  image_URL: DataTypes.STRING,
  found: DataTypes.BOOLEAN,
  zone: DataTypes.STRING,
}, {
  sequelize, modelName: 'pet'
});
