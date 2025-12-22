import { Request, Response, NextFunction } from 'express';

export const loginValidate = (req: Request, res: Response, next: NextFunction) => {
    let {usuario} = req.body;

    if (usuario == null || usuario == undefined || usuario == ' ' || usuario.length == 0) {
        res.status(400).json({"error": "NO SE HA LOGUEADO CORRECTAMENTE"})
    } else {
        next()
    }
};