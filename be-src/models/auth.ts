import { sequelize } from "./sequelize";
import { Model, DataTypes } from 'sequelize';

export class Auth extends Model { }

Auth.init({
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  myID: DataTypes.INTEGER,

}, {
  sequelize, modelName: 'Auth'
});
