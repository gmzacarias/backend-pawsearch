import { Auth, User } from "../models";
import { sgMail } from "../lib/sendgrid"
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";

const SECRET = process.env.SECRET
// const LOCAL_HOST = "http://127.0.0.1:8080"
const LOCAL_HOST = "https://pawsearch-598b3.web.app"

export function getSHA256ofString(text) {
    return crypto.createHash('sha256').update(text).digest('hex')
}

export async function getToken(data) {
    const { email, password } = data
    const user = await User.findOne({
        where: {
            email: email
        }
    });
    const getPassword = user.get("password")
    if (getPassword === password) {
        try {
            const hashedPassword = getSHA256ofString(password)
            const auth = await Auth.findOne({
                where: {
                    email,
                    password: hashedPassword
                }
            })
            console.log(auth);
            let token = null
            let userId = null
            if (auth) {
                userId = auth.get("myID");
                token = jwt.sign({ id: userId }, SECRET);
            }
            return { token, userId }
        } catch (error) {
            console.error(error)
            
        }
    }
}

export async function updatePassword(newPassword, userId) {
    const hashedPassword = getSHA256ofString(newPassword)

    try {
        const updatePassword = await Auth.update({ password: hashedPassword }, {
            where: {
                myID: userId
            }
        })
        const dataPassword = await User.update({ password: newPassword }, {
            where: {
                id: userId
            }
        })
        return [updatePassword, dataPassword]
    } catch (e) {
        throw e
    }
}

export function generateToken(email) {
    const token = jwt.sign({ email }, SECRET, { expiresIn: "2h" })
    return token
}

export async function recoverPassword(email, token) {
    try {
        const user = await Auth.findOne({ where: { email } })
        if (!user) {
            throw new Error("no se encontro al usuario")
        }
        await sendResetPassword(email, token)

        return "se ha enviado un correo electronico con el token generado"
    }
    catch (error) {
        throw (error)
    }
}

export async function sendResetPassword(email, token) {
    const verifiedSender = "gastonmzacarias@gmail.com"
    let year = new Date().getFullYear()
    const msg = {
        to: email,
        from: verifiedSender,
        subject: "Restablecimiento de contraseña",
        html: `
         <body style="background-color:#b7dcff; padding:10px; font-family:Helvetica, Arial, sans-serif; color:#05254c; text-align:center; ">
            <main style="display:flex; flex-direction:column;">
                <img src="https://i.imgur.com/fT0V03Z.png" alt="pawsearch logo" title="PAWSEARCH" title="PAWSEARCH" style="width:220px; height:40px">
                <div style="background-color:#fff; width:80%; margin:10px auto; padding:10px; font-family:Arial, sans-serif; color:#05254c; text-align:center;">
                   <h1 style="font-size:18px;">Hola 🧐</h1>
                   <p style="font-size:16px;">Recibiste este correo electrónico porque solicitaste restablecer tu contraseña.<br>
                       Por favor, haz clic en el siguiente enlace y sigue las instrucciones:
                   </p>
                   <button style="background-color:#05254c; border-radius:12px; padding:10px;">
                       <a href="${LOCAL_HOST}/reset-password?token=${token}" style="color:#FFF; text-decoration:none;">Restablecer contraseña</a>
                   </button>
                   <p style="font-size:16px;">Si no solicitaste restablecer tu contraseña, ignora este correo electrónico.</p>
                   <p style="font-size:16px;">Gracias.</p>
                </div>
               <p style="font-size:16px;">©${year} - PAWSEARCH</p>
            </main>
        </body>
        `
    }
    try {
        await sgMail.send(msg);
        console.log(msg)
        console.log("Correo electronico de restablecimiento de contraseña enviado")
    }
    catch (error) {
        console.error("Error al enviar el correo de restablecimiento de contraseña")
        throw error
    }
}

export async function resetPassword(token, newPassword) {
    try {
        //verifica el token y obtiene el mail asociado
        const decoded = jwt.verify(token, SECRET)
        const email = decoded["email"]
        //buscar el usuario por su mail en el modelo Auth
        const authUser = await Auth.findOne({ where: { email } })
        if (!authUser) {
            throw new Error("no se encontro un usuario, con ese correo electronico")
        }
        //generar el hash de la nueva contraseña
        const hashedPassword = crypto.createHash("sha256").update(newPassword).digest("hex")
        //actualizar la contraseña del usuario
        await authUser.update({ password: hashedPassword });
        //buscar el usuario por su mail en el modelo Auth
        const user = await User.findOne({ where: { email } })
        if (!user) {
            throw new Error("No se encontró un usuario en el modelo User con ese correo electrónico");
        }
        // Actualizar la contraseña en el modelo User
        await user.update({ password: newPassword });
        // Éxito en el restablecimiento de la contraseña
        return 'La contraseña se ha restablecido correctamente';
    }
    catch (error) {
        console.error("Error", error)
    }
}

