import { selectData } from "./extractData.services";

export const getUsuarioDetalle = async (usuario: string, pass: string, _whse: string) => {
  
  const getUsuarioQuery = `
    SELECT user, password, BODEGA, CC, HUB, rol
    FROM trazabilidad_hub.usuario
    WHERE user = ? AND password = ?
    LIMIT 1
  `;
  const usuarioData = await selectData(getUsuarioQuery, [usuario, pass]);
  return usuarioData;
}

export const getProfileUser = async (user: string) => {
  const responseUser = await selectData(
    `SELECT t.CC, user FROM trazabilidad_hub.usuario t WHERE user=? LIMIT 501`,
    [user]
  );
  return responseUser;
};
