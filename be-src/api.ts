import express from 'express';
import cors from "cors";
import * as path from "path"
import { createUser, checkMail, updateUser, getAllUsers, dataUser } from "./controllers/users-controller"
import { getReports, createReport } from "./controllers/reports-controller"
import { getAllPets, petsAroundMe, createPet, updatePet, deletePetById, allPetsByUser, reportPetFound, deleteAllPets } from "./controllers/pets-controllers"
import { generateToken, getToken, recoverPassword, resetPassword, sendResetPassword } from "./controllers/auth-controller"
import { authMiddleware, CheckMiddleware } from "./models/middlewares"
import 'dotenv/config'
import "./types"



let app = express()
app.use(cors({ origin: true, credentials: true }));

app.use(express.json({
    limit: "100mb"
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.options('*', cors())
const port = process.env.PORT || 3000

//verify email
app.get("/check-email", async (req, res) => {
    try {
        const { email } = req.query
        const emailExists = await checkMail(email)
        if (emailExists) {
            res.status(200).json({ message: "El correo electrónico existe en la base de datos" });
        } else {
            res.status(404).json({ message: "El correo electrónico no existe en la base de datos" });
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

//sign up
app.post("/auth/signup", CheckMiddleware, async (req, res) => {
    try {
        const user = await createUser(req.body)
        if (user) {
            res.status(201).json({ message: "Usuario creado con exito" })
        } else {
            res.status(400).json({ message: " Hubo un problema al crear el usuario" })
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

//sign in
app.post("/auth/token", CheckMiddleware, async (req, res) => {
    try {
        const { token, userId } = await getToken(req.body)
        if (token !== undefined) {
            res.status(200).json({ token, userId })
        } else {
            res.status(401).json({ message: "Acceso no autorizado" });
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

//my data
app.get("/user", authMiddleware, async (req, res) => {
    const { userId } = req.query
    try {
        const data = await dataUser(userId);
        if(data){
            res.status(200).json(data);
        }else{
            res.status(404).json({message:"No se puedo obtener la informacion"})
        }
        // console.log(data);
    } catch (error) {
        res.status(400).json(error);
    }
});

//update user data
app.put("/update-user", CheckMiddleware, authMiddleware, async (req, res) => {
    const { userId } = req.query
    try {
        if (userId === "undefined") {
            res.status(404).json({ message: "id no definido" })
        } else {
            const update = await updateUser(req.body, userId)
            res.status(200).json(update)
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

//send email password
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const token = generateToken(email)
        await recoverPassword(email, token);
        res.status(200).json({ message: "Se ha enviado un correo electronico para restablecer la contraseña"})
        // console.log("forgot password", email, token)
    }
    catch (error) {
        // console.error("Error al solicitar restablecer la contraseña", error)
        res.status(500).json({ error: "Ha ocurrido un error al solicitar restablecer la contraseña" })
    }
})

//reset password
app.put("/reset-password", async (req, res) => {
    const { token, password } = req.body;
    try {
        await resetPassword(token, password)
        res.status(200).json({ message: "La contraseña se ha restablecido correctamente", password: password })
    }
    catch (error) {
        // console.error("Error al restablecer la contraseña", error)
        res.status(500).json({ error: "Ha ocurrido un error al restablecer la contraseña" })
    }
})

//get my pets
app.get("/user/pets", authMiddleware, async (req, res) => {
    const { userId } = req.query
    try {
        const data = await allPetsByUser(userId, ["userId", 'id', 'found', 'image_URL', 'name', 'lat', 'lng', "zone"])
        res.status(200).json(data)
        // console.log(data)
    } catch (error) {
        res.status(400).json(error)
    }
})


//****Endpoints pets****
//create pet
app.post("/user/create-pet", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const createNewPet = await createPet(req.body, userId)
        res.status(201).json(createNewPet)
    } catch (error) {
        res.status(400).json(error)
    }
})

//update pet
app.put("/user/update-pet", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {
        const data = await updatePet(req.body, petId)
        // console.log(data)
        res.status(200).json({ message: "Reporte exitoso: La mascota ha sido actualizada" })
    } catch (error) {
        res.status(400).json(error)
    }
})

// delete pet
app.delete("/user/delete-pet", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {
        const data = await deletePetById(petId)
        // console.log(data)
        res.status(200).json({ message: "Reporte exitoso: La mascota ha sido eliminada" })
    } catch (error) {
        res.status(400).json(error)
    }
})


//****Endpoints reports****
//report pet found
app.put("/user/found-pet", authMiddleware, async (req, res) => {
    const { petId } = req.query
    try {
        const data = await reportPetFound(petId)
        res.status(200).json({ message: "Reporte exitoso: La mascota ha sido encontrada" })
    } catch (error) {
        res.status(400).json(error)
        // console.log(error)
    }
})

//report pet
app.post("/user/report-pet", async (req, res) => {
    const { petId } = req.query
    try {
        const newReport = await createReport(petId, req.body)
        res.status(201).json(newReport)
    } catch (error) {
        res.status(400).json(error)
    }
})


//gets pets near me
app.get("/pets-around-me", async (req, res) => {
    const { lat, lng } = req.query
    try {
        const hits = await petsAroundMe(lat, lng)
        res.status(200).json(hits);
    } catch (error) {
        res.status(400).json(error)
    }
});
//Delete all pets
app.delete("/all-pets/delete", async (req, res) => {
    try {
        const data = await deleteAllPets()
        console.log(data)
        res.status(200).json({ message: "Reporte exitoso:se eliminaron todas las mascotas" })
    } catch (error) {
        res.status(400).json(error)
    }
})


//****Endpoints get all data****
//get all reports
app.get("/all-reports", async (req, res) => {
    const reports = await getReports()
    res.status(200).json(reports)
})

//get all pets
app.get("/all-pets", async (req, res) => {
    const allPets = await getAllPets()
    res.status(200).json(allPets)
})

//get all users
app.get("/all-users", async (req, res) => {
    const allUsers = await getAllUsers()
    res.status(200).json(allUsers)
    // console.log(allUsers)
})

const relativeRoute = path.resolve(__dirname, "../../dist");
app.use(express.static(relativeRoute))
app.get("*", function (req, res) {
    res.sendFile(relativeRoute + "/index.html");
})

app.listen(port, () => {
    console.log(`servidor OK, en el puerto ${port}`);
});



