import { Request, Response } from "express";
import { getUsuarioDetalle } from "../services/userData.services";
import { logger } from "../utils/logger";

export const userLogin = async (req: Request, res: Response) => {
  const { usuario, password, whse } = req.body;
  logger.debug('login body received');

  try {
    
    if (
      usuario == null ||
      usuario.length == 0 ||
      password == null ||
      password.length == 0 ||
      whse == null ||
      whse.length == 0
    ) {
      return res
        .status(400)
        .json({
          message: "Usuario, contraseña y bodega son campos obligatorios",
        });

    }

    let getUser = await getUsuarioDetalle(usuario, password, whse);
    logger.debug('user fetched');
    
    if (getUser.length > 0) {

      let warning = "";
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!strongPasswordRegex.test(password)) {
        warning = "SU CONTRASEÑA ES INSEGURA, PORFAVOR CAMBIELA";
      }

      return res.status(200).json({
        usuario: getUser[0].user,
        perfil: getUser[0].rol,
        centro_costo: getUser[0].CC,
        hub: getUser[0].HUB,
        bodega: getUser[0].BODEGA,
        warning
      });
    } else {
      return res
        .status(400)
        .json({ message: "Credenciales inválidas" });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error interno' });
  }

}
