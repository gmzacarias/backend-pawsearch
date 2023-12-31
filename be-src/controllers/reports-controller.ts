import 'dotenv/config';
import { Report, Pet, User } from "../models"
import { sgMail } from "../lib/sendgrid"

const ENVIRONMENT=process.env.NODE_ENV
let localhost
if(ENVIRONMENT === "development"){
    localhost= "localhost:3000"
}else {
    localhost="vercel.com/"
}

export async function getReports() {
  return Report.findAll({})
}

export async function createReport(petId, data) {
  try {
    const petReport = await Pet.findByPk(petId)
    let userIdFromPet = petReport.get("userId") as any
    let petName = petReport.get("name")
    let year = new Date().getFullYear()
    let userFromPet = await User.findByPk(userIdFromPet)
    let userName = userFromPet.get("userName")
    const recipient = userFromPet.get("email");
    const verifiedSender = "gastonmzacarias@gmail.com"
    const createdReport = await Report.create({
      petId,
      name_pet:petName,
      name_reporter: petReport.get("name"),
      phone_number: data.phone_number,
      pet_info: data.pet_info,
    })

    const msg = {
      to: `${recipient}`, // Change to your recipient
      from: `${verifiedSender}`, // Change to your verified sender
      subject: `Se ha reportado informacion de ${petName}!`,
      html: `
        <body style="background-color:#b7dcff; padding:10px; font-family:Helvetica, Arial, sans-serif; color:#05254c; text-align:center; ">
            <main style="display:flex; flex-direction:column;">
                <img src="https://i.imgur.com/fT0V03Z.png" alt="pawsearch logo" title="PAWSEARCH" title="PAWSEARCH" style="width:220px; height:40px">
                <div style="background-color:#fff; width:80%; margin:10px auto; padding:10px; font-family:Arial, sans-serif; color:#05254c;">
                   <h1 style="font-size:18px; text-align:center;">Hola ${userName} 🧐</h1>
                   <h2 style="font-size:16px; text-align:justify;">Recibiste este correo electrónico porque reportaron informacion de ${petName}.</h2>
                   <p style="font-size:14px; text-align:justify";>
                   nombre de la persona que lo reporto:${data.name_reporter}<br>
                   telefono de contacto:${data.phone_number}<br>
                   informacion adicional:${data.pet_info}
                   </p>
                   <button style="background-color:#05254c; border-radius:12px; padding:10px;">
                       <a href="https://${localhost}" style="color:#FFF; text-decoration:none;">ir a PawSearch</a>
                   </button>
                 
                </div>
               <p style="font-size:16px;">©${year} - PAWSEARCH</p>
            </main>
        </body>
        `
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email enviado correctamente')
      })
      .catch((error) => {
        console.error(error)
      })
    return createdReport
  } catch (error) {
    throw error
  }

}

