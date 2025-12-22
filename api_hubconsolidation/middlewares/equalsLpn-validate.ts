import { Request, Response, NextFunction } from 'express';

export const equalsValidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {lpn, lpn_consolidado} = req.body;

        if (lpn === lpn_consolidado) {
        
            res.status(400).json({
                error: "AMBOS LPN NO PUEDEN SER IGUALES",
                data: [
                    {
                        TC_LPN_ID: lpn,
                        ESTADO: "",
                    }
                ]
            })
        } else {
            next()
        }
    } catch (e) {
        res.status(400).json({
            error: 'error'
        })
    }
};