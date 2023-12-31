import 'dotenv/config'
import { Sequelize} from "sequelize";
export const sequelize = new Sequelize({
  dialect: "postgres",
  username: process.env.SEQUELIZE_USERNAME,
  password:process.env.SEQUELIZE_PASSWORD,
  database: process.env.SEQUELIZE_DATABASE,
    port: 5432,
    host: process.env.SEQUELIZE_HOST,
    ssl: true,
    // esto es necesario para que corra correctamente
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  });
  
  async function test() {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
    }
    
    test();
 


