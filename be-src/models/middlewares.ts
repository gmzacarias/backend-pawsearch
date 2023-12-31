import * as jwt from "jsonwebtoken"

export function authMiddleware(req,res,next){
    const token = req.headers.authorization.split(" ")[1]
    try{
        const data = jwt.verify(token, process.env.SECRET)
        req.user=data;
        next()
    }catch(e){
        res.status(401).json({error:true})
    }

}

export async function CheckMiddleware(req, res, next) {
    const hasValue =
      Object.values(req.body).filter((e) => {
        return e !== "";
      }).length >= 1;
  
    if (hasValue) {
      next();
    } else {
      res.status(401).send({ error: "No hay body" });
    }
  }