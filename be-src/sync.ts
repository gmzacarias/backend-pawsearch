import { sequelize } from "./models/sequelize";
import "./models"

sequelize.sync({ force: true }).then((res) => console.log(res));